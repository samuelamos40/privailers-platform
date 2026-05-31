-- Add support for internal platform meetings
ALTER TABLE public.cohort_classes ADD COLUMN IF NOT EXISTS use_internal_room BOOLEAN DEFAULT true;
ALTER TABLE public.cohort_classes ADD COLUMN IF NOT EXISTS room_id TEXT;
