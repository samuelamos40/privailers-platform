-- Safely recreate the handler function to prevent "Database error saving new user"
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_course_id uuid;
BEGIN
  -- 1. Create the user profile
  -- We use ON CONFLICT DO NOTHING to prevent errors if the row miraculously exists
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Attempt Auto-Enrollment (Safely)
  -- We wrap this in a BEGIN...EXCEPTION block so that if enrollment fails 
  -- (e.g., no courses exist, strict constraints), it DOES NOT crash the registration!
  BEGIN
    -- Find the first available published course
    SELECT id INTO default_course_id FROM public.courses WHERE published = true LIMIT 1;
    
    IF default_course_id IS NOT NULL THEN
      INSERT INTO public.enrollments (user_id, course_id)
      VALUES (new.id, default_course_id)
      ON CONFLICT DO NOTHING;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- If auto-enrollment fails, we swallow the error so the user is still created.
    RAISE NOTICE 'Auto-enrollment failed for user %', new.id;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
