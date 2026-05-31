-- Database Fix V2: Advanced Filtering and Roster Data

-- 1. Coupon Association
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id);

-- 2. Personalized Cohort Curriculum & Price
-- (Adding plan field for instructors to describe the personalized route)
ALTER TABLE public.cohorts ADD COLUMN IF NOT EXISTS batch_plan TEXT;
-- Price was already added to cohorts in the previous step, but ensuring it's there.

-- 3. Payment Channels for Paystack
-- No SQL needed for this, but we will update the frontend config.

-- 4. Roster Improvements
-- We'll add a way to track "Free vs Paid" status more easily. 
-- In this system, "Paid" means an enrollment exists with a payment reference.
