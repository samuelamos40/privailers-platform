-- TRIGGER TO AUTOMATICALLY UPDATE PROGRESS BASED ON ATTENDANCE
-- Whenever a class is marked as 'completed', we update the progress for all enrolled students in that cohort.

CREATE OR REPLACE FUNCTION public.update_cohort_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run when status changes to 'completed'
    IF (NEW.status = 'completed' AND OLD.status != 'completed') THEN
        
        -- Update progress for all students in this cohort
        UPDATE public.enrollments e
        SET progress = (
            SELECT 
                CASE 
                    WHEN count_total.total = 0 THEN 0
                    ELSE ROUND((count_attended.attended::float / count_total.total::float) * 100)
                END
            FROM (
                -- Total completed classes for this cohort
                SELECT count(*)::int as total 
                FROM public.cohort_classes 
                WHERE cohort_id = NEW.cohort_id AND status = 'completed'
            ) count_total,
            (
                -- Classes this student attended for this cohort
                SELECT count(*)::int as attended
                FROM public.cohort_attendance ca
                JOIN public.cohort_classes cc ON ca.class_id = cc.id
                WHERE cc.cohort_id = NEW.cohort_id AND ca.student_id = e.user_id AND cc.status = 'completed'
            ) count_attended
        )
        WHERE e.cohort_id = NEW.cohort_id;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS tr_update_cohort_progress ON public.cohort_classes;
CREATE TRIGGER tr_update_cohort_progress
AFTER UPDATE OF status ON public.cohort_classes
FOR EACH ROW
EXECUTE FUNCTION public.update_cohort_progress();
