-- 1. Create the Cohorts table
CREATE TABLE IF NOT EXISTS public.cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES public.users(id),
    name TEXT NOT NULL, -- e.g. "January 2026 Batch", "Weekend Professional Group"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    capacity INTEGER DEFAULT 50,
    price DECIMAL(10, 2), -- Custom price for this batch (optional)
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add cohort_id to enrollment (NULL allowed for self-paced courses)
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES public.cohorts(id);

-- 3. Enable RLS
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Public can view cohorts" ON public.cohorts;
CREATE POLICY "Public can view cohorts" ON public.cohorts 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Instructors manage own cohorts" ON public.cohorts;
CREATE POLICY "Instructors manage own cohorts" ON public.cohorts 
FOR ALL USING (
    instructor_id = auth.uid() 
    OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Helper function for instructor check if not already present
CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'instructor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
