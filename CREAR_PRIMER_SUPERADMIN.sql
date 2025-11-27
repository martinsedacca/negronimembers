-- =====================================================================
-- CREAR PRIMER SUPERADMIN
-- =====================================================================
-- Ejecutar DESPUÉS de la migración principal
-- Ejecutar UNA SOLA VEZ
-- =====================================================================

-- ============================================
-- OPCIÓN 1: Crear SuperAdmin desde usuario existente
-- ============================================

-- SI YA TIENES UN USUARIO EN SUPABASE AUTH:
-- 1. Ve a: Supabase Dashboard → Authentication → Users
-- 2. Copia el UUID de tu usuario
-- 3. Reemplaza 'TU_USER_ID_AQUI' con ese UUID
-- 4. Ejecuta este script

DO $$
DECLARE
    super_admin_user_id UUID := 'TU_USER_ID_AQUI'; -- ← CAMBIAR ESTO
    user_email TEXT;
    user_name TEXT;
BEGIN
    -- Verificar que el usuario existe
    SELECT email, raw_user_meta_data->>'full_name'
    INTO user_email, user_name
    FROM auth.users
    WHERE id = super_admin_user_id;
    
    IF user_email IS NULL THEN
        RAISE EXCEPTION 'Usuario no encontrado. Verifica el UUID.';
    END IF;
    
    -- Crear entrada en system_users
    INSERT INTO public.system_users (
        user_id,
        role,
        full_name,
        email,
        is_active,
        created_by
    )
    VALUES (
        super_admin_user_id,
        'superadmin',
        COALESCE(user_name, 'Super Admin'),
        user_email,
        true,
        super_admin_user_id -- Se crea a sí mismo
    )
    ON CONFLICT (user_id) DO UPDATE
    SET role = 'superadmin',
        is_active = true;
    
    RAISE NOTICE '✅ SuperAdmin creado exitosamente';
    RAISE NOTICE 'Email: %', user_email;
    RAISE NOTICE 'Nombre: %', COALESCE(user_name, 'Super Admin');
END $$;

-- ============================================
-- OPCIÓN 2: Crear usuario Y SuperAdmin en un solo paso
-- ============================================

-- SI AÚN NO TIENES USUARIO:
-- Descomenta y completa la siguiente sección

/*
DO $$
DECLARE
    new_user_id UUID;
    user_email TEXT := 'tu-email@example.com'; -- ← CAMBIAR
    user_password TEXT := 'TuPasswordSegura123!'; -- ← CAMBIAR
    user_full_name TEXT := 'Tu Nombre Completo'; -- ← CAMBIAR
BEGIN
    -- Crear usuario en Supabase Auth
    -- NOTA: Esto requiere permisos especiales o usar el Dashboard
    RAISE EXCEPTION 'Crea el usuario primero en: Authentication → Users → Add user';
    
    -- Luego ejecuta la OPCIÓN 1 con el UUID del usuario creado
END $$;
*/

-- ============================================
-- VERIFICAR SUPERADMIN CREADO
-- ============================================

-- Ejecuta esta query para verificar:
SELECT 
    su.id,
    su.email,
    su.full_name,
    su.role,
    su.is_active,
    su.created_at,
    u.email as auth_email,
    u.created_at as user_created_at
FROM public.system_users su
JOIN auth.users u ON su.user_id = u.id
WHERE su.role = 'superadmin';

-- Deberías ver tu usuario con rol 'superadmin' ✅

-- ============================================
-- PRÓXIMOS PASOS
-- ============================================

-- 1. ✅ Verificar que el SuperAdmin se creó correctamente
-- 2. ✅ Hacer logout/login en tu app
-- 3. ✅ Verificar que puedes acceder a /dashboard/users
-- 4. ✅ Crear tu primer Admin desde la UI
-- 5. ✅ Probar creación de managers y base

-- =====================================================================
