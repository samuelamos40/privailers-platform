-- Fix Row Level Security Policies for Registration
-- Run this in Supabase SQL Editor to allow user registration

-- Users Table Policies
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- 1. Allow anyone to insert their own user record during registration
CREATE POLICY "Allow user registration"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- 2. Users can read their own data
CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (auth.uid() = id OR role = 'admin');

-- 3. Users can update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Only admins can delete users
CREATE POLICY "Admins can delete users"
ON users FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Enrollments Table Policies
DROP POLICY IF EXISTS "Allow enrollment creation" ON enrollments;
DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can update own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON enrollments;

-- Allow students to be enrolled during registration
CREATE POLICY "Allow enrollment creation"
ON enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments"
ON enrollments FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Students can update their own enrollment progress
CREATE POLICY "Students can update own enrollments"
ON enrollments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Leads Table Policies
DROP POLICY IF EXISTS "Anyone can create leads" ON leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON leads;
DROP POLICY IF EXISTS "Admins can update leads" ON leads;

CREATE POLICY "Anyone can create leads"
ON leads FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all leads"
ON leads FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update leads"
ON leads FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
