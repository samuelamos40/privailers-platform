-- Create a secure RPC function to wipe a cohort
-- This function runs as 'security definer', bypassing RLS for this specific task
-- Only Admins and the Cohort's Instructor are allowed to call it

CREATE OR REPLACE FUNCTION public.wipe_cohort(target_cohort_id UUID)
RETURNS void AS $$
DECLARE
    requester_role TEXT;
    is_owner BOOLEAN;
BEGIN
    -- 1. Check permissions
    SELECT role INTO requester_role FROM public.users WHERE id = auth.uid();
    SELECT (instructor_id = auth.uid()) INTO is_owner FROM public.cohorts WHERE id = target_cohort_id;

    IF requester_role != 'admin' AND (requester_role != 'instructor' OR NOT is_owner) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins or the assigned instructor can wipe this batch.';
    END IF;

    -- 2. Perform Cascading Delete
    -- Attendance
    DELETE FROM public.cohort_attendance 
    WHERE class_id IN (SELECT id FROM public.cohort_classes WHERE cohort_id = target_cohort_id);
    
    -- Classes & Announcements
    DELETE FROM public.cohort_classes WHERE cohort_id = target_cohort_id;
    DELETE FROM public.cohort_announcements WHERE cohort_id = target_cohort_id;
    
    -- Enrollments
    DELETE FROM public.enrollments WHERE cohort_id = target_cohort_id;
    
    -- The Cohort itself
    DELETE FROM public.cohorts WHERE id = target_cohort_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
