-- FULL DATABASE RESET SCRIPT
-- This script completely wipes the database and rebuilds it correctly.
-- Use this instead of creating a new project.

-- 1. Wipe everything
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 2. Create Tables
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Linked to auth.users.id
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'paid')),
  duration TEXT NOT NULL,
  price DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'paused')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  content TEXT NOT NULL,
  video_url TEXT
);

CREATE TABLE public.module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, module_id)
);

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'reviewed')),
  submitted_at TIMESTAMPTZ,
  feedback TEXT
);

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  interest TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('article', 'tip', 'announcement')),
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the Safe Admin Function
-- Critical: Use SECURITY DEFINER to bypass RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- 5. Create Safe Policies (No self-referencing recursion)

-- Users Table
CREATE POLICY "Users view own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins view all" ON users FOR SELECT USING (is_admin());
CREATE POLICY "Admins delete users" ON users FOR DELETE USING (is_admin());
-- IMPORTANT: Allow INSERT by trigger (system) - or simple check for now if trigger fails
CREATE POLICY "System insert" ON users FOR INSERT WITH CHECK (true);

-- Courses Table
CREATE POLICY "Public view courses" ON courses FOR SELECT USING (true);

-- Enrollments Table
CREATE POLICY "Students view own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students update own enrollments" ON enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all enrollments" ON enrollments FOR SELECT USING (is_admin());
CREATE POLICY "System insert enrollments" ON enrollments FOR INSERT WITH CHECK (true);

-- Leads Table
CREATE POLICY "Public create leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage leads" ON leads FOR ALL USING (is_admin());

-- 6. Setup Triggers for User Automation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_course_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );

  IF (new.raw_user_meta_data->>'role' = 'student' OR new.raw_user_meta_data->>'role' IS NULL) THEN
    INSERT INTO public.enrollments (user_id, course_id, progress, status)
    VALUES (new.id, default_course_id, 0, 'active');
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Seed Data (Default Course for Auto-Enrollment)
INSERT INTO public.courses (id, title, description, tier, duration)
VALUES ('11111111-1111-1111-1111-111111111111', 'Introductory Data Analysis', 'The ultimate foundation for aspiring analysts. Master Excel and SQL basics through real-world business cases.', 'free', '2 Weeks');

