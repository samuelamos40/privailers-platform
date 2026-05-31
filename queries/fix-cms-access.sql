-- FIX CMS ACCESS (Missing Policies)
-- I previously forgot to add "Write" policies for the content tables.
-- This script fixes it so Admins can add courses/modules and Students can read them.

-- 1. Courses Table Policies
DROP POLICY IF EXISTS "Public view courses" ON courses;
DROP POLICY IF EXISTS "Admins manage courses" ON courses;

CREATE POLICY "Public view courses" ON courses FOR SELECT USING (true);

CREATE POLICY "Admins manage courses" ON courses FOR ALL USING (public.is_admin());


-- 2. Modules Table Policies
DROP POLICY IF EXISTS "Public view modules" ON modules;
DROP POLICY IF EXISTS "Admins manage modules" ON modules;

CREATE POLICY "Public view modules" ON modules FOR SELECT USING (true);

CREATE POLICY "Admins manage modules" ON modules FOR ALL USING (public.is_admin());


-- 3. Projects Table Policies (just in case)
DROP POLICY IF EXISTS "Students view own projects" ON projects;
DROP POLICY IF EXISTS "Admins manage projects" ON projects;

CREATE POLICY "Students view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage projects" ON projects FOR ALL USING (public.is_admin());
