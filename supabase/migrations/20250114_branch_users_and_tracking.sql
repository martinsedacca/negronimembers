-- =============================================================================
-- Migration: Branch Users and Enhanced Tracking
-- Description: Create system for branch-specific users and ensure all 
--              usage records track branch_id
-- Date: 2025-01-14
-- =============================================================================

-- =============================================================================
-- 1. CREATE BRANCH USERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS branch_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'scanner' CHECK (role IN ('manager', 'scanner', 'staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, branch_id)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_branch_users_user_id ON branch_users(user_id);
CREATE INDEX IF NOT EXISTS idx_branch_users_branch_id ON branch_users(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_users_active ON branch_users(is_active);

-- =============================================================================
-- 2. ADD BRANCH TRACKING TO COUPON BENEFIT USAGE
-- =============================================================================

-- Already has card_usage_id which links to branch, but let's add direct reference
ALTER TABLE member_coupon_benefit_usage
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);

CREATE INDEX IF NOT EXISTS idx_coupon_benefit_usage_branch_id 
ON member_coupon_benefit_usage(branch_id);

-- =============================================================================
-- 3. RLS POLICIES FOR BRANCH USERS
-- =============================================================================

ALTER TABLE branch_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their branch assignments" ON branch_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can manage branch users" ON branch_users
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- 4. FUNCTION TO GET USER'S BRANCH
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_branch_id(user_uuid UUID)
RETURNS UUID AS $$
  SELECT branch_id 
  FROM branch_users 
  WHERE user_id = user_uuid 
    AND is_active = true 
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- =============================================================================
-- 5. VIEWS FOR BRANCH ANALYTICS
-- =============================================================================

-- View: Usage by branch
CREATE OR REPLACE VIEW branch_usage_stats AS
SELECT 
  b.id as branch_id,
  b.name as branch_name,
  b.city,
  b.is_active as branch_active,
  COUNT(DISTINCT cu.member_id) as unique_members,
  COUNT(cu.id) as total_visits,
  COUNT(CASE WHEN cu.usage_date >= NOW() - INTERVAL '30 days' THEN 1 END) as visits_last_30_days,
  COUNT(CASE WHEN cu.usage_date >= NOW() - INTERVAL '7 days' THEN 1 END) as visits_last_7_days,
  MAX(cu.usage_date) as last_visit,
  COUNT(DISTINCT DATE(cu.usage_date)) as days_with_activity
FROM branches b
LEFT JOIN card_usage cu ON b.id = cu.branch_id
GROUP BY b.id, b.name, b.city, b.is_active;

GRANT SELECT ON branch_usage_stats TO authenticated;

-- View: Promotions usage by branch
CREATE OR REPLACE VIEW branch_promotions_usage AS
SELECT 
  b.id as branch_id,
  b.name as branch_name,
  p.id as promotion_id,
  p.title as promotion_title,
  p.icon,
  p.usage_type,
  COUNT(ap.id) as times_used,
  COUNT(DISTINCT ap.member_id) as unique_members,
  SUM(ap.discount_amount) as total_discount,
  COUNT(CASE WHEN ap.applied_date >= NOW() - INTERVAL '30 days' THEN 1 END) as uses_last_30_days,
  MAX(ap.applied_date) as last_used
FROM branches b
CROSS JOIN promotions p
LEFT JOIN applied_promotions ap ON ap.promotion_id = p.id
LEFT JOIN card_usage cu ON ap.card_usage_id = cu.id AND cu.branch_id = b.id
WHERE p.is_active = true
GROUP BY b.id, b.name, p.id, p.title, p.icon, p.usage_type;

GRANT SELECT ON branch_promotions_usage TO authenticated;

-- View: Special coupons usage by branch
CREATE OR REPLACE VIEW branch_coupon_usage AS
SELECT 
  b.id as branch_id,
  b.name as branch_name,
  sc.id as coupon_id,
  sc.code as coupon_code,
  sc.title as coupon_title,
  cb.id as benefit_id,
  cb.title as benefit_title,
  cb.icon,
  COUNT(usage.id) as times_used,
  COUNT(DISTINCT usage.member_id) as unique_members,
  SUM(usage.discount_amount) as total_discount,
  COUNT(CASE WHEN usage.used_at >= NOW() - INTERVAL '30 days' THEN 1 END) as uses_last_30_days,
  MAX(usage.used_at) as last_used
FROM branches b
CROSS JOIN special_coupons sc
CROSS JOIN coupon_benefits cb
LEFT JOIN member_coupon_benefit_usage usage 
  ON usage.benefit_id = cb.id 
  AND usage.branch_id = b.id
WHERE sc.is_active = true 
  AND cb.is_active = true
  AND cb.coupon_id = sc.id
GROUP BY b.id, b.name, sc.id, sc.code, sc.title, cb.id, cb.title, cb.icon;

GRANT SELECT ON branch_coupon_usage TO authenticated;

-- View: Branch staff members
CREATE OR REPLACE VIEW branch_staff_list AS
SELECT 
  b.id as branch_id,
  b.name as branch_name,
  u.id as user_id,
  u.email,
  bu.role,
  bu.is_active,
  bu.created_at as assigned_at
FROM branches b
JOIN branch_users bu ON b.id = bu.branch_id
JOIN auth.users u ON bu.user_id = u.id
WHERE bu.is_active = true;

GRANT SELECT ON branch_staff_list TO authenticated;

-- =============================================================================
-- 6. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_branch_users_updated_at 
  BEFORE UPDATE ON branch_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 7. COMMENTS
-- =============================================================================

COMMENT ON TABLE branch_users IS 'Assigns users to specific branches with roles';
COMMENT ON COLUMN branch_users.role IS 'User role at branch: manager, scanner, or staff';
COMMENT ON FUNCTION get_user_branch_id IS 'Returns the branch_id for a given user';
COMMENT ON VIEW branch_usage_stats IS 'Overview of usage statistics per branch';
COMMENT ON VIEW branch_promotions_usage IS 'Promotion usage statistics per branch';
COMMENT ON VIEW branch_coupon_usage IS 'Special coupon usage statistics per branch';
COMMENT ON VIEW branch_staff_list IS 'List of staff members assigned to each branch';

-- =============================================================================
-- 8. UPDATE EXISTING DATA TO LINK TO BRANCH
-- =============================================================================

-- Update member_coupon_benefit_usage to have branch_id from card_usage
UPDATE member_coupon_benefit_usage mcbu
SET branch_id = cu.branch_id
FROM card_usage cu
WHERE mcbu.card_usage_id = cu.id
  AND mcbu.branch_id IS NULL
  AND cu.branch_id IS NOT NULL;

-- =============================================================================
-- DONE! Branch tracking system implemented
-- =============================================================================
