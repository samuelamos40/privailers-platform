-- Database Triggers for User Registration
-- This replaces the client-side inserts to avoid RLS issues

-- 1. Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_course_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'student') -- Default to student if missing
  );

  -- If the user is a student, enroll them in the default course
  IF (new.raw_user_meta_data->>'role' = 'student' OR new.raw_user_meta_data->>'role' IS NULL) THEN
    INSERT INTO public.enrollments (user_id, course_id, progress, status)
    VALUES (
      new.id,
      default_course_id,
      0,
      'active'
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Grant necessary permissions (just in case)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.enrollments TO service_role;
