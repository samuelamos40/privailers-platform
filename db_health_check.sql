-- Database Health Check Script
-- Run this in Supabase SQL Editor to verify the schema status

SELECT 
    table_name, 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name IN ('enrollments', 'cohorts', 'cohort_classes', 'cohort_announcements')
    AND column_name IN ('cohort_id', 'instructor_id', 'use_internal_room', 'status', 'course_id')
ORDER BY 
    table_name;

-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('enrollments', 'cohorts', 'cohort_classes', 'cohort_announcements');
