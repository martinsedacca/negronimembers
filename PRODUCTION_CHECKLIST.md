# 🚀 Checklist de Producción - Negroni App

## Estado Actual
- [ ] SMS con Twilio
- [ ] Deploy en Vercel
- [ ] Dominio personalizado
- [ ] Apple Wallet
- [ ] Push Notifications

---

## 1. SMS con Twilio (URGENTE)

### Paso 1: Crear cuenta Twilio
1. Ve a [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Crea una cuenta (hay crédito gratis para empezar)
3. Verifica tu número de teléfono

### Paso 2: Obtener credenciales
En el Dashboard de Twilio, copia:
- **Account SID**: `ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- **Auth Token**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Paso 3: Comprar número de teléfono
1. Twilio Console → Phone Numbers → Buy a Number
2. Selecciona un número con capacidad **SMS**
3. Costo: ~$1/mes + ~$0.0075/SMS enviado

### Paso 4: Configurar en Supabase
1. [Supabase Dashboard](https://supabase.com/dashboard) → Tu proyecto
2. **Authentication** → **Providers** → **Phone**
3. Habilitar **Enable Phone provider**
4. Configurar:
   - **SMS Provider**: `Twilio`
   - **Twilio Account SID**: (tu SID)
   - **Twilio Auth Token**: (tu token)
   - **Twilio Messaging Service SID**: (dejar vacío si usas número directo)
   - **Twilio Phone Number**: (tu número con formato +1XXXXXXXXXX)
5. **Save**

### Paso 5: Verificar
- Probar login en `/member/auth`
- Debería recibir SMS con código de 6 dígitos

---

## 2. Deploy en Vercel

### Paso 1: Conectar repositorio
1. [vercel.com](https://vercel.com) → Import Project
2. Conectar con GitHub/GitLab
3. Seleccionar el repositorio

### Paso 2: Configurar variables de entorno
En Vercel → Settings → Environment Variables, agregar:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

### Paso 3: Deploy
- Push a `main` → Deploy automático

---

## 3. Supabase - Configuración de Producción

### Authentication Settings
1. **Site URL**: `https://tu-dominio.com`
2. **Redirect URLs**: 
   - `https://tu-dominio.com/**`
   - `http://localhost:3000/**` (para desarrollo)

### Row Level Security (RLS)
- Verificar que todas las tablas tengan RLS habilitado
- Políticas correctas para members, transactions, etc.

---

## 4. Capacitor para iOS/Android

### Actualizar configuración
En `capacitor.config.ts`:
```typescript
server: {
  url: 'https://tu-dominio.com/member', // Cambiar a producción
  cleartext: false, // Deshabilitar HTTP
}
```

### Build iOS
```bash
npm run build
npx cap sync ios
npx cap open ios
# En Xcode: Product → Archive
```

### Build Android
```bash
npm run build
npx cap sync android
npx cap open android
# En Android Studio: Build → Generate Signed Bundle/APK
```

---

## 5. Dominio Personalizado (Opcional)

### En Vercel
1. Settings → Domains
2. Agregar dominio: `app.negroni.com`
3. Configurar DNS según instrucciones

### En Supabase
Actualizar Site URL y Redirect URLs con el nuevo dominio.

---

## Costos Estimados (Mensual)

| Servicio | Costo |
|----------|-------|
| Vercel Pro | $20/mes (o gratis con límites) |
| Supabase Pro | $25/mes |
| Twilio SMS | ~$1/mes + $0.0075/SMS |
| Apple Developer | $99/año |
| Google Play | $25 (único) |

**Total mínimo**: ~$46/mes + costos variables de SMS

---

## Siguiente Paso Inmediato

**Configurar Twilio** → Dame tu Account SID y número cuando los tengas para verificar la configuración.
