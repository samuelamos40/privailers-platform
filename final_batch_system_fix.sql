-- FINAL FIX FOR BATCH SYSTEM & REGISTRATION

-- 1. FIX TABLE COLUMNS (Adding missing fields)
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES public.cohorts(id);
ALTER TABLE public.enrollments ALTER COLUMN course_id DROP NOT NULL;

ALTER TABLE public.cohort_classes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE public.cohort_classes ADD COLUMN IF NOT EXISTS use_internal_room BOOLEAN DEFAULT TRUE;

-- 2. FIX INSTRUCTOR PERMISSIONS (Allows scheduling classes & announcements)
DROP POLICY IF EXISTS "instructor_manage_classes_policy" ON public.cohort_classes;
CREATE POLICY "instructor_manage_classes_policy" ON public.cohort_classes
FOR ALL TO authenticated
USING (cohort_id IN (SELECT id FROM cohorts WHERE instructor_id = auth.uid()))
WITH CHECK (cohort_id IN (SELECT id FROM cohorts WHERE instructor_id = auth.uid()));

DROP POLICY IF EXISTS "instructor_manage_announcements" ON public.cohort_announcements;
CREATE POLICY "instructor_manage_announcements" ON public.cohort_announcements
FOR ALL TO authenticated
USING (cohort_id IN (SELECT id FROM cohorts WHERE instructor_id = auth.uid()))
WITH CHECK (cohort_id IN (SELECT id FROM cohorts WHERE instructor_id = auth.uid()));

-- 3. FIX REGISTRATION PERMISSIONS (Allows new students to enroll)
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable enrollment for all" ON public.enrollments;
CREATE POLICY "Enable enrollment for all" ON public.enrollments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable enrollment update for students" ON public.enrollments;
CREATE POLICY "Enable enrollment update for students" ON public.enrollments FOR UPDATE USING (auth.uid() = user_id);

-- 4. FIX PROGRESS TRACKING (Ensures "Mark as Complete" works)
DROP POLICY IF EXISTS "Users can manage their own progress" ON public.module_progress;
CREATE POLICY "Users can manage their own progress" ON public.module_progress
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. REMOVE OLD "ONE COURSE PER STUDENT" RESTRICTION
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_user_id_course_id_key;
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS unique_user_cohort;
ALTER TABLE public.enrollments ADD CONSTRAINT unique_user_cohort UNIQUE (user_id, cohort_id);

-- 6. DISABLE BACKGROUND AUTO-ENROLLMENT (Aggressive Cleanup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. ALLOW STUDENTS TO VIEW THEIR BATCH SCHEDULE & ANNOUNCEMENTS
ALTER TABLE public.cohort_classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "students_view_own_cohort_classes" ON public.cohort_classes;
CREATE POLICY "students_view_own_cohort_classes" ON public.cohort_classes
FOR SELECT TO authenticated
USING (cohort_id IN (SELECT cohort_id FROM enrollments WHERE user_id = auth.uid()));

ALTER TABLE public.cohort_announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "students_view_own_cohort_announcements" ON public.cohort_announcements;
CREATE POLICY "students_view_own_cohort_announcements" ON public.cohort_announcements
FOR SELECT TO authenticated
USING (cohort_id IN (SELECT cohort_id FROM enrollments WHERE user_id = auth.uid()));
