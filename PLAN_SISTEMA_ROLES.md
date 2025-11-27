# 🔐 PLAN COMPLETO: SISTEMA DE ROLES Y PERMISOS

**Fecha:** Noviembre 2025  
**Objetivo:** Implementar sistema robusto de roles con 5 niveles de acceso

---

## 📊 ANÁLISIS DE REQUERIMIENTOS

### **Roles Solicitados**

| Rol | Permisos | Restricciones |
|-----|----------|---------------|
| **SuperAdmin** | • Control total del sistema<br>• Crear/editar/eliminar admins<br>• Acceso a todas las sucursales<br>• Configuración global | Ninguna |
| **Admin** | • Crear managers y base<br>• Gestionar sucursales<br>• Ver reportes generales<br>• NO puede crear otros admins | No puede gestionar SuperAdmins ni Admins |
| **Manager** | • Crear beneficios para SUS sucursales<br>• Crear códigos especiales<br>• Ver miembros de sus sucursales<br>• Registrar eventos en sus sucursales | • Solo sucursales asignadas<br>• NO puede editar/eliminar beneficios de otros<br>• NO puede crear usuarios |
| **Base (Staff)** | • Dar de alta miembros<br>• Escanear QR<br>• Registrar acciones en sucursales<br>• Ver info de miembros | • Solo operaciones básicas<br>• No puede crear beneficios<br>• No puede crear usuarios |
| **Miembro** | • Ver su propia info<br>• Ver sus puntos<br>• Ver beneficios disponibles<br>• Historial de canjes | Solo acceso a sus propios datos |

---

## 🚨 PROBLEMAS IDENTIFICADOS

### **1. Estructura Actual Incompleta**

**Problema:** La tabla `branch_users` actual solo tiene:
```sql
role TEXT CHECK (role IN ('admin', 'manager', 'staff'))
```

**Faltan:**
- ✗ No hay rol `superadmin`
- ✗ No hay rol `base` (equivalente a staff pero más limitado)
- ✗ No hay distinción entre roles globales y roles de sucursal
- ✗ No hay tabla de permisos granulares
- ✗ No hay forma de identificar al primer SuperAdmin

---

### **2. Conflicto: Roles Globales vs Sucursal**

**Problema:** Un SuperAdmin/Admin debe tener acceso global, pero `branch_users` asigna usuarios a sucursales específicas.

**Solución:** Crear dos tablas separadas:
- `system_users` → Roles globales (superadmin, admin)
- `branch_users` → Roles de sucursal (manager, base)

---

### **3. Permisos de Edición de Benefits**

**Problema:** "Manager no puede modificar beneficios creados por otros"

**Falta:**
- ✗ Campo `created_by_user_id` en tabla `promotions`
- ✗ Lógica para verificar propiedad antes de editar/eliminar
- ✗ RLS policies que implementen esta restricción

---

### **4. Restricción de Sucursales**

**Problema:** Manager solo puede crear beneficios para SUS sucursales.

**Falta:**
- ✗ Relación entre `promotions` y `branches`
- ✗ Campo `applicable_branches` en promotions
- ✗ Validación en backend/RLS

---

### **5. Autenticación de Miembros**

**Problema:** Los miembros necesitan login pero no son usuarios de `auth.users`.

**Decisión requerida:**
- **Opción A:** Crear usuarios en `auth.users` para miembros
- **Opción B:** Sistema de autenticación separado para miembros
- **Recomendación:** Opción A (usar Supabase Auth)

---

### **6. Primer SuperAdmin**

**Problema:** ¿Cómo se crea el primer SuperAdmin?

**Solución:** Script de inicialización o crear manualmente en Supabase Auth + SQL.

---

## 🏗️ ARQUITECTURA DE SOLUCIÓN

### **Nueva Estructura de Tablas**

```
┌─────────────────────────────────────────────────────┐
│                   auth.users                         │
│  (Tabla de Supabase - Todos los usuarios)           │
└─────────────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌────────────────────┐    ┌────────────────────┐
│   system_users     │    │      members       │
│  (Roles globales)  │    │   (Solo miembros)  │
│                    │    │                    │
│ • superadmin       │    │ • member info      │
│ • admin            │    │ • points           │
│                    │    │ • tier             │
└────────────────────┘    └────────────────────┘
        │
        ▼
┌────────────────────┐
│   branch_users     │
│ (Roles sucursal)   │
│                    │
│ • manager          │
│ • base (staff)     │
└────────────────────┘
```

---

## 📋 PLAN DE IMPLEMENTACIÓN

### **FASE 1: Migración del Schema (1-2 horas)**

#### 1.1 Crear tabla `system_users`

```sql
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
```

#### 1.2 Actualizar tabla `branch_users`

```sql
-- Cambiar roles permitidos
ALTER TABLE public.branch_users 
DROP CONSTRAINT IF EXISTS branch_users_role_check;

ALTER TABLE public.branch_users 
ADD CONSTRAINT branch_users_role_check 
CHECK (role IN ('manager', 'base'));
```

#### 1.3 Agregar tracking a `promotions`

```sql
ALTER TABLE public.promotions 
ADD COLUMN created_by_user_id UUID REFERENCES auth.users(id);

ALTER TABLE public.promotions 
ADD COLUMN applicable_branches UUID[] DEFAULT NULL;

-- NULL = todas las sucursales (solo superadmin/admin)
-- Array = sucursales específicas (managers)
```

#### 1.4 Agregar tracking a `codes`

```sql
ALTER TABLE public.codes 
ADD COLUMN created_by_user_id UUID REFERENCES auth.users(id);

ALTER TABLE public.codes 
ADD COLUMN branch_id UUID REFERENCES public.branches(id);
```

#### 1.5 Crear tabla de permisos (opcional pero recomendado)

```sql
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
```

---

### **FASE 2: RLS Policies (1-2 horas)**

#### 2.1 System Users Policies

```sql
-- Solo superadmins pueden ver todos los system_users
CREATE POLICY "Superadmins can view all system users"
ON public.system_users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.system_users su
        WHERE su.user_id = auth.uid() 
        AND su.role = 'superadmin'
        AND su.is_active = true
    )
);

-- Admins solo pueden ver otros admins (no superadmins)
CREATE POLICY "Admins can view other admins"
ON public.system_users FOR SELECT
USING (
    role = 'admin' AND
    EXISTS (
        SELECT 1 FROM public.system_users su
        WHERE su.user_id = auth.uid() 
        AND su.role IN ('admin', 'superadmin')
        AND su.is_active = true
    )
);

-- Solo superadmins pueden crear system_users
CREATE POLICY "Superadmins can create system users"
ON public.system_users FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.system_users su
        WHERE su.user_id = auth.uid() 
        AND su.role = 'superadmin'
        AND su.is_active = true
    )
);
```

#### 2.2 Branch Users Policies

```sql
-- Superadmins y Admins pueden gestionar branch_users
CREATE POLICY "System admins can manage branch users"
ON public.branch_users FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.system_users su
        WHERE su.user_id = auth.uid() 
        AND su.role IN ('superadmin', 'admin')
        AND su.is_active = true
    )
);

-- Managers pueden ver sus propias asignaciones
CREATE POLICY "Users can view their own branch assignments"
ON public.branch_users FOR SELECT
USING (user_id = auth.uid());
```

#### 2.3 Promotions Policies

```sql
-- Managers solo pueden editar sus propios beneficios
CREATE POLICY "Managers can only edit their own promotions"
ON public.promotions FOR UPDATE
USING (
    created_by_user_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.branch_users bu
        WHERE bu.user_id = auth.uid() 
        AND bu.role = 'manager'
        AND bu.is_active = true
    )
);

-- Managers solo pueden eliminar sus propios beneficios
CREATE POLICY "Managers can only delete their own promotions"
ON public.promotions FOR DELETE
USING (
    created_by_user_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.branch_users bu
        WHERE bu.user_id = auth.uid() 
        AND bu.role = 'manager'
        AND bu.is_active = true
    )
);

-- Superadmins y Admins pueden editar/eliminar todo
CREATE POLICY "System admins can manage all promotions"
ON public.promotions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.system_users su
        WHERE su.user_id = auth.uid() 
        AND su.role IN ('superadmin', 'admin')
        AND su.is_active = true
    )
);
```

#### 2.4 Members Policies

```sql
-- Miembros solo pueden ver su propia info
CREATE POLICY "Members can view their own data"
ON public.members FOR SELECT
USING (
    user_id = auth.uid()
);

-- Staff (base) puede crear y ver miembros de sus sucursales
CREATE POLICY "Staff can manage members in their branches"
ON public.members FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.branch_users bu
        WHERE bu.user_id = auth.uid() 
        AND bu.role IN ('manager', 'base')
        AND bu.is_active = true
    )
);
```

---

### **FASE 3: Helper Functions (1 hora)**

#### 3.1 Función: Verificar rol del usuario

```sql
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Verificar si es system user
    SELECT role INTO user_role
    FROM public.system_users
    WHERE user_id = user_uuid AND is_active = true;
    
    IF user_role IS NOT NULL THEN
        RETURN user_role;
    END IF;
    
    -- Verificar si es branch user
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
```

#### 3.2 Función: Verificar permisos

```sql
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
            RETURN required_permission NOT IN ('manage_superadmins', 'create_admins');
        WHEN 'manager' THEN
            RETURN required_permission IN ('create_promotions', 'create_codes', 'view_members', 'create_events');
        WHEN 'base' THEN
            RETURN required_permission IN ('create_members', 'scan_qr', 'view_members');
        WHEN 'member' THEN
            RETURN required_permission IN ('view_own_data', 'redeem_promotions');
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 3.3 Función: Obtener sucursales del usuario

```sql
CREATE OR REPLACE FUNCTION get_user_branches(user_uuid UUID)
RETURNS TABLE(branch_id UUID, branch_name TEXT, user_role TEXT) AS $$
BEGIN
    -- Si es system user (superadmin/admin), devuelve todas las sucursales
    IF EXISTS (
        SELECT 1 FROM public.system_users 
        WHERE user_id = user_uuid AND is_active = true
    ) THEN
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
```

---

### **FASE 4: Backend API Routes (2-3 horas)**

#### 4.1 `/api/admin/users` - Gestión de usuarios

**GET** - Listar usuarios (según rol)
**POST** - Crear usuario (verificar permisos)
**PATCH** - Actualizar usuario
**DELETE** - Eliminar usuario

```typescript
// app/api/admin/users/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Verificar rol
  const { data: userRole } = await supabase.rpc('get_user_role', { user_uuid: user.id })
  
  if (!['superadmin', 'admin'].includes(userRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Listar usuarios según rol
  // SuperAdmin ve todo
  // Admin no ve superadmins
  
  // ... implementación
}

export async function POST(request: Request) {
  // Crear usuario (solo superadmin puede crear admins)
  // ... implementación
}
```

#### 4.2 `/api/admin/users/[id]/branches` - Asignar sucursales

```typescript
// app/api/admin/users/[id]/branches/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Asignar usuario a sucursal con rol (manager o base)
}
```

---

### **FASE 5: UI de Administración (3-4 horas)**

#### 5.1 Página: `/dashboard/users`

**Componentes:**
- `UsersTable` - Lista de usuarios
- `CreateUserModal` - Crear usuario
- `EditUserModal` - Editar usuario
- `AssignBranchesModal` - Asignar sucursales
- `RoleBadge` - Badge visual del rol

**Features:**
- Filtrar por rol
- Buscar por nombre/email
- Ordenar por fecha de creación
- Acción: Activar/Desactivar
- Acción: Editar
- Acción: Eliminar (con confirmación)
- Acción: Asignar sucursales (para managers/base)

#### 5.2 Formulario: Crear Usuario

**Campos:**
- Email (único, required)
- Nombre completo (required)
- Password (required al crear, opcional al editar)
- Rol (select según permisos del usuario actual)
  - SuperAdmin ve: [superadmin, admin, manager, base]
  - Admin ve: [manager, base]
- Sucursales (multi-select, solo si rol = manager o base)

**Validaciones:**
- Email válido y no existe
- Password mínimo 8 caracteres
- Si rol = manager/base, al menos 1 sucursal
- SuperAdmin solo puede ser creado por otro SuperAdmin

---

### **FASE 6: Middleware de Autorización (1 hora)**

#### 6.1 Crear middleware de permisos

```typescript
// lib/auth/permissions.ts
export async function requireRole(roles: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { data: userRole } = await supabase
    .rpc('get_user_role', { user_uuid: user.id })
  
  if (!roles.includes(userRole)) {
    redirect('/unauthorized')
  }
  
  return { user, role: userRole }
}
```

#### 6.2 Proteger rutas

```typescript
// app/dashboard/users/page.tsx
import { requireRole } from '@/lib/auth/permissions'

export default async function UsersPage() {
  await requireRole(['superadmin', 'admin'])
  
  // ... página
}
```

---

### **FASE 7: Script de Inicialización (30 min)**

#### 7.1 Crear primer SuperAdmin

```sql
-- crear_super_admin.sql
-- Ejecutar UNA VEZ después de crear tu usuario en Supabase Auth

-- Reemplaza con tu user_id real de auth.users
DO $$
DECLARE
    super_admin_user_id UUID := 'tu-user-id-aqui'; -- ← CAMBIAR
BEGIN
    -- Verificar que el usuario existe en auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = super_admin_user_id) THEN
        -- Crear entrada en system_users
        INSERT INTO public.system_users (user_id, role, full_name, email, is_active)
        SELECT 
            id,
            'superadmin',
            raw_user_meta_data->>'full_name',
            email,
            true
        FROM auth.users
        WHERE id = super_admin_user_id
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'SuperAdmin creado exitosamente';
    ELSE
        RAISE EXCEPTION 'Usuario no encontrado en auth.users';
    END IF;
END $$;
```

---

## 🎨 DISEÑO DE UI

### **Dashboard: Sección Usuarios**

```
┌────────────────────────────────────────────────────────┐
│  👥 Gestión de Usuarios                    [+ Nuevo]   │
├────────────────────────────────────────────────────────┤
│                                                         │
│  🔍 [Buscar...]  📊 [Filtrar: Todos ▼]                │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Nombre          Email           Rol        Acciones│ │
│  ├──────────────────────────────────────────────────┤ │
│  │ Martin Sedacca  martin@...     🔴 SuperAdmin  ⚙️  │ │
│  │ Juan Pérez      juan@...       🟠 Admin       ⚙️  │ │
│  │ Ana García      ana@...        🟡 Manager     ⚙️  │ │
│  │ Carlos López    carlos@...     🟢 Base        ⚙️  │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### **Modal: Crear Usuario**

```
┌──────────────────────────────────────┐
│  Crear Usuario Nuevo           [X]   │
├──────────────────────────────────────┤
│                                       │
│  Email *                              │
│  [____________________________]       │
│                                       │
│  Nombre Completo *                    │
│  [____________________________]       │
│                                       │
│  Password *                           │
│  [____________________________]       │
│                                       │
│  Rol *                                │
│  [ Manager              ▼ ]          │
│                                       │
│  Sucursales * (solo managers/base)   │
│  [ ☑️ Aeroparque                ]    │
│  [ ☐ Centro                     ]    │
│  [ ☐ Nordelta                   ]    │
│                                       │
│           [Cancelar]  [Crear]        │
└──────────────────────────────────────┘
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### **1. Seguridad**

- ✅ Nunca confiar en el frontend para permisos
- ✅ Siempre validar en backend/RLS
- ✅ No exponer service_role key en frontend
- ✅ Usar RLS policies robustas
- ✅ Hashear passwords (Supabase Auth lo hace automáticamente)

### **2. Experiencia de Usuario**

- ✅ Mostrar mensajes claros cuando no tiene permisos
- ✅ Ocultar elementos de UI que no puede usar
- ✅ Validar antes de enviar formularios
- ✅ Feedback visual inmediato
- ✅ Confirmación para acciones destructivas

### **3. Performance**

- ✅ Cachear rol del usuario (no consultar en cada request)
- ✅ Usar índices en tablas de usuarios
- ✅ Limitar queries con LIMIT/OFFSET
- ✅ Optimizar RLS policies (evitar subqueries complejos)

### **4. Testing**

- ✅ Probar cada rol individualmente
- ✅ Verificar que no pueda acceder a rutas prohibidas
- ✅ Probar edge cases (usuario sin rol, desactivado, etc.)
- ✅ Verificar que RLS policies funcionen correctamente

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### **Base de Datos**
- [ ] Crear tabla `system_users`
- [ ] Actualizar tabla `branch_users`
- [ ] Agregar campos a `promotions` (created_by, applicable_branches)
- [ ] Agregar campos a `codes` (created_by, branch_id)
- [ ] Crear RLS policies para todas las tablas
- [ ] Crear funciones helper (get_user_role, user_has_permission, get_user_branches)
- [ ] Crear índices necesarios
- [ ] Ejecutar script de primer SuperAdmin

### **Backend**
- [ ] API route: GET /api/admin/users
- [ ] API route: POST /api/admin/users
- [ ] API route: PATCH /api/admin/users/[id]
- [ ] API route: DELETE /api/admin/users/[id]
- [ ] API route: POST /api/admin/users/[id]/branches
- [ ] Middleware de autorización
- [ ] Helper functions de permisos

### **Frontend**
- [ ] Página /dashboard/users
- [ ] Componente UsersTable
- [ ] Componente CreateUserModal
- [ ] Componente EditUserModal
- [ ] Componente AssignBranchesModal
- [ ] Componente RoleBadge
- [ ] Actualizar DashboardNav (agregar "Usuarios" solo para admins)
- [ ] Página /unauthorized (para accesos denegados)
- [ ] Hook useUserRole para verificar permisos en UI

### **Seguridad**
- [ ] Proteger todas las rutas de admin
- [ ] Verificar permisos en cada API route
- [ ] Validar inputs en backend
- [ ] Rate limiting en endpoints sensibles
- [ ] Logging de acciones administrativas

### **Testing**
- [ ] Crear usuarios de cada tipo
- [ ] Probar login con cada rol
- [ ] Verificar acceso a rutas según rol
- [ ] Probar creación/edición de beneficios con managers
- [ ] Verificar restricciones de sucursales
- [ ] Probar flujo completo de staff (crear miembro, escanear)

### **Documentación**
- [ ] Guía de roles y permisos
- [ ] Manual de uso para cada tipo de usuario
- [ ] API documentation
- [ ] Troubleshooting guide

---

## 🚀 TIEMPO ESTIMADO TOTAL

| Fase | Tiempo | Descripción |
|------|--------|-------------|
| 1. Schema Migration | 1-2 horas | Crear/modificar tablas |
| 2. RLS Policies | 1-2 horas | Configurar seguridad |
| 3. Helper Functions | 1 hora | Funciones SQL |
| 4. Backend API | 2-3 horas | API routes |
| 5. UI Components | 3-4 horas | Frontend completo |
| 6. Middleware | 1 hora | Autorización |
| 7. Testing | 2-3 horas | Probar todo |
| **TOTAL** | **11-16 horas** | Implementación completa |

---

## 🎯 PRÓXIMOS PASOS

1. **Revisar este plan** - Confirmar que cubre todos los requerimientos
2. **Ejecutar Fase 1** - Migración del schema
3. **Crear SuperAdmin** - Tu usuario inicial
4. **Implementar Backend** - APIs y permisos
5. **Desarrollar Frontend** - UI de gestión
6. **Testing exhaustivo** - Cada rol y permiso
7. **Deploy a producción** - Con documentación

---

**¿Aprobamos este plan para comenzar la implementación?**
