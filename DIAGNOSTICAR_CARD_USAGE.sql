-- ============================================================================
-- DIAGNÓSTICO: ¿Por qué falla el API de scanner stats?
-- ============================================================================

-- 1. VER QUÉ COLUMNAS TIENE LA TABLA (CRÍTICO - el API usa nombres incorrectos)
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'card_usage'
ORDER BY ordinal_position;

-- 2. VER ALGUNOS DATOS DE EJEMPLO
SELECT * FROM card_usage LIMIT 5;

-- 3. CONTAR REGISTROS
SELECT COUNT(*) as total FROM card_usage;

-- ============================================================================
-- COPIA TODOS LOS RESULTADOS Y DÁMELOS
-- ============================================================================
