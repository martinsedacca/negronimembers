-- =============================================================================
-- Migration: Fix Memberships and Benefits + Special Coupons System
-- Description: Clean incorrect data, create proper Member/Gold tiers, 
--              correct benefits in ENGLISH, and implement special coupons
-- Date: 2025-01-13
-- =============================================================================

-- =============================================================================
-- 1. CLEAN UP INCORRECT MEMBERSHIP TYPES
-- =============================================================================

-- Delete incorrect membership types
DELETE FROM membership_types WHERE name IN ('Standard', 'Premium', 'VIP');

-- Update members to use correct types (map old to new)
UPDATE members 
SET membership_type = 'Member' 
WHERE membership_type IN ('Standard', 'basic');

UPDATE members 
SET membership_type = 'Gold' 
WHERE membership_type IN ('Premium', 'VIP');

-- Insert correct membership types
INSERT INTO membership_types (id, name, description, price, color, benefits)
VALUES 
  ('40000000-0000-0000-0000-000000000001', 'Member', 'Standard membership with essential benefits', 0, '#F97316', '[
    "Free coffee at lunch",
    "10% off takeaway orders",
    "1 complimentary drink at brunch",
    "Birthday person eats free (tables 6+ people)"
  ]'),
  ('40000000-0000-0000-0000-000000000002', 'Gold', 'Premium membership with enhanced benefits', 99, '#EAB308', '[
    "All Member benefits",
    "15% off takeaway (instead of 10%)",
    "Priority reservations",
    "Exclusive events access"
  ]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  color = EXCLUDED.color,
  benefits = EXCLUDED.benefits;

-- =============================================================================
-- 2. CLEAN UP AND RECREATE BENEFITS (IN ENGLISH)
-- =============================================================================

-- Delete all incorrect promotions
DELETE FROM promotions WHERE id NOT IN (
  SELECT DISTINCT promotion_id FROM applied_promotions
);

-- Insert correct benefits in ENGLISH
INSERT INTO promotions (
  id,
  title,
  description,
  discount_type,
  discount_value,
  start_date,
  end_date,
  is_active,
  terms_conditions,
  icon,
  usage_type,
  category,
  applicable_membership_types,
  min_usage_count,
  max_usage_count
) VALUES
  -- Free Coffee at Lunch
  (
    '40000000-0000-0000-0000-000000000001',
    'Free Coffee at Lunch',
    'Get a free coffee with your lunch purchase',
    'percentage',
    100,
    NOW() - INTERVAL '1 year',
    NOW() + INTERVAL '10 years',
    true,
    'Valid Monday-Friday, 11:30am-2:30pm. One per visit.',
    '☕',
    'coffee',
    'freebie',
    ARRAY['Member', 'Gold'],
    0,
    1
  ),
  
  -- 10% Off Takeaway (Member)
  (
    '40000000-0000-0000-0000-000000000002',
    '10% Off Takeaway',
    '10% discount on all takeaway orders',
    'percentage',
    10,
    NOW() - INTERVAL '1 year',
    NOW() + INTERVAL '10 years',
    true,
    'Applicable to any takeaway order. Not valid with other discounts.',
    '🥡',
    'takeaway',
    'discount',
    ARRAY['Member'],
    0,
    NULL
  ),
  
  -- 15% Off Takeaway (Gold)
  (
    '40000000-0000-0000-0000-000000000003',
    '15% Off Takeaway',
    '15% discount on all takeaway orders (Gold exclusive)',
    'percentage',
    15,
    NOW() - INTERVAL '1 year',
    NOW() + INTERVAL '10 years',
    true,
    'Gold members only. Applicable to any takeaway order.',
    '🥡',
    'takeaway',
    'discount',
    ARRAY['Gold'],
    0,
    NULL
  ),
  
  -- Complimentary Drink at Brunch
  (
    '40000000-0000-0000-0000-000000000004',
    'Complimentary Drink at Brunch',
    'Get 1 free drink with your brunch order',
    'percentage',
    100,
    NOW() - INTERVAL '1 year',
    NOW() + INTERVAL '10 years',
    true,
    'Valid Saturday-Sunday, 9am-2pm. One drink per brunch order.',
    '🍹',
    'brunch',
    'freebie',
    ARRAY['Member', 'Gold'],
    0,
    1
  ),
  
  -- Birthday Free Meal
  (
    '40000000-0000-0000-0000-000000000005',
    'Birthday Person Eats Free',
    'Birthday person gets free meal + drink at tables of 6+ people',
    'percentage',
    100,
    NOW() - INTERVAL '1 year',
    NOW() + INTERVAL '10 years',
    true,
    'Valid on birthday month. Table must have 6 or more guests. Includes one meal and one drink of choice. Present membership card.',
    '🎂',
    'birthday',
    'freebie',
    ARRAY['Member', 'Gold'],
    0,
    1
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  icon = EXCLUDED.icon,
  usage_type = EXCLUDED.usage_type,
  category = EXCLUDED.category,
  applicable_membership_types = EXCLUDED.applicable_membership_types,
  terms_conditions = EXCLUDED.terms_conditions,
  min_usage_count = EXCLUDED.min_usage_count,
  max_usage_count = EXCLUDED.max_usage_count;

-- =============================================================================
-- 3. CREATE SPECIAL COUPONS SYSTEM
-- =============================================================================

-- Table for special coupon codes
CREATE TABLE IF NOT EXISTS special_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  max_redemptions INTEGER, -- NULL = unlimited
  current_redemptions INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track which members have redeemed which coupons
CREATE TABLE IF NOT EXISTS member_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES special_coupons(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, coupon_id)
);

-- Table for special benefits tied to coupons
CREATE TABLE IF NOT EXISTS coupon_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES special_coupons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'points')),
  discount_value NUMERIC(10,2) NOT NULL,
  icon TEXT DEFAULT '🎁',
  terms_conditions TEXT,
  usage_limit INTEGER, -- NULL = unlimited per member
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track usage of coupon benefits
CREATE TABLE IF NOT EXISTS member_coupon_benefit_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES special_coupons(id) ON DELETE CASCADE,
  benefit_id UUID NOT NULL REFERENCES coupon_benefits(id) ON DELETE CASCADE,
  card_usage_id UUID REFERENCES card_usage(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  discount_amount NUMERIC(10,2)
);

-- =============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_special_coupons_code ON special_coupons(code);
CREATE INDEX IF NOT EXISTS idx_special_coupons_active ON special_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_member_coupons_member_id ON member_coupons(member_id);
CREATE INDEX IF NOT EXISTS idx_member_coupons_coupon_id ON member_coupons(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_benefits_coupon_id ON coupon_benefits(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_benefit_usage_member_id ON member_coupon_benefit_usage(member_id);
CREATE INDEX IF NOT EXISTS idx_coupon_benefit_usage_coupon_id ON member_coupon_benefit_usage(coupon_id);

-- =============================================================================
-- 5. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE special_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_coupon_benefit_usage ENABLE ROW LEVEL SECURITY;

-- Policies for special_coupons
CREATE POLICY "Authenticated users can view active coupons" ON special_coupons
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Authenticated users can manage coupons" ON special_coupons
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies for member_coupons
CREATE POLICY "Members can view their own coupons" ON member_coupons
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Members can redeem coupons" ON member_coupons
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for coupon_benefits
CREATE POLICY "Anyone can view active coupon benefits" ON coupon_benefits
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage coupon benefits" ON coupon_benefits
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies for member_coupon_benefit_usage
CREATE POLICY "Members can view their own usage" ON member_coupon_benefit_usage
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Members can use benefits" ON member_coupon_benefit_usage
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================================================
-- 6. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_special_coupons_updated_at 
  BEFORE UPDATE ON special_coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 7. VIEWS FOR EASY QUERYING
-- =============================================================================

-- View for member's available coupon benefits
CREATE OR REPLACE VIEW member_available_coupon_benefits AS
SELECT 
  mc.member_id,
  sc.id as coupon_id,
  sc.code as coupon_code,
  sc.title as coupon_title,
  cb.id as benefit_id,
  cb.title as benefit_title,
  cb.description,
  cb.icon,
  cb.discount_type,
  cb.discount_value,
  cb.terms_conditions,
  cb.usage_limit,
  COALESCE(COUNT(usage.id), 0) as times_used,
  CASE 
    WHEN cb.usage_limit IS NULL THEN true
    WHEN COUNT(usage.id) < cb.usage_limit THEN true
    ELSE false
  END as can_use
FROM member_coupons mc
JOIN special_coupons sc ON mc.coupon_id = sc.id
JOIN coupon_benefits cb ON cb.coupon_id = sc.id
LEFT JOIN member_coupon_benefit_usage usage 
  ON usage.member_id = mc.member_id 
  AND usage.benefit_id = cb.id
WHERE sc.is_active = true
  AND cb.is_active = true
  AND (sc.valid_until IS NULL OR sc.valid_until > NOW())
GROUP BY mc.member_id, sc.id, sc.code, sc.title, cb.id, cb.title, cb.description, 
         cb.icon, cb.discount_type, cb.discount_value, cb.terms_conditions, cb.usage_limit;

GRANT SELECT ON member_available_coupon_benefits TO authenticated;

-- =============================================================================
-- 8. SAMPLE SPECIAL COUPON (AERO22)
-- =============================================================================

-- Insert example special coupon
INSERT INTO special_coupons (id, code, title, description, valid_until, max_redemptions)
VALUES (
  '50000000-0000-0000-0000-000000000001',
  'AERO22',
  'Aeroespacial 2025',
  'Special benefits for Aeroespacial 2025 event attendees',
  NOW() + INTERVAL '1 year',
  100
)
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- Insert benefits for AERO22 coupon
INSERT INTO coupon_benefits (coupon_id, title, description, discount_type, discount_value, icon, terms_conditions, usage_limit)
VALUES 
  (
    '50000000-0000-0000-0000-000000000001',
    '20% Off Total Bill',
    'Exclusive 20% discount for Aeroespacial 2025 attendees',
    'percentage',
    20,
    '🚀',
    'Valid for dine-in only. Not combinable with other offers.',
    NULL
  ),
  (
    '50000000-0000-0000-0000-000000000001',
    'Free Appetizer',
    'Get a complimentary appetizer of choice',
    'percentage',
    100,
    '🥗',
    'Choose from selected appetizers menu. One per visit.',
    1
  )
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 9. COMMENTS
-- =============================================================================

COMMENT ON TABLE special_coupons IS 'Special promotional coupon codes that members can redeem';
COMMENT ON TABLE member_coupons IS 'Tracks which members have redeemed which coupons';
COMMENT ON TABLE coupon_benefits IS 'Special benefits associated with coupon codes';
COMMENT ON TABLE member_coupon_benefit_usage IS 'Tracks usage of special coupon benefits';
COMMENT ON VIEW member_available_coupon_benefits IS 'Shows available coupon benefits for each member with usage tracking';

-- =============================================================================
-- DONE! Database cleaned and special coupons system implemented
-- =============================================================================
