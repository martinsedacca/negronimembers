-- =====================================================================
-- FULL PRODUCTION MIGRATION - NEGRONI MEMBERSHIP SYSTEM
-- =====================================================================
-- SUPABASE CLOUD SETUP COMPLETO
-- Fecha: Enero 2025
-- Versión: 2.0 - Incluye sistema de códigos
-- =====================================================================
-- 
-- INSTRUCCIONES:
-- 1. Copia TODO este archivo
-- 2. Pégalo en: Supabase Dashboard → SQL Editor → New Query
-- 3. Click "RUN"
-- 4. Espera 30-60 segundos
--
-- =====================================================================

-- ============================================
-- EXTENSIONES
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================
-- SCHEMA INICIAL - TABLAS PRINCIPALES
-- ============================================

-- Membership Types
CREATE TABLE IF NOT EXISTS public.membership_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    benefits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Members
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    membership_type TEXT NOT NULL DEFAULT 'Member',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    member_number TEXT UNIQUE NOT NULL,
    joined_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    points INTEGER DEFAULT 0,
    ghl_contact_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Promotions (Benefits)
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'points')),
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    applicable_to TEXT[] DEFAULT ARRAY['all'],
    min_usage_count INTEGER DEFAULT 0,
    max_usage_count INTEGER,
    is_active BOOLEAN DEFAULT true,
    terms_conditions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Promotions (redemptions)
CREATE TABLE IF NOT EXISTS public.member_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Passes
CREATE TABLE IF NOT EXISTS public.wallet_passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    pass_type_identifier TEXT NOT NULL,
    serial_number TEXT NOT NULL UNIQUE,
    authentication_token TEXT NOT NULL UNIQUE,
    voided BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card Usage Tracking
CREATE TABLE IF NOT EXISTS public.card_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    usage_type TEXT NOT NULL,
    location TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CODES SYSTEM (NUEVA)
-- ============================================

-- Codes Table
CREATE TABLE IF NOT EXISTS public.codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    max_redemptions INTEGER,
    current_redemptions INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Codes (N:M relationship)
CREATE TABLE IF NOT EXISTS public.member_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    code_id UUID NOT NULL REFERENCES public.codes(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, code_id)
);

-- ============================================
-- BRANCHES SYSTEM
-- ============================================

-- Branches
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branch Users
CREATE TABLE IF NOT EXISTS public.branch_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, branch_id)
);

-- ============================================
-- EVENTS SYSTEM
-- ============================================

-- Events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    capacity INTEGER,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Members (attendees)
CREATE TABLE IF NOT EXISTS public.event_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    attended BOOLEAN DEFAULT false,
    attended_at TIMESTAMPTZ,
    UNIQUE(event_id, member_id)
);

-- ============================================
-- PUSH NOTIFICATIONS
-- ============================================

-- Push Subscriptions (Web)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push Notifications
CREATE TABLE IF NOT EXISTS public.push_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    icon TEXT,
    badge TEXT,
    data JSONB DEFAULT '{}',
    target_type TEXT DEFAULT 'all' CHECK (target_type IN ('all', 'specific', 'segment')),
    target_ids TEXT[],
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push Notification Deliveries
CREATE TABLE IF NOT EXISTS public.push_notification_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES public.push_notifications(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.push_subscriptions(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error TEXT,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Push Tokens (Apple Wallet)
CREATE TABLE IF NOT EXISTS public.wallet_push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pass_serial_number TEXT NOT NULL,
    device_library_identifier TEXT NOT NULL,
    push_token TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pass_serial_number, device_library_identifier)
);

-- Wallet Push Notifications
CREATE TABLE IF NOT EXISTS public.wallet_push_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pass_serial_number TEXT NOT NULL,
    title TEXT,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCANNER & TRACKING
-- ============================================

-- Scanner Locations
CREATE TABLE IF NOT EXISTS public.scanner_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    location_type TEXT NOT NULL CHECK (location_type IN ('entry', 'exit', 'checkpoint', 'pos')),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scanner Sessions
CREATE TABLE IF NOT EXISTS public.scanner_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    scanner_location_id UUID NOT NULL REFERENCES public.scanner_locations(id) ON DELETE CASCADE,
    scan_type TEXT NOT NULL CHECK (scan_type IN ('check_in', 'check_out', 'purchase', 'verification')),
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONFIGURATION
-- ============================================

-- System Config
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card Design Config
CREATE TABLE IF NOT EXISTS public.card_design_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GHL Sync Log
CREATE TABLE IF NOT EXISTS public.ghl_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    ghl_contact_id TEXT,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    error_message TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding Questions
CREATE TABLE IF NOT EXISTS public.onboarding_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '{}',
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Segments
CREATE TABLE IF NOT EXISTS public.member_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    segment_name TEXT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, segment_name)
);

-- ============================================
-- INDICES PARA OPTIMIZACIÓN
-- ============================================

-- Members indices
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_members_member_number ON public.members(member_number);
CREATE INDEX IF NOT EXISTS idx_members_membership_type ON public.members(membership_type);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
CREATE INDEX IF NOT EXISTS idx_members_ghl_contact_id ON public.members(ghl_contact_id);

-- Codes indices
CREATE INDEX IF NOT EXISTS idx_codes_code ON public.codes(code);
CREATE INDEX IF NOT EXISTS idx_codes_is_active ON public.codes(is_active);
CREATE INDEX IF NOT EXISTS idx_codes_valid_dates ON public.codes(valid_from, valid_until);

-- Member codes indices
CREATE INDEX IF NOT EXISTS idx_member_codes_member ON public.member_codes(member_id);
CREATE INDEX IF NOT EXISTS idx_member_codes_code ON public.member_codes(code_id);

-- Events indices
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_branch ON public.events(branch_id);

-- Promotions indices
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON public.promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions(is_active);

-- Scanner sessions indices
CREATE INDEX IF NOT EXISTS idx_scanner_sessions_member ON public.scanner_sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_scanner_sessions_location ON public.scanner_sessions(scanner_location_id);
CREATE INDEX IF NOT EXISTS idx_scanner_sessions_scanned_at ON public.scanner_sessions(scanned_at);

-- Card usage indices
CREATE INDEX IF NOT EXISTS idx_card_usage_member ON public.card_usage(member_id);
CREATE INDEX IF NOT EXISTS idx_card_usage_type ON public.card_usage(usage_type);
CREATE INDEX IF NOT EXISTS idx_card_usage_created ON public.card_usage(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanner_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanner_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_design_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghl_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_segments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - MEMBERS
-- ============================================

CREATE POLICY "Users can view their own member profile"
    ON public.members FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can view all members"
    ON public.members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create members"
    ON public.members FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update members"
    ON public.members FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- RLS POLICIES - CODES
-- ============================================

CREATE POLICY "Public can view active codes"
    ON public.codes FOR SELECT
    USING (is_active = true);

CREATE POLICY "Authenticated users can view all codes"
    ON public.codes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage codes"
    ON public.codes FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- RLS POLICIES - MEMBER CODES
-- ============================================

CREATE POLICY "Members can view their own codes"
    ON public.member_codes FOR SELECT
    TO authenticated
    USING (
        member_id IN (
            SELECT id FROM public.members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can view all member codes"
    ON public.member_codes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage member codes"
    ON public.member_codes FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- RLS POLICIES - OTHER TABLES
-- ============================================

-- Promotions
CREATE POLICY "Everyone can view active promotions"
    ON public.promotions FOR SELECT
    USING (is_active = true);

CREATE POLICY "Authenticated users can manage promotions"
    ON public.promotions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Events
CREATE POLICY "Everyone can view active events"
    ON public.events FOR SELECT
    USING (is_active = true);

CREATE POLICY "Authenticated users can manage events"
    ON public.events FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Branches
CREATE POLICY "Everyone can view active branches"
    ON public.branches FOR SELECT
    USING (is_active = true);

CREATE POLICY "Authenticated users can manage branches"
    ON public.branches FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow all operations for authenticated users on remaining tables
CREATE POLICY "Authenticated users full access" ON public.membership_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.member_promotions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.wallet_passes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.card_usage FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.branch_users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.event_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.push_subscriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.push_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.push_notification_deliveries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.wallet_push_tokens FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.wallet_push_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.scanner_locations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.scanner_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.system_config FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.card_design_config FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.ghl_sync_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.onboarding_questions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON public.member_segments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- TRIGGERS - AUTO UPDATE TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER membership_types_updated_at BEFORE UPDATE ON public.membership_types FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER wallet_passes_updated_at BEFORE UPDATE ON public.wallet_passes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER codes_updated_at BEFORE UPDATE ON public.codes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER branch_users_updated_at BEFORE UPDATE ON public.branch_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER push_subscriptions_updated_at BEFORE UPDATE ON public.push_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER wallet_push_tokens_updated_at BEFORE UPDATE ON public.wallet_push_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER scanner_locations_updated_at BEFORE UPDATE ON public.scanner_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER system_config_updated_at BEFORE UPDATE ON public.system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER card_design_config_updated_at BEFORE UPDATE ON public.card_design_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- TRIGGERS - CODE REDEMPTIONS
-- ============================================

CREATE OR REPLACE FUNCTION increment_code_redemptions()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.codes
    SET current_redemptions = current_redemptions + 1
    WHERE id = NEW.code_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER member_code_redeemed
    AFTER INSERT ON public.member_codes
    FOR EACH ROW
    EXECUTE FUNCTION increment_code_redemptions();

CREATE OR REPLACE FUNCTION decrement_code_redemptions()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.codes
    SET current_redemptions = GREATEST(0, current_redemptions - 1)
    WHERE id = OLD.code_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER member_code_removed
    AFTER DELETE ON public.member_codes
    FOR EACH ROW
    EXECUTE FUNCTION decrement_code_redemptions();

-- ============================================
-- SEED DATA - INITIAL CONFIGURATION
-- ============================================

-- Insert default membership types
INSERT INTO public.membership_types (name, description, price, benefits, is_active)
VALUES 
    ('Member', 'Standard membership', 0, '{"access": "standard", "events": true, "discounts": "basic"}', true),
    ('Gold', 'Premium membership', 50, '{"access": "vip", "events": true, "discounts": "premium", "priority": true}', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample codes
INSERT INTO public.codes (code, description, is_active, max_redemptions, valid_from, valid_until)
VALUES 
    ('AERO', 'Access to Aeroparque benefits', true, NULL, NOW(), NOW() + INTERVAL '1 year'),
    ('VIP', 'VIP member benefits', true, 100, NOW(), NOW() + INTERVAL '6 months'),
    ('PREMIUM', 'Premium access', true, 50, NOW(), NOW() + INTERVAL '3 months'),
    ('LAUNCH', 'Launch event exclusive', true, 200, NOW(), NOW() + INTERVAL '2 months')
ON CONFLICT (code) DO NOTHING;

-- Insert default branch
INSERT INTO public.branches (name, address, is_active)
VALUES ('Aeroparque', 'Av. Costanera Rafael Obligado 5790, Buenos Aires', true)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- MIGRACIÓN COMPLETADA ✅
-- =====================================================================
-- 
-- Tablas creadas: 23
-- Índices optimizados: 15+
-- RLS habilitado en todas las tablas
-- Políticas de seguridad configuradas
-- Triggers automáticos activos
-- Datos de ejemplo insertados
--
-- PRÓXIMO PASO: Verificar que todo se creó correctamente
-- Ejecuta: SELECT tablename FROM pg_tables WHERE schemaname = 'public';
--
-- =====================================================================
