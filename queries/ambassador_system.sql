-- ============================================
-- AMBASSADOR / AFFILIATE REFERRAL SYSTEM
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Ambassadors table
CREATE TABLE IF NOT EXISTS ambassadors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    referral_code TEXT UNIQUE NOT NULL,
    commission_rate NUMERIC DEFAULT 10,        -- % of sale ambassador earns
    discount_value NUMERIC DEFAULT 0,          -- % discount student gets
    is_active BOOLEAN DEFAULT true,
    total_referrals INTEGER DEFAULT 0,
    total_earned NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE,
    referred_user_id UUID,
    referred_email TEXT,
    course_id UUID,
    cohort_id UUID,
    amount_paid NUMERIC DEFAULT 0,
    commission_amount NUMERIC DEFAULT 0,
    commission_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies - allow all for authenticated users (admin-level access)
CREATE POLICY "Allow all for authenticated" ON ambassadors
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON referrals
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. Index for fast code lookups
CREATE INDEX IF NOT EXISTS idx_ambassadors_code ON ambassadors(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_ambassador ON referrals(ambassador_id);
