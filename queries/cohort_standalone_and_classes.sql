-- 1. Support Standalone Cohorts (Optional Course ID)
ALTER TABLE public.cohorts ALTER COLUMN course_id DROP NOT NULL;
ALTER TABLE public.cohorts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.cohorts ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Create Cohort Classes Table (Live Sessions & Assignments)
CREATE TABLE IF NOT EXISTS public.cohort_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    meeting_link TEXT,
    assignment_details TEXT,
    assignment_deadline TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Cohort Announcements Table
CREATE TABLE IF NOT EXISTS public.cohort_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES public.users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Fix Visibility RLS for Cohorts (Ensure students can see open batches)
DROP POLICY IF EXISTS "Anyone can view open cohorts" ON public.cohorts;
CREATE POLICY "Anyone can view open cohorts" ON public.cohorts
FOR SELECT USING (status = 'open' OR instructor_id = auth.uid());

-- 5. Enable RLS on new tables
ALTER TABLE public.cohort_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students in cohort can view classes" ON public.cohort_classes
FOR SELECT USING (
    EXISTS (SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND cohort_id = public.cohort_classes.cohort_id)
    OR EXISTS (SELECT 1 FROM cohorts WHERE id = public.cohort_classes.cohort_id AND instructor_id = auth.uid())
);

CREATE POLICY "Students in cohort can view announcements" ON public.cohort_announcements
FOR SELECT USING (
    EXISTS (SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND cohort_id = public.cohort_announcements.cohort_id)
    OR EXISTS (SELECT 1 FROM cohorts WHERE id = public.cohort_announcements.cohort_id AND instructor_id = auth.uid())
);

-- 6. Add "Notified" tracking to announcements (simulated email flag)
ALTER TABLE public.cohort_announcements ADD COLUMN IF NOT EXISTS is_notified BOOLEAN DEFAULT FALSE;
