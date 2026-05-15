-- Advanced Admin Features: Coupons and User Controls

-- 1. Create Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- e.g. "WELCOME20"
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    expires_at TIMESTAMPTZ,
    max_uses INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enhance Users Table for Access Control
-- We add these to the users table to track platform-wide access
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS access_status TEXT DEFAULT 'active' CHECK (access_status IN ('active', 'deactivated'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW();

-- 3. Row Level Security for Coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Enrollment logic will check if a coupon is valid
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
CREATE POLICY "Anyone can view active coupons" ON public.coupons 
FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

DROP POLICY IF EXISTS "Admins manage coupons" ON public.coupons;
CREATE POLICY "Admins manage coupons" ON public.coupons 
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Update Admin view of users (already usually allowed, but making explicit)
DROP POLICY IF EXISTS "Admins can update user status" ON public.users;
CREATE POLICY "Admins can update user status" ON public.users
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Atomic function to increment coupon usage
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons 
  SET used_count = used_count + 1 
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
