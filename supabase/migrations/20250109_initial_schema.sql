-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create members table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    membership_type TEXT NOT NULL DEFAULT 'basic',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    member_number TEXT UNIQUE NOT NULL,
    joined_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create memberships table (membership types/tiers)
CREATE TABLE IF NOT EXISTS public.membership_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    benefits JSONB,
    price DECIMAL(10, 2),
    duration_months INTEGER,
    color TEXT DEFAULT '#000000',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'points')),
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    min_usage_count INTEGER DEFAULT 0,
    max_usage_count INTEGER,
    applicable_membership_types TEXT[],
    is_active BOOLEAN DEFAULT true,
    terms_conditions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create card_usage table (track when members use their cards)
CREATE TABLE IF NOT EXISTS public.card_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    usage_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location TEXT,
    notes TEXT,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create applied_promotions table (track which promotions were applied)
CREATE TABLE IF NOT EXISTS public.applied_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
    card_usage_id UUID REFERENCES public.card_usage(id) ON DELETE SET NULL,
    applied_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    discount_amount DECIMAL(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create wallet_passes table (store Apple/Google Wallet pass data)
CREATE TABLE IF NOT EXISTS public.wallet_passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    pass_type TEXT NOT NULL CHECK (pass_type IN ('apple', 'google')),
    pass_id TEXT NOT NULL UNIQUE,
    serial_number TEXT NOT NULL,
    pass_data JSONB,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_members_user_id ON public.members(user_id);
CREATE INDEX idx_members_email ON public.members(email);
CREATE INDEX idx_members_member_number ON public.members(member_number);
CREATE INDEX idx_members_status ON public.members(status);
CREATE INDEX idx_card_usage_member_id ON public.card_usage(member_id);
CREATE INDEX idx_card_usage_date ON public.card_usage(usage_date);
CREATE INDEX idx_applied_promotions_member_id ON public.applied_promotions(member_id);
CREATE INDEX idx_applied_promotions_promotion_id ON public.applied_promotions(promotion_id);
CREATE INDEX idx_wallet_passes_member_id ON public.wallet_passes(member_id);
CREATE INDEX idx_promotions_dates ON public.promotions(start_date, end_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membership_types_updated_at BEFORE UPDATE ON public.membership_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applied_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_passes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for members (authenticated users can manage all members - admin dashboard)
CREATE POLICY "Authenticated users can view all members" ON public.members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert members" ON public.members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update members" ON public.members
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete members" ON public.members
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for membership_types (public read)
CREATE POLICY "Anyone can view membership types" ON public.membership_types
    FOR SELECT USING (true);

-- RLS Policies for promotions (authenticated users can manage all)
CREATE POLICY "Authenticated users can view all promotions" ON public.promotions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert promotions" ON public.promotions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update promotions" ON public.promotions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete promotions" ON public.promotions
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for card_usage (authenticated users can manage all)
CREATE POLICY "Authenticated users can view all card usage" ON public.card_usage
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert card usage" ON public.card_usage
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update card usage" ON public.card_usage
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete card usage" ON public.card_usage
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for applied_promotions (authenticated users can manage all)
CREATE POLICY "Authenticated users can view all applied promotions" ON public.applied_promotions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert applied promotions" ON public.applied_promotions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update applied promotions" ON public.applied_promotions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete applied promotions" ON public.applied_promotions
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for wallet_passes (authenticated users can manage all)
CREATE POLICY "Authenticated users can view all wallet passes" ON public.wallet_passes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert wallet passes" ON public.wallet_passes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update wallet passes" ON public.wallet_passes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete wallet passes" ON public.wallet_passes
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some default membership types
INSERT INTO public.membership_types (name, description, benefits, price, duration_months, color) VALUES
    ('Basic', 'Membresía básica con beneficios estándar', '{"benefits": ["Acceso básico", "10% descuento", "Acumulación de puntos"]}', 0.00, 12, '#6B7280'),
    ('Silver', 'Membresía Silver con beneficios mejorados', '{"benefits": ["Acceso prioritario", "15% descuento", "Doble puntos", "Promociones exclusivas"]}', 49.99, 12, '#C0C0C0'),
    ('Gold', 'Membresía Gold premium', '{"benefits": ["Acceso VIP", "20% descuento", "Triple puntos", "Promociones exclusivas", "Eventos especiales"]}', 99.99, 12, '#FFD700'),
    ('Platinum', 'Membresía Platinum de élite', '{"benefits": ["Acceso ilimitado", "30% descuento", "Cuádruple puntos", "Todas las promociones", "Eventos VIP", "Atención personalizada"]}', 199.99, 12, '#E5E4E2');
