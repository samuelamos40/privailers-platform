/**
 * RESTORE FULL CATALOG & FIX SLOWNESS
 * Run this in your Supabase SQL Editor.
 */

-- 1. ADD MISSING COLUMN 'published'
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='published') THEN
    ALTER TABLE public.courses ADD COLUMN published BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- 2. CLEAR PREVIOUS SEED (Optional, to ensure clean restoration)
DELETE FROM public.courses WHERE id IN (
  '11111111-1111-1111-1111-111111111111', 
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- 3. INSERT 6 PROFESSIONAL COURSES
INSERT INTO public.courses (id, title, description, tier, duration, price, published) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Introductory Data Analysis', 'The ultimate foundation. Master Excel and SQL basics through real-world business cases.', 'free', '2 Weeks', NULL, TRUE),
  ('22222222-2222-2222-2222-222222222222', 'Advanced Data Analytics & Visualization', 'Deep dive into Power BI, Tableau, and advanced statistical modeling.', 'paid', '6 Weeks', 45000.00, TRUE),
  ('33333333-3333-3333-3333-333333333333', 'Python for Data Science', 'Build predictive models and automate reporting with the Python ecosystem.', 'paid', '8 Weeks', 75000.00, TRUE),
  ('44444444-4444-4444-4444-444444444444', 'Excel for Business Intelligence', 'Transform raw data into executive-level dashboards with advanced Excel.', 'paid', '4 Weeks', 25000.00, TRUE),
  ('55555555-5555-5555-5555-555555555555', 'SQL for Data Engineers', 'Master PostgreSQL, database design, and query optimization.', 'paid', '5 Weeks', 35000.00, TRUE),
  ('66666666-6666-6666-6666-666666666666', 'Data Storytelling & Reporting', 'Learn the art of communicating insights to stakeholders.', 'free', '1 Week', NULL, TRUE);

-- 4. INSERT MODULES FOR ALL COURSES (Minimal 3 per course for restoration)
INSERT INTO public.modules (course_id, title, "order", content)
SELECT id, 'Getting Started with ' || title, 1, 'Introduction and setup.' FROM public.courses
UNION ALL
SELECT id, 'Core Concepts of ' || title, 2, 'Fundamental techniques.' FROM public.courses
UNION ALL
SELECT id, 'Final Project: ' || title, 3, 'Hands-on application.' FROM public.courses;

-- 5. RE-RELOAD SCHEMA CACHE (Critical for fixing 406/Slowness)
NOTIFY pgrst, 'reload schema';

-- Verification
SELECT title, tier, price FROM public.courses WHERE published = TRUE;
