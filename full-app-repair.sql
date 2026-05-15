/**
 * MASTER REPAIR SCRIPT - PRIVIALERS PLATFORM
 * Run this in your Supabase SQL Editor.
 */

-- 1. Reload the schema cache to fix the 406 Not Acceptable errors immediately
NOTIFY pgrst, 'reload schema';

-- 2. Synchronize existing Auth users with the public profile table
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', 'Student'), 
  'student'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 3. Restore Admin access for your specific account
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'samuelamos419@gmail.com';

-- 4. Sync enrollment records for all students for the default course
INSERT INTO public.enrollments (user_id, course_id, progress, status)
SELECT 
  id, 
  '11111111-1111-1111-1111-111111111111', 
  0, 
  'active'
FROM public.users
WHERE role = 'student'
ON CONFLICT (user_id, course_id) DO NOTHING;

-- 5. Verification Output
-- This confirms how many users are now correctly registered in your platform.
SELECT email, role, created_at FROM public.users ORDER BY role ASC;
