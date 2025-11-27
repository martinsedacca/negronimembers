# 🚀 GUÍA RÁPIDA: Implementar Sistema de Roles

**Tiempo total:** 2-3 horas  
**Dificultad:** Media

---

## ✅ PRE-REQUISITOS

- [x] Migración principal ejecutada (`FULL_PRODUCTION_MIGRATION.sql`)
- [x] Base de datos en Supabase Cloud funcionando
- [x] Proyecto conectado a producción (`.env.local` actualizado)
- [x] Servidor dev corriendo sin errores

---

## 📋 PASOS DE IMPLEMENTACIÓN

### **PASO 1: Ejecutar Migración del Sistema de Roles (15 min)**

#### 1.1 Abrir Supabase Dashboard

👉 https://supabase.com/dashboard/project/hlfqsserfifjnarboqfj/sql/new

#### 1.2 Ejecutar script

1. Abre el archivo: `MIGRACION_SISTEMA_ROLES.sql`
2. Copia TODO (Cmd+A → Cmd+C)
3. Pega en SQL Editor
4. Click **"RUN"**
5. ⏳ Espera 30-60 segundos
6. ✅ Deberías ver: "Success. No rows returned"

#### 1.3 Verificar

Ejecuta este query:

```sql
-- Verificar que system_users existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'system_users' 
AND table_schema = 'public';

-- Verificar funciones
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('get_user_role', 'is_admin', 'is_superadmin')
AND routine_schema = 'public';
```

**Resultado esperado:**
- ✅ Tabla `system_users` existe
- ✅ 3 funciones encontradas

---

### **PASO 2: Crear Tu Usuario SuperAdmin (5 min)**

#### 2.1 Crear usuario en Supabase Auth (si no tienes)

1. Supabase Dashboard → **Authentication → Users**
2. Click **"Add user"** → **"Create new user"**
3. Completa:
   - Email: `tu-email@example.com`
   - Password: `[tu contraseña segura]`
   - ✅ Check **"Auto Confirm User"**
4. Click **"Create user"**
5. **Copia el UUID** del usuario (lo necesitarás)

#### 2.2 Convertir a SuperAdmin

1. Abre SQL Editor (nueva query)
2. Abre el archivo: `CREAR_PRIMER_SUPERADMIN.sql`
3. **EDITA LA LÍNEA 18:**
   ```sql
   super_admin_user_id UUID := 'TU_USER_ID_AQUI'; -- ← Pega tu UUID aquí
   ```
4. Copia TODO el script
5. Pega en SQL Editor
6. Click **"RUN"**
7. ✅ Deberías ver: "SuperAdmin creado exitosamente"

#### 2.3 Verificar

```sql
SELECT * FROM public.system_users WHERE role = 'superadmin';
```

Deberías ver tu usuario con rol `superadmin` ✅

---

### **PASO 3: Implementar Backend - API Routes (1 hora)**

**Archivos a crear:**

```
app/api/admin/
├── users/
│   ├── route.ts              (GET, POST - listar y crear usuarios)
│   └── [id]/
│       ├── route.ts          (PATCH, DELETE - editar y eliminar)
│       └── branches/
│           └── route.ts      (POST - asignar sucursales)
```

**Librerías helper:**

```
lib/auth/
├── permissions.ts     (middleware y helpers de permisos)
└── roles.ts          (constantes y tipos de roles)
```

---

### **PASO 4: Implementar Frontend - UI de Gestión (2 horas)**

**Páginas y componentes:**

```
app/dashboard/
└── users/
    ├── page.tsx                  (Página principal)
    └── components/
        ├── UsersTable.tsx        (Tabla de usuarios)
        ├── CreateUserModal.tsx   (Modal crear)
        ├── EditUserModal.tsx     (Modal editar)
        ├── AssignBranchesModal.tsx (Asignar sucursales)
        └── RoleBadge.tsx         (Badge visual del rol)

components/
└── auth/
    └── RequireRole.tsx   (Componente para proteger páginas)
```

---

### **PASO 5: Actualizar Navegación (15 min)**

Agregar "Usuarios" al menú del dashboard (solo para admins).

**Archivo:** `components/dashboard/DashboardNav.tsx`

---

### **PASO 6: Testing Completo (30 min)**

#### 6.1 Crear usuarios de prueba

- [ ] Crear 1 Admin
- [ ] Crear 1 Manager (asignar a Aeroparque)
- [ ] Crear 1 Base (asignar a Aeroparque)

#### 6.2 Probar permisos

- [ ] Login como Manager → Crear beneficio
- [ ] Login como Admin → Editar beneficio del Manager
- [ ] Login como Manager → NO puede editar beneficio del Admin
- [ ] Login como Base → Solo ve opciones de crear miembros
- [ ] Login como Miembro → Solo ve su propia info

#### 6.3 Probar restricciones

- [ ] Admin NO puede crear SuperAdmin
- [ ] Manager NO puede ver usuarios
- [ ] Base NO puede crear beneficios
- [ ] Miembro NO puede acceder al dashboard admin

---

## 🎯 CHECKLIST DE VERIFICACIÓN

### Base de Datos
- [ ] Tabla `system_users` creada
- [ ] Tabla `branch_users` actualizada (roles: manager, base)
- [ ] Campos `created_by_user_id` en `promotions`
- [ ] Campos `applicable_branches` en `promotions`
- [ ] Campos `created_by_user_id` en `codes`
- [ ] Funciones helper creadas (get_user_role, etc.)
- [ ] RLS policies actualizadas
- [ ] SuperAdmin creado y verificado

### Backend
- [ ] API route: GET /api/admin/users
- [ ] API route: POST /api/admin/users
- [ ] API route: PATCH /api/admin/users/[id]
- [ ] API route: DELETE /api/admin/users/[id]
- [ ] API route: POST /api/admin/users/[id]/branches
- [ ] Middleware de permisos
- [ ] Helper functions

### Frontend
- [ ] Página /dashboard/users
- [ ] UsersTable component
- [ ] CreateUserModal component
- [ ] EditUserModal component
- [ ] AssignBranchesModal component
- [ ] RoleBadge component
- [ ] Navegación actualizada
- [ ] Protección de rutas por rol

### Testing
- [ ] Todos los roles probados
- [ ] Permisos verificados
- [ ] Restricciones validadas
- [ ] No hay errores en consola
- [ ] RLS funciona correctamente

---

## 🚨 PROBLEMAS COMUNES

### "Usuario no puede ver la sección Usuarios"

**Causa:** No tiene rol de admin.

**Solución:**
```sql
-- Verificar rol
SELECT * FROM public.system_users WHERE user_id = 'tu-user-id';

-- Si no existe, crear
INSERT INTO public.system_users (user_id, role, full_name, email, is_active)
VALUES ('tu-user-id', 'superadmin', 'Tu Nombre', 'tu@email.com', true);
```

---

### "Manager puede editar beneficios de otros"

**Causa:** RLS policy no está aplicándose.

**Solución:**
```sql
-- Verificar RLS habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'promotions';

-- Verificar policies
SELECT * FROM pg_policies WHERE tablename = 'promotions';

-- Re-aplicar policy si es necesario
DROP POLICY IF EXISTS "Only creator or admin can update promotions" ON public.promotions;
CREATE POLICY "Only creator or admin can update promotions"
ON public.promotions FOR UPDATE
TO authenticated
USING (can_edit_promotion(auth.uid(), id));
```

---

### "Error: auth.uid() is null"

**Causa:** Usuario no está autenticado o sesión expiró.

**Solución:**
1. Logout y login de nuevo
2. Verificar token en localStorage
3. Reiniciar servidor dev

---

## 📚 ARCHIVOS DE REFERENCIA

### Migración
- `PLAN_SISTEMA_ROLES.md` - Plan completo detallado
- `MIGRACION_SISTEMA_ROLES.sql` - Script SQL principal
- `CREAR_PRIMER_SUPERADMIN.sql` - Script para SuperAdmin

### Guías
- Esta guía - Implementación rápida
- `FULL_PRODUCTION_MIGRATION.sql` - Migración original

---

## 🎉 RESULTADO FINAL

Después de completar todos los pasos:

```
✅ 5 roles implementados
✅ Permisos granulares configurados
✅ RLS protegiendo todos los datos
✅ UI de gestión de usuarios
✅ Sistema totalmente funcional
```

**Roles disponibles:**
- 🔴 SuperAdmin - Control total
- 🟠 Admin - Gestión general
- 🟡 Manager - Gestión de sucursales
- 🟢 Base - Operaciones básicas
- 🔵 Miembro - Vista propia

---

## 🚀 PRÓXIMOS PASOS

1. **Completar implementación backend** (1 hora)
2. **Completar implementación frontend** (2 horas)
3. **Testing exhaustivo** (30 min)
4. **Documentación de uso** (30 min)
5. **Deploy a producción** (opcional)

---

**¿Listo para empezar?**  
Comienza con el PASO 1 y sigue la guía secuencialmente.

**¿Necesitas ayuda?**  
Consulta el `PLAN_SISTEMA_ROLES.md` para más detalles.
