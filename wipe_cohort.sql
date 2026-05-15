-- REPLACEME: Paste the actual cohort ID between the quotes below
-- Example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
-- You can get the ID by running the list_cohorts.sql script

DO $$ 
DECLARE
    target_id UUID := 'PASTE_ID_HERE'; 
BEGIN
    -- 1. Delete dependent records
    DELETE FROM cohort_attendance WHERE class_id IN (SELECT id FROM cohort_classes WHERE cohort_id = target_id);
    DELETE FROM cohort_classes WHERE cohort_id = target_id;
    DELETE FROM cohort_announcements WHERE cohort_id = target_id;
    DELETE FROM enrollments WHERE cohort_id = target_id;
    
    -- 2. Delete the cohort
    DELETE FROM cohorts WHERE id = target_id;
    
    RAISE NOTICE 'Success: Cohort and linked records removed.';
END $$;
