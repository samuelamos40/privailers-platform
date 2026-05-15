-- ADD THUMBNAIL_URL TO COURSES
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- UPDATE EXISTING COURSES WITH BRANDED ICONS
UPDATE public.courses SET thumbnail_url = '/images/icons/data-analysis.png' WHERE title ILIKE '%Data%';
UPDATE public.courses SET thumbnail_url = '/images/icons/excel.png' WHERE title ILIKE '%Excel%';
UPDATE public.courses SET thumbnail_url = '/images/icons/sql.png' WHERE title ILIKE '%SQL%';
UPDATE public.courses SET thumbnail_url = '/images/icons/general.png' WHERE thumbnail_url IS NULL;
