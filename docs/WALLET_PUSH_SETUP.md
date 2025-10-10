# 📲 Apple Wallet Push Notifications Setup

## Descripción

Sistema de notificaciones push para Apple Wallet que permite enviar actualizaciones directamente a los iPhones de los miembros que tienen la tarjeta instalada.

## ✅ Ventajas sobre Web Push

- **Nativo de iOS**: Funciona perfectamente en iPhone
- **Más confiable**: Llegan siempre, sin necesidad de tener la app abierta
- **Mejor UX**: Aparecen en el lock screen junto con la tarjeta
- **Sin permisos extra**: Ya otorgados al instalar la tarjeta
- **Updates automáticos**: La tarjeta se actualiza automáticamente

## 🔧 Configuración

### 1. Aplicar Migración en Supabase

Ejecuta el SQL en **Supabase Dashboard → SQL Editor**:

```sql
-- Ver archivo: supabase/migrations/20250110_wallet_push_tokens.sql
```

### 2. Obtener Certificado de APNs

Necesitas crear un **Apple Push Notification Authentication Key** en tu cuenta de desarrollador de Apple:

1. Ve a https://developer.apple.com/account/
2. **Certificates, Identifiers & Profiles**
3. **Keys** → Click en **+** (crear nueva key)
4. Nombre: "Wallet Push Key"
5. **Marca:** ✅ **Apple Push Notifications service (APNs)**
6. Click en **Continue** → **Register**
7. **Descarga el archivo `.p8`** (solo se puede descargar una vez)
8. **Guarda el Key ID** (ej: `ABC123XYZ`)
9. **Guarda tu Team ID** (arriba a la derecha de la página)

### 3. Configurar Variables de Entorno

Agrega a tu `.env.local`:

```bash
# Apple Wallet Push Notifications
APPLE_WALLET_PUSH_KEY="-----BEGIN PRIVATE KEY-----
[Contenido del archivo .p8 que descargaste]
-----END PRIVATE KEY-----"
APPLE_WALLET_KEY_ID=ABC123XYZ
APPLE_TEAM_ID=XYZ123ABC
APPLE_WALLET_PASS_TYPE_ID=pass.com.tuempresa.membership
```

**⚠️ Importante:**
- El contenido de `.p8` debe incluir las líneas `BEGIN` y `END`
- `APPLE_WALLET_PASS_TYPE_ID` debe coincidir con el Pass Type ID de tu tarjeta
- Mantén estas credenciales **secretas**

### 4. Reiniciar el Servidor

```bash
npm run dev
```

## 📱 Uso

### Enviar Notificación desde Segmentos

1. Ve a **Dashboard → Segmentos**
2. Aplica filtros para seleccionar miembros
3. Click en **"Enviar a Wallet"** (botón morado 💳)
4. Escribe un mensaje (máx 120 caracteres)
5. Click en **"Enviar"**

### Ejemplo de Mensaje

```
¡Nueva promoción disponible! 20% OFF en tu próxima visita 🎉
```

### Qué Sucede

1. **Backend** envía una notificación push a través de APNs
2. **iPhone** recibe la notificación
3. **Wallet** descarga la versión actualizada de la tarjeta desde tu servidor
4. **Usuario** ve la notificación en el lock screen

## 🔄 Flujo Técnico

```
┌─────────────┐         ┌──────────┐         ┌─────────┐         ┌──────────┐
│  Dashboard  │         │ Tu API   │         │  APNs   │         │  iPhone  │
│  (Segment)  │────────▶│ /wallet/ │────────▶│  Apple  │────────▶│  Wallet  │
│             │ POST    │  push/   │  HTTP/2 │ Servers │  Push   │   App    │
└─────────────┘         │  send    │         │         │         └──────────┘
                        └──────────┘         └─────────┘               │
                              │                                        │
                              │◀───────────────────────────────────────┘
                              │      GET /v1/passes/{passType}/{serial}
                        (Wallet descarga tarjeta actualizada)
```

## 📊 Estadísticas

### Ver Tokens Registrados

```sql
SELECT 
  wpt.device_library_identifier,
  m.full_name,
  m.email,
  wpt.is_active,
  wpt.created_at,
  wpt.last_updated_at
FROM wallet_push_tokens wpt
JOIN members m ON m.id = wpt.member_id
WHERE wpt.is_active = true
ORDER BY wpt.created_at DESC;
```

### Ver Historial de Notificaciones

```sql
SELECT 
  wpn.message,
  wpn.total_sent,
  wpn.total_delivered,
  wpn.total_failed,
  wpn.sent_at
FROM wallet_push_notifications wpn
ORDER BY wpn.sent_at DESC
LIMIT 20;
```

## 🐛 Troubleshooting

### No se registran tokens

**Problema:** Los usuarios instalan la tarjeta pero no aparecen tokens en `wallet_push_tokens`

**Solución:**
1. Verifica que el endpoint `/v1/devices/...` esté funcionando
2. Revisa logs del servidor cuando se instala una tarjeta
3. Asegúrate de que el Pass Type ID sea correcto

### Notificaciones no llegan

**Problema:** Se envían pero no llegan al iPhone

**Solución:**
1. **Verifica credenciales APNs:**
   - Key ID correcto
   - Team ID correcto
   - Archivo .p8 válido
2. **Revisa logs del servidor:**
   ```bash
   # Busca errores de APNs
   grep "Wallet Push" logs/*.log
   ```
3. **Prueba en producción:** APNs sandbox puede tener limitaciones

### Error "Invalid Token"

**Problema:** Tokens marcados como inválidos

**Solución:**
- El usuario desinstaló la tarjeta
- Se marcará automáticamente como `is_active = false`
- Normal, no requiere acción

## 🚀 Próximos Pasos

- [ ] Programar notificaciones para envío futuro
- [ ] Templates de mensajes predefinidos
- [ ] Dashboard de estadísticas de envío
- [ ] Rich notifications (imágenes, acciones)
- [ ] Segmentación por zona geográfica

## 📝 Notas Importantes

1. **Límites de APNs:**
   - Máx 5-10 notificaciones por día por dispositivo (recomendado)
   - Mensajes cortos (máx 120 caracteres)

2. **Testing:**
   - Usa un iPhone real con la tarjeta instalada
   - APNs sandbox puede tener retrasos

3. **Producción:**
   - Cambia `production: true` en `/lib/services/wallet-push.ts`
   - Usa certificados de producción de Apple

## 🔗 Referencias

- [Apple Wallet Developer Guide](https://developer.apple.com/documentation/walletpasses)
- [APNs Documentation](https://developer.apple.com/documentation/usernotifications)
- [Pass Updates](https://developer.apple.com/library/archive/documentation/PassKit/Reference/PassKit_WebService/WebService.html)
