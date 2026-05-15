-- 1. Fix module_progress policy (Ensures "Mark as Complete" works)
DROP POLICY IF EXISTS "Users can manage their own progress" ON public.module_progress;
CREATE POLICY "Users can manage their own progress" ON public.module_progress
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Ensure students can select enrollments for update
DROP POLICY IF EXISTS "Users can update their own enrollment" ON public.enrollments;
CREATE POLICY "Users can update their own enrollment" ON public.enrollments
FOR UPDATE USING (auth.uid() = user_id);

-- 3. Notification system support
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": false}';
