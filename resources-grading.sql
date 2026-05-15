-- Create RESOURCES table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Dataset', 'Guide', 'Template', etc.
    file_url TEXT NOT NULL,
    file_size TEXT, -- Display string e.g., '2.4 MB'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create ASSIGNMENTS table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create SUBMISSIONS table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    grade INTEGER, -- 0 to 100
    feedback TEXT,
    status TEXT DEFAULT 'submitted' -- 'submitted', 'graded'
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Resources: Everyone (auth) can view, Admin can edit
CREATE POLICY "Public read resources" ON resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage resources" ON resources FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Assignments: Everyone (auth) can view, Admin can edit
CREATE POLICY "Public read assignments" ON assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage assignments" ON assignments FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Submissions: Students see/edit their own, Admins see all
CREATE POLICY "Student manage own submissions" ON submissions FOR ALL TO authenticated USING (
    auth.uid() = user_id
);
CREATE POLICY "Admin view all submissions" ON submissions FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update grading" ON submissions FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
