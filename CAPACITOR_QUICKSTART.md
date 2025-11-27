# 🚀 Capacitor Quick Start - 5 Minutos

## ✅ Ya está instalado y configurado

Tu app móvil está **lista para probar**. Solo necesitas:

---

## 📱 Probar en iOS (2 minutos)

### 1. Abrir Xcode:
```bash
npm run cap:open:ios
```

### 2. Seleccionar Simulador:
- En Xcode, arriba a la izquierda
- Click en "App" → Selecciona "iPhone 15 Pro"

### 3. Run:
- Click ▶️ o presiona `Cmd + R`
- Espera ~30 segundos a que compile
- Se abre el simulador iOS

### 4. ¡Listo!
Tu PWA ahora corre en iOS. Navega a `/member/auth`

---

## 🤖 Probar en Android (3 minutos)

### 1. Abrir Android Studio:
```bash
npm run cap:open:android
```

### 2. Crear Emulador (primera vez):
- Tools → Device Manager
- Create Virtual Device
- Selecciona: Pixel 7
- Download: System Image (API 34)
- Finish

### 3. Run:
- Click ▶️ verde
- Espera que arranque el emulador (~1 min)
- Espera que compile (~30 seg)

### 4. ¡Listo!
Tu PWA ahora corre en Android.

---

## 🔄 Workflow de Desarrollo

### Desarrollo Normal:

```bash
# Terminal 1: Next.js (como siempre)
npm run dev

# Terminal 2: Sync con mobile (solo cuando cambies algo)
npm run mobile:dev

# Xcode/Android Studio: Run (se recarga automático)
```

### Cambios en el Código:

1. Editas tu código Next.js
2. Guardas (Ctrl + S)
3. **App se recarga automáticamente** en el simulador

**NO necesitas:**
- ❌ Rebuild la app
- ❌ Cerrar y abrir
- ❌ `cap sync` cada vez

Solo sync cuando:
- Instalas un plugin nuevo
- Cambias `capacitor.config.ts`
- Cambias assets (icons, splash)

---

## 🎯 Lo que YA funciona

✅ Login con SMS  
✅ Onboarding  
✅ Pass con QR  
✅ Progreso circular  
✅ Beneficios  
✅ Historial  
✅ Animaciones  
✅ Bottom nav  
✅ Dark theme  

**Todo tu código Next.js funciona tal cual.**

---

## 🔌 Features Nativas Disponibles

### Push Notifications:
```typescript
import { PushNotifications } from '@capacitor/push-notifications';

await PushNotifications.requestPermissions();
```

### Geolocalización:
```typescript
import { Geolocation } from '@capacitor/geolocation';

const coordinates = await Geolocation.getCurrentPosition();
```

### Haptics (Vibración):
```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

await Haptics.impact({ style: ImpactStyle.Medium });
```

### Camera:
```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

const image = await Camera.getPhoto({
  resultType: CameraResultType.Uri
});
```

---

## 📦 Deploy a Stores

### TestFlight (iOS Beta):

1. Xcode → Product → Archive
2. Distribute App → TestFlight
3. Upload
4. Espera review (~1 día)
5. Invita testers

### Play Store (Android Beta):

1. Android Studio → Build → Generate Signed Bundle
2. Upload a Google Play Console
3. Create internal testing track
4. Upload AAB
5. Invita testers

---

## 🚨 Errores Comunes

### "Could not connect to server"

**Causa:** Next.js no está corriendo

**Solución:**
```bash
npm run dev
```

### App muestra pantalla blanca

**Causa:** URL incorrecta en config

**Solución:**
```bash
# Verifica en capacitor.config.ts
url: 'http://localhost:3000'  # Para desarrollo
```

### Cambios no se ven

**Causa:** Necesitas sync

**Solución:**
```bash
npm run cap:sync
```

---

## 📚 Docs Completa

Ver: [`docs/CAPACITOR_SETUP.md`](./docs/CAPACITOR_SETUP.md)

- Configuración detallada
- Push notifications setup
- Geolocalización
- Build para stores
- Troubleshooting

---

## ✅ Checklist

- [ ] Xcode instalado (Mac)
- [ ] Android Studio instalado (opcional)
- [ ] `npm run dev` corriendo
- [ ] `npm run cap:open:ios` abre Xcode
- [ ] App corre en simulador iOS
- [ ] `/member/auth` muestra el login

**¿Todo OK? ¡Empiezas a desarrollar! 🎉**

---

**Tiempo total:** ~5 minutos  
**Siguiente paso:** Agregar push notifications  
**Docs completa:** `docs/CAPACITOR_SETUP.md`
