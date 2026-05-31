-- FIX: Robust RLS policies for Progress Tracking
-- Drops existing policies to ensure clean state, then adds correct ones.

-- 1. MODULE_PROGRESS POLICIES
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own progress" ON module_progress;
DROP POLICY IF EXISTS "Students insert own progress" ON module_progress;
DROP POLICY IF EXISTS "Students update own progress" ON module_progress;
DROP POLICY IF EXISTS "Admins view all progress" ON module_progress;
DROP POLICY IF EXISTS "Admins manage all progress" ON module_progress;

-- Allow students to view their own
CREATE POLICY "Students view own progress" 
ON module_progress FOR SELECT 
USING (auth.uid() = user_id);

-- Allow students to insert their own
CREATE POLICY "Students insert own progress" 
ON module_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow students to update their own
CREATE POLICY "Students update own progress" 
ON module_progress FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow admins full access
CREATE POLICY "Admins manage all progress" 
ON module_progress FOR ALL 
USING (is_admin());


-- 2. ENROLLMENTS POLICIES (Ensure updates are allowed)
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students update own enrollments" ON enrollments;

-- Ensure Update policy exists and is correct
CREATE POLICY "Students update own enrollments" 
ON enrollments FOR UPDATE 
USING (auth.uid() = user_id);

-- Grant privileges to authenticated users just in case
GRANT ALL ON TABLE module_progress TO postgres;
GRANT ALL ON TABLE module_progress TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE module_progress TO authenticated;
