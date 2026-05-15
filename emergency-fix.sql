-- EMERGENCY FIX: Restore Login Access
-- This script removes the "Admin Check" that was causing the infinite loop.
-- It restricts users to seeing ONLY their own profile, which is 100% safe from recursion.

-- 1. Drop ALL existing read policies on users
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users and Admins can read data" ON users;
DROP POLICY IF EXISTS "Enable read access" ON users;

-- 2. Create the SIMPLEST POSSIBLE policy
-- This allows: "If I am User X, I can read User X's data".
-- It does NOT check "Am I an admin?", so it CANNOT loop.
CREATE POLICY "Simple Login Access"
ON users FOR SELECT
USING (auth.uid() = id);

-- 3. Ensure Update/Delete still ownership bounded
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Enable update for users" ON users;

CREATE POLICY "Simple Update Access"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Note: Admin view features will be temporarily disabled for the "Users" table
-- but Login will work immediately. We can re-add Admin features safely later.
