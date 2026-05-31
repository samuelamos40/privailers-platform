-- Create the lesson comments table
CREATE TABLE IF NOT EXISTS public.lesson_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can view comments for the modules they are on.
CREATE POLICY "Comments are viewable by everyone" 
    ON public.lesson_comments
    FOR SELECT USING (true);

-- Policy 2: Authenticated users can insert their own comments.
CREATE POLICY "Authenticated users can insert comments" 
    ON public.lesson_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can delete their own comments, or Admins can delete any comment.
CREATE POLICY "Users and admins can delete comments" 
    ON public.lesson_comments
    FOR DELETE USING (
        auth.uid() = user_id 
        OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );
