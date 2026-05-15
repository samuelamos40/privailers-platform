-- ENSURE ATTENDANCE DELETES AUTOMATICALLY WHEN A CLASS IS DELETED
-- This script adds "ON DELETE CASCADE" to the attendance table foreign key.

-- 1. Create the table if it doesn't exist (safety first)
CREATE TABLE IF NOT EXISTS public.cohort_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES public.cohort_classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- 2. If it already exists without CASCADE, let's fix it
DO $$ 
BEGIN
    -- Check if the constraint exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cohort_attendance_class_id_fkey' 
        AND table_name = 'cohort_attendance'
    ) THEN
        -- Drop if it doesn't have cascade (safest to drop and recreate)
        ALTER TABLE public.cohort_attendance DROP CONSTRAINT cohort_attendance_class_id_fkey;
        ALTER TABLE public.cohort_attendance 
        ADD CONSTRAINT cohort_attendance_class_id_fkey 
        FOREIGN KEY (class_id) REFERENCES public.cohort_classes(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. PERMISSIONS: Ensure instructors can see the data and students can check in
ALTER TABLE public.cohort_attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can log their own attendance" ON public.cohort_attendance;
CREATE POLICY "Students can log their own attendance" ON public.cohort_attendance
FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Instructors can view attendance for their cohorts" ON public.cohort_attendance;
CREATE POLICY "Instructors can view attendance for their cohorts" ON public.cohort_attendance
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM cohort_classes cc
        JOIN cohorts c ON c.id = cc.cohort_id
        WHERE cc.id = public.cohort_attendance.class_id
        AND c.instructor_id = auth.uid()
    )
);
