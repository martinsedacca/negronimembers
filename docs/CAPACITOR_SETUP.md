# 📱 Capacitor Setup - Negroni Mobile App

**Fecha:** Noviembre 4, 2025  
**Estado:** ✅ Configuración completa  
**Plataformas:** iOS + Android

---

## 🎯 Resumen

Capacitor está configurado como **contenedor nativo** que apunta a tu Next.js server. **NO se hace build estático**.

### Arquitectura:

```
┌─────────────────────────────────────┐
│   App Nativa (iOS/Android)          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   WebView (Capacitor)       │   │
│  │                             │   │
│  │   ↓ Apunta a ↓             │   │
│  │                             │   │
│  │   Next.js Server           │   │
│  │   (Vercel/localhost)       │   │
│  │                             │   │
│  │   /member/*                │   │
│  └─────────────────────────────┘   │
│                                     │
│  + Push Notifications (Native)     │
│  + Geolocation (Native)             │
│  + Haptics (Native)                 │
│  + Camera (Native)                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Admin Dashboard (Web)             │
│                                     │
│   https://app.vercel.app/dashboard │
│   (Sin cambios, funciona 100%)     │
└─────────────────────────────────────┘
```

---

## ✅ Lo que está instalado

### Dependencias:
- ✅ `@capacitor/core` - Core framework
- ✅ `@capacitor/cli` - CLI tools
- ✅ `@capacitor/ios` - Plataforma iOS
- ✅ `@capacitor/android` - Plataforma Android
- ✅ `@capacitor/push-notifications` - Push nativas
- ✅ `@capacitor/geolocation` - GPS para sucursales
- ✅ `@capacitor/local-notifications` - Notificaciones locales
- ✅ `@capacitor/haptics` - Feedback táctil
- ✅ `@capacitor/status-bar` - Barra de estado
- ✅ `@capacitor/splash-screen` - Splash screen

### Plataformas:
- ✅ `ios/` - Proyecto Xcode creado
- ✅ `android/` - Proyecto Android Studio creado

---

## 📁 Archivos de Configuración

### 1. `capacitor.config.ts`

**Configuración principal:**

```typescript
server: {
  url: process.env.CAPACITOR_SERVER_URL || 'http://localhost:3000',
  cleartext: true,
}
```

**Variables de entorno:**

- **Desarrollo:** `http://localhost:3000`
- **Producción:** `https://tu-app.vercel.app`

**Cómo cambiar:**
```bash
# Development
export CAPACITOR_SERVER_URL=http://localhost:3000

# Production
export CAPACITOR_SERVER_URL=https://negroni-app.vercel.app
```

---

### 2. `public/sw.js`

**Service Worker con caché inteligente:**

#### Estrategia de Caché:

```javascript
// ✅ CACHEA (para offline):
- QR Codes del usuario
- Datos básicos del perfil (/api/member)
- Pantalla del pass (/member/pass)

// ❌ NO CACHEA (requiere internet):
- Beneficios (Supabase)
- Historial (Supabase)
- Admin dashboard
- Todas las demás API calls
```

#### Network First Strategy:

```
1. Intenta fetch de red
2. Si tiene internet → Guarda en cache + retorna
3. Si NO tiene internet → Sirve desde cache
4. Si no hay cache → Error 503
```

---

## 🚀 Scripts NPM

### Desarrollo:

```bash
# 1. Iniciar Next.js dev server
npm run dev
# → http://localhost:3000

# 2. Sincronizar con Capacitor (nueva terminal)
npm run mobile:dev

# 3. Abrir Xcode
npm run cap:open:ios

# 4. Abrir Android Studio
npm run cap:open:android
```

### Comandos Disponibles:

| Comando | Descripción |
|---------|-------------|
| `npm run cap:sync` | Sincronizar assets y plugins |
| `npm run cap:open:ios` | Abrir proyecto en Xcode |
| `npm run cap:open:android` | Abrir en Android Studio |
| `npm run cap:run:ios` | Compilar y correr en iOS |
| `npm run cap:run:android` | Compilar y correr en Android |
| `npm run mobile:dev` | Sync con localhost |
| `npm run mobile:prod` | Sync con Vercel URL |

---

## 📱 Desarrollo iOS

### 1. Abrir Xcode:

```bash
npm run cap:open:ios
```

### 2. Configurar Signing:

1. En Xcode → Selecciona proyecto "App"
2. Signing & Capabilities
3. Selecciona tu Team
4. Bundle Identifier: `com.negroni.membership`

### 3. Probar en Simulador:

1. Selecciona simulador (ej: iPhone 15 Pro)
2. Click ▶️ Run
3. Espera que compile
4. Abre en simulador

### 4. Probar en Dispositivo Físico:

1. Conecta iPhone vía USB
2. Confía en la computadora
3. Selecciona tu iPhone en Xcode
4. Click ▶️ Run

---

## 🤖 Desarrollo Android

### 1. Abrir Android Studio:

```bash
npm run cap:open:android
```

### 2. Configurar Gradle:

- Primera vez: espera sync de Gradle (~5 min)
- Puede pedir instalar SDK components

### 3. Probar en Emulador:

1. Tools → Device Manager
2. Create Virtual Device
3. Selecciona Pixel 7
4. Download system image (API 34)
5. Click ▶️ Run

### 4. Probar en Dispositivo Físico:

1. Habilita "Opciones de desarrollador" en Android
2. Habilita "Depuración USB"
3. Conecta via USB
4. Acepta permiso en el teléfono
5. Click ▶️ Run

---

## 🔧 Configuración de URLs

### Desarrollo Local:

```bash
# Terminal 1: Next.js
npm run dev

# Terminal 2: Capacitor sync
export CAPACITOR_SERVER_URL=http://localhost:3000
npm run cap:sync

# Terminal 3: Abrir Xcode
npm run cap:open:ios
```

**La app apuntará a tu localhost.**

---

### Producción (Vercel):

1. **Deploy Next.js a Vercel:**
```bash
vercel deploy --prod
# → https://negroni-membership.vercel.app
```

2. **Actualizar URL en Capacitor:**
```bash
export CAPACITOR_SERVER_URL=https://negroni-membership.vercel.app
npm run mobile:prod
```

3. **Rebuild app:**
```bash
# iOS
npm run cap:open:ios
# → Archive → Distribute

# Android
npm run cap:open:android
# → Build → Generate Signed Bundle
```

---

## 🎨 Personalización

### Splash Screen:

```
ios/App/App/Assets.xcassets/Splash.imageset/
android/app/src/main/res/drawable/splash.png
```

**Tamaños requeridos:**
- iOS: 2732x2732px
- Android: 1080x1920px

### App Icon:

```
ios/App/App/Assets.xcassets/AppIcon.appiconset/
android/app/src/main/res/mipmap-*/
```

**Genera icons:**
```bash
# Usar herramienta online:
# https://icon.kitchen
# O:
# https://capacitorjs.com/docs/guides/splash-screens-and-icons
```

---

## 🔔 Push Notifications

### Setup iOS (APNs):

1. **Apple Developer Account**
   - Crear App ID
   - Habilitar Push Notifications
   - Generar .p8 key

2. **Xcode:**
   - Signing & Capabilities → + Capability
   - Agregar "Push Notifications"
   - Agregar "Background Modes" → Remote notifications

3. **Código:**
```typescript
// Ya configurado en capacitor.config.ts
PushNotifications: {
  presentationOptions: ['badge', 'sound', 'alert'],
}
```

### Setup Android (FCM):

1. **Firebase Console:**
   - Crear proyecto Firebase
   - Agregar app Android
   - Descargar `google-services.json`

2. **Android Studio:**
   - Copiar `google-services.json` a `android/app/`
   - Sync Gradle

3. **Permisos:**
```xml
<!-- Ya configurado en AndroidManifest.xml -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

---

## 📍 Geolocalización

**Para ubicar sucursales cercanas:**

### iOS:

1. **Info.plist** (ya configurado):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to find nearby Negroni stores</string>
```

2. **Código:**
```typescript
import { Geolocation } from '@capacitor/geolocation';

const coordinates = await Geolocation.getCurrentPosition();
// coordinates.coords.latitude
// coordinates.coords.longitude
```

### Android:

1. **AndroidManifest.xml** (ya configurado):
```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

2. **Código:** Mismo que iOS

---

## 🧪 Testing

### En Simulador:

```bash
# iOS
npm run cap:run:ios

# Android
npm run cap:run:android
```

### En Dispositivo:

**iOS:**
1. Conecta iPhone
2. Xcode → Selecciona tu dispositivo
3. Run

**Android:**
1. Habilita USB Debugging
2. Conecta vía USB
3. Android Studio → Run

---

## 📦 Build para Stores

### iOS (App Store):

```bash
# 1. Abrir Xcode
npm run cap:open:ios

# 2. Product → Archive
# 3. Distribute App
# 4. App Store Connect
# 5. Upload
```

**Requisitos:**
- Apple Developer Account ($99/año)
- App Store Connect configurado
- Provisioning Profiles
- Certificates

### Android (Play Store):

```bash
# 1. Abrir Android Studio
npm run cap:open:android

# 2. Build → Generate Signed Bundle / APK
# 3. Selecciona "Android App Bundle"
# 4. Crea o selecciona keystore
# 5. Release build type
# 6. Finish
```

**Requisitos:**
- Google Play Developer Account ($25 único)
- Keystore para signing
- App Bundle (.aab)

---

## 🚨 Troubleshooting

### Error: "Could not connect to development server"

**Solución:**
```bash
# Verifica que Next.js está corriendo
npm run dev

# Verifica la URL en capacitor.config.ts
# Usa IP local en vez de localhost para dispositivos físicos
export CAPACITOR_SERVER_URL=http://192.168.1.X:3000
npm run cap:sync
```

### Error: "CocoaPods not installed"

**Solución:**
```bash
sudo gem install cocoapods
cd ios/App
pod install
```

### Error: Gradle sync failed

**Solución:**
```bash
cd android
./gradlew clean
./gradlew build
```

### Error: Service Worker no cachea

**Solución:**
1. Verifica que `sw.js` esté en `/public`
2. Registra el SW en tu app
3. Limpia cache del navegador
4. Reload

---

## 📊 Ventajas de Este Setup

### ✅ Para el Admin Dashboard:
- Sin cambios
- SSR funciona
- API routes funciona
- Deploy normal a Vercel
- Sin restricciones

### ✅ Para la App Móvil:
- Hot updates → Sin rebuild
- Features nativas → GPS, Push, Haptics
- Offline QR → Service Worker
- App Stores → iOS + Android
- Un solo codebase → Next.js

### ✅ Para Desarrollo:
- Reutilizas 100% del código
- Mismo Next.js para todo
- No aprender Flutter/React Native
- Supabase compartido
- Debugging fácil

---

## 📝 Checklist Pre-Launch

### iOS:

- [ ] Bundle ID correcto (`com.negroni.membership`)
- [ ] Signing configurado
- [ ] Push Notifications habilitado
- [ ] Info.plist con permisos
- [ ] Icons y splash screen
- [ ] Testeo en dispositivo real
- [ ] App Store metadata preparado
- [ ] Screenshots para App Store

### Android:

- [ ] Package name correcto (`com.negroni.membership`)
- [ ] Keystore creado y guardado
- [ ] google-services.json agregado
- [ ] AndroidManifest con permisos
- [ ] Icons y splash screen
- [ ] Testeo en dispositivo real
- [ ] Play Store metadata preparado
- [ ] Screenshots para Play Store

### General:

- [ ] URL de producción en capacitor.config.ts
- [ ] Service Worker testeado
- [ ] Push notifications funcionando
- [ ] Geolocalización funcionando
- [ ] QR offline funcionando
- [ ] Next.js deployado a Vercel
- [ ] Supabase en producción
- [ ] Políticas de privacidad
- [ ] Términos y condiciones

---

## 🔗 Links Útiles

- **Capacitor Docs:** https://capacitorjs.com/docs
- **iOS Guidelines:** https://developer.apple.com/app-store/guidelines/
- **Android Guidelines:** https://play.google.com/console/about/guides/
- **Icon Generator:** https://icon.kitchen
- **Splash Generator:** https://capacitorjs.com/docs/guides/splash-screens-and-icons

---

## 📞 Siguiente Paso

**Probar la app en simulador:**

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run cap:open:ios
```

En Xcode: Click ▶️ Run

**¡Deberías ver tu PWA corriendo en el simulador iOS!** 🎉

---

**Última actualización:** Nov 4, 2025  
**Versión:** 1.0
