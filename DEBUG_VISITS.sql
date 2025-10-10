-- =============================================================================
-- DEBUG: Investigar problema de visitas múltiples
-- =============================================================================

-- 1. Ver los últimos registros de card_usage para identificar duplicados
SELECT 
    id,
    transaction_id,
    member_id,
    event_type,
    usage_date,
    amount_spent,
    points_earned,
    created_at
FROM card_usage
ORDER BY created_at DESC
LIMIT 50;

-- 2. Buscar registros con mismo timestamp (posibles duplicados)
SELECT 
    member_id,
    event_type,
    usage_date,
    transaction_id,
    COUNT(*) as cantidad,
    ARRAY_AGG(id) as ids
FROM card_usage
WHERE usage_date >= NOW() - INTERVAL '1 hour'
GROUP BY member_id, event_type, usage_date, transaction_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 3. Ver registros sin transaction_id (legacy records o error)
SELECT 
    id,
    member_id,
    event_type,
    usage_date,
    transaction_id,
    created_at
FROM card_usage
WHERE transaction_id IS NULL
ORDER BY created_at DESC
LIMIT 20;

-- 4. Verificar si hay múltiples registros con el MISMO transaction_id (no debería pasar)
SELECT 
    transaction_id,
    COUNT(*) as cantidad,
    ARRAY_AGG(id) as ids,
    ARRAY_AGG(event_type) as types,
    ARRAY_AGG(usage_date) as dates
FROM card_usage
WHERE transaction_id IS NOT NULL
GROUP BY transaction_id
HAVING COUNT(*) > 1;

-- 5. Ver el historial completo del miembro que pasó de 35 a 48
-- REEMPLAZAR 'MEMBER_ID_AQUI' con el ID real del miembro afectado
-- SELECT 
--     id,
--     transaction_id,
--     event_type,
--     usage_date,
--     amount_spent,
--     points_earned,
--     created_at
-- FROM card_usage
-- WHERE member_id = 'MEMBER_ID_AQUI'
-- ORDER BY created_at DESC;

-- 6. Verificar la vista member_stats para este miembro
-- SELECT * FROM member_stats WHERE id = 'MEMBER_ID_AQUI';

-- 7. Contar manualmente las visitas del miembro
-- SELECT 
--     event_type,
--     COUNT(*) as cantidad
-- FROM card_usage
-- WHERE member_id = 'MEMBER_ID_AQUI'
-- GROUP BY event_type;
