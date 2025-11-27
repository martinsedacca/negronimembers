-- =============================================================================
-- PUSH NOTIFICATIONS SYSTEM
-- =============================================================================

-- Table to store push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    keys JSONB NOT NULL, -- Contains p256dh and auth keys
    user_agent TEXT,
    device_name TEXT,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to store push notification history
CREATE TABLE IF NOT EXISTS push_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    icon TEXT,
    url TEXT,
    badge TEXT,
    data JSONB,
    
    -- Targeting
    target_type TEXT CHECK (target_type IN ('all', 'segment', 'individual', 'tier')),
    target_filter JSONB, -- Stores filter criteria for segments
    
    -- Stats
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    
    -- Metadata
    sent_by UUID REFERENCES auth.users(id),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track individual notification deliveries
CREATE TABLE IF NOT EXISTS push_notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES push_notifications(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES push_subscriptions(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    
    status TEXT CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'clicked')),
    error_message TEXT,
    
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_member ON push_subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_push_notifications_sent_at ON push_notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_notification_deliveries_notification ON push_notification_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS idx_push_notification_deliveries_status ON push_notification_deliveries(status);

-- Triggers
CREATE TRIGGER update_push_subscriptions_updated_at 
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notification_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions" ON push_subscriptions
FOR ALL USING (auth.uid() = member_id OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view notifications" ON push_notifications
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create notifications" ON push_notifications
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view deliveries" ON push_notification_deliveries
FOR SELECT USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON push_subscriptions TO authenticated;
GRANT ALL ON push_notifications TO authenticated;
GRANT ALL ON push_notification_deliveries TO authenticated;
