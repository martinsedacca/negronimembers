# 🔍 AUDITORÍA COMPLETA DE LA APLICACIÓN

**Fecha:** 2025-01-13  
**Objetivo:** Identificar TODOS los componentes que necesitan modificarse para adaptarse al nuevo plan

---

## 📋 PLAN ACTUAL CONFIRMADO:

### Membership Types (SOLO 2):
- ✅ **Member** (Free, $0)
- ✅ **Gold** ($99)

### Benefits (EN INGLÉS):
- ☕ Free Coffee at Lunch
- 🥡 10% Off Takeaway (Member) / 15% Off Takeaway (Gold)
- 🍹 Complimentary Drink at Brunch
- 🎂 Birthday Person Eats Free (tables 6+ people)

### Nuevas Funcionalidades:
- 🎟️ Sistema de Cupones Especiales (AERO22, etc.)
- 🏢 Tracking por Sucursal (branch_id en todo)
- 👤 branch_users (usuarios asignados a sucursales)

---

## ❌ PROBLEMAS ENCONTRADOS POR PÁGINA:

### 1. `/dashboard/settings` - SettingsForm.tsx
**PROBLEMA CRÍTICO:** Hardcoded 4 tiers (Basic, Silver, Gold, Platinum)

**Líneas problemáticas:**
```typescript
Lines 14-17:
tier_thresholds?: {
  Basic: { min_spent: number; min_visits: number }
  Silver: { min_spent: number; min_visits: number }
  Gold: { min_spent: number; min_visits: number }
  Platinum: { min_spent: number; min_visits: number }
}

Lines 33-36:
const [tierThresholds, setTierThresholds] = useState({
  Basic: { min_spent: 0, min_visits: 0 },
  Silver: { min_spent: 500, min_visits: 20 },
  Gold: { min_spent: 2000, min_visits: 50 },
  Platinum: { min_spent: 5000, min_visits: 100 },
})

Lines 164-199:
{Object.entries(tierThresholds).map(([tier, thresholds]) => (
  // Hardcoded iteration over Basic, Silver, Gold, Platinum
))}
```

**QUÉ HACER:**
- ❌ ELIMINAR sistema de tier_thresholds completamente
- ❌ ELIMINAR sección "Umbrales de Tier" del UI
- ✅ MANTENER: Reglas de puntos (per_dollar_spent, per_visit, per_event_attended)
- ✅ MANTENER: Integración GoHighLevel
- ✅ AGREGAR: Gestión de membership types (crear/editar Member y Gold)
- ✅ AGREGAR: Asignar beneficios a cada tipo

**ACCIÓN:**
```
[ ] Crear nuevo componente MembershipTypesManager
[ ] Eliminar sección tier_thresholds de SettingsForm
[ ] Permitir editar Member y Gold (nombre, precio, beneficios)
```

---

### 2. `/member/progress` - Progress Page
**PROBLEMA:** Usa mockLevels con 3 niveles (Member, Gold, Platinum)

**Líneas problemáticas:**
```typescript
Lines 8-9:
const currentLevel = mockLevels.find(l => l.level_number === mockMember.current_level)!
const nextLevel = mockLevels.find(l => l.level_number === mockMember.current_level + 1)
```

**QUÉ HACER:**
- ❌ ELIMINAR concepto de "levels" basado en visitas
- ❌ ELIMINAR círculo de progreso hacia siguiente nivel
- ✅ CAMBIAR: Mostrar membership type actual (Member o Gold)
- ✅ CAMBIAR: No mostrar "progreso" porque no es basado en actividad
- ✅ MANTENER: Beneficios actuales del plan
- ✅ AGREGAR: Botón "Upgrade to Gold" si es Member

**ACCIÓN:**
```
[ ] Reimplementar /member/progress sin sistema de levels
[ ] Mostrar membership type actual
[ ] Listar beneficios disponibles del plan
[ ] Botón para upgrade si es Member
[ ] Eliminar cálculo de visitas/progreso
```

---

### 3. `lib/mock-data.ts` - Mock Levels
**PROBLEMA:** mockLevels tiene 3 niveles, mockPlans tiene 3 planes

**Líneas problemáticas:**
```typescript
Lines 20-54: mockLevels (Member, Gold, Platinum)
Lines 56-140: mockBenefits (3 niveles de beneficios)
Lines 242-283: mockPlans (Free, Premium, VIP)
```

**QUÉ HACER:**
- ❌ ELIMINAR mockLevels completo
- ❌ ELIMINAR mockPlans o actualizar a (Member, Gold)
- ✅ ACTUALIZAR mockBenefits para reflejar beneficios reales EN INGLÉS
- ✅ AGREGAR mockCoupons para ejemplos de cupones especiales

**ACCIÓN:**
```
[ ] Eliminar mockLevels
[ ] Actualizar mockPlans a Member/Gold
[ ] Actualizar mockBenefits con beneficios reales
[ ] Agregar mockCoupons (AERO22 ejemplo)
```

---

### 4. `/member/benefits` - Benefits Page
**PROBLEMA:** Probablemente usa mockBenefits con 3 niveles

**QUÉ HACER:**
- ✅ Fetch real promotions desde BD
- ✅ Filtrar por membership_type del miembro
- ✅ Mostrar términos y condiciones
- ✅ AGREGAR: Sección "Special Benefits" para cupones redimidos

**ACCIÓN:**
```
[ ] Revisar /member/benefits page
[ ] Conectar a promotions reales (no mock)
[ ] Agregar sección de special coupon benefits
```

---

### 5. `/member/pass` - Pass Page (QR Card)
**PROBLEMA:** Probablemente muestra "level" en vez de "membership_type"

**QUÉ HACER:**
- ✅ Mostrar "Member" o "Gold" en vez de "Level 2"
- ✅ Usar colores correctos (#F97316 para Member, #EAB308 para Gold)

**ACCIÓN:**
```
[ ] Revisar /member/pass page
[ ] Cambiar "Level X" a "Member" o "Gold"
[ ] Actualizar colores
```

---

### 6. `/dashboard/members` - Members List
**PROBLEMA:** Probablemente muestra membership_type como Basic/Silver/etc.

**QUÉ HACER:**
- ✅ Mostrar Member o Gold
- ✅ Filtro para Member/Gold
- ✅ AGREGAR: Indicador si tiene cupones especiales activos

**ACCIÓN:**
```
[ ] Revisar filtros de membership_type
[ ] Agregar columna de special coupons
```

---

### 7. `/dashboard/members/new` - New Member Form
**PROBLEMA:** Dropdown de membership_type con tipos incorrectos

**QUÉ HACER:**
- ✅ Cargar membership_types dinámicamente desde BD
- ✅ Solo mostrar Member y Gold
- ✅ Mostrar precio de cada uno

**ACCIÓN:**
```
[ ] Fetch membership_types desde BD
[ ] No hardcodear opciones
```

---

### 8. `/dashboard/promotions` - Promotions Manager
**PROBLEMA:** Puede tener membership types hardcoded en formularios

**QUÉ HACER:**
- ✅ Cargar membership_types dinámicamente
- ✅ Checkbox para Member y/o Gold
- ✅ Mostrar iconos en la lista
- ✅ AGREGAR: Link a crear Special Coupons

**ACCIÓN:**
```
[ ] Revisar formulario de crear/editar promoción
[ ] Fetch membership_types dinámicamente
[ ] Agregar link a página de cupones especiales
```

---

### 9. Navigation Menu - DashboardNav.tsx
**PROBLEMA:** Ya tiene Stats agregado ✅

**QUÉ AGREGAR:**
- ✅ Link a "Coupons" (cupones especiales)
- ✅ Link a "Branch Analytics" (analytics por sucursal)

**ACCIÓN:**
```
[✅] Stats ya agregado
[ ] Agregar link "Special Coupons"
[ ] Agregar link "Branch Analytics"
```

---

## 🆕 PÁGINAS NUEVAS QUE FALTAN CREAR:

### 1. `/dashboard/coupons` - Special Coupons Manager
**QUÉ DEBE HACER:**
- Listar cupones especiales (AERO22, SUMMER24, etc.)
- Crear nuevo cupón (código, título, descripción, fecha límite)
- Agregar beneficios al cupón
- Ver cuántos miembros lo han redimido
- Activar/desactivar cupones

**COMPONENTES:**
```
app/dashboard/coupons/page.tsx
app/dashboard/coupons/new/page.tsx
app/dashboard/coupons/[id]/page.tsx (edit)
components/coupons/CouponsList.tsx
components/coupons/CouponForm.tsx
components/coupons/BenefitsList.tsx
```

---

### 2. `/dashboard/branches/[id]/analytics` - Branch Analytics
**QUÉ DEBE HACER:**
- Ver uso de beneficios por sucursal
- Ver cupones especiales usados por sucursal
- Ver miembros únicos por sucursal
- Gráficos de tendencias
- Top promociones más usadas

**COMPONENTES:**
```
app/dashboard/branches/[id]/analytics/page.tsx
components/analytics/BranchUsageChart.tsx
components/analytics/BranchPromotionsTable.tsx
```

---

### 3. `/dashboard/membership-types` - Manage Member/Gold
**QUÉ DEBE HACER:**
- Ver Member y Gold
- Editar precio de Gold
- Editar beneficios de cada tipo
- Editar colores/iconos
- NO permitir agregar más tipos (validación)

**COMPONENTES:**
```
app/dashboard/membership-types/page.tsx
components/membership/MembershipTypeCard.tsx
components/membership/EditMembershipForm.tsx
```

---

### 4. `/member/coupons` - Redeem Special Coupons
**QUÉ DEBE HACER:**
- Input para ingresar código (AERO22)
- Mostrar mensaje de error si no existe
- Mostrar confirmación si lo redimió
- Listar cupones activos del miembro
- Mostrar beneficios de cada cupón
- Indicar cuántas veces usó cada beneficio

**COMPONENTES:**
```
app/member/coupons/page.tsx
components/member/CouponRedeemForm.tsx
components/member/MyCouponsList.tsx
```

---

## 🔌 APIs NUEVAS QUE FALTAN:

### 1. `/api/coupons/redeem` (POST)
**Request:**
```json
{
  "member_id": "uuid",
  "coupon_code": "AERO22"
}
```

**Response:**
```json
{
  "success": true,
  "coupon": {
    "id": "uuid",
    "code": "AERO22",
    "title": "Aeroespacial 2025",
    "benefits": [...]
  }
}
```

---

### 2. `/api/coupons` (GET/POST/PUT/DELETE)
**GET** - Listar cupones
**POST** - Crear cupón
**PUT** - Actualizar cupón
**DELETE** - Eliminar cupón

---

### 3. `/api/membership-types` (GET/PUT)
**GET** - Listar Member y Gold
**PUT** - Actualizar tipo (solo precio y beneficios, no agregar nuevos)

---

### 4. `/api/branches/[id]/analytics` (GET)
**Response:**
```json
{
  "branch_id": "uuid",
  "usage_stats": {...},
  "promotions_usage": [...],
  "coupon_usage": [...]
}
```

---

## 📝 ACTUALIZAR seed.sql

### Eliminar:
- ❌ membership_types incorrectos (ya hecho ✅)
- ❌ promotions en español (ya hecho ✅)
- ❌ Miembros con membership_type incorrecto

### Agregar:
- ✅ Member y Gold (ya hecho ✅)
- ✅ 5 beneficios en inglés (ya hecho ✅)
- ✅ Cupón AERO22 de ejemplo (ya hecho ✅)
- ✅ 3 sucursales de ejemplo (ya existe)
- ❌ branch_users de ejemplo (usuarios asignados a sucursales)
- ❌ Actualizar miembros existentes a Member o Gold

---

## ✅ CHECKLIST COMPLETO DE TAREAS:

### Backend/Database:
- [✅] Migración: Limpiar membership_types (Member, Gold)
- [✅] Migración: Beneficios en inglés
- [✅] Migración: Sistema de cupones especiales
- [✅] Migración: branch_users y tracking
- [ ] seed.sql: Agregar branch_users de ejemplo
- [ ] seed.sql: Actualizar miembros a Member/Gold

### APIs:
- [ ] `POST /api/coupons/redeem`
- [ ] `GET /api/coupons`
- [ ] `POST /api/coupons`
- [ ] `PUT /api/coupons/[id]`
- [ ] `DELETE /api/coupons/[id]`
- [ ] `GET /api/membership-types`
- [ ] `PUT /api/membership-types/[id]`
- [ ] `GET /api/branches/[id]/analytics`

### Dashboard Pages:
- [ ] `/dashboard/settings` - Eliminar tier_thresholds, agregar membership types manager
- [ ] `/dashboard/coupons` - Nueva página
- [ ] `/dashboard/coupons/new` - Nueva página
- [ ] `/dashboard/coupons/[id]` - Nueva página
- [ ] `/dashboard/membership-types` - Nueva página
- [ ] `/dashboard/branches/[id]/analytics` - Nueva página
- [ ] `/dashboard/members` - Revisar filtros
- [ ] `/dashboard/members/new` - Fetch membership_types dinámicamente
- [ ] `/dashboard/promotions` - Fetch membership_types dinámicamente
- [ ] `DashboardNav.tsx` - Agregar links a Coupons y Branch Analytics

### Member App Pages:
- [ ] `/member/progress` - Eliminar sistema de levels, mostrar membership type
- [ ] `/member/benefits` - Conectar a DB real, agregar special benefits
- [ ] `/member/pass` - Cambiar "Level" a "Member/Gold"
- [ ] `/member/coupons` - Nueva página para redimir cupones
- [ ] `MemberNav.tsx` - Agregar link a coupons (si no existe)

### Lib/Utils:
- [ ] `lib/mock-data.ts` - Eliminar mockLevels, actualizar mockPlans y mockBenefits
- [ ] Crear `lib/membership-utils.ts` - Helpers para Member/Gold

---

## 📊 PRIORIDADES:

### 🔴 CRÍTICO (Rompe funcionalidad actual):
1. `/dashboard/settings` - Eliminar tier_thresholds
2. `lib/mock-data.ts` - Actualizar datos mock
3. `/member/progress` - Reimplementar sin levels
4. `seed.sql` - Actualizar datos de ejemplo

### 🟠 IMPORTANTE (Nueva funcionalidad core):
1. `/dashboard/coupons` - Sistema completo de cupones
2. `/member/coupons` - Redimir cupones
3. `POST /api/coupons/redeem` - API de redención

### 🟡 MEJORA (Analytics y gestión):
1. `/dashboard/membership-types` - Gestionar Member/Gold
2. `/dashboard/branches/[id]/analytics` - Analytics por sucursal
3. Navigation - Agregar links faltantes

### 🟢 OPCIONAL (Polish):
1. Iconos y colores consistentes
2. Mensajes de error mejorados
3. Loading states

---

## 🎯 PLAN DE IMPLEMENTACIÓN SUGERIDO:

### Fase A - Arreglar lo Roto (2-3 horas):
1. ✅ Eliminar tier_thresholds de SettingsForm
2. ✅ Actualizar mock-data.ts
3. ✅ Reimplementar /member/progress
4. ✅ Actualizar seed.sql final

### Fase B - Sistema de Cupones (3-4 horas):
1. ✅ API /api/coupons (CRUD completo)
2. ✅ API /api/coupons/redeem
3. ✅ Dashboard /dashboard/coupons
4. ✅ Member app /member/coupons

### Fase C - Analytics por Sucursal (2 horas):
1. ✅ API /api/branches/[id]/analytics
2. ✅ Página /dashboard/branches/[id]/analytics

### Fase D - Gestión Membership Types (1-2 horas):
1. ✅ API /api/membership-types
2. ✅ Página /dashboard/membership-types

### Fase E - Polish (1 hora):
1. ✅ Navigation links
2. ✅ Revisar /dashboard/members filtros
3. ✅ Revisar /member/benefits
4. ✅ Revisar /member/pass

---

## 💾 BACKUPS:
- ✅ `backups/backup_20251104_115318.sql` (357K) - Antes del análisis

---

**TOTAL ESTIMADO: 9-12 horas de trabajo**

**PRÓXIMO PASO:** Implementar Fase A (arreglar lo roto) antes de continuar con cupones.
