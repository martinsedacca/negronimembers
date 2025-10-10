-- =============================================================================
-- Migration: GoHighLevel Integration
-- Description: Add tables and config for GHL contact sync
-- Date: 2025-01-10
-- =============================================================================

-- 1. Add GHL configuration to system_config
INSERT INTO system_config (key, value, description)
VALUES 
  ('ghl_api_token', '', 'GoHighLevel Private Integration Token (PIT)'),
  ('ghl_location_id', '8CuDDsReJB6uihox2LBw', 'GoHighLevel Location/Sub-account ID (default: Doral)')
ON CONFLICT (key) DO NOTHING;

-- 2. Create GHL sync log table
CREATE TABLE IF NOT EXISTS ghl_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  contact_id TEXT, -- GHL contact ID
  action TEXT NOT NULL, -- 'create', 'update', 'bulk_sync'
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  metadata JSONB,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ghl_sync_log_member_id ON ghl_sync_log(member_id);
CREATE INDEX IF NOT EXISTS idx_ghl_sync_log_synced_at ON ghl_sync_log(synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_ghl_sync_log_contact_id ON ghl_sync_log(contact_id);

-- 4. Add RLS policies
ALTER TABLE ghl_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view sync logs"
  ON ghl_sync_log
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert sync logs"
  ON ghl_sync_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 5. Grant permissions
GRANT SELECT, INSERT ON ghl_sync_log TO authenticated;

-- 6. Add comments
COMMENT ON TABLE ghl_sync_log IS 'Logs all synchronization actions between membership system and GoHighLevel';
COMMENT ON COLUMN ghl_sync_log.contact_id IS 'GoHighLevel contact ID for tracking';
COMMENT ON COLUMN ghl_sync_log.action IS 'Type of sync action: create, update, or bulk_sync';
COMMENT ON COLUMN ghl_sync_log.metadata IS 'Additional data like bulk sync results';
