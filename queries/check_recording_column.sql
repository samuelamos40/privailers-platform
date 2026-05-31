-- Check if recording_url column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cohort_classes' AND column_name = 'recording_url';
