-- Migration: System Configuration
-- Date: 2025-01-10
-- Description: Create system_config table for configurable settings

-- =============================================================================
-- 1. CREATE SYSTEM_CONFIG TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- 2. INSERT DEFAULT CONFIG
-- =============================================================================

INSERT INTO system_config (key, value, description) VALUES
('points_rules', '{
  "per_dollar_spent": 1,
  "per_visit": 10,
  "per_event_attended": 20
}'::jsonb, 'Reglas de acumulación de puntos'),

('tier_thresholds', '{
  "Basic": {"min_spent": 0, "min_visits": 0},
  "Silver": {"min_spent": 500, "min_visits": 20},
  "Gold": {"min_spent": 2000, "min_visits": 50},
  "Platinum": {"min_spent": 5000, "min_visits": 100}
}'::jsonb, 'Umbrales para cambio de tier automático')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 3. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_system_config_updated_at 
BEFORE UPDATE ON system_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Everyone can read config
CREATE POLICY "Anyone can view system config" ON system_config
FOR SELECT USING (true);

-- Only authenticated users can update config
CREATE POLICY "Authenticated users can update config" ON system_config
FOR UPDATE USING (auth.role() = 'authenticated');

-- =============================================================================
-- DONE!
-- =============================================================================
