-- =============================================================================
-- Migration: Add GoHighLevel Webhook Configuration
-- Description: Add webhook URL to system config for GHL integration
-- Date: 2025-01-10
-- =============================================================================

-- Insert default GHL webhook config if it doesn't exist
INSERT INTO system_config (key, value, description)
VALUES (
  'ghl_webhook_url',
  '',
  'GoHighLevel webhook URL para enviar tarjetas digitales a clientes'
)
ON CONFLICT (key) DO NOTHING;

-- Add comment
COMMENT ON TABLE system_config IS 'System-wide configuration including integrations like GoHighLevel';
