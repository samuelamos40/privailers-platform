-- FIX FOR LIVE CLASSES ROW LEVEL SECURITY (RLS)
-- Ensures that students can view:
-- 1. General platform sessions (course_id IS NULL AND cohort_id IS NULL)
-- 2. Course-specific live sessions for courses they are enrolled in
-- 3. Cohort-specific live sessions for cohorts they are enrolled in
-- 4. Instructors can manage their live sessions
-- 5. Admins have full access

ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view live classes" ON live_classes;
DROP POLICY IF EXISTS "Allow authenticated users to read live classes" ON live_classes;
DROP POLICY IF EXISTS "Admins manage live classes" ON live_classes;
DROP POLICY IF EXISTS "Allow admins to manage live classes" ON live_classes;
DROP POLICY IF EXISTS "View live classes Policy" ON live_classes;
DROP POLICY IF EXISTS "Manage live classes Policy" ON live_classes;

-- SELECT Policy
CREATE POLICY "View live classes Policy" ON public.live_classes
FOR SELECT USING (
  -- Admins can view everything
  public.is_admin()
  OR
  -- General platform events are visible to all authenticated users
  (live_classes.course_id IS NULL AND live_classes.cohort_id IS NULL)
  OR
  -- Assigned instructors can view their course live classes
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = live_classes.course_id AND instructor_id = auth.uid()
  )
  OR
  -- Enrolled students can view course live classes
  EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE user_id = auth.uid() AND course_id = live_classes.course_id AND status = 'active'
  )
  OR
  -- Enrolled students can view cohort live classes
  EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE user_id = auth.uid() AND cohort_id = live_classes.cohort_id AND status = 'active'
  )
);

-- ALL / Management Policy
CREATE POLICY "Manage live classes Policy" ON public.live_classes
FOR ALL USING (
  public.is_admin()
  OR
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = live_classes.course_id AND instructor_id = auth.uid()
  )
);
