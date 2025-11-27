-- Migration: Branches System
-- Date: 2025-01-10
-- Description: Add branches table and migrate branch_location to branch_id

-- =============================================================================
-- 1. CREATE BRANCHES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    address TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    manager_name TEXT,
    is_active BOOLEAN DEFAULT true,
    opening_hours JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. MIGRATE EXISTING DATA (COMMENTED OUT FOR FRESH INSTALL)
-- =============================================================================

-- Insert unique branch locations from card_usage
-- INSERT INTO branches (name, is_active)
-- SELECT DISTINCT branch_location, true
-- FROM card_usage 
-- WHERE branch_location IS NOT NULL 
-- AND branch_location != ''
-- ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 3. ADD BRANCH_ID TO CARD_USAGE
-- =============================================================================

ALTER TABLE card_usage 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);

-- Migrate existing branch_location data to branch_id
-- UPDATE card_usage cu
-- SET branch_id = b.id
-- FROM branches b
-- WHERE cu.branch_location = b.name
-- AND cu.branch_id IS NULL;

-- =============================================================================
-- 4. CREATE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_branches_name ON branches(name);
CREATE INDEX IF NOT EXISTS idx_branches_is_active ON branches(is_active);
CREATE INDEX IF NOT EXISTS idx_card_usage_branch_id ON card_usage(branch_id);

-- =============================================================================
-- 5. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_branches_updated_at 
BEFORE UPDATE ON branches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view branches" ON branches
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create branches" ON branches
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update branches" ON branches
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete branches" ON branches
FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================================================
-- 7. VIEW FOR BRANCH STATS
-- =============================================================================

CREATE OR REPLACE VIEW branch_stats AS
SELECT 
    b.id,
    b.name,
    b.address,
    b.city,
    b.is_active,
    COUNT(DISTINCT cu.member_id) as unique_customers,
    COUNT(cu.id) as total_transactions,
    0 as total_purchases,
    0 as total_visits,
    0 as total_events,
    0::numeric as total_revenue,
    0::numeric as average_purchase,
    COUNT(CASE WHEN cu.usage_date >= NOW() - INTERVAL '30 days' THEN 1 END) as transactions_last_30_days,
    0::numeric as revenue_last_30_days,
    MAX(cu.usage_date) as last_transaction_date
FROM branches b
LEFT JOIN card_usage cu ON b.id = cu.branch_id
GROUP BY b.id, b.name, b.address, b.city, b.is_active;

-- Grant permissions
GRANT SELECT ON branch_stats TO authenticated;

-- =============================================================================
-- DONE!
-- =============================================================================
