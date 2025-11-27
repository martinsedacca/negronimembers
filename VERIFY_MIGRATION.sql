-- =====================================================================
-- SCRIPT DE VERIFICACIÓN POST-MIGRACIÓN
-- =====================================================================
-- Ejecuta este script en Supabase SQL Editor después de la migración
-- para verificar que todo se creó correctamente
-- =====================================================================

-- ============================================
-- 1. VERIFICAR TABLAS CREADAS
-- ============================================

SELECT 
  '✅ Tablas Creadas' as status,
  COUNT(*) as total_tables
FROM pg_tables 
WHERE schemaname = 'public';

-- Debería mostrar: 23 tablas

-- ============================================
-- 2. LISTAR TODAS LAS TABLAS
-- ============================================

SELECT 
  tablename as table_name,
  CASE 
    WHEN tablename IN (
      'members', 'membership_types', 'promotions', 'member_promotions',
      'wallet_passes', 'card_usage', 'codes', 'member_codes',
      'branches', 'branch_users', 'events', 'event_members',
      'push_subscriptions', 'push_notifications', 'push_notification_deliveries',
      'wallet_push_tokens', 'wallet_push_notifications',
      'scanner_locations', 'scanner_sessions',
      'system_config', 'card_design_config', 'ghl_sync_log',
      'onboarding_questions', 'member_segments'
    ) THEN '✅'
    ELSE '⚠️'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 3. VERIFICAR ROW LEVEL SECURITY (RLS)
-- ============================================

SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ Habilitado'
    ELSE '❌ Deshabilitado'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Todas deberían tener RLS habilitado (true)

-- ============================================
-- 4. VERIFICAR POLÍTICAS RLS
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN cmd = 'SELECT' THEN '📖 SELECT'
    WHEN cmd = 'INSERT' THEN '➕ INSERT'
    WHEN cmd = 'UPDATE' THEN '✏️ UPDATE'
    WHEN cmd = 'DELETE' THEN '🗑️ DELETE'
    WHEN cmd = '*' THEN '🔓 ALL'
    ELSE cmd
  END as operation
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 5. VERIFICAR ÍNDICES
-- ============================================

SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- 6. VERIFICAR TRIGGERS
-- ============================================

SELECT 
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 7. VERIFICAR DATOS INICIALES
-- ============================================

-- Membership Types
SELECT '✅ Membership Types' as data_type, COUNT(*) as count FROM public.membership_types;

-- Codes
SELECT '✅ Codes' as data_type, COUNT(*) as count FROM public.codes;

-- Branches
SELECT '✅ Branches' as data_type, COUNT(*) as count FROM public.branches;

-- ============================================
-- 8. VERIFICAR RELACIONES (FOREIGN KEYS)
-- ============================================

SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 9. RESUMEN FINAL
-- ============================================

SELECT 
  'Tablas' as item,
  COUNT(DISTINCT tablename) as total
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Índices' as item,
  COUNT(*) as total
FROM pg_indexes 
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Políticas RLS' as item,
  COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Triggers' as item,
  COUNT(*) as total
FROM information_schema.triggers
WHERE trigger_schema = 'public'

UNION ALL

SELECT 
  'Membership Types' as item,
  COUNT(*) as total
FROM public.membership_types

UNION ALL

SELECT 
  'Códigos' as item,
  COUNT(*) as total
FROM public.codes

UNION ALL

SELECT 
  'Branches' as item,
  COUNT(*) as total
FROM public.branches;

-- =====================================================================
-- VALORES ESPERADOS:
-- =====================================================================
-- Tablas: 23
-- Índices: 15+
-- Políticas RLS: 25+
-- Triggers: 15+
-- Membership Types: 2 (Member, Gold)
-- Códigos: 4 (AERO, VIP, PREMIUM, LAUNCH)
-- Branches: 1 (Aeroparque)
-- =====================================================================

-- ============================================
-- 10. VERIFICAR EXTENSIONES
-- ============================================

SELECT 
  extname as extension_name,
  extversion as version
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pg_stat_statements');

-- Deberían estar instaladas: uuid-ossp y pg_stat_statements

-- =====================================================================
-- ✅ SI TODOS LOS CHECKS PASAN, LA MIGRACIÓN FUE EXITOSA
-- =====================================================================
