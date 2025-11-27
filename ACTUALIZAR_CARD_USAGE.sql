-- ============================================================================
-- ACTUALIZAR TABLA CARD_USAGE CON CAMPOS FALTANTES
-- Esta tabla necesita campos para tracking de scanner
-- ============================================================================

-- AGREGAR CAMPOS FALTANTES
ALTER TABLE card_usage 
ADD COLUMN IF NOT EXISTS usage_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_spent DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'purchase' CHECK (event_type IN ('purchase', 'event', 'visit')),
ADD COLUMN IF NOT EXISTS branch_location TEXT,
ADD COLUMN IF NOT EXISTS served_by UUID REFERENCES auth.users(id);

-- MIGRAR DATOS: copiar created_at a usage_date para registros existentes
UPDATE card_usage 
SET usage_date = created_at 
WHERE usage_date IS NULL;

-- CREAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_card_usage_usage_date ON card_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_card_usage_amount ON card_usage(amount_spent);
CREATE INDEX IF NOT EXISTS idx_card_usage_event_type ON card_usage(event_type);
CREATE INDEX IF NOT EXISTS idx_card_usage_branch ON card_usage(branch_location);

-- VERIFICAR RESULTADO
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'card_usage'
ORDER BY ordinal_position;

-- ============================================================================
-- EJECUTA ESTO EN SUPABASE Y DAME EL RESULTADO FINAL
-- ============================================================================
