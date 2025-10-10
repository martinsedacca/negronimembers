-- =============================================================================
-- APPLE WALLET PUSH TOKENS
-- =============================================================================

-- Table to store Apple Wallet device push tokens
CREATE TABLE IF NOT EXISTS wallet_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pass_id UUID NOT NULL REFERENCES wallet_passes(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    device_library_identifier TEXT NOT NULL,
    push_token TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    last_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(device_library_identifier, pass_id)
);

-- Table to track wallet push notifications sent
CREATE TABLE IF NOT EXISTS wallet_push_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    message TEXT NOT NULL,
    
    -- Targeting
    target_type TEXT CHECK (target_type IN ('all', 'segment', 'individual', 'tier')),
    target_filter JSONB,
    
    -- Stats
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    
    -- Metadata
    sent_by UUID REFERENCES auth.users(id),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallet_push_tokens_member ON wallet_push_tokens(member_id);
CREATE INDEX IF NOT EXISTS idx_wallet_push_tokens_active ON wallet_push_tokens(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_wallet_push_tokens_device ON wallet_push_tokens(device_library_identifier);
CREATE INDEX IF NOT EXISTS idx_wallet_push_notifications_sent_at ON wallet_push_notifications(sent_at DESC);

-- Triggers
CREATE TRIGGER update_wallet_push_tokens_updated_at 
BEFORE UPDATE ON wallet_push_tokens
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE wallet_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_push_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view wallet tokens" ON wallet_push_tokens
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage wallet tokens" ON wallet_push_tokens
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view wallet notifications" ON wallet_push_notifications
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create wallet notifications" ON wallet_push_notifications
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON wallet_push_tokens TO authenticated;
GRANT ALL ON wallet_push_notifications TO authenticated;
