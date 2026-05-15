-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create live_classes table
CREATE TABLE IF NOT EXISTS public.live_classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    meeting_url TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to view live classes
CREATE POLICY "Allow authenticated users to read live classes" 
ON public.live_classes 
FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Allow admins to insert, update, delete
CREATE POLICY "Allow admins to manage live classes" 
ON public.live_classes 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);
