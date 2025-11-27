-- =============================================================================
-- Migration: Add Wallet Status to Member Stats View
-- Description: Update member_stats view to include wallet installation status
-- Date: 2025-01-10
-- =============================================================================

-- Drop existing view
DROP VIEW IF EXISTS member_stats;

-- Recreate view with wallet status (simplified for initial schema)
CREATE VIEW member_stats AS
SELECT 
    m.id,
    m.full_name,
    m.email,
    m.phone,
    m.membership_type,
    m.status,
    m.member_number,
    m.points,
    m.joined_date,
    m.created_at,
    m.updated_at,
    -- Usage stats (simplified - no event_type or amount_spent in initial schema)
    COALESCE(COUNT(cu.id), 0) as total_visits,
    0 as total_purchases,
    0 as total_events,
    0::numeric as lifetime_spent,
    COALESCE(COUNT(cu.id) FILTER (WHERE cu.usage_date >= NOW() - INTERVAL '30 days'), 0) as visits_last_30_days,
    0::numeric as spent_last_30_days,
    COALESCE(COUNT(cu.id) FILTER (WHERE cu.usage_date >= NOW() - INTERVAL '90 days'), 0) as visits_last_90_days,
    0::numeric as spent_last_90_days,
    MAX(cu.usage_date) as last_visit,
    0::numeric as average_purchase,
    COUNT(DISTINCT ap.promotion_id) as promotions_used,
    -- Wallet status
    COUNT(wp.id) > 0 as has_wallet,
    ARRAY_AGG(
        CASE 
            WHEN wp.id IS NOT NULL 
            THEN wp.pass_type 
            ELSE NULL 
        END
    ) FILTER (WHERE wp.id IS NOT NULL) as wallet_types
FROM members m
LEFT JOIN card_usage cu ON m.id = cu.member_id
LEFT JOIN applied_promotions ap ON m.id = ap.member_id
LEFT JOIN wallet_passes wp ON m.id = wp.member_id
GROUP BY m.id;

-- Grant permissions
GRANT SELECT ON member_stats TO authenticated;

-- Add comment
COMMENT ON VIEW member_stats IS 'Aggregated member statistics including wallet installation status';
