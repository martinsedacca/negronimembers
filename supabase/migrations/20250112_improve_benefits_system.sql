-- =============================================================================
-- Migration: Improve Benefits System
-- Description: Add icon, usage_type, and category fields to promotions
-- Date: 2025-01-12
-- =============================================================================

-- =============================================================================
-- 1. ADD NEW COLUMNS TO PROMOTIONS
-- =============================================================================

-- Add icon field (emoji or icon name)
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '🎁';

-- Add usage_type for categorizing benefits
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS usage_type TEXT DEFAULT 'general';

-- Add category for grouping
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'discount';

-- Add check constraint for usage_type
ALTER TABLE promotions
ADD CONSTRAINT promotions_usage_type_check 
CHECK (usage_type IN ('coffee', 'takeaway', 'brunch', 'birthday', 'general', 'event', 'special'));

-- Add check constraint for category
ALTER TABLE promotions
ADD CONSTRAINT promotions_category_check 
CHECK (category IN ('discount', 'freebie', 'points', 'upgrade', 'special'));

-- =============================================================================
-- 2. CREATE INDEX FOR BETTER PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_promotions_usage_type ON promotions(usage_type);
CREATE INDEX IF NOT EXISTS idx_promotions_category ON promotions(category);

-- =============================================================================
-- 3. UPDATE EXISTING PROMOTIONS (if any)
-- =============================================================================

-- Set default values for existing promotions
UPDATE promotions 
SET 
  icon = '🎁',
  usage_type = 'general',
  category = 'discount'
WHERE icon IS NULL OR usage_type IS NULL OR category IS NULL;

-- =============================================================================
-- 4. INSERT STANDARD BENEFITS
-- =============================================================================

-- Delete existing sample promotions to replace with better ones
DELETE FROM promotions WHERE id IN (
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000003'
);

-- Insert standard benefits
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
  applicable_membership_types
) VALUES
  -- Coffee Discount
  (
    '30000000-0000-0000-0000-000000000001',
    '20% Descuento en Café',
    'Obtén 20% de descuento en cualquier bebida de café',
    'percentage',
    20,
    NOW() - INTERVAL '1 year',
    NOW() + INTERVAL '10 years',
    true,
    'Válido para café caliente o frío. No acumulable con otras promociones de café.',
    '☕',
    'coffee',
    'discount',
    ARRAY['Premium', 'VIP']
  ),
  
  -- Takeaway Discount
  (
    '30000000-0000-0000-0000-000000000002',
    '15% Descuento Takeaway',
    '15% de descuento en pedidos para llevar',
    'percentage',
    15,
    NOW() - INTERVAL '1 year',
    NOW() + INTERVAL '10 years',
    true,
    'Aplicable a cualquier orden para llevar. No incluye delivery.',
    '🥡',
    'takeaway',
    'discount',
    ARRAY['Standard', 'Premium', 'VIP']
  ),
  
  -- Brunch Special
  (
    '30000000-0000-0000-0000-000000000003',
    'Brunch Especial',
    'Café gratis con tu brunch los fines de semana',
    'percentage',
    100,
    NOW() - INTERVAL '1 year',
    NOW() + INTERVAL '10 years',
    true,
    'Válido sábados y domingos de 9am a 2pm. Un café por brunch ordenado.',
    '🍳',
    'brunch',
    'freebie',
    ARRAY['Premium', 'VIP']
  ),
  
  -- Birthday Gift
  (
    '30000000-0000-0000-0000-000000000004',
    'Regalo de Cumpleaños',
    'Postre o bebida gratis en tu cumpleaños',
    'percentage',
    100,
    NOW() - INTERVAL '1 year',
    NOW() + INTERVAL '10 years',
    true,
    'Válido el día de tu cumpleaños. Presentar tarjeta de membresía.',
    '🎂',
    'birthday',
    'freebie',
    ARRAY['Standard', 'Premium', 'VIP']
  ),
  
  -- VIP Free Coffee Monthly
  (
    '30000000-0000-0000-0000-000000000005',
    'Café Gratis Mensual VIP',
    'Un café gratis cada mes para miembros VIP',
    'percentage',
    100,
    NOW() - INTERVAL '1 year',
    NOW() + INTERVAL '10 years',
    true,
    'Solo para miembros VIP. Límite: 1 café por mes calendario.',
    '👑',
    'coffee',
    'freebie',
    ARRAY['VIP']
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
  terms_conditions = EXCLUDED.terms_conditions;

-- =============================================================================
-- 5. CREATE VIEW FOR BENEFIT STATISTICS
-- =============================================================================

CREATE OR REPLACE VIEW benefit_usage_stats AS
SELECT 
  p.id as promotion_id,
  p.title,
  p.icon,
  p.usage_type,
  p.category,
  p.discount_type,
  p.discount_value,
  COUNT(ap.id) as total_uses,
  COUNT(DISTINCT ap.member_id) as unique_members,
  SUM(ap.discount_amount) as total_discount_given,
  COUNT(CASE WHEN ap.applied_date >= NOW() - INTERVAL '30 days' THEN 1 END) as uses_last_30_days,
  COUNT(CASE WHEN ap.applied_date >= NOW() - INTERVAL '7 days' THEN 1 END) as uses_last_7_days,
  MAX(ap.applied_date) as last_used_date
FROM promotions p
LEFT JOIN applied_promotions ap ON p.id = ap.promotion_id
GROUP BY p.id, p.title, p.icon, p.usage_type, p.category, p.discount_type, p.discount_value
ORDER BY total_uses DESC;

-- Grant permissions
GRANT SELECT ON benefit_usage_stats TO authenticated;

-- =============================================================================
-- 6. ADD COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON COLUMN promotions.icon IS 'Emoji or icon name to display in UI (e.g., ☕, 🥡, 🍳, 🎂)';
COMMENT ON COLUMN promotions.usage_type IS 'Type of benefit: coffee, takeaway, brunch, birthday, general, event, special';
COMMENT ON COLUMN promotions.category IS 'Category: discount, freebie, points, upgrade, special';
COMMENT ON VIEW benefit_usage_stats IS 'Statistics for each benefit showing usage, members, and discounts';

-- =============================================================================
-- DONE! Benefits system improved
-- =============================================================================
