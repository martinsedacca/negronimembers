# Plan de Mejoras - Sistema de Membresías Negroni

## 📋 Resumen de Requerimientos

1. **Sistema de Configuración de Puntos** - Configurar puntos por visita/gasto/evento
2. **Columnas en Tabla de Miembros** - Mostrar visitas y gasto total
3. **Edición de Promociones** - Permitir editar promociones existentes
4. **Sistema de Eventos** - Alta y gestión de eventos
5. **Sistema de Sucursales** - Gestión completa de sucursales

---

## 🎯 MEJORA 1: Sistema de Configuración de Puntos

### Base de Datos (5 min)
```sql
CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Insert default config
INSERT INTO system_config (key, value, description) VALUES
('points_rules', '{
  "per_dollar_spent": 1,
  "per_visit": 10,
  "per_event_attended": 20
}'::jsonb, 'Reglas de acumulación de puntos'),
('tier_thresholds', '{
  "Basic": {"min_spent": 0, "min_visits": 0},
  "Silver": {"min_spent": 500, "min_visits": 20},
  "Gold": {"min_spent": 2000, "min_visits": 50},
  "Platinum": {"min_spent": 5000, "min_visits": 100}
}'::jsonb, 'Umbrales para cambio de tier automático');
```

### API Endpoint (10 min)
**Archivo:** `app/api/config/route.ts`
```typescript
// GET /api/config - Obtener configuración
// PUT /api/config - Actualizar configuración (solo admin)
```

### UI - Página de Configuración (30 min)
**Ruta:** `/dashboard/settings`

**Componente:** `app/dashboard/settings/page.tsx`
- Input para puntos por dólar gastado
- Input para puntos por visita
- Input para puntos por evento
- Configuración de umbrales de tier
- Botón guardar (solo visible para admin)

---

## 🎯 MEJORA 2: Columnas Visitas/Gasto en Tabla Miembros

### Backend - Ya existe en member_stats (0 min)
✅ La vista `member_stats` ya tiene:
- `total_visits`
- `lifetime_spent`
- `spent_last_30_days`
- `visits_last_30_days`

### Frontend - Actualizar MembersList (15 min)

**Archivo:** `components/members/MembersList.tsx`

Agregar columnas:
```tsx
<th>Visitas</th>
<th>Gasto Total</th>

// En el tbody:
<td>{member.total_visits || 0}</td>
<td>${member.lifetime_spent || 0}</td>
```

**Cambio en página:** Fetch desde `member_stats` en lugar de `members`

---

## 🎯 MEJORA 3: Edición de Promociones

### Componente Modal de Edición (30 min)
**Archivo:** `components/promotions/EditPromotionModal.tsx`

Similar a MemberDetailModal:
- Form con todos los campos de promoción
- Edición inline
- Validación de fechas
- Actualización vía API

### API Endpoint (10 min)
**Archivo:** `app/api/promotions/[id]/route.ts`
```typescript
// PUT /api/promotions/:id - Actualizar promoción
// DELETE /api/promotions/:id - Eliminar promoción
```

### Actualizar PromotionsList (10 min)
- Agregar botón "Editar" en cada tarjeta
- Abrir modal con datos precargados
- Refresh después de guardar

---

## 🎯 MEJORA 4: Sistema de Gestión de Eventos

### Base de Datos (10 min)
```sql
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    branch_id UUID REFERENCES branches(id),
    max_attendees INTEGER,
    points_reward INTEGER DEFAULT 20,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    image_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'confirmed', 'attended', 'cancelled')),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    attended_at TIMESTAMPTZ,
    UNIQUE(event_id, member_id)
);

CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_member ON event_attendees(member_id);
```

### API Endpoints (20 min)
```typescript
// POST /api/events - Crear evento
// GET /api/events - Listar eventos
// PUT /api/events/:id - Actualizar evento
// DELETE /api/events/:id - Eliminar evento
// POST /api/events/:id/invite - Invitar miembros
// POST /api/events/:id/attend - Marcar asistencia
```

### UI - Página de Eventos (1 hora)
**Ruta:** `/dashboard/events`

**Componentes:**
- `EventsList.tsx` - Lista de eventos (upcoming, completed)
- `NewEventForm.tsx` - Crear evento
- `EventDetail.tsx` - Ver detalles + lista de invitados
- `InviteMembersModal.tsx` - Seleccionar miembros para invitar

**Features:**
- Filtros por estado, fecha, sucursal
- Marcar asistencia desde scanner
- Ver estadísticas de asistencia
- Exportar lista de invitados

---

## 🎯 MEJORA 5: Sistema de Gestión de Sucursales

### Base de Datos (10 min)
```sql
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    address TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    manager_name TEXT,
    is_active BOOLEAN DEFAULT true,
    opening_hours JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrar datos existentes
INSERT INTO branches (name) 
SELECT DISTINCT branch_location 
FROM card_usage 
WHERE branch_location IS NOT NULL;

-- Agregar relación a card_usage
ALTER TABLE card_usage 
ADD COLUMN branch_id UUID REFERENCES branches(id);

-- Migrar branch_location a branch_id
UPDATE card_usage cu
SET branch_id = b.id
FROM branches b
WHERE cu.branch_location = b.name;

-- Agregar relación a events
ALTER TABLE events 
ADD COLUMN branch_id UUID REFERENCES branches(id);
```

### API Endpoints (15 min)
```typescript
// POST /api/branches - Crear sucursal
// GET /api/branches - Listar sucursales
// PUT /api/branches/:id - Actualizar sucursal
// DELETE /api/branches/:id - Eliminar (solo si no tiene registros)
```

### UI - Página de Sucursales (45 min)
**Ruta:** `/dashboard/branches`

**Componentes:**
- `BranchesList.tsx` - Lista de sucursales
- `BranchForm.tsx` - Crear/Editar sucursal
- `BranchStats.tsx` - Estadísticas por sucursal

**Features:**
- CRUD completo de sucursales
- Ver métricas por sucursal (ventas, visitas, clientes únicos)
- Estado activo/inactivo
- Validación de horarios

### Integrar en Scanner (10 min)
**Actualizar:** `components/scanner/TransactionForm.tsx`
```tsx
// Reemplazar input de texto por dropdown de sucursales
<select>
  {branches.map(b => (
    <option key={b.id} value={b.id}>{b.name}</option>
  ))}
</select>
```

### Agregar Filtro en MembersList (10 min)
```tsx
// Dropdown para filtrar por sucursal donde visitó
<select>
  <option value="all">Todas las sucursales</option>
  {branches.map(...)}
</select>
```

### Vista de Sucursales por Miembro (15 min)
**En MemberDetailModal agregar:**
```tsx
<div>
  <h4>Sucursales Visitadas</h4>
  {member.branches.map(branch => (
    <div>
      {branch.name} - {branch.visit_count} visitas - ${branch.total_spent}
    </div>
  ))}
</div>
```

**Query SQL necesaria:**
```sql
SELECT 
  b.name,
  COUNT(*) as visit_count,
  SUM(cu.amount_spent) as total_spent
FROM card_usage cu
JOIN branches b ON cu.branch_id = b.id
WHERE cu.member_id = $1
GROUP BY b.id, b.name
ORDER BY visit_count DESC;
```

---

## 📊 Resumen de Tiempo Estimado

| Mejora | Tiempo | Prioridad |
|--------|--------|-----------|
| **1. Config de Puntos** | 45 min | MEDIA |
| **2. Columnas Miembros** | 15 min | ALTA ⚡ |
| **3. Edición Promociones** | 50 min | ALTA ⚡ |
| **4. Sistema de Eventos** | 1.5h | MEDIA |
| **5. Sistema de Sucursales** | 2h | ALTA ⚡ |

**TOTAL: ~5 horas**

---

## 🚀 Orden Recomendado de Implementación

### **FASE A - Rápidas y Críticas** (1h 20min)
1. ✅ **Mejora 2** - Columnas visitas/gasto (15 min)
2. ✅ **Mejora 3** - Edición promociones (50 min)
3. ✅ **Inicio Mejora 5** - DB de sucursales (15 min)

### **FASE B - Sucursales Completo** (1h 45min)
4. ✅ **Mejora 5 continuación** - API + UI sucursales
5. ✅ **Integración** - Scanner con sucursales
6. ✅ **Filtros** - Miembros por sucursal

### **FASE C - Eventos** (1h 30min)
7. ✅ **Mejora 4** - Sistema completo de eventos

### **FASE D - Configuración** (45 min)
8. ✅ **Mejora 1** - Sistema de configuración

---

## 🎨 Wireframes / Estructura

### Página de Sucursales
```
┌─────────────────────────────────────┐
│ Sucursales                + Nueva   │
├─────────────────────────────────────┤
│ 🏢 Palermo                          │
│    📍 Av. Santa Fe 1234             │
│    📊 125 visitas | $12,450         │
│    [Editar] [Stats]                 │
├─────────────────────────────────────┤
│ 🏢 Recoleta                         │
│    📍 Av. Callao 5678               │
│    📊 89 visitas | $8,920           │
│    [Editar] [Stats]                 │
└─────────────────────────────────────┘
```

### Página de Eventos
```
┌─────────────────────────────────────┐
│ Eventos                  + Nuevo    │
├─────────────────────────────────────┤
│ [Próximos] [Completados] [Todos]   │
├─────────────────────────────────────┤
│ 🎉 Noche VIP                        │
│    📅 15 Ene 2025 - 21:00           │
│    📍 Palermo                        │
│    👥 45/60 confirmados             │
│    [Ver Detalles] [Invitar]        │
└─────────────────────────────────────┘
```

### Config de Puntos
```
┌─────────────────────────────────────┐
│ Configuración - Puntos              │
├─────────────────────────────────────┤
│ Puntos por dólar gastado:    [1]   │
│ Puntos por visita:           [10]  │
│ Puntos por evento asistido:  [20]  │
├─────────────────────────────────────┤
│ Umbrales de Tier                    │
│ Silver:  $500   | 20 visitas        │
│ Gold:    $2000  | 50 visitas        │
│ Platinum: $5000 | 100 visitas       │
├─────────────────────────────────────┤
│              [Guardar Cambios]      │
└─────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

- [ ] Migración BD: system_config, events, branches
- [ ] API: config, events, branches, promotions/:id
- [ ] UI: Settings page
- [ ] UI: Actualizar MembersList con columnas
- [ ] UI: EditPromotionModal
- [ ] UI: Events page completa
- [ ] UI: Branches page completa
- [ ] Integración: Scanner con sucursales dropdown
- [ ] Integración: Filtros por sucursal en miembros
- [ ] Integración: Vista de sucursales por miembro
- [ ] Testing: Crear evento y marcar asistencia
- [ ] Testing: CRUD completo de sucursales
- [ ] Testing: Editar promoción
- [ ] Testing: Cambiar config de puntos

---

¿Empezamos con la **FASE A** (mejoras rápidas)?
