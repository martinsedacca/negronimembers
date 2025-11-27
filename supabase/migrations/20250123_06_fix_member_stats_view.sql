-- =============================================================================
-- Migration: Fix member_stats view - Prevent count multiplication
-- Description: Recreate view with proper JOINs to avoid counting duplicates
-- Date: 2025-01-10
-- Version: 2 (Final)
-- =============================================================================

-- Drop existing view
DROP VIEW IF EXISTS member_stats;

-- Recreate view with corrected aggregations (using subqueries to avoid multiplication)
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
    -- Usage stats (from card_usage only)
    COALESCE(usage_stats.total_visits, 0) as total_visits,
    COALESCE(usage_stats.total_purchases, 0) as total_purchases,
    COALESCE(usage_stats.total_events, 0) as total_events,
    COALESCE(usage_stats.lifetime_spent, 0) as lifetime_spent,
    COALESCE(usage_stats.visits_last_30_days, 0) as visits_last_30_days,
    COALESCE(usage_stats.spent_last_30_days, 0) as spent_last_30_days,
    COALESCE(usage_stats.visits_last_90_days, 0) as visits_last_90_days,
    COALESCE(usage_stats.spent_last_90_days, 0) as spent_last_90_days,
    usage_stats.last_visit,
    COALESCE(usage_stats.average_purchase, 0) as average_purchase,
    -- Promotions used (from applied_promotions)
    COALESCE(promo_stats.promotions_used, 0) as promotions_used,
    -- Wallet status (from wallet_passes)
    COALESCE(wallet_stats.has_wallet, false) as has_wallet,
    wallet_stats.wallet_types
FROM members m
LEFT JOIN (
    -- Subquery for usage statistics (simplified - no event_type or amount_spent in initial schema)
    SELECT 
        member_id,
        COUNT(*) as total_visits,
        0::bigint as total_purchases,
        0::bigint as total_events,
        0::numeric as lifetime_spent,
        COUNT(*) FILTER (WHERE usage_date >= NOW() - INTERVAL '30 days') as visits_last_30_days,
        0::numeric as spent_last_30_days,
        COUNT(*) FILTER (WHERE usage_date >= NOW() - INTERVAL '90 days') as visits_last_90_days,
        0::numeric as spent_last_90_days,
        MAX(usage_date) as last_visit,
        0::numeric as average_purchase
    FROM card_usage
    GROUP BY member_id
) usage_stats ON m.id = usage_stats.member_id
LEFT JOIN (
    -- Subquery for promotions
    SELECT 
        member_id,
        COUNT(DISTINCT promotion_id) as promotions_used
    FROM applied_promotions
    GROUP BY member_id
) promo_stats ON m.id = promo_stats.member_id
LEFT JOIN (
    -- Subquery for wallet status
    SELECT 
        member_id,
        COUNT(*) > 0 as has_wallet,
        ARRAY_AGG(pass_type) as wallet_types
    FROM wallet_passes
    GROUP BY member_id
) wallet_stats ON m.id = wallet_stats.member_id;

-- Grant permissions
GRANT SELECT ON member_stats TO authenticated;

-- Add comment
COMMENT ON VIEW member_stats IS 'Aggregated member statistics with fixed JOIN logic to prevent count multiplication';
