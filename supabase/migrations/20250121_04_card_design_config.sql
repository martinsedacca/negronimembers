-- Create card_design_config table for customizing wallet card appearance
CREATE TABLE IF NOT EXISTS public.card_design_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    
    -- General styling
    logo_text TEXT DEFAULT 'Negroni',
    organization_name TEXT DEFAULT 'Negroni Membership',
    
    -- Colors (RGB format)
    colors JSONB DEFAULT '{
        "basic": {"bg": "rgb(107, 114, 128)", "fg": "rgb(255, 255, 255)", "label": "rgb(255, 255, 255)"},
        "silver": {"bg": "rgb(192, 192, 192)", "fg": "rgb(0, 0, 0)", "label": "rgb(0, 0, 0)"},
        "gold": {"bg": "rgb(255, 215, 0)", "fg": "rgb(0, 0, 0)", "label": "rgb(0, 0, 0)"},
        "platinum": {"bg": "rgb(229, 228, 226)", "fg": "rgb(0, 0, 0)", "label": "rgb(0, 0, 0)"}
    }'::jsonb,
    
    -- Fields configuration (what to show in each section)
    header_fields JSONB DEFAULT '[
        {"key": "membership_type", "label": "TIPO", "source": "membership_type", "transform": "uppercase"}
    ]'::jsonb,
    
    primary_fields JSONB DEFAULT '[
        {"key": "member_name", "label": "MIEMBRO", "source": "full_name"}
    ]'::jsonb,
    
    secondary_fields JSONB DEFAULT '[
        {"key": "member_number", "label": "NÚMERO", "source": "member_number"},
        {"key": "points", "label": "PUNTOS", "source": "points", "changeMessage": "Tus puntos han cambiado a %@"}
    ]'::jsonb,
    
    auxiliary_fields JSONB DEFAULT '[
        {"key": "expiry_date", "label": "VENCE", "source": "expiry_date", "dateStyle": "PKDateStyleMedium"}
    ]'::jsonb,
    
    back_fields JSONB DEFAULT '[
        {"key": "email", "label": "Email", "source": "email"},
        {"key": "phone", "label": "Teléfono", "source": "phone", "optional": true},
        {"key": "joined_date", "label": "Miembro desde", "source": "joined_date", "dateStyle": "PKDateStyleMedium"},
        {"key": "terms", "label": "Términos y Condiciones", "value": "Esta tarjeta es personal e intransferible. Válida solo para el titular. Para más información visita nuestro sitio web."}
    ]'::jsonb,
    
    -- Barcode configuration
    barcode_config JSONB DEFAULT '{
        "format": "PKBarcodeFormatQR",
        "messageEncoding": "iso-8859-1",
        "messageSource": "member_number"
    }'::jsonb,
    
    -- Images (URLs or base64)
    logo_image TEXT,
    icon_image TEXT,
    background_image TEXT,
    strip_image TEXT,
    
    -- Advanced styling
    text_alignment TEXT DEFAULT 'left',
    grouping_identifier TEXT,
    suppress_strip_shine BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_card_design_config_default ON public.card_design_config(is_default) WHERE is_default = true;

-- Create trigger for updated_at
CREATE TRIGGER update_card_design_config_updated_at BEFORE UPDATE ON public.card_design_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.card_design_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view all card designs" ON public.card_design_config
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert card designs" ON public.card_design_config
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update card designs" ON public.card_design_config
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete card designs" ON public.card_design_config
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert default design configuration
INSERT INTO public.card_design_config (name, description, is_default) VALUES
    ('Diseño Predeterminado', 'Configuración de diseño predeterminada para las tarjetas de membresía', true);
