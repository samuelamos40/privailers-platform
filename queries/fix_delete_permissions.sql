-- Add DELETE policy to enrollments so Admins can wipe cohorts
-- and students can potentially unenroll themselves

DROP POLICY IF EXISTS "Enable enrollment delete for admins" ON public.enrollments;
CREATE POLICY "Enable enrollment delete for admins" ON public.enrollments
FOR DELETE TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'instructor')
  OR auth.uid() = user_id
);

-- Also add a policy for cohort deletion just in case
DROP POLICY IF EXISTS "Admins and Instructors can delete cohorts" ON public.cohorts;
CREATE POLICY "Admins and Instructors can delete cohorts" ON public.cohorts
FOR DELETE TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  OR instructor_id = auth.uid()
);
