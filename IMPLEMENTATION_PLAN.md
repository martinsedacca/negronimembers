# Plan de Implementación: Sistema de Tracking y Scanner QR

## 📊 Análisis del Estado Actual

### Base de Datos Existente
✅ Tablas ya creadas:
- `members` - Información de miembros
- `card_usage` - Registro de uso de tarjetas (falta campo `amount_spent`)
- `applied_promotions` - Promociones aplicadas
- `promotions` - Definición de promociones
- `membership_types` - Tipos de membresía

### ❌ Lo que falta:
1. Campo `amount_spent` en `card_usage`
2. Campo `event_type` para distinguir compras vs eventos
3. Sistema de roles (admin, sucursal)
4. Tabla de `special_invitations` para eventos
5. Tabla de `member_segments` para filtros guardados
6. Vistas/funciones para queries complejas

---

## 🎯 Fases de Implementación

### **FASE 1: Actualización de Base de Datos** (30 min)

#### 1.1 Migración de Schema
```sql
-- Agregar campos faltantes a card_usage
ALTER TABLE card_usage 
ADD COLUMN amount_spent DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN event_type TEXT DEFAULT 'purchase' CHECK (event_type IN ('purchase', 'event', 'visit')),
ADD COLUMN branch_location TEXT,
ADD COLUMN served_by UUID REFERENCES auth.users(id);

-- Crear tabla de invitaciones especiales
CREATE TABLE special_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'declined', 'attended')),
    invitation_data JSONB,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de segmentos guardados
CREATE TABLE member_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    filters JSONB NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de roles de usuario
CREATE TABLE user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    role TEXT DEFAULT 'branch' CHECK (role IN ('admin', 'branch', 'readonly')),
    branch_name TEXT,
    permissions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vistas útiles
CREATE VIEW member_stats AS
SELECT 
    m.id,
    m.full_name,
    m.email,
    m.membership_type,
    COUNT(cu.id) as total_visits,
    COALESCE(SUM(cu.amount_spent), 0) as total_spent,
    COUNT(CASE WHEN cu.usage_date >= NOW() - INTERVAL '30 days' THEN 1 END) as visits_last_30_days,
    COALESCE(SUM(CASE WHEN cu.usage_date >= NOW() - INTERVAL '30 days' THEN cu.amount_spent END), 0) as spent_last_30_days,
    MAX(cu.usage_date) as last_visit
FROM members m
LEFT JOIN card_usage cu ON m.id = cu.member_id
GROUP BY m.id;
```

---

### **FASE 2: API de Scanner QR para Sucursales** (2 horas)

#### 2.1 Endpoint de escaneo
**Archivo**: `app/api/scanner/verify/route.ts`
```typescript
// POST /api/scanner/verify
// Escanea el QR y devuelve info del miembro + promociones disponibles
{
  member_number: string
} => {
  member: Member,
  stats: {
    total_visits: number,
    total_spent: number,
    last_visit: Date
  },
  available_promotions: Promotion[],
  active_tier: string
}
```

#### 2.2 Endpoint de aplicación de compra/visita
**Archivo**: `app/api/scanner/record/route.ts`
```typescript
// POST /api/scanner/record
{
  member_id: string,
  event_type: 'purchase' | 'event' | 'visit',
  amount_spent?: number,
  branch_location: string,
  applied_promotions?: string[], // IDs de promociones
  notes?: string
} => {
  card_usage_id: string,
  points_earned: number,
  new_tier?: string // Si cambió de tier
}
```

---

### **FASE 3: Interfaz de Scanner** (3 horas)

#### 3.1 Página de Scanner
**Ruta**: `/dashboard/scanner`

**Componentes**:
- `QRScanner.tsx` - Lector de QR con cámara
- `MemberInfoPanel.tsx` - Info del miembro escaneado
- `AvailablePromotions.tsx` - Lista de promos aplicables
- `RecordTransaction.tsx` - Form para registrar compra/visita

**Features**:
- ✅ Escaneo con cámara (usar `html5-qrcode`)
- ✅ Modo manual (ingresar member_number)
- ✅ Vista de historial reciente del cliente
- ✅ Aplicación de múltiples promociones
- ✅ Registro rápido sin monto (solo visita)
- ✅ Selector de sucursal
- ✅ Modo offline con sync posterior (opcional)

---

### **FASE 4: Sistema de Segmentación** (2 horas)

#### 4.1 Página de Filtros
**Ruta**: `/dashboard/segments`

**Filtros disponibles**:
```typescript
interface SegmentFilters {
  // Financieros
  total_spent_min?: number
  total_spent_max?: number
  spent_last_30_days_min?: number
  
  // Frecuencia
  total_visits_min?: number
  visits_last_30_days_min?: number
  last_visit_before?: Date
  last_visit_after?: Date
  
  // Membresía
  membership_types?: string[]
  status?: ('active' | 'inactive')[]
  
  // Promociones
  used_promotion_id?: string
  never_used_promotions?: boolean
  
  // Eventos
  attended_event?: string
  never_attended_events?: boolean
}
```

#### 4.2 Componentes
- `SegmentBuilder.tsx` - Constructor de filtros
- `SegmentPreview.tsx` - Vista previa de miembros
- `SegmentActions.tsx` - Acciones (exportar, asignar promo, invitar)

---

### **FASE 5: Sistema de Promociones Personalizadas** (1.5 horas)

#### 5.1 Asignación masiva
**Endpoint**: `app/api/promotions/assign-bulk/route.ts`
```typescript
// POST /api/promotions/assign-bulk
{
  segment_filters: SegmentFilters,
  promotion_id: string,
  auto_apply: boolean
} => {
  assigned_count: number,
  member_ids: string[]
}
```

#### 5.2 Tabla adicional
```sql
CREATE TABLE member_assigned_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    promotion_id UUID REFERENCES promotions(id),
    assigned_by UUID REFERENCES auth.users(id),
    auto_apply BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending',
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **FASE 6: Sistema de Invitaciones** (1.5 horas)

#### 6.1 Creación de eventos
**Ruta**: `/dashboard/events`

```typescript
interface EventInvitation {
  event_name: string
  event_date: Date
  description: string
  segment_filters: SegmentFilters
  max_attendees?: number
}
```

#### 6.2 Exportación para otra app
**Endpoint**: `app/api/events/export/route.ts`
```typescript
// GET /api/events/export/:event_id
=> {
  event: Event,
  invitees: {
    id: string,
    email: string,
    full_name: string,
    phone: string,
    status: string
  }[]
}
```

---

### **FASE 7: Sistema de Tier Automático** (1 hora)

#### 7.1 Función para calcular tier
```sql
CREATE OR REPLACE FUNCTION calculate_member_tier(member_id UUID)
RETURNS TEXT AS $$
DECLARE
    total_spent DECIMAL;
    total_visits INTEGER;
    new_tier TEXT;
BEGIN
    SELECT 
        COALESCE(SUM(amount_spent), 0),
        COUNT(*)
    INTO total_spent, total_visits
    FROM card_usage
    WHERE card_usage.member_id = $1
    AND usage_date >= NOW() - INTERVAL '12 months';
    
    -- Lógica de tier basada en gasto
    IF total_spent >= 5000 THEN
        new_tier := 'Platinum';
    ELSIF total_spent >= 2000 THEN
        new_tier := 'Gold';
    ELSIF total_spent >= 500 THEN
        new_tier := 'Silver';
    ELSE
        new_tier := 'Basic';
    END IF;
    
    -- Actualizar miembro si cambió
    UPDATE members 
    SET membership_type = new_tier
    WHERE id = member_id
    AND membership_type != new_tier;
    
    RETURN new_tier;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar tier automáticamente
CREATE OR REPLACE FUNCTION update_tier_on_usage()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_member_tier(NEW.member_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_tier
AFTER INSERT ON card_usage
FOR EACH ROW
EXECUTE FUNCTION update_tier_on_usage();
```

---

### **FASE 8: Analytics Dashboard** (2 horas)

#### 8.1 Nueva página
**Ruta**: `/dashboard/analytics`

**Métricas**:
- 📊 Gasto promedio por tier
- 📈 Frecuencia de visitas por período
- 🎯 Promociones más usadas
- 👥 Segmentación de clientes activos/inactivos
- 🏆 Top clientes (por gasto y frecuencia)
- 📍 Distribución por sucursal

---

## 🔒 Seguridad y Permisos

### Roles:
1. **Admin** - Acceso total
2. **Branch** - Solo scanner, ver info, aplicar promos
3. **Readonly** - Solo visualización

### Políticas RLS para Scanner:
```sql
-- Los usuarios de sucursal solo pueden registrar uso, no eliminar
CREATE POLICY "Branch users can insert card usage"
ON card_usage FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'branch')
    )
);
```

---

## 📱 Consideraciones Adicionales

### Cosas a tener en cuenta:

1. **Privacidad de datos**
   - ✅ GDPR compliance
   - ✅ Encriptación de datos sensibles
   - ✅ Logs de acceso

2. **Performance**
   - ✅ Índices en campos de filtrado
   - ✅ Cache para segmentos comunes
   - ✅ Paginación en vistas de miembros

3. **UX para sucursales**
   - ✅ Modo rápido (scan → monto → done)
   - ✅ Offline support con sync
   - ✅ Confirmación visual/audio al escanear
   - ✅ Atajos de teclado

4. **Integraciones futuras**
   - ✅ API pública para otras apps
   - ✅ Webhooks para eventos
   - ✅ Export a CSV/Excel
   - ✅ Sincronización con POS

5. **Notificaciones**
   - ✅ Email cuando cambian de tier
   - ✅ Push notifications para promos
   - ✅ SMS para invitaciones a eventos

6. **Auditoría**
   - ✅ Log de quién aplicó cada promo
   - ✅ Log de modificaciones a segmentos
   - ✅ Tracking de quien escaneó qué

---

## 🚀 Orden Recomendado de Implementación

1. **FASE 1** - Base de datos (CRÍTICO) ✅
2. **FASE 2** - API Scanner (CRÍTICO) ✅
3. **FASE 3** - UI Scanner (CRÍTICO) ✅
4. **FASE 7** - Tier automático (IMPORTANTE) 🎯
5. **FASE 4** - Segmentación (IMPORTANTE) 🎯
6. **FASE 5** - Promos personalizadas (MEDIO) 📊
7. **FASE 6** - Invitaciones (MEDIO) 📊
8. **FASE 8** - Analytics (NICE TO HAVE) 📈

---

## ⏱️ Tiempo Estimado Total: **13-15 horas**

- Desarrollo core: 8 horas
- Testing y ajustes: 3 horas
- Documentación: 1 hora
- Deploy y validación: 1 hora

---

## 🎨 Mockup de Flujo de Scanner

```
[SCANNER QR] 📸
    ↓ (escanea)
[INFO CLIENTE]
  - Juan Pérez
  - Gold Member
  - Última visita: hace 5 días
  - Total gastado: $2,450
    ↓
[PROMOCIONES DISPONIBLES]
  ☑ 20% descuento (Gold)
  ☑ Bebida gratis (cumpleaños)
  ☐ Happy Hour
    ↓
[REGISTRAR TRANSACCIÓN]
  💰 Monto: $___
  📍 Sucursal: Palermo
  📝 Notas: ___________
    ↓
[✅ REGISTRADO!]
  + 45 puntos
  🎉 ¡Subió a Platinum!
```

---

¿Te parece bien este plan? ¿Quieres que empiece con la Fase 1 (migración de base de datos)?
