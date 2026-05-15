-- FIX: Add RLS policies for module_progress table

-- 1. Enable RLS (already done, but safe to repeat)
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;

-- 2. Allow students to VIEW their own progress
CREATE POLICY "Students view own progress" 
ON module_progress FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Allow students to INSERT their own progress
CREATE POLICY "Students insert own progress" 
ON module_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Allow students to UPDATE their own progress
CREATE POLICY "Students update own progress" 
ON module_progress FOR UPDATE 
USING (auth.uid() = user_id);

-- 5. Allow admins to view all progress
CREATE POLICY "Admins view all progress" 
ON module_progress FOR SELECT 
USING (is_admin());
