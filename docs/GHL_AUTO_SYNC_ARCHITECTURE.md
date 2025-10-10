# Arquitectura de Sincronización Automática con GoHighLevel

## 🏗️ Visión General

El sistema implementa sincronización automática bidireccional entre el sistema de membresías y GoHighLevel, actualizando los custom fields de contactos en tiempo real conforme ocurren eventos.

## 📊 Flujo de Datos

```
[Evento en App] → [Webhook Local] → [GHL Sync Service] → [GHL API] → [Contact Updated]
     ↓
[Database Update]
```

## 🔄 Componentes Principales

### 1. GHLSyncService (`/lib/services/ghl-sync.ts`)

**Responsabilidades:**
- ✅ Crear/actualizar contactos en GHL
- ✅ Verificar existencia de custom fields
- ✅ Crear automáticamente custom fields faltantes
- ✅ Sincronizar tags de membresía y tier
- ✅ Mantener caché de field IDs

**Métodos clave:**
- `ensureCustomFields()` - Verifica y crea custom fields necesarios
- `syncMember(member)` - Sincroniza un miembro individual
- `findContact(email, phone)` - Busca contacto existente
- `createContact(member)` - Crea nuevo contacto
- `updateContact(contactId, member)` - Actualiza contacto existente

### 2. Webhook Endpoint (`/app/api/webhooks/member-updated/route.ts`)

**Responsabilidades:**
- ✅ Recibir notificaciones de cambios
- ✅ Validar webhook secret (opcional)
- ✅ Cargar configuración de GHL
- ✅ Obtener datos completos del miembro desde `member_stats`
- ✅ Invocar `GHLSyncService`
- ✅ Registrar resultado en `ghl_sync_log`

**Payload esperado:**
```json
{
  "type": "INSERT" | "UPDATE",
  "table": "members",
  "record": {
    "id": "member-uuid"
  }
}
```

### 3. Puntos de Integración

#### A. Crear Nuevo Miembro
**Archivo:** `/components/members/NewMemberForm.tsx`
**Trigger:** Al guardar formulario de nuevo miembro
```typescript
const { data: newMember } = await supabase.from('members').insert({...}).select().single()
fetch('/api/webhooks/member-updated', {
  method: 'POST',
  body: JSON.stringify({ type: 'INSERT', table: 'members', record: { id: newMember.id } })
})
```

#### B. Actualizar Miembro
**Archivo:** `/components/members/MemberDetailModalNew.tsx`
**Trigger:** Al guardar cambios en perfil de miembro
```typescript
await supabase.from('members').update(formData).eq('id', member.id)
fetch('/api/webhooks/member-updated', {
  method: 'POST',
  body: JSON.stringify({ type: 'UPDATE', table: 'members', record: { id: member.id } })
})
```

#### C. Registrar Visita/Compra
**Archivo:** `/app/api/scanner/record/route.ts`
**Trigger:** Al registrar transacción en scanner
```typescript
// Después de insertar en card_usage y actualizar puntos
fetch(`${baseUrl}/api/webhooks/member-updated`, {
  method: 'POST',
  body: JSON.stringify({ type: 'UPDATE', table: 'members', record: { id: member_id } })
})
```

## 📋 Custom Fields Sincronizados

| Field Name | Field Key | Type | Se Actualiza En |
|------------|-----------|------|-----------------|
| Membership Number | member_number | TEXT | Crear miembro |
| Member Tier | member_tier | TEXT | Crear/actualizar, cambio de tier |
| Member Points | member_points | NUMERICAL | Crear/actualizar, cada transacción |
| Member Status | member_status | TEXT | Crear/actualizar |
| **Member Visits** | member_visits | NUMERICAL | **Cada visita registrada** |
| **Member Spent** | member_spent | NUMERICAL | **Cada compra registrada** |
| **Member Last Visit** | member_last_visit | TEXT | **Cada visita registrada** |
| Member Avg Purchase | member_avg_purchase | NUMERICAL | Cada compra registrada |

## 🏷️ Tags Automáticos

**Por Status:**
- `membership` - Tag general
- `membership_active` - Status activo
- `membership_inactive` - Status inactivo

**Por Tier:**
- `tier_basic`
- `tier_silver`
- `tier_gold`
- `tier_platinum`
- `tier_vip`

## ⚡ Características de Rendimiento

### 1. Sincronización Asíncrona
Todas las llamadas al webhook son **no bloqueantes**:
```typescript
fetch('/api/webhooks/member-updated', {...}).catch(err => console.error('GHL sync failed:', err))
// No esperamos respuesta, la app continúa
```

### 2. Caché de Field IDs
Los IDs de custom fields se cachean en memoria después de la primera sincronización:
```typescript
private customFieldsCache: Map<string, string> | null = null
```

### 3. Rate Limiting Protection
Delay de 200ms entre creaciones de custom fields para evitar límites de API:
```typescript
await new Promise(resolve => setTimeout(resolve, 200))
```

### 4. Búsqueda Inteligente de Contactos
Busca por email primero, luego por teléfono para evitar duplicados:
```typescript
async findContact(email: string, phone?: string | null): Promise<string | null>
```

## 🔐 Seguridad

### 1. Webhook Secret (Opcional)
```typescript
const webhookSecret = request.headers.get('x-webhook-secret')
if (expectedSecret && webhookSecret !== expectedSecret) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 2. Configuración desde Base de Datos
Token y Location ID se almacenan en `system_config`:
```typescript
const { data: config } = await supabase
  .from('system_config')
  .select('config_value')
  .in('config_key', ['ghl_api_token', 'ghl_location_id'])
```

## 📝 Logging y Debugging

### Console Logs
El sistema usa prefijos de emoji para facilitar debugging:
- 🔵 `[GHLSync]` - Operaciones normales
- 🔴 `[GHLSync]` - Errores
- ✅ `[GHLSync]` - Operaciones exitosas
- ⚠️ `[GHLSync]` - Advertencias

### Sync Log Table
Cada sincronización se registra en `ghl_sync_log`:
```sql
CREATE TABLE ghl_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  sync_type TEXT, -- 'create' | 'update' | 'bulk'
  success BOOLEAN,
  error_message TEXT,
  ghl_contact_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

## 🧪 Testing

### 1. Test Individual Sync
```typescript
// Desde el navegador (consola)
await fetch('/api/ghl/sync-member', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ member_id: 'uuid-here' })
})
```

### 2. Test Bulk Sync
```typescript
await fetch('/api/ghl/sync-all', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
```

### 3. Test Config
```typescript
await fetch('/api/ghl/test-config')
```

## 🐛 Troubleshooting

### Problema: Custom fields no se crean

**Causa:** Token sin permisos para crear custom fields
**Solución:** Verificar scopes del PIT:
- ✅ contacts.readonly
- ✅ contacts.write
- ✅ locations.readonly
- ✅ locations/customFields.write (si disponible)

### Problema: Sincronización no se dispara

**Causa 1:** GHL no configurado
**Solución:** Verificar que `ghl_api_token` y `ghl_location_id` existan en `system_config`

**Causa 2:** Webhook endpoint no accesible
**Solución:** Verificar `NEXT_PUBLIC_APP_URL` en `.env.local`

### Problema: Contactos duplicados

**Causa:** Email o teléfono diferentes entre registros
**Solución:** El sistema busca por email primero, luego teléfono. Asegurar que el email sea consistente.

## 📊 Métricas y Monitoreo

### Consultar Sync Log
```sql
-- Últimas 10 sincronizaciones
SELECT 
  m.full_name,
  m.email,
  gsl.sync_type,
  gsl.success,
  gsl.error_message,
  gsl.created_at
FROM ghl_sync_log gsl
JOIN members m ON m.id = gsl.member_id
ORDER BY gsl.created_at DESC
LIMIT 10;

-- Tasa de éxito por tipo
SELECT 
  sync_type,
  COUNT(*) as total,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN success THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM ghl_sync_log
GROUP BY sync_type;
```

## 🚀 Mejoras Futuras

### Posibles Optimizaciones
- [ ] Webhook retry con exponential backoff
- [ ] Queue system para sincronizaciones (Bull/Redis)
- [ ] Batch updates para múltiples cambios
- [ ] Webhook desde Supabase Triggers (en lugar de llamadas desde frontend)
- [ ] Dashboard de sincronización en tiempo real
- [ ] Alertas por email/Slack en fallos

### Features Adicionales
- [ ] Sincronización bidireccional (GHL → App)
- [ ] Webhooks de GHL para detectar cambios externos
- [ ] Segmentación automática en GHL basada en tier/puntos
- [ ] Triggering de workflows en GHL por eventos específicos

---

**Última actualización:** 2025-01-10 (v2.0)
**Autor:** Sistema de Membresías
