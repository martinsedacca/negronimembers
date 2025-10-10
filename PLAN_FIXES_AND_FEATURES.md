# Plan: Correcciones y Nuevas Funcionalidades

**Fecha:** 10 de Enero 2025  
**Issues a resolver:**
1. Bug: Visitas duplicadas (se registran 7 en lugar de 1)
2. Feature: Ver si miembro tiene tarjeta instalada
3. Feature: Actualizaciones automáticas y push notifications

---

## 🐛 **ISSUE 1: Bug de Visitas Duplicadas**

### Investigación Necesaria:

**Posibles causas:**
1. **React Strict Mode** - En desarrollo, React ejecuta efectos 2 veces
2. **Múltiples clicks** - Usuario hace click múltiple antes de que se deshabilite el botón
3. **Triggers en DB** - Algún trigger ejecutándose múltiples veces
4. **Re-renders** - El componente se re-renderiza causando múltiples submits
5. **Browser extensions** - Extensiones que interceptan requests

**Plan de acción:**

#### Paso 1: Debugging (30 min)
- [ ] Agregar logging detallado en el endpoint `/api/scanner/record`
- [ ] Agregar timestamp único a cada request
- [ ] Verificar en logs de Supabase si hay múltiples INSERT
- [ ] Revisar Network tab en DevTools durante registro

#### Paso 2: Fixes (1h)
- [ ] **Fix A: Deshabilitar botón inmediatamente**
  - Agregar `disabled={loading}` al botón submit
  - Prevenir doble submit con flag de "submitting"
  
- [ ] **Fix B: Debounce del submit**
  - Implementar debounce de 500ms en handleSubmit
  - Usar hook personalizado useDebounce
  
- [ ] **Fix C: Request deduplication**
  - Generar ID único por transacción en frontend
  - Validar en backend que no exista el mismo transaction_id
  - Agregar columna `transaction_id` a `card_usage`

- [ ] **Fix D: Desactivar Strict Mode temporalmente**
  - Comentar `<React.StrictMode>` en desarrollo para probar
  - Si esto lo soluciona, implementar idempotencia en el backend

#### Paso 3: Validación (30 min)
- [ ] Probar registro de visita 10 veces
- [ ] Verificar en DB que solo se crea 1 registro
- [ ] Verificar contador de visitas en member_stats

**Tiempo estimado:** 2 horas

---

## 📱 **ISSUE 2: Ver si Miembro tiene Tarjeta Instalada**

### Contexto:
La tabla `wallet_passes` ya existe y almacena:
- `pass_type`: 'apple' o 'google'
- `pass_id`: ID único del pase
- `serial_number`: Número de serie
- `last_updated`: Última actualización
- `created_at`: Fecha de instalación

### Plan de Implementación:

#### Fase 1: Backend - Endpoints (1h)

**Archivo:** `/app/api/members/[id]/wallet-status/route.ts`
```typescript
GET /api/members/:id/wallet-status
Respuesta:
{
  has_wallet: boolean,
  passes: [
    {
      pass_type: 'apple' | 'google',
      installed_at: timestamp,
      last_updated: timestamp,
      serial_number: string
    }
  ]
}
```

**Modificaciones a endpoints existentes:**
- [ ] `/api/scanner/verify` - Incluir wallet_status en respuesta
- [ ] `/api/members` - Agregar columna "Tarjeta" en lista

#### Fase 2: Database - Vista SQL (30 min)

**Archivo:** `/supabase/migrations/20250110_wallet_status_view.sql`
```sql
CREATE VIEW member_wallet_status AS
SELECT 
  m.id as member_id,
  COUNT(wp.id) > 0 as has_wallet,
  ARRAY_AGG(
    JSON_BUILD_OBJECT(
      'pass_type', wp.pass_type,
      'installed_at', wp.created_at,
      'last_updated', wp.last_updated
    )
  ) FILTER (WHERE wp.id IS NOT NULL) as passes
FROM members m
LEFT JOIN wallet_passes wp ON m.id = wp.member_id
GROUP BY m.id;
```

#### Fase 3: Frontend - UI Components (2h)

**1. Member Info Card (Scanner)**
```tsx
// components/scanner/MemberInfo.tsx
- Agregar sección "Estado de Tarjeta Digital"
- Mostrar iconos de Apple Wallet / Google Wallet
- Badge verde si instalada, gris si no
- Fecha de instalación
```

**2. Members List**
```tsx
// components/members/MembersList.tsx
- Nueva columna "Tarjeta"
- Icono Apple/Google con tooltip
- Filter: "Con tarjeta" / "Sin tarjeta"
```

**3. Member Detail Modal**
```tsx
// components/members/MemberDetailModal.tsx (NUEVO)
- Vista detallada del miembro
- Sección de wallet passes
- Botón "Enviar link de instalación" (futuro)
```

#### Fase 4: Types Update (30 min)
- [ ] Actualizar `lib/types/database.ts` con wallet_status
- [ ] Agregar tipos para wallet pass response

**Tiempo estimado:** 4 horas

---

## 🔔 **ISSUE 3: Actualizaciones Automáticas y Push Notifications**

### Contexto:
Apple Wallet y Google Wallet soportan push notifications para actualizar tarjetas cuando hay cambios (puntos, tier, promociones).

### Arquitectura Propuesta:

```
┌─────────────────┐
│  Next.js App    │
│  (Admin/Scanner)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Supabase DB    │─────▶│  Webhook Service │
│  (Triggers)     │      │  (Next.js API)   │
└─────────────────┘      └────────┬─────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
         ┌────────────────┐            ┌──────────────────┐
         │ Apple Push      │            │ Google Cloud     │
         │ Notification    │            │ Messaging (FCM)  │
         │ Service (APNs)  │            │                  │
         └────────┬────────┘            └────────┬─────────┘
                  │                              │
                  ▼                              ▼
         ┌────────────────┐            ┌──────────────────┐
         │ Apple Wallet    │            │ Google Wallet    │
         │ (iPhone)        │            │ (Android)        │
         └─────────────────┘            └──────────────────┘
```

### Plan de Implementación:

#### Fase 1: Infraestructura Base (3h)

**1.1. Configuración de Certificados**
- [ ] Obtener Apple Developer Certificate (.p12)
- [ ] Configurar Team ID y Pass Type ID
- [ ] Obtener Google Service Account JSON
- [ ] Configurar Firebase Cloud Messaging

**1.2. Variables de Entorno**
```env
# Apple Wallet
APPLE_TEAM_ID=
APPLE_PASS_TYPE_ID=
APPLE_WWDR_CERTIFICATE=
APPLE_SIGNING_CERTIFICATE=
APPLE_CERTIFICATE_PASSWORD=

# Google Wallet
GOOGLE_APPLICATION_CREDENTIALS=
GOOGLE_ISSUER_ID=
GOOGLE_CLASS_ID=

# Push Notifications
PUSH_NOTIFICATION_ENDPOINT=
```

**1.3. Dependencias**
```bash
npm install @walletpass/pass-js firebase-admin node-apn
```

#### Fase 2: Database Changes (2h)

**Archivo:** `/supabase/migrations/20250110_push_notifications.sql`

```sql
-- Tabla para tracking de push notifications
CREATE TABLE push_notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  pass_type TEXT CHECK (pass_type IN ('apple', 'google')),
  notification_type TEXT, -- 'points_update', 'tier_change', 'promotion_assigned'
  payload JSONB,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para queue de actualizaciones
CREATE TABLE wallet_update_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  update_type TEXT, -- 'points', 'tier', 'promotion', 'full'
  priority INTEGER DEFAULT 5, -- 1-10, 10 = highest
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función para encolar actualizaciones
CREATE OR REPLACE FUNCTION enqueue_wallet_update(
  p_member_id UUID,
  p_update_type TEXT,
  p_priority INTEGER DEFAULT 5
) RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  INSERT INTO wallet_update_queue (member_id, update_type, priority)
  VALUES (p_member_id, p_update_type, p_priority)
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Encolar actualización cuando cambien puntos
CREATE OR REPLACE FUNCTION trigger_enqueue_points_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.points != OLD.points THEN
    PERFORM enqueue_wallet_update(NEW.id, 'points', 7);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_enqueue_points_update
AFTER UPDATE OF points ON members
FOR EACH ROW
EXECUTE FUNCTION trigger_enqueue_points_update();

-- Trigger: Encolar actualización cuando cambie tier
CREATE OR REPLACE FUNCTION trigger_enqueue_tier_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.membership_type != OLD.membership_type THEN
    PERFORM enqueue_wallet_update(NEW.id, 'tier', 10); -- Max priority
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_enqueue_tier_update
AFTER UPDATE OF membership_type ON members
FOR EACH ROW
EXECUTE FUNCTION trigger_enqueue_tier_update();

-- Trigger: Encolar actualización cuando se asigne promoción
CREATE OR REPLACE FUNCTION trigger_enqueue_promotion_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM enqueue_wallet_update(NEW.member_id, 'promotion', 8);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_enqueue_promotion_update
AFTER INSERT ON member_assigned_promotions
FOR EACH ROW
EXECUTE FUNCTION trigger_enqueue_promotion_update();

-- Índices
CREATE INDEX idx_wallet_update_queue_unprocessed ON wallet_update_queue(processed, priority DESC, created_at);
CREATE INDEX idx_push_logs_member ON push_notification_logs(member_id);
CREATE INDEX idx_push_logs_status ON push_notification_logs(status);
```

#### Fase 3: Backend - API Endpoints (4h)

**3.1. Endpoint: Process Update Queue**

**Archivo:** `/app/api/wallet/process-queue/route.ts`
```typescript
// Procesa queue de actualizaciones (cron job cada 1 minuto)
POST /api/wallet/process-queue

Lógica:
1. Obtener top 10 items no procesados (ordered by priority)
2. Para cada member_id:
   - Obtener wallet_passes del miembro
   - Generar nuevo .pkpass / .jwt actualizado
   - Enviar push notification a Apple/Google
   - Marcar como procesado
3. Log de resultados
```

**3.2. Endpoint: Send Push Notification**

**Archivo:** `/app/api/wallet/send-push/route.ts`
```typescript
POST /api/wallet/send-push
Body: {
  member_id: UUID,
  pass_type: 'apple' | 'google',
  notification_type: string
}

Lógica:
- Apple: Usar APNs con certificado
- Google: Usar FCM API
- Log en push_notification_logs
```

**3.3. Endpoint: Generate Updated Pass**

**Archivo:** `/app/api/wallet/generate-pass/[memberId]/route.ts`
```typescript
GET /api/wallet/generate-pass/:memberId?passType=apple

Lógica:
1. Obtener datos frescos del miembro (puntos, tier, promociones)
2. Generar pass.json / JWT actualizado
3. Para Apple: Firmar y crear .pkpass
4. Para Google: Crear JWT signed
5. Retornar archivo o URL
```

#### Fase 4: Services - Pass Generation (5h)

**Archivo:** `/lib/services/appleWallet.ts`
```typescript
export class AppleWalletService {
  async generatePass(memberData: Member): Promise<Buffer>
  async updatePass(passId: string, memberData: Member): Promise<Buffer>
  async sendPushNotification(deviceTokens: string[]): Promise<void>
  private signPass(passJson: any): Buffer
}
```

**Archivo:** `/lib/services/googleWallet.ts`
```typescript
export class GoogleWalletService {
  async generatePass(memberData: Member): Promise<string> // JWT
  async updatePass(objectId: string, memberData: Member): Promise<string>
  async sendPushNotification(objectId: string): Promise<void>
  private createJWT(payload: any): string
}
```

**Archivo:** `/lib/services/pushNotificationService.ts`
```typescript
export class PushNotificationService {
  async sendToApple(deviceTokens: string[], payload: any): Promise<void>
  async sendToGoogle(registrationTokens: string[], payload: any): Promise<void>
  async logNotification(log: PushLog): Promise<void>
}
```

#### Fase 5: Cron Job - Automatic Processing (2h)

**Opción A: Vercel Cron Jobs** (Recomendado para Next.js)

**Archivo:** `/vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/wallet/process-queue",
      "schedule": "* * * * *"  // Cada minuto
    }
  ]
}
```

**Opción B: Supabase Edge Functions**

**Archivo:** `/supabase/functions/process-wallet-updates/index.ts`
```typescript
// Ejecutar cada minuto usando Supabase Cron
Deno.serve(async (req) => {
  // Llamar a /api/wallet/process-queue
  // O procesar directamente desde aquí
})
```

**Opción C: GitHub Actions** (Free tier friendly)

**Archivo:** `.github/workflows/process-wallet-queue.yml`
```yaml
name: Process Wallet Update Queue
on:
  schedule:
    - cron: '* * * * *'  # Cada minuto
  workflow_dispatch:
jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - name: Call API
        run: curl -X POST https://tu-app.vercel.app/api/wallet/process-queue
```

#### Fase 6: Frontend - Admin Panel (3h)

**Página:** `/app/dashboard/push-notifications/page.tsx`

Features:
- [ ] Vista de queue de actualizaciones (pending/processed)
- [ ] Logs de push notifications enviadas
- [ ] Estadísticas: % de tarjetas instaladas, push exitosos/fallidos
- [ ] Botón "Forzar actualización manual" para un miembro
- [ ] Botón "Actualizar todos" (bulk update)
- [ ] Filtros por tipo, estado, fecha

**Componentes:**
- `PushNotificationLogs.tsx` - Tabla de logs
- `WalletUpdateQueue.tsx` - Vista de queue
- `PushStats.tsx` - Estadísticas y gráficos

#### Fase 7: Testing y Debugging (4h)

- [ ] Probar instalación de tarjeta Apple Wallet en iPhone real
- [ ] Probar instalación de tarjeta Google Wallet en Android
- [ ] Registrar transacción y verificar push automático
- [ ] Verificar que tarjeta se actualice en device
- [ ] Probar cambio de tier y notificación
- [ ] Probar asignación de promoción y notificación
- [ ] Load testing: 100 actualizaciones simultáneas
- [ ] Error handling: Qué pasa si APNs falla

#### Fase 8: Documentación (2h)

- [ ] Guía de setup de certificados Apple
- [ ] Guía de setup de Firebase/Google
- [ ] Troubleshooting común
- [ ] Diagrama de arquitectura
- [ ] API documentation

---

## 📊 **RESUMEN DE TIEMPOS**

| Task | Estimación |
|------|------------|
| **Issue 1: Bug Visitas Duplicadas** | 2h |
| **Issue 2: Wallet Status** | 4h |
| **Issue 3: Push Notifications** | |
| - Infraestructura | 3h |
| - Database | 2h |
| - API Endpoints | 4h |
| - Services | 5h |
| - Cron Job | 2h |
| - Frontend | 3h |
| - Testing | 4h |
| - Documentación | 2h |
| **TOTAL Issue 3** | **25h** |
| **GRAN TOTAL** | **31h** |

---

## 🎯 **PRIORIDADES RECOMENDADAS**

### Sprint 1 (1-2 días):
1. ✅ **Fix bug de visitas duplicadas** - CRÍTICO (2h)
2. ✅ **Wallet status en UI** - IMPORTANTE (4h)

### Sprint 2 (5-7 días):
3. ✅ **Push notifications completo** - NICE TO HAVE (25h)

---

## 🔧 **ALTERNATIVAS SIMPLIFICADAS**

Si 25h es demasiado para push notifications, aquí hay una versión simplificada:

### **Versión Lite: Actualizaciones por Link (4h)**

En lugar de push automático, generar links de actualización:

1. **Cuando cambien datos del miembro:**
   - Generar nuevo pass
   - Enviar email/SMS con link de actualización
   - "Tu tarjeta ha sido actualizada, haz click aquí"

2. **Endpoint simple:**
   ```
   GET /api/wallet/update/:memberId/:passType
   - Genera pass actualizado
   - Retorna archivo para download
   - Usuario lo agrega manualmente
   ```

3. **Ventajas:**
   - No requiere certificados complejos
   - No requiere cron jobs
   - Mucho más simple
   - Funciona igual de bien si el usuario abre el link

4. **Desventajas:**
   - Usuario debe hacer click (no es automático)
   - Requiere email/SMS service

---

## 🚀 **DECISIÓN REQUERIDA**

¿Qué approach prefieres?

**A) Full Implementation (31h total)**
- Fix bug visitas
- Wallet status
- Push notifications automáticas completas

**B) MVP Fast (6h total)**
- Fix bug visitas
- Wallet status
- Link de actualización manual (no push)

**C) Híbrido (15h total)**
- Fix bug visitas
- Wallet status
- Push notifications solo para tier changes
- Link manual para todo lo demás

---

**Próximo paso:** Dime cuál approach prefieres y empiezo con el Issue 1 (bug de visitas) inmediatamente.
