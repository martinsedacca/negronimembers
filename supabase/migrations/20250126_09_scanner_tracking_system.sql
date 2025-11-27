-- Migration: Scanner and Tracking System
-- Date: 2025-01-10
-- Description: Add fields for amount tracking, event types, roles, segments, and invitations

-- =============================================================================
-- 1. EXTEND EXISTING TABLES
-- =============================================================================

-- Add fields to card_usage for tracking amounts and types
ALTER TABLE card_usage 
ADD COLUMN IF NOT EXISTS amount_spent DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'purchase' CHECK (event_type IN ('purchase', 'event', 'visit')),
ADD COLUMN IF NOT EXISTS branch_location TEXT,
ADD COLUMN IF NOT EXISTS served_by UUID REFERENCES auth.users(id);

-- Update members status constraint to remove suspended
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_status_check;
ALTER TABLE members ADD CONSTRAINT members_status_check 
  CHECK (status IN ('active', 'inactive'));

-- =============================================================================
-- 2. CREATE NEW TABLES
-- =============================================================================

-- User roles for access control
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'branch' CHECK (role IN ('admin', 'branch', 'readonly')),
    branch_name TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Special event invitations
CREATE TABLE IF NOT EXISTS special_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'declined', 'attended')),
    invitation_data JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved member segments for filtering
CREATE TABLE IF NOT EXISTS member_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    filters JSONB NOT NULL,
    member_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assigned promotions (separate from applied)
CREATE TABLE IF NOT EXISTS member_assigned_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id),
    auto_apply BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    UNIQUE(member_id, promotion_id)
);

-- Tier history for tracking changes
CREATE TABLE IF NOT EXISTS tier_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    old_tier TEXT NOT NULL,
    new_tier TEXT NOT NULL,
    reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. CREATE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_card_usage_amount ON card_usage(amount_spent);
CREATE INDEX IF NOT EXISTS idx_card_usage_event_type ON card_usage(event_type);
CREATE INDEX IF NOT EXISTS idx_card_usage_branch ON card_usage(branch_location);
CREATE INDEX IF NOT EXISTS idx_special_invitations_member ON special_invitations(member_id);
CREATE INDEX IF NOT EXISTS idx_special_invitations_event_date ON special_invitations(event_date);
CREATE INDEX IF NOT EXISTS idx_assigned_promotions_member ON member_assigned_promotions(member_id);
CREATE INDEX IF NOT EXISTS idx_assigned_promotions_status ON member_assigned_promotions(status);
CREATE INDEX IF NOT EXISTS idx_tier_history_member ON tier_history(member_id);

-- =============================================================================
-- 4. CREATE VIEWS
-- =============================================================================

-- Member statistics view
CREATE OR REPLACE VIEW member_stats AS
SELECT 
    m.id,
    m.full_name,
    m.email,
    m.phone,
    m.membership_type,
    m.status,
    m.member_number,
    m.joined_date,
    m.points,
    COUNT(cu.id) as total_visits,
    COUNT(CASE WHEN cu.event_type = 'purchase' THEN 1 END) as total_purchases,
    COUNT(CASE WHEN cu.event_type = 'event' THEN 1 END) as total_events,
    COALESCE(SUM(cu.amount_spent), 0) as lifetime_spent,
    COUNT(CASE WHEN cu.usage_date >= NOW() - INTERVAL '30 days' THEN 1 END) as visits_last_30_days,
    COALESCE(SUM(CASE WHEN cu.usage_date >= NOW() - INTERVAL '30 days' THEN cu.amount_spent END), 0) as spent_last_30_days,
    COUNT(CASE WHEN cu.usage_date >= NOW() - INTERVAL '90 days' THEN 1 END) as visits_last_90_days,
    COALESCE(SUM(CASE WHEN cu.usage_date >= NOW() - INTERVAL '90 days' THEN cu.amount_spent END), 0) as spent_last_90_days,
    MAX(cu.usage_date) as last_visit,
    COALESCE(AVG(cu.amount_spent) FILTER (WHERE cu.amount_spent > 0), 0) as average_purchase,
    COUNT(DISTINCT ap.promotion_id) as promotions_used
FROM members m
LEFT JOIN card_usage cu ON m.id = cu.member_id
LEFT JOIN applied_promotions ap ON m.id = ap.member_id
GROUP BY m.id;

-- Active promotions for member
CREATE OR REPLACE VIEW member_available_promotions AS
SELECT 
    m.id as member_id,
    p.id as promotion_id,
    p.title,
    p.description,
    p.discount_type,
    p.discount_value,
    p.start_date,
    p.end_date,
    p.applicable_membership_types,
    CASE 
        WHEN map.id IS NOT NULL THEN true
        ELSE false
    END as is_assigned
FROM members m
CROSS JOIN promotions p
LEFT JOIN member_assigned_promotions map ON m.id = map.member_id AND p.id = map.promotion_id
WHERE p.is_active = true
  AND p.start_date <= NOW()
  AND p.end_date >= NOW()
  AND (p.applicable_membership_types IS NULL 
       OR p.applicable_membership_types = '{}' 
       OR m.membership_type = ANY(p.applicable_membership_types));

-- =============================================================================
-- 5. CREATE FUNCTIONS
-- =============================================================================

-- Function to calculate member tier based on spending
CREATE OR REPLACE FUNCTION calculate_member_tier(p_member_id UUID)
RETURNS TEXT AS $$
DECLARE
    total_spent DECIMAL;
    total_visits INTEGER;
    current_tier TEXT;
    new_tier TEXT;
BEGIN
    -- Get current tier
    SELECT membership_type INTO current_tier
    FROM members
    WHERE id = p_member_id;
    
    -- Calculate metrics for last 12 months
    SELECT 
        COALESCE(SUM(amount_spent), 0),
        COUNT(*)
    INTO total_spent, total_visits
    FROM card_usage
    WHERE member_id = p_member_id
    AND usage_date >= NOW() - INTERVAL '12 months';
    
    -- Determine new tier based on spending
    -- Adjust these thresholds as needed
    IF total_spent >= 5000 OR total_visits >= 100 THEN
        new_tier := 'Platinum';
    ELSIF total_spent >= 2000 OR total_visits >= 50 THEN
        new_tier := 'Gold';
    ELSIF total_spent >= 500 OR total_visits >= 20 THEN
        new_tier := 'Silver';
    ELSE
        new_tier := 'Basic';
    END IF;
    
    -- Update if tier changed
    IF current_tier != new_tier THEN
        UPDATE members 
        SET membership_type = new_tier,
            updated_at = NOW()
        WHERE id = p_member_id;
        
        -- Log tier change
        INSERT INTO tier_history (member_id, old_tier, new_tier, reason)
        VALUES (p_member_id, current_tier, new_tier, 
                format('Auto-upgrade: $%s spent, %s visits in last 12 months', 
                       total_spent, total_visits));
    END IF;
    
    RETURN new_tier;
END;
$$ LANGUAGE plpgsql;

-- Function to get member count for filters
CREATE OR REPLACE FUNCTION count_members_by_filters(filters JSONB)
RETURNS INTEGER AS $$
DECLARE
    count_result INTEGER;
BEGIN
    -- This is a placeholder - implement full filter logic in app
    SELECT COUNT(*) INTO count_result FROM member_stats;
    RETURN count_result;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 6. CREATE TRIGGERS
-- =============================================================================

-- Auto-calculate tier on card usage
CREATE OR REPLACE FUNCTION trigger_update_tier()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update tier if it's a purchase with amount
    IF NEW.event_type = 'purchase' AND NEW.amount_spent > 0 THEN
        PERFORM calculate_member_tier(NEW.member_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_tier_on_usage
AFTER INSERT ON card_usage
FOR EACH ROW
EXECUTE FUNCTION trigger_update_tier();

-- Updated_at triggers for new tables
CREATE TRIGGER update_user_roles_updated_at 
BEFORE UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_special_invitations_updated_at 
BEFORE UPDATE ON special_invitations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_segments_updated_at 
BEFORE UPDATE ON member_segments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 7. ROW LEVEL SECURITY
-- =============================================================================

-- User roles policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own role" ON user_roles
FOR SELECT USING (user_id = auth.uid() OR 
                  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage roles" ON user_roles
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Special invitations policies
ALTER TABLE special_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view invitations" ON special_invitations
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create invitations" ON special_invitations
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update invitations" ON special_invitations
FOR UPDATE USING (auth.role() = 'authenticated');

-- Member segments policies
ALTER TABLE member_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view segments" ON member_segments
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create segments" ON member_segments
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update segments" ON member_segments
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete segments" ON member_segments
FOR DELETE USING (auth.role() = 'authenticated');

-- Assigned promotions policies
ALTER TABLE member_assigned_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view assigned promotions" ON member_assigned_promotions
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can assign promotions" ON member_assigned_promotions
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update assigned promotions" ON member_assigned_promotions
FOR UPDATE USING (auth.role() = 'authenticated');

-- Tier history policies
ALTER TABLE tier_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tier history" ON tier_history
FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================================================
-- 8. GRANT PERMISSIONS
-- =============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- DONE!
-- =============================================================================
