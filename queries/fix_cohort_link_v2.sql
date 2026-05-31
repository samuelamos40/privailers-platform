-- Advanced Fix for Python for Data Analysis Cohort
-- This script will list all matches first so you can verify

-- 1. List all courses and cohorts with "Python" in them
SELECT id, title, 'COURSE' as type FROM courses WHERE title ILIKE '%Python%';
SELECT id, name, 'COHORT' as type FROM cohorts WHERE name ILIKE '%Python%';

-- 2. Attempt the link (Safe Version)
DO $$ 
DECLARE
    cid UUID;
    coid UUID;
BEGIN
    -- Try to find the BEST matches
    SELECT id INTO cid FROM courses WHERE title ILIKE 'Python for Data Analysis%' ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO coid FROM cohorts WHERE name ILIKE 'Python for Data Analysis%' ORDER BY created_at DESC LIMIT 1;

    IF cid IS NOT NULL AND coid IS NOT NULL THEN
        UPDATE cohorts SET course_id = cid WHERE id = coid;
        RAISE NOTICE 'SUCCESS: Linked Cohort % to Course %', coid, cid;
    ELSE
        RAISE NOTICE 'WARNING: Could not find exact match. Please use the IDs from the lists above to manually update.';
    END IF;
END $$;
