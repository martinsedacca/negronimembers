-- =====================================================================
-- CREAR SUPERADMIN - Martin Sedacca
-- =====================================================================
-- User ID: 13e942f4-7c73-453b-9fa7-ad7ab19de218
-- =====================================================================

DO $$
DECLARE
    super_admin_user_id UUID := '13e942f4-7c73-453b-9fa7-ad7ab19de218';
    user_email TEXT;
    user_name TEXT;
BEGIN
    -- Verificar que el usuario existe en auth.users
    SELECT 
        email, 
        COALESCE(raw_user_meta_data->>'full_name', 'Super Admin') 
    INTO user_email, user_name
    FROM auth.users
    WHERE id = super_admin_user_id;
    
    IF user_email IS NULL THEN
        RAISE EXCEPTION 'Usuario no encontrado en auth.users con ID: %', super_admin_user_id;
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
        user_name,
        user_email,
        true,
        super_admin_user_id -- Se crea a sí mismo
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
        role = 'superadmin',
        is_active = true,
        updated_at = NOW();
    
    RAISE NOTICE '✅ SuperAdmin creado exitosamente!';
    RAISE NOTICE 'Email: %', user_email;
    RAISE NOTICE 'Nombre: %', user_name;
    RAISE NOTICE 'User ID: %', super_admin_user_id;
END $$;

-- =====================================================================
-- VERIFICAR QUE SE CREÓ CORRECTAMENTE
-- =====================================================================

SELECT 
    'SuperAdmin creado ✅' as status,
    su.id,
    su.user_id,
    su.email,
    su.full_name,
    su.role,
    su.is_active,
    su.created_at,
    u.email as auth_email
FROM public.system_users su
JOIN auth.users u ON su.user_id = u.id
WHERE su.user_id = '13e942f4-7c73-453b-9fa7-ad7ab19de218';

-- Deberías ver tu usuario con rol 'superadmin' ✅
