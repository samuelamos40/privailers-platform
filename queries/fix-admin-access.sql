-- 1. Ensure the is_admin() function is correctly defined and secure
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix Courses Policies
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
DROP POLICY IF EXISTS "Admins manage courses" ON courses;
DROP POLICY IF EXISTS "Public view courses" ON courses;

CREATE POLICY "Anyone can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Admins manage courses" ON courses FOR ALL USING (is_admin());

-- 3. Fix Modules Policies
DROP POLICY IF EXISTS "Anyone can view modules" ON modules;
DROP POLICY IF EXISTS "Admins manage modules" ON modules;
DROP POLICY IF EXISTS "Public view modules" ON modules;

CREATE POLICY "Anyone can view modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Admins manage modules" ON modules FOR ALL USING (is_admin());

-- 4. Fix Live Classes Policies
-- Create live_classes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.live_classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    meeting_url TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read live classes" ON live_classes;
DROP POLICY IF EXISTS "Allow admins to manage live classes" ON live_classes;
DROP POLICY IF EXISTS "Anyone can view live classes" ON live_classes;
DROP POLICY IF EXISTS "Admins manage live classes" ON live_classes;

CREATE POLICY "Anyone can view live classes" ON live_classes FOR SELECT USING (true);
CREATE POLICY "Admins manage live classes" ON live_classes FOR ALL USING (is_admin());

-- 5. Fix Projects Policies (for Admin grading)
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins manage projects" ON projects;

CREATE POLICY "Admins manage projects" ON projects FOR ALL USING (is_admin());
