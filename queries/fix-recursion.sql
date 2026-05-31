-- Fix Infinite Recursion in RLS Policies
-- The previous policies caused an infinite loop because checking if a user is an admin
-- required reading the 'users' table, which triggered the 'read' policy again.

-- 1. Create a secure function to check admin status
-- SECURITY DEFINER means it runs with the privileges of the creator (postgres/admin),
-- bypassing RLS to avoid the recursion loop.
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

-- 2. Update Users Table Policies to use the function
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

CREATE POLICY "Users and Admins can read data"
ON users FOR SELECT
USING (
  auth.uid() = id 
  OR 
  is_admin() -- Uses the secure function
);

CREATE POLICY "Admins can delete users"
ON users FOR DELETE
USING ( is_admin() );

-- 3. Update Other Tables (Enrollments, Leads) to use the new function
-- (Optional but cleaner)

DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
CREATE POLICY "Students and Admins view enrollments"
ON enrollments FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  is_admin()
);

DROP POLICY IF EXISTS "Admins can view all leads" ON leads;
CREATE POLICY "Admins can view all leads"
ON leads FOR SELECT
USING ( is_admin() );

DROP POLICY IF EXISTS "Admins can update leads" ON leads;
CREATE POLICY "Admins can update leads"
ON leads FOR UPDATE
USING ( is_admin() );
