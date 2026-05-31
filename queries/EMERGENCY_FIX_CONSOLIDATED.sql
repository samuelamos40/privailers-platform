-- EMERGENCY CONSOLIDATED DATABASE FIX
-- Run this in Supabase SQL Editor to fix ALL recent issues

-- 1. ADD MISSING COLUMNS
ALTER TABLE public.cohort_classes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE public.cohort_classes ADD COLUMN IF NOT EXISTS use_internal_room BOOLEAN DEFAULT TRUE;
ALTER TABLE public.cohort_classes ADD COLUMN IF NOT EXISTS recording_url TEXT;
ALTER TABLE public.cohort_announcements ADD COLUMN IF NOT EXISTS is_notified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES public.cohorts(id);
ALTER TABLE public.enrollments ALTER COLUMN course_id DROP NOT NULL;

-- 2. FIX DELETE PERMISSIONS
DROP POLICY IF EXISTS "Enable enrollment delete for admins" ON public.enrollments;
CREATE POLICY "Enable enrollment delete for admins" ON public.enrollments
FOR DELETE TO authenticated
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'instructor')
  OR auth.uid() = user_id
);

DROP POLICY IF EXISTS "Admins and Instructors can delete cohorts" ON public.cohorts;
CREATE POLICY "Admins and Instructors can delete cohorts" ON public.cohorts
FOR DELETE TO authenticated
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  OR instructor_id = auth.uid()
);

-- 3. CREATE WIPE_COHORT RPC (The Ultimate Delete Fix)
CREATE OR REPLACE FUNCTION public.wipe_cohort(target_cohort_id UUID)
RETURNS void AS $$
DECLARE
    requester_role TEXT;
    is_owner BOOLEAN;
BEGIN
    SELECT role INTO requester_role FROM public.users WHERE id = auth.uid();
    SELECT (instructor_id = auth.uid()) INTO is_owner FROM public.cohorts WHERE id = target_cohort_id;

    IF requester_role != 'admin' AND (requester_role != 'instructor' OR NOT is_owner) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins or the assigned instructor can wipe this batch.';
    END IF;

    DELETE FROM public.cohort_attendance 
    WHERE class_id IN (SELECT id FROM public.cohort_classes WHERE cohort_id = target_cohort_id);
    DELETE FROM public.cohort_classes WHERE cohort_id = target_cohort_id;
    DELETE FROM public.cohort_announcements WHERE cohort_id = target_cohort_id;
    DELETE FROM public.enrollments WHERE cohort_id = target_cohort_id;
    DELETE FROM public.cohorts WHERE id = target_cohort_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FIX STUDENT VISIBILITY FOR LIVE CLASSES
ALTER TABLE public.cohort_classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "students_view_own_cohort_classes" ON public.cohort_classes;
CREATE POLICY "students_view_own_cohort_classes" ON public.cohort_classes
FOR SELECT TO authenticated
USING (cohort_id IN (SELECT cohort_id FROM enrollments WHERE user_id = auth.uid()) OR (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'instructor'));

-- 5. ENABLE REALTIME FOR COHORT_CLASSES
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'cohort_classes'
  ) THEN
    ALTER publication supabase_realtime ADD TABLE public.cohort_classes;
  END IF;
END $$;

-- 7. ATTENDANCE & PROGRESS SYSTEM
-- Ensure attendance is deleted when a class is deleted
ALTER TABLE public.cohort_attendance DROP CONSTRAINT IF EXISTS cohort_attendance_class_id_fkey;
ALTER TABLE public.cohort_attendance 
ADD CONSTRAINT cohort_attendance_class_id_fkey 
FOREIGN KEY (class_id) REFERENCES public.cohort_classes(id) ON DELETE CASCADE;

ALTER TABLE public.cohort_attendance 
DROP CONSTRAINT IF EXISTS unique_student_class_attendance;
ALTER TABLE public.cohort_attendance 
ADD CONSTRAINT unique_student_class_attendance UNIQUE (student_id, class_id);

CREATE OR REPLACE FUNCTION public.update_cohort_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'completed' AND OLD.status != 'completed') THEN
        UPDATE public.enrollments e
        SET progress = (
            SELECT 
                CASE 
                    WHEN count_total.total = 0 THEN 0
                    ELSE ROUND((count_attended.attended::float / count_total.total::float) * 100)
                END
            FROM (
                SELECT count(*)::int as total 
                FROM public.cohort_classes 
                WHERE cohort_id = NEW.cohort_id AND status = 'completed'
            ) count_total,
            (
                SELECT count(*)::int as attended
                FROM public.cohort_attendance ca
                JOIN public.cohort_classes cc ON ca.class_id = cc.id
                WHERE cc.cohort_id = NEW.cohort_id AND ca.student_id = e.user_id AND cc.status = 'completed'
            ) count_attended
        )
        WHERE e.cohort_id = NEW.cohort_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_update_cohort_progress ON public.cohort_classes;
CREATE TRIGGER tr_update_cohort_progress
AFTER UPDATE OF status ON public.cohort_classes
FOR EACH ROW
EXECUTE FUNCTION public.update_cohort_progress();

-- 8. RE-SYNC SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
