-- Script to fix Python for Data Analysis cohort association
-- This will search for the cohort and the potential courses to fix the link

DO $$ 
DECLARE
    correct_course_id UUID;
    target_cohort_id UUID;
BEGIN
    -- 1. Find the correct Python for Data Analysis course
    SELECT id INTO correct_course_id FROM courses WHERE title ILIKE '%Python for Data Analysis%' LIMIT 1;
    
    -- 2. Find the cohort that might be mislinked
    SELECT id INTO target_cohort_id FROM cohorts WHERE name ILIKE '%Python for Data Analysis%' LIMIT 1;
    
    IF target_cohort_id IS NOT NULL AND correct_course_id IS NOT NULL THEN
        UPDATE cohorts SET course_id = correct_course_id WHERE id = target_cohort_id;
        RAISE NOTICE 'Updated cohort % to point to course %', target_cohort_id, correct_course_id;
    ELSIF target_cohort_id IS NOT NULL THEN
        RAISE NOTICE 'Found cohort but could not find a course with a matching title. Please check the course name.';
    ELSE
        RAISE NOTICE 'Could not find the target cohort.';
    END IF;
END $$;
