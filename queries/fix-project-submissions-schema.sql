/**
 * FIX PROJECT SUBMISSIONS SCHEMA
 * Run this in your Supabase SQL Editor.
 */

-- 1. RENAME CURRENT PROJECTS TABLE (Acts as submissions)
-- Check if projects table exists before renaming
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='projects') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='project_submissions') THEN
    ALTER TABLE public.projects RENAME TO project_submissions;
  END IF;
END $$;

-- 2. CREATE THE NEW PROJECTS TABLE (Assignments Templates)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  guide_url TEXT,
  dataset_url TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FIX PROJECT_SUBMISSIONS COLUMNS
-- Ensure columns exist in project_submissions
DO $$ 
BEGIN 
  -- Rename submitted_at to created_at if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='project_submissions' AND column_name='submitted_at') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='project_submissions' AND column_name='created_at') THEN
    ALTER TABLE public.project_submissions RENAME COLUMN submitted_at TO created_at;
  END IF;

  -- Add created_at if it still doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='project_submissions' AND column_name='created_at') THEN
    ALTER TABLE public.project_submissions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add grade if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='project_submissions' AND column_name='grade') THEN
    ALTER TABLE public.project_submissions ADD COLUMN grade INTEGER;
  END IF;

  -- Add submission_content if missing (previously file_url)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='project_submissions' AND column_name='file_url') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='project_submissions' AND column_name='submission_content') THEN
    ALTER TABLE public.project_submissions RENAME COLUMN file_url TO submission_content;
  END IF;

  -- Add project_id if missing (to link submission to assignment)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='project_submissions' AND column_name='project_id') THEN
    ALTER TABLE public.project_submissions ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. ENABLE RLS & POLICIES
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- 5. CREATE SAFE POLICIES (No recursion)
DROP POLICY IF EXISTS "Public view assignments" ON public.projects;
CREATE POLICY "Public view assignments" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students view own submissions" ON public.project_submissions;
CREATE POLICY "Students view own submissions" ON public.project_submissions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students create submissions" ON public.project_submissions;
CREATE POLICY "Students create submissions" ON public.project_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage submissions" ON public.project_submissions;
CREATE POLICY "Admins manage submissions" ON public.project_submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 6. SEED INITIAL PROJECTS (Assignments) for each course
INSERT INTO public.projects (id, course_id, title, description)
SELECT 
  '77777777-7777-7777-7777-777777777777', -- Intro course project
  '11111111-1111-1111-1111-111111111111', 
  'Retail Sales Performance Report', 
  'Analyze the provided dataset to identify sales trends and top-performing regions.'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.projects (id, course_id, title, description)
SELECT 
  '88888888-8888-8888-8888-888888888888', -- Advanced Analytics project
  '22222222-2222-2222-2222-222222222222', 
  'Executive Dashboard Design', 
  'Build a multi-page interactive dashboard for an airline KPI analysis.'
ON CONFLICT (id) DO NOTHING;

-- 7. NOTIFY PGRST TO RELOAD SCHEMA (Fix 406 Errors)
NOTIFY pgrst, 'reload schema';

-- Verification Output
SELECT * FROM public.projects;
