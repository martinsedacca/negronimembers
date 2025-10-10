# 🔔 Sistema de Notificaciones Push

## Descripción

Sistema completo de notificaciones push web que permite enviar notificaciones a miembros en tiempo real usando la API estándar de Web Push.

## Características

- ✅ **Notificaciones Web Push** - Compatible con Chrome, Firefox, Edge, Safari
- ✅ **Segmentación** - Envía a todos los miembros o por filtros específicos
- ✅ **Tracking** - Estadísticas de envío, entrega y clicks
- ✅ **Service Worker** - Funciona incluso con la app cerrada
- ✅ **URLs personalizadas** - Redirige al hacer click

## Configuración

### 1. Aplicar Migración en Supabase

Ejecuta el SQL en **Supabase Dashboard → SQL Editor**:

```sql
-- Ver archivo: supabase/migrations/20250110_push_notifications.sql
```

### 2. Configurar Variables de Entorno

Agrega a tu `.env.local`:

```bash
# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BGQPVvozvwEDyONt0dKzKEKyiDcnfRm47yWGm3y1BSJKfb5G6WvZGCix9pJwEqjjSY3ecISIQT6shZSAC2U35Kc
VAPID_PRIVATE_KEY=TZexl-EuW9v1uc_6QkeTViWvl_ykuQzsndl7XWiixQc
VAPID_SUBJECT=mailto:tu-email@ejemplo.com
```

⚠️ **Importante:** Cambia `VAPID_SUBJECT` por tu email real.

### 3. Reiniciar el Servidor

```bash
npm run dev
```

## Uso

### Enviar Notificación a Segmento

1. Ve a **Dashboard → Segmentos**
2. Aplica los filtros deseados (ej: tier = Gold, gasto > $500)
3. Click en **"Enviar Push"**
4. Completa:
   - **Título:** Máx 50 caracteres
   - **Mensaje:** Máx 120 caracteres
   - **URL (opcional):** Redirige al hacer click
5. Click en **"Enviar"**

### Tipos de Segmentación

| Tipo | Descripción |
|------|-------------|
| **Segment** | Basado en filtros (tier, gasto, visitas, etc.) |
| **Individual** | A miembros específicos |
| **All** | A todos los miembros |
| **Tier** | Por nivel de membresía |

## Arquitectura

### Base de Datos

```
push_subscriptions
├── id (UUID)
├── member_id (FK → members)
├── endpoint (TEXT, UNIQUE)
├── keys (JSONB) - p256dh y auth
├── is_active (BOOLEAN)
└── last_used_at (TIMESTAMPTZ)

push_notifications
├── id (UUID)
├── title, body, icon, url
├── target_type (all|segment|individual|tier)
├── target_filter (JSONB)
├── total_sent, total_delivered, total_failed, total_clicked
└── sent_at (TIMESTAMPTZ)

push_notification_deliveries
├── notification_id (FK)
├── subscription_id (FK)
├── member_id (FK)
├── status (pending|sent|delivered|failed|clicked)
└── sent_at, delivered_at, clicked_at
```

### API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/push/subscribe` | POST | Registrar suscripción push |
| `/api/push/subscribe?endpoint=...` | DELETE | Eliminar suscripción |
| `/api/push/send` | POST | Enviar notificaciones |

### Service Worker

Archivo: `public/sw.js`

- Escucha eventos `push`
- Muestra notificaciones
- Maneja clicks en notificaciones
- Redirige a URLs específicas

## Suscripción del Usuario

Para que un miembro reciba notificaciones, debe:

1. **Visitar la app** en su dispositivo
2. **Permitir notificaciones** cuando el navegador lo solicite
3. La suscripción se guarda automáticamente en `push_subscriptions`

### Implementar Botón de Suscripción (Opcional)

```tsx
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'

function NotificationButton() {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications()

  if (!isSupported) return <p>Notificaciones no soportadas</p>

  return (
    <button onClick={isSubscribed ? unsubscribe : subscribe}>
      {isSubscribed ? 'Desactivar Notificaciones' : 'Activar Notificaciones'}
    </button>
  )
}
```

## Envío Programático

```typescript
// Enviar a segmento específico
const response = await fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Nueva promoción',
    body: '¡20% OFF en tu próxima visita!',
    url: 'https://tuapp.com/promociones',
    icon: '/icon-192x192.png',
    target_type: 'segment',
    target_filter: {
      membership_type: 'Gold',
      total_spent_min: 500
    }
  }),
})

const data = await response.json()
console.log(`Enviadas: ${data.stats.sent}, Fallidas: ${data.stats.failed}`)
```

## Estadísticas y Tracking

### Ver Historial de Notificaciones

```sql
SELECT 
  pn.title,
  pn.body,
  pn.total_sent,
  pn.total_delivered,
  pn.total_failed,
  pn.total_clicked,
  pn.sent_at
FROM push_notifications pn
ORDER BY sent_at DESC
LIMIT 20;
```

### Ver Tasa de Apertura

```sql
SELECT 
  pn.title,
  ROUND(100.0 * pn.total_clicked / NULLIF(pn.total_sent, 0), 2) as click_rate
FROM push_notifications pn
WHERE pn.total_sent > 0
ORDER BY pn.sent_at DESC;
```

## Troubleshooting

### Las notificaciones no llegan

1. **Verifica permisos del navegador:** Settings → Notifications
2. **Revisa la consola:** F12 → Console
3. **Verifica suscripciones activas:**
   ```sql
   SELECT COUNT(*) FROM push_subscriptions WHERE is_active = true;
   ```

### Error "Subscription expired"

- El navegador invalidó la suscripción
- Se marca automáticamente como `is_active = false`
- El usuario debe volver a suscribirse

### No hay botón de suscripción

- Las suscripciones se pueden registrar automáticamente al cargar la app
- Implementa el hook `usePushNotifications` en tu layout principal

## Limitaciones

- ✅ **Chrome/Edge:** Soporte completo
- ✅ **Firefox:** Soporte completo
- ⚠️ **Safari:** Solo en macOS 13+ e iOS 16.4+
- ❌ **Opera Mini:** No soportado

## Mejores Prácticas

1. **Títulos cortos** - Máx 50 caracteres
2. **Mensajes concisos** - Máx 120 caracteres
3. **URLs relevantes** - Lleva a contenido específico
4. **Frecuencia moderada** - No spam
5. **Segmentación inteligente** - Envía solo a quienes les interesa

## Próximos Pasos

- [ ] Dashboard de estadísticas de notificaciones
- [ ] Programar notificaciones para envío futuro
- [ ] Templates de notificaciones predefinidas
- [ ] A/B testing de mensajes
- [ ] Rich notifications (imágenes, acciones múltiples)
