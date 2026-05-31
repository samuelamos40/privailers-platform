-- NUCLEAR OPTION: Reset Policies Completely
-- Use this if the recursion error (42P17) persists.

-- 1. Drop ALL existing policies on relevant tables to ensure a clean slate
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users and Admins can read data" ON users;

DROP POLICY IF EXISTS "Allow enrollment creation" ON enrollments;
DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can update own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students and Admins view enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON enrollments;

DROP POLICY IF EXISTS "Anyone can create leads" ON leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON leads;
DROP POLICY IF EXISTS "Admins can update leads" ON leads;

-- 2. Re-create SIMPLEST POSSIBLE policies (Non-Recursive)

-- USERS TABLE
CREATE POLICY "Enable insert for registration" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Users see themselves. Admins see everyone (using the SAFE function).
-- NOTE: Ensure you ran the previous script to create is_admin() function first!
-- If is_admin() doesn't exist, this will fail. We'll recreate it here just to be sure.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Direct query, SECURITY DEFINER escapes RLS
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Enable read access" ON users FOR SELECT
USING (
  auth.uid() = id OR is_admin()
);

CREATE POLICY "Enable update for users" ON users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Enable delete for admins" ON users FOR DELETE
USING (is_admin());

-- ENROLLMENTS TABLE
CREATE POLICY "Enable insert for enrollments" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read for enrollments" ON enrollments FOR SELECT
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Enable update for enrollments" ON enrollments FOR UPDATE
USING (auth.uid() = user_id);

-- LEADS TABLE
CREATE POLICY "Enable insert for leads" ON leads FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for leads" ON leads FOR SELECT USING (is_admin());

CREATE POLICY "Enable update for leads" ON leads FOR UPDATE USING (is_admin());
