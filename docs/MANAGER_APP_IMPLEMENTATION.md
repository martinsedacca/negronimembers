# Manager App Implementation Plan
## Subdominio: manager.negronimembers.com

**Fecha inicio:** 2025-11-27
**Estado:** 🟢 COMPLETADO (pendiente: testing y deploy)

---

## 1. ANÁLISIS DEL SISTEMA ACTUAL

### 1.1 Tablas Existentes Relevantes

| Tabla | Propósito | Campos Clave |
|-------|-----------|--------------|
| `branches` | 4 sucursales activas | id, name, address, city |
| `system_users` | Solo admins (superadmin) | user_id, role, email |
| `branch_users` | ⚠️ INCOMPLETA - no tiene branch_id | user_id, role, full_name |
| `card_usage` | Transacciones | member_id, branch_id, served_by, amount_spent, points_earned |
| `applied_promotions` | Beneficios usados | member_id, promotion_id, card_usage_id, discount_amount |
| `member_available_promotions` | Vista de beneficios | member_id, applicable_branches |

### 1.2 Sucursales Activas
- **Brickell** - 652c4ff5-4ff9-408c-8001-bc4a75e7a385
- **Doral** - 9986c070-f964-4b8f-b10a-a292a07b93f9
- **Midtown** - 2c4dbc25-d684-48b8-89af-6885b04e05db
- **Weston** - 462ecda3-e33b-4f8c-9703-312df7681dd0

### 1.3 APIs de Scanner Existentes
- `POST /api/scanner/verify` - Verifica miembro, retorna beneficios disponibles
- `POST /api/scanner/record` - Registra transacción, aplica beneficios
- `GET /api/scanner/stats` - Estadísticas del día
- `POST /api/scanner/search` - Búsqueda flexible de miembros

### 1.4 Problemas Identificados
1. ❌ `branch_users` no tiene `branch_id` - no hay relación usuario-sucursal
2. ❌ No existe distinción entre Manager y Server
3. ❌ No hay sistema de PIN para login rápido
4. ❌ No hay persistencia de sucursal seleccionada

---

## 2. REQUISITOS FUNCIONALES

### 2.1 Tipos de Usuario

| Tipo | Descripción | Sucursales | Cambio de Sucursal |
|------|-------------|------------|-------------------|
| **Manager** | Gerente rotativo | Múltiples asignadas | Puede cambiar él mismo |
| **Server** | Mesero fijo | Una sola | Solo admin puede cambiar |

### 2.2 Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────────┐
│                    PANTALLA LOGIN                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    🍷 NEGRONI                                    │
│                                                                  │
│              Ingresa tu PIN de 4 dígitos                        │
│                                                                  │
│                   ┌───┐ ┌───┐ ┌───┐ ┌───┐                       │
│                   │ ● │ │ ● │ │ ○ │ │ ○ │                       │
│                   └───┘ └───┘ └───┘ └───┘                       │
│                                                                  │
│         ┌─────┐   ┌─────┐   ┌─────┐                             │
│         │  1  │   │  2  │   │  3  │                             │
│         └─────┘   └─────┘   └─────┘                             │
│         ┌─────┐   ┌─────┐   ┌─────┐                             │
│         │  4  │   │  5  │   │  6  │                             │
│         └─────┘   └─────┘   └─────┘                             │
│         ┌─────┐   ┌─────┐   ┌─────┐                             │
│         │  7  │   │  8  │   │  9  │                             │
│         └─────┘   └─────┘   └─────┘                             │
│                   ┌─────┐                                        │
│                   │  0  │                                        │
│                   └─────┘                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Selección de Sucursal (Solo Managers con múltiples)

```
┌─────────────────────────────────────────────────────────────────┐
│                 SELECCIONA TU SUCURSAL                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  📍 Brickell                                             │   │
│   │     955 S Miami Ave, Miami, FL                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  📍 Midtown                                              │   │
│   │     3201 Buena Vista Blvd, Miami, FL                    │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   (Esta selección se recuerda hasta que la cambies)             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Pantalla Principal Scanner

```
┌─────────────────────────────────────────────────────────────────┐
│  🍷 NEGRONI         Brickell [▼ Cambiar]        Juan M. │ 🚪    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │                    📷 ESCANEAR QR                        │    │
│  │                                                          │    │
│  │              (toca para activar cámara)                  │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ─────────────────────── o ───────────────────────              │
│                                                                  │
│  🔍 Buscar cliente por nombre, teléfono, email...               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  📊 HOY EN BRICKELL                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  $1,250  │  │    15    │  │    12    │  │   $83    │        │
│  │  Ventas  │  │ Visitas  │  │ Clientes │  │ Promedio │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Cliente Encontrado - Registro de Visita

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Volver                                           Brickell    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  👤 María García                                                 │
│  ⭐ Gold Member  •  #12345  •  850 pts                          │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  📋 BENEFICIOS DISPONIBLES EN BRICKELL                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ☐  15% OFF en consumo                                    │    │
│  │     Descuento general en tu cuenta                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ☐  Copa de vino de cortesía                              │    │
│  │     Una copa de vino de la casa                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ☐  Postre gratis                                         │    │
│  │     Un postre del día                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  💰 MONTO DE LA CUENTA                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  $                                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   ✓ REGISTRAR VISITA                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.6 Confirmación de Registro

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                         ✓                                        │
│                                                                  │
│                  ¡VISITA REGISTRADA!                            │
│                                                                  │
│            María García ganó 125 puntos                         │
│                                                                  │
│            Descuento aplicado: $18.75                           │
│            (15% de $125.00)                                     │
│                                                                  │
│        ┌─────────────────────────────────┐                      │
│        │      ESCANEAR OTRO CLIENTE      │                      │
│        └─────────────────────────────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. MODELO DE DATOS

### 3.1 Nueva Tabla: `staff_members`

```sql
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Autenticación
  user_id UUID REFERENCES auth.users(id),  -- NULL si usa solo PIN
  pin VARCHAR(4) NOT NULL,                  -- PIN de 4 dígitos
  pin_hash TEXT,                            -- Hash del PIN para seguridad
  
  -- Información personal
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  
  -- Rol y estado
  role TEXT NOT NULL CHECK (role IN ('manager', 'server')),
  is_active BOOLEAN DEFAULT true,
  
  -- Sucursal activa (persiste entre sesiones)
  current_branch_id UUID REFERENCES branches(id),
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  UNIQUE(pin)  -- PIN debe ser único
);
```

### 3.2 Nueva Tabla: `staff_branch_access`

```sql
CREATE TABLE staff_branch_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(staff_id, branch_id)
);
```

### 3.3 Nueva Tabla: `staff_sessions`

```sql
CREATE TABLE staff_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  
  -- Token para mantener sesión
  session_token TEXT NOT NULL UNIQUE,
  
  -- Tracking
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- Device info
  user_agent TEXT,
  ip_address TEXT
);
```

### 3.4 Modificar `card_usage`

```sql
-- Agregar referencia al staff que registró
ALTER TABLE card_usage 
  ADD COLUMN staff_id UUID REFERENCES staff_members(id);

-- Índice para reportes por staff
CREATE INDEX idx_card_usage_staff ON card_usage(staff_id);
```

---

## 4. APIS A CREAR

### 4.1 Autenticación Staff

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `POST /api/staff/login` | POST | Login con PIN, retorna token de sesión |
| `POST /api/staff/logout` | POST | Cierra sesión |
| `GET /api/staff/me` | GET | Info del staff autenticado + sucursal actual |
| `POST /api/staff/switch-branch` | POST | Cambia sucursal activa (solo managers) |

### 4.2 Scanner (Staff)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `POST /api/staff/scanner/verify` | POST | Verifica miembro + filtra beneficios por sucursal |
| `POST /api/staff/scanner/record` | POST | Registra visita + staff_id |
| `GET /api/staff/scanner/stats` | GET | Stats de la sucursal actual |

### 4.3 Admin (Dashboard)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `GET /api/admin/staff` | GET | Lista todo el staff |
| `POST /api/admin/staff` | POST | Crea nuevo staff |
| `PUT /api/admin/staff/:id` | PUT | Edita staff |
| `DELETE /api/admin/staff/:id` | DELETE | Desactiva staff |
| `PUT /api/admin/staff/:id/branches` | PUT | Asigna sucursales |

---

## 5. ESTRUCTURA DE ARCHIVOS

```
app/
├── scanner/                        # Manager App (manager.negronimembers.com)
│   ├── layout.tsx                  # Layout sin navbar del dashboard
│   ├── page.tsx                    # Redirect a /scanner/login
│   ├── login/
│   │   └── page.tsx                # PIN pad + selección sucursal
│   ├── main/
│   │   └── page.tsx                # Scanner principal
│   ├── register/
│   │   └── page.tsx                # Registro de visita
│   └── components/
│       ├── PinPad.tsx              # Teclado numérico
│       ├── BranchSelector.tsx      # Selector de sucursal
│       ├── QRScanner.tsx           # Escáner (reutilizar existente)
│       ├── MemberSearch.tsx        # Búsqueda de cliente
│       ├── BenefitsList.tsx        # Lista de beneficios
│       ├── AmountInput.tsx         # Input de monto
│       └── StaffHeader.tsx         # Header con info de staff
│
├── api/
│   └── staff/
│       ├── login/route.ts
│       ├── logout/route.ts
│       ├── me/route.ts
│       ├── switch-branch/route.ts
│       └── scanner/
│           ├── verify/route.ts
│           ├── record/route.ts
│           └── stats/route.ts
│
└── dashboard/
    └── staff/                      # Admin: gestión de staff
        ├── page.tsx                # Lista de staff
        ├── new/page.tsx            # Crear staff
        └── [id]/page.tsx           # Editar staff
```

---

## 6. CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Base de Datos ✅ COMPLETADA
- [x] 1.1 Crear tabla `staff_members`
- [x] 1.2 Crear tabla `staff_branch_access`
- [x] 1.3 Crear tabla `staff_sessions`
- [x] 1.4 Agregar columna `staff_id` a `card_usage`
- [x] 1.5 Crear índices necesarios
- [x] 1.6 Crear RLS policies

### Fase 2: APIs de Autenticación ✅ COMPLETADA
- [x] 2.1 `POST /api/staff/login` - Login con PIN
- [x] 2.2 `POST /api/staff/logout` - Cerrar sesión
- [x] 2.3 `GET /api/staff/me` - Info del staff
- [x] 2.4 `POST /api/staff/switch-branch` - Cambiar sucursal
- [x] 2.5 Middleware de autenticación para staff (`lib/staff-auth.ts`)

### Fase 3: APIs de Scanner ✅ COMPLETADA
- [x] 3.1 `POST /api/staff/scanner/verify` - Con filtro de sucursal
- [x] 3.2 `POST /api/staff/scanner/record` - Con staff_id
- [x] 3.3 `GET /api/staff/scanner/stats` - Por sucursal

### Fase 4: UI - Login ✅ COMPLETADA
- [x] 4.1 Layout de scanner (sin sidebar) - `app/scanner/layout.tsx`
- [x] 4.2 Componente PinPad - `app/scanner/components/PinPad.tsx`
- [x] 4.3 Pantalla de login - `app/scanner/login/page.tsx`
- [x] 4.4 Selector de sucursal - `app/scanner/components/BranchSelector.tsx`
- [x] 4.5 Persistencia de sesión - `app/scanner/hooks/useStaffSession.ts`

### Fase 5: UI - Scanner Principal ✅ COMPLETADA
- [x] 5.1 Header con info de staff y sucursal
- [x] 5.2 Escáner QR con html5-qrcode
- [x] 5.3 Búsqueda de cliente
- [x] 5.4 Stats del día por sucursal
- [x] Archivo: `app/scanner/main/page.tsx`

### Fase 6: UI - Registro de Visita ✅ COMPLETADA
- [x] 6.1 Mostrar info del cliente
- [x] 6.2 Lista de beneficios (filtrados por sucursal)
- [x] 6.3 Selección de beneficios a aplicar
- [x] 6.4 Input de monto
- [x] 6.5 Botón de registrar
- [x] 6.6 Pantalla de confirmación
- [x] Archivo: `app/scanner/register/page.tsx`

### Fase 7: Dashboard Admin - Gestión de Staff ✅ COMPLETADA
- [x] 7.1 Lista de staff con filtros - `app/dashboard/staff/page.tsx`
- [x] 7.2 Formulario crear staff - `app/dashboard/staff/new/page.tsx`
- [x] 7.3 Formulario editar staff - `app/dashboard/staff/[id]/page.tsx`
- [x] 7.4 Asignación de sucursales (incluido en formularios)
- [x] 7.5 APIs admin: `app/api/admin/staff/route.ts` y `[id]/route.ts`

### Fase 8: Testing y Deploy
- [ ] 8.1 Crear staff de prueba desde dashboard
- [ ] 8.2 Probar login con PIN en /scanner/login
- [ ] 8.3 Probar escaneo y registro de visitas
- [ ] 8.4 Configurar subdominio en Vercel con APP_MODE=manager
- [ ] 8.5 Variables de entorno para manager.negronimembers.com

---

## 7. INSTRUCCIONES DE TESTING LOCAL

### 7.1 Probar Manager App en desarrollo
```bash
# En .env.local, agregar:
NEXT_PUBLIC_APP_MODE=manager

# Reiniciar servidor
npm run dev

# Ir a http://localhost:3000 → redirige a /scanner/login
```

### 7.2 Crear Staff de prueba
1. Ir a `/dashboard/staff` (modo admin)
2. Click "Add Staff"
3. Crear un Manager con PIN 1234 y asignar sucursales
4. Crear un Server con PIN 5678 y asignar 1 sucursal

### 7.3 Flujo de prueba
1. Login con PIN → seleccionar sucursal (si manager)
2. Escanear QR o buscar cliente
3. Seleccionar beneficios disponibles
4. Ingresar monto y registrar visita
5. Ver confirmación con puntos ganados

---

## 8. CONSIDERACIONES DE SEGURIDAD

### 7.1 PIN
- Hash del PIN almacenado, no texto plano
- Bloqueo después de 5 intentos fallidos
- PIN de 4 dígitos (10,000 combinaciones)
- Sesión expira después de 8 horas de inactividad

### 7.2 Sesiones
- Token único por sesión
- Registro de IP y User Agent
- Solo una sesión activa por dispositivo
- Logout automático al cerrar navegador

### 7.3 Permisos
- Staff solo puede ver/registrar en sus sucursales asignadas
- Manager puede cambiar sucursal, Server no
- Todas las acciones se registran con staff_id

---

## 9. ARCHIVOS CREADOS

### Base de Datos (Migraciones en Supabase)
- `staff_members` - Tabla de managers y servers
- `staff_branch_access` - Relación staff-sucursales
- `staff_sessions` - Sesiones activas
- `card_usage.staff_id` - Columna agregada

### APIs
- `/api/staff/login` - Login con PIN
- `/api/staff/logout` - Cerrar sesión
- `/api/staff/me` - Info del staff autenticado
- `/api/staff/switch-branch` - Cambiar sucursal
- `/api/staff/scanner/verify` - Verificar miembro con filtro de sucursal
- `/api/staff/scanner/record` - Registrar visita
- `/api/staff/scanner/stats` - Estadísticas del día
- `/api/admin/staff` - CRUD de staff (admin)

### UI - Scanner App
- `app/scanner/layout.tsx`
- `app/scanner/page.tsx` - Redirect inicial
- `app/scanner/login/page.tsx` - Login con PIN
- `app/scanner/main/page.tsx` - Scanner principal
- `app/scanner/register/page.tsx` - Registrar visita
- `app/scanner/components/PinPad.tsx`
- `app/scanner/components/BranchSelector.tsx`
- `app/scanner/hooks/useStaffSession.ts`

### UI - Dashboard Admin
- `app/dashboard/staff/page.tsx` - Lista de staff
- `app/dashboard/staff/new/page.tsx` - Crear staff
- `app/dashboard/staff/[id]/page.tsx` - Editar staff

### Utilidades
- `lib/staff-auth.ts` - Helper de autenticación

---

## 10. ESTADO ACTUAL

✅ **DESARROLLO COMPLETADO**

Pendiente:
- Crear staff de prueba en el dashboard
- Probar flujo completo
- Deploy a manager.negronimembers.com
