-- Ensure unique attendance records
ALTER TABLE public.cohort_attendance 
DROP CONSTRAINT IF EXISTS unique_student_class_attendance;

ALTER TABLE public.cohort_attendance 
ADD CONSTRAINT unique_student_class_attendance UNIQUE (student_id, class_id);
