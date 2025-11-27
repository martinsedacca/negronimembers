-- =====================================================================
-- MIGRACIÓN: SISTEMA DE ROLES Y PERMISOS
-- =====================================================================
-- Fecha: Noviembre 2025
-- Versión: 3.0 - Sistema completo de 5 roles
-- 
-- ROLES:
-- 1. SuperAdmin - Control total
-- 2. Admin - Gestión sin crear otros admins
-- 3. Manager - Gestión de sucursales asignadas
-- 4. Base (Staff) - Operaciones básicas
-- 5. Member - Solo vista propia
--
-- EJECUTAR EN: Supabase Dashboard → SQL Editor
-- =====================================================================

-- ============================================
-- PASO 1: CREAR TABLA SYSTEM_USERS
-- ============================================

CREATE TABLE IF NOT EXISTS public.system_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin')),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.system_users IS 'Usuarios con roles globales (superadmin, admin)';
COMMENT ON COLUMN public.system_users.role IS 'Rol global: superadmin o admin';

-- Índices
CREATE INDEX IF NOT EXISTS idx_system_users_user_id ON public.system_users(user_id);
CREATE INDEX IF NOT EXISTS idx_system_users_role ON public.system_users(role);
CREATE INDEX IF NOT EXISTS idx_system_users_active ON public.system_users(is_active);

-- Trigger para updated_at
CREATE TRIGGER system_users_updated_at 
    BEFORE UPDATE ON public.system_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PASO 2: ACTUALIZAR BRANCH_USERS
-- ============================================

-- Cambiar roles permitidos (quitar 'admin' y 'staff', agregar 'base')
ALTER TABLE public.branch_users 
DROP CONSTRAINT IF EXISTS branch_users_role_check;

ALTER TABLE public.branch_users 
ADD CONSTRAINT branch_users_role_check 
CHECK (role IN ('manager', 'base'));

COMMENT ON COLUMN public.branch_users.role IS 'Rol en sucursal: manager o base (staff)';

-- ============================================
-- PASO 3: AGREGAR TRACKING A PROMOTIONS
-- ============================================

-- Campo: Quién creó el beneficio
ALTER TABLE public.promotions 
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);

-- Campo: A qué sucursales aplica (NULL = todas)
ALTER TABLE public.promotions 
ADD COLUMN IF NOT EXISTS applicable_branches UUID[];

COMMENT ON COLUMN public.promotions.created_by_user_id IS 'Usuario que creó el beneficio';
COMMENT ON COLUMN public.promotions.applicable_branches IS 'Sucursales donde aplica. NULL = todas (solo superadmin/admin)';

-- Índice
CREATE INDEX IF NOT EXISTS idx_promotions_created_by ON public.promotions(created_by_user_id);

-- ============================================
-- PASO 4: AGREGAR TRACKING A CODES
-- ============================================

-- Campo: Quién creó el código
ALTER TABLE public.codes 
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);

-- Campo: Sucursal asociada
ALTER TABLE public.codes 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

COMMENT ON COLUMN public.codes.created_by_user_id IS 'Usuario que creó el código';
COMMENT ON COLUMN public.codes.branch_id IS 'Sucursal asociada (NULL = global)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_codes_created_by ON public.codes(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_codes_branch ON public.codes(branch_id);

-- ============================================
-- PASO 5: TABLA DE PERMISOS (OPCIONAL)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission TEXT NOT NULL,
    resource TEXT,
    resource_id UUID,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, permission, resource, resource_id)
);

COMMENT ON TABLE public.user_permissions IS 'Permisos granulares por usuario (opcional)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON public.user_permissions(permission);

-- ============================================
-- PASO 6: FUNCIONES HELPER
-- ============================================

-- Función: Obtener rol del usuario
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Verificar si es system user (superadmin o admin)
    SELECT role INTO user_role
    FROM public.system_users
    WHERE user_id = user_uuid AND is_active = true;
    
    IF user_role IS NOT NULL THEN
        RETURN user_role;
    END IF;
    
    -- Verificar si es branch user (manager o base)
    SELECT role INTO user_role
    FROM public.branch_users
    WHERE user_id = user_uuid AND is_active = true
    LIMIT 1;
    
    IF user_role IS NOT NULL THEN
        RETURN user_role;
    END IF;
    
    -- Verificar si es miembro
    IF EXISTS (SELECT 1 FROM public.members WHERE user_id = user_uuid) THEN
        RETURN 'member';
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_role IS 'Obtiene el rol de un usuario (superadmin, admin, manager, base, member)';

-- Función: Verificar si es admin (superadmin o admin)
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.system_users 
        WHERE user_id = user_uuid 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Verificar si es superadmin
CREATE OR REPLACE FUNCTION is_superadmin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.system_users 
        WHERE user_id = user_uuid 
        AND role = 'superadmin'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Obtener sucursales del usuario
CREATE OR REPLACE FUNCTION get_user_branches(user_uuid UUID)
RETURNS TABLE(branch_id UUID, branch_name TEXT, user_role TEXT) AS $$
BEGIN
    -- Si es system user (superadmin/admin), devuelve todas las sucursales
    IF is_admin(user_uuid) THEN
        RETURN QUERY
        SELECT b.id, b.name, 'all_access'::TEXT
        FROM public.branches b
        WHERE b.is_active = true;
    ELSE
        -- Si es branch user, devuelve solo sus sucursales
        RETURN QUERY
        SELECT bu.branch_id, b.name, bu.role
        FROM public.branch_users bu
        JOIN public.branches b ON bu.branch_id = b.id
        WHERE bu.user_id = user_uuid 
        AND bu.is_active = true 
        AND b.is_active = true;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_branches IS 'Obtiene las sucursales asignadas a un usuario. Admins ven todas.';

-- Función: Verificar permisos
CREATE OR REPLACE FUNCTION user_has_permission(
    user_uuid UUID,
    required_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    user_role := get_user_role(user_uuid);
    
    CASE user_role
        WHEN 'superadmin' THEN
            RETURN TRUE; -- SuperAdmin tiene todos los permisos
        WHEN 'admin' THEN
            -- Admin no puede gestionar superadmins ni crear admins
            RETURN required_permission NOT IN ('manage_superadmins', 'create_superadmin');
        WHEN 'manager' THEN
            RETURN required_permission IN (
                'create_promotions', 'edit_own_promotions', 'delete_own_promotions',
                'create_codes', 'view_members', 'create_events', 'manage_branch'
            );
        WHEN 'base' THEN
            RETURN required_permission IN (
                'create_members', 'view_members', 'scan_qr', 'register_actions'
            );
        WHEN 'member' THEN
            RETURN required_permission IN (
                'view_own_data', 'redeem_promotions', 'view_own_history'
            );
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_has_permission IS 'Verifica si un usuario tiene un permiso específico';

-- Función: Verificar si puede editar promoción
CREATE OR REPLACE FUNCTION can_edit_promotion(
    user_uuid UUID,
    promotion_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    promotion_creator UUID;
    user_role TEXT;
BEGIN
    -- Obtener creador del beneficio
    SELECT created_by_user_id INTO promotion_creator
    FROM public.promotions
    WHERE id = promotion_uuid;
    
    -- Obtener rol del usuario
    user_role := get_user_role(user_uuid);
    
    -- SuperAdmin y Admin pueden editar cualquier beneficio
    IF user_role IN ('superadmin', 'admin') THEN
        RETURN TRUE;
    END IF;
    
    -- Manager solo puede editar sus propios beneficios
    IF user_role = 'manager' AND promotion_creator = user_uuid THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_edit_promotion IS 'Verifica si un usuario puede editar un beneficio específico';

-- ============================================
-- PASO 7: RLS POLICIES - SYSTEM_USERS
-- ============================================

ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;

-- Superadmins pueden ver todos los system_users
CREATE POLICY "Superadmins can view all system users"
ON public.system_users FOR SELECT
TO authenticated
USING (is_superadmin(auth.uid()));

-- Admins pueden ver otros admins (no superadmins)
CREATE POLICY "Admins can view other admins"
ON public.system_users FOR SELECT
TO authenticated
USING (
    role = 'admin' AND
    is_admin(auth.uid())
);

-- Usuarios pueden ver su propio registro
CREATE POLICY "Users can view their own system_users record"
ON public.system_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Solo superadmins pueden crear system_users
CREATE POLICY "Only superadmins can create system users"
ON public.system_users FOR INSERT
TO authenticated
WITH CHECK (is_superadmin(auth.uid()));

-- Solo superadmins pueden actualizar system_users
CREATE POLICY "Only superadmins can update system users"
ON public.system_users FOR UPDATE
TO authenticated
USING (is_superadmin(auth.uid()));

-- Solo superadmins pueden eliminar system_users
CREATE POLICY "Only superadmins can delete system users"
ON public.system_users FOR DELETE
TO authenticated
USING (is_superadmin(auth.uid()));

-- ============================================
-- PASO 8: RLS POLICIES - BRANCH_USERS (ACTUALIZAR)
-- ============================================

-- Eliminar políticas existentes conflictivas
DROP POLICY IF EXISTS "Authenticated users can manage branch users" ON public.branch_users;
DROP POLICY IF EXISTS "Users can view their branch assignments" ON public.branch_users;

-- Admins pueden ver todos los branch_users
CREATE POLICY "Admins can view all branch users"
ON public.branch_users FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Usuarios pueden ver sus propias asignaciones
CREATE POLICY "Users can view their own branch assignments"
ON public.branch_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Solo admins pueden crear branch_users
CREATE POLICY "Only admins can create branch users"
ON public.branch_users FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Solo admins pueden actualizar branch_users
CREATE POLICY "Only admins can update branch users"
ON public.branch_users FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

-- Solo admins pueden eliminar branch_users
CREATE POLICY "Only admins can delete branch users"
ON public.branch_users FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- ============================================
-- PASO 9: RLS POLICIES - PROMOTIONS (ACTUALIZAR)
-- ============================================

-- Eliminar políticas existentes conflictivas
DROP POLICY IF EXISTS "Everyone can view active promotions" ON public.promotions;
DROP POLICY IF EXISTS "Authenticated users can manage promotions" ON public.promotions;

-- Todos pueden ver promociones activas
CREATE POLICY "Anyone can view active promotions"
ON public.promotions FOR SELECT
USING (is_active = true);

-- Authenticated pueden ver todas (para admin)
CREATE POLICY "Authenticated can view all promotions"
ON public.promotions FOR SELECT
TO authenticated
USING (true);

-- Managers pueden crear promociones
CREATE POLICY "Managers can create promotions"
ON public.promotions FOR INSERT
TO authenticated
WITH CHECK (
    get_user_role(auth.uid()) IN ('superadmin', 'admin', 'manager')
);

-- Solo creador o admin puede editar
CREATE POLICY "Only creator or admin can update promotions"
ON public.promotions FOR UPDATE
TO authenticated
USING (can_edit_promotion(auth.uid(), id));

-- Solo creador o admin puede eliminar
CREATE POLICY "Only creator or admin can delete promotions"
ON public.promotions FOR DELETE
TO authenticated
USING (can_edit_promotion(auth.uid(), id));

-- ============================================
-- PASO 10: RLS POLICIES - CODES (ACTUALIZAR)
-- ============================================

-- Eliminar políticas existentes conflictivas
DROP POLICY IF EXISTS "Public can view active codes" ON public.codes;
DROP POLICY IF EXISTS "Authenticated users can view all codes" ON public.codes;
DROP POLICY IF EXISTS "Authenticated users can manage codes" ON public.codes;

-- Autenticados pueden ver códigos activos
CREATE POLICY "Authenticated can view active codes"
ON public.codes FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins pueden ver todos
CREATE POLICY "Admins can view all codes"
ON public.codes FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Managers y admins pueden crear códigos
CREATE POLICY "Managers and admins can create codes"
ON public.codes FOR INSERT
TO authenticated
WITH CHECK (
    get_user_role(auth.uid()) IN ('superadmin', 'admin', 'manager')
);

-- Solo creador o admin puede editar
CREATE POLICY "Only creator or admin can update codes"
ON public.codes FOR UPDATE
TO authenticated
USING (
    is_admin(auth.uid()) OR
    created_by_user_id = auth.uid()
);

-- Solo creador o admin puede eliminar
CREATE POLICY "Only creator or admin can delete codes"
ON public.codes FOR DELETE
TO authenticated
USING (
    is_admin(auth.uid()) OR
    created_by_user_id = auth.uid()
);

-- ============================================
-- PASO 11: RLS POLICIES - MEMBERS (ACTUALIZAR)
-- ============================================

-- Eliminar políticas existentes conflictivas
DROP POLICY IF EXISTS "Authenticated users can view all members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can create members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can update members" ON public.members;

-- Miembros pueden ver su propia info
CREATE POLICY "Members can view their own data"
ON public.members FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('superadmin', 'admin', 'manager', 'base')
);

-- Staff (base, manager, admin) pueden crear miembros
CREATE POLICY "Staff can create members"
ON public.members FOR INSERT
TO authenticated
WITH CHECK (
    get_user_role(auth.uid()) IN ('superadmin', 'admin', 'manager', 'base')
);

-- Staff y miembros pueden actualizar
CREATE POLICY "Staff and members can update members"
ON public.members FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('superadmin', 'admin', 'manager', 'base')
);

-- Solo admins pueden eliminar miembros
CREATE POLICY "Only admins can delete members"
ON public.members FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- ============================================
-- PASO 12: GRANTS DE PERMISOS
-- ============================================

-- Permisos en system_users
GRANT SELECT ON public.system_users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.system_users TO authenticated;

-- Permisos en user_permissions
GRANT ALL ON public.user_permissions TO authenticated;

-- ============================================
-- PASO 13: TRIGGER PARA AUTO-ASIGNAR created_by
-- ============================================

-- Trigger para promotions
CREATE OR REPLACE FUNCTION set_created_by_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_by_user_id IS NULL THEN
        NEW.created_by_user_id := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar a promotions
DROP TRIGGER IF EXISTS promotions_set_created_by ON public.promotions;
CREATE TRIGGER promotions_set_created_by
    BEFORE INSERT ON public.promotions
    FOR EACH ROW
    EXECUTE FUNCTION set_created_by_user();

-- Aplicar a codes
DROP TRIGGER IF EXISTS codes_set_created_by ON public.codes;
CREATE TRIGGER codes_set_created_by
    BEFORE INSERT ON public.codes
    FOR EACH ROW
    EXECUTE FUNCTION set_created_by_user();

-- =====================================================================
-- MIGRACIÓN COMPLETADA ✅
-- =====================================================================
-- 
-- Tablas creadas/modificadas:
-- • system_users (NUEVA)
-- • branch_users (roles actualizados)
-- • promotions (campos created_by, applicable_branches)
-- • codes (campos created_by, branch_id)
-- • user_permissions (NUEVA - opcional)
--
-- Funciones creadas:
-- • get_user_role()
-- • is_admin()
-- • is_superadmin()
-- • get_user_branches()
-- • user_has_permission()
-- • can_edit_promotion()
--
-- RLS Policies actualizadas en:
-- • system_users
-- • branch_users
-- • promotions
-- • codes
-- • members
--
-- PRÓXIMO PASO:
-- Ejecutar script para crear tu primer SuperAdmin
-- Ver: CREAR_PRIMER_SUPERADMIN.sql
--
-- =====================================================================
