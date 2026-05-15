-- Add parent_id to support threaded replies
ALTER TABLE public.lesson_comments 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.lesson_comments(id) ON DELETE CASCADE;
