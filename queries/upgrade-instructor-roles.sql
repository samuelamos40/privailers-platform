-- 1. Upgrade 'users' table to support the 'instructor' role
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'instructor', 'admin'));

-- 2. Add 'instructor_id' to the courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES public.users(id);

-- 3. Create a secure function to check if someone is an instructor
CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'instructor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Secure the 'live_classes' table so ONLY enrolled students, the course instructor, or admins can view it
DROP POLICY IF EXISTS "Anyone can view live classes" ON live_classes;
DROP POLICY IF EXISTS "Allow authenticated users to read live classes" ON live_classes;
DROP POLICY IF EXISTS "Admins manage live classes" ON live_classes;
DROP POLICY IF EXISTS "Allow admins to manage live classes" ON live_classes;

CREATE POLICY "View live classes Policy" ON live_classes
FOR SELECT USING (
  public.is_admin() 
  OR 
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = live_classes.course_id AND instructor_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE user_id = auth.uid() AND course_id = live_classes.course_id AND status = 'active'
  )
);

CREATE POLICY "Manage live classes Policy" ON live_classes
FOR ALL USING (
  public.is_admin()
  OR
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = live_classes.course_id AND instructor_id = auth.uid()
  )
);

-- 5. Likewise, we should update Course Management to allow Instructors to manage their assigned courses
DROP POLICY IF EXISTS "Admins manage courses" ON courses;
CREATE POLICY "Admins and Assigned Instructors manage courses" ON courses
FOR ALL USING (
  public.is_admin()
  OR
  instructor_id = auth.uid()
);

-- Modules Management
DROP POLICY IF EXISTS "Admins manage modules" ON modules;
CREATE POLICY "Admins and Assigned Instructors manage modules" ON modules
FOR ALL USING (
  public.is_admin()
  OR
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = modules.course_id AND instructor_id = auth.uid()
  )
);
