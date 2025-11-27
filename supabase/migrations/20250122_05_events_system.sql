-- Migration: Events and Invitations System
-- Date: 2025-01-10
-- Description: Create events and event attendees tracking

-- =============================================================================
-- 1. CREATE EVENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    branch_id UUID REFERENCES branches(id),
    max_attendees INTEGER,
    points_reward INTEGER DEFAULT 20,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    image_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. CREATE EVENT ATTENDEES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'confirmed', 'attended', 'cancelled')),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    attended_at TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(event_id, member_id)
);

-- =============================================================================
-- 3. CREATE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_branch ON events(branch_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_member ON event_attendees(member_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON event_attendees(status);

-- =============================================================================
-- 4. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_events_updated_at 
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view events" ON events
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create events" ON events
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update events" ON events
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete events" ON events
FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view attendees" ON event_attendees
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage attendees" ON event_attendees
FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- 6. VIEW FOR EVENT STATS
-- =============================================================================

CREATE OR REPLACE VIEW event_stats AS
SELECT 
    e.id,
    e.name,
    e.description,
    e.event_date,
    e.end_date,
    e.location,
    e.branch_id,
    e.max_attendees,
    e.points_reward,
    e.status,
    e.image_url,
    e.created_at,
    COUNT(ea.id) as total_invited,
    COUNT(CASE WHEN ea.status = 'confirmed' THEN 1 END) as confirmed_count,
    COUNT(CASE WHEN ea.status = 'attended' THEN 1 END) as attended_count,
    COUNT(CASE WHEN ea.status = 'cancelled' THEN 1 END) as cancelled_count
FROM events e
LEFT JOIN event_attendees ea ON e.id = ea.event_id
GROUP BY e.id, e.name, e.description, e.event_date, e.end_date, e.location, 
         e.branch_id, e.max_attendees, e.points_reward, e.status, e.image_url, e.created_at;

-- Grant permissions
GRANT SELECT ON event_stats TO authenticated;

-- =============================================================================
-- DONE!
-- =============================================================================
