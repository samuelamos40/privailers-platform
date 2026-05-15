-- SEED DATA FOR COURSE PLAYER
-- Ensures we have a course and modules to display

-- 1. Ensure the default course exists
INSERT INTO public.courses (id, title, description, tier, duration)
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'Intro to Data Analytics', 
  'Start your journey into data analytics with this comprehensive introductory course.', 
  'free', 
  '2 weeks'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Clear existing modules for this course to start fresh
DELETE FROM public.modules WHERE course_id = '11111111-1111-1111-1111-111111111111';

-- 3. Insert Modules
INSERT INTO public.modules (course_id, title, "order", content, video_url) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Welcome to Data Analytics',
  1,
  'In this introductory lesson, we will explore what data analytics is and why it matters in today''s world.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ' -- Placeholder YouTube link
),
(
  '11111111-1111-1111-1111-111111111111',
  'Excel Basics for Analysts',
  2,
  'Learn the fundamental interface of Excel, how to navigate sheets, and basic formatting techniques.',
  'https://www.youtube.com/embed/calc-basics'
),
(
  '11111111-1111-1111-1111-111111111111',
  'Essential Formulas: SUM & AVERAGE',
  3,
  'Master the core arithmetic functions that form the basis of all analysis.',
  'https://www.youtube.com/embed/formulas-101'
),
(
  '11111111-1111-1111-1111-111111111111',
  'Data Visualization - Charts & Graphs',
  4,
  'A picture is worth a thousand numbers. Learn how to select the right chart for your data.',
  'https://www.youtube.com/embed/charts-101'
);
