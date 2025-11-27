-- =====================================================
-- MIGRATION: Coupons → Codes System
-- Description: Change from discount coupons to member codes
-- =====================================================

-- 1. Rename coupons table to codes
ALTER TABLE IF EXISTS coupons RENAME TO codes;

-- 2. Rename coupon_redemptions to member_codes
ALTER TABLE IF EXISTS coupon_redemptions RENAME TO member_codes;

-- 3. Update codes table structure
-- Remove discount-related columns
ALTER TABLE codes DROP COLUMN IF EXISTS discount_type;
ALTER TABLE codes DROP COLUMN IF EXISTS discount_value;
ALTER TABLE codes DROP COLUMN IF EXISTS branch_id;

-- Rename max_redemptions to max_uses
ALTER TABLE codes RENAME COLUMN max_redemptions TO max_uses;

-- 4. Update member_codes table
-- Remove branch_id if exists
ALTER TABLE member_codes DROP COLUMN IF EXISTS branch_id;

-- Rename coupon_id to code_id
ALTER TABLE member_codes RENAME COLUMN coupon_id TO code_id;

-- Update foreign key
ALTER TABLE member_codes DROP CONSTRAINT IF EXISTS coupon_redemptions_coupon_id_fkey;
ALTER TABLE member_codes DROP CONSTRAINT IF EXISTS member_codes_coupon_id_fkey;
ALTER TABLE member_codes 
  ADD CONSTRAINT member_codes_code_id_fkey 
  FOREIGN KEY (code_id) REFERENCES codes(id) ON DELETE CASCADE;

-- 5. Update promotions table for code-based benefits
-- Add applicable_to column (replaces applicable_membership_types)
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS applicable_to TEXT[] DEFAULT ARRAY['all'];

-- Migrate existing data
UPDATE promotions
SET applicable_to = CASE
  WHEN 'Member' = ANY(applicable_membership_types) AND 'Gold' = ANY(applicable_membership_types) THEN ARRAY['all']
  WHEN 'Member' = ANY(applicable_membership_types) THEN ARRAY['tier:Member']
  WHEN 'Gold' = ANY(applicable_membership_types) THEN ARRAY['tier:Gold']
  ELSE ARRAY['all']
END
WHERE applicable_to IS NULL OR applicable_to = ARRAY['all'];

-- Keep old column for now (can be removed later if needed)
-- ALTER TABLE promotions DROP COLUMN applicable_membership_types;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_codes_code ON codes(code);
CREATE INDEX IF NOT EXISTS idx_codes_is_active ON codes(is_active);
CREATE INDEX IF NOT EXISTS idx_member_codes_member_id ON member_codes(member_id);
CREATE INDEX IF NOT EXISTS idx_member_codes_code_id ON member_codes(code_id);
CREATE INDEX IF NOT EXISTS idx_promotions_applicable_to ON promotions USING GIN(applicable_to);

-- 7. Add comments
COMMENT ON TABLE codes IS 'Member codes that unlock special benefits (formerly coupons)';
COMMENT ON TABLE member_codes IS 'Tracks which members have redeemed which codes';
COMMENT ON COLUMN promotions.applicable_to IS 'Array of applicability rules: ["all"], ["tier:Member"], ["tier:Gold"], ["code:AERO"], etc.';

-- 8. Update RLS policies
-- Drop old policies
DROP POLICY IF EXISTS "Users can view active coupons" ON codes;
DROP POLICY IF EXISTS "Admins can manage coupons" ON codes;
DROP POLICY IF EXISTS "Users can view their redemptions" ON member_codes;
DROP POLICY IF EXISTS "Admins can manage redemptions" ON member_codes;

-- Create new policies for codes
CREATE POLICY "Users can view active codes" ON codes
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage codes" ON codes
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create new policies for member_codes
CREATE POLICY "Users can view their codes" ON member_codes
  FOR SELECT
  USING (auth.uid()::text = member_id::text);

CREATE POLICY "Users can redeem codes" ON member_codes
  FOR INSERT
  WITH CHECK (auth.uid()::text = member_id::text);

CREATE POLICY "Admins can manage member codes" ON member_codes
  FOR ALL
  USING (auth.role() = 'authenticated');

-- 9. Create helper function to check if member has code
CREATE OR REPLACE FUNCTION member_has_code(p_member_id UUID, p_code_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM member_codes mc
    JOIN codes c ON c.id = mc.code_id
    WHERE mc.member_id = p_member_id
    AND c.code = UPPER(p_code_text)
    AND c.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create helper function to get member's applicable benefits
CREATE OR REPLACE FUNCTION get_member_benefits(p_member_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  icon TEXT,
  discount_type TEXT,
  discount_value NUMERIC
) AS $$
DECLARE
  v_member_tier TEXT;
  v_member_codes TEXT[];
BEGIN
  -- Get member's tier
  SELECT membership_type INTO v_member_tier
  FROM members
  WHERE id = p_member_id;

  -- Get member's codes
  SELECT ARRAY_AGG('code:' || c.code)
  INTO v_member_codes
  FROM member_codes mc
  JOIN codes c ON c.id = mc.code_id
  WHERE mc.member_id = p_member_id
  AND c.is_active = true;

  -- Return benefits that apply to this member
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.icon,
    p.discount_type,
    p.discount_value
  FROM promotions p
  WHERE p.is_active = true
  AND (
    'all' = ANY(p.applicable_to)
    OR ('tier:' || v_member_tier) = ANY(p.applicable_to)
    OR (v_member_codes && p.applicable_to) -- Array overlap operator
  )
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
