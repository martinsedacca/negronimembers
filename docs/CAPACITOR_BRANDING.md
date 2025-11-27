# 🎨 Personalizar Branding - Splash Screen e Íconos

## 🚨 Problema Actual

1. **Splash Screen:** Muestra logo de Capacitor (genérico)
2. **App Icon:** Ícono genérico de Capacitor

## ✅ Solución

---

## 📱 1. Splash Screen (Pantalla de Carga)

### Requisitos de Imagen:

**Para iOS:**
- **Tamaño:** 2732 x 2732 px (cuadrado)
- **Formato:** PNG con fondo transparente o color sólido
- **Contenido:** Logo de Negroni centrado
- **Fondo:** Negro (#0A0A0A) para mantener dark theme

### Ubicación del archivo:

```
ios/App/App/Assets.xcassets/Splash.imageset/
```

### Pasos:

1. **Crear la imagen:**
   - Logo de Negroni (blanco o naranja)
   - Fondo negro sólido
   - 2732 x 2732 px
   - Guardar como `splash-2732x2732.png`

2. **Reemplazar en Xcode:**
   ```
   Xcode → App → Assets.xcassets → Splash
   ```
   - Arrastra tu imagen `splash-2732x2732.png`
   - Reemplaza la imagen existente

3. **Configuración ya hecha en capacitor.config.ts:**
   ```typescript
   SplashScreen: {
     launchShowDuration: 2000,
     backgroundColor: '#0A0A0A',  // Negro
     showSpinner: false,
   }
   ```

---

## 🎯 2. App Icon

### Requisitos:

**Necesitas generar múltiples tamaños:**
- 20x20, 29x29, 40x40, 58x58, 60x60, 76x76, 80x80, 87x87, 120x120, 152x152, 167x167, 180x180, 1024x1024

### Herramienta Recomendada:

**Option 1: Online (Más fácil)**
https://www.appicon.co/

1. Sube logo de Negroni (1024x1024 px)
2. Selecciona "iOS"
3. Download
4. Descomprime el ZIP

**Option 2: Figma/Photoshop**
- Exporta cada tamaño manualmente

### Ubicación:

```
ios/App/App/Assets.xcassets/AppIcon.appiconset/
```

### Pasos:

1. **En Xcode:**
   ```
   App → Assets.xcassets → AppIcon
   ```

2. **Arrastra cada tamaño** a su slot correspondiente:
   - 20pt 2x → 40x40
   - 20pt 3x → 60x60
   - 29pt 2x → 58x58
   - ... etc

3. **1024x1024** va en "App Store iOS 1024pt"

---

## 🎨 Diseño Recomendado

### Splash Screen:

```
┌───────────────────────────┐
│                           │
│                           │
│         🍸                │
│       NEGRONI             │
│                           │
│    (Logo centrado)        │
│                           │
│                           │
│                           │
└───────────────────────────┘
Fondo: Negro (#0A0A0A)
Logo: Blanco o Naranja (#EA580C)
```

### App Icon:

```
┌─────────────┐
│   🍸        │
│  NEGRONI    │
│             │
└─────────────┘
Fondo: Negro o Naranja
Logo: Blanco
Esquinas: Redondeadas (iOS lo hace automático)
```

---

## 🚀 Quick Fix (Temporal)

### Si no tienes el logo listo:

1. **Crea un splash simple en Figma/Canva:**
   - Canvas 2732x2732
   - Fondo negro
   - Texto "NEGRONI" blanco, centrado
   - Font: Bold, grande
   - Exportar PNG

2. **Reemplaza en Xcode:**
   ```
   Xcode → Assets → Splash → Arrastra PNG
   ```

3. **Rebuild:**
   ```
   Cmd + Shift + K (Clean)
   Cmd + R (Run)
   ```

---

## 🔄 Después de Cambiar Assets

**Siempre ejecuta:**

```bash
# 1. Clean build en Xcode
Cmd + Shift + K

# 2. O desde terminal
cd ~/Desktop/Works/Programacion/Negroni/CascadeProjects/windsurf-project-2/membership-cards
npx cap sync ios

# 3. Rebuild en Xcode
Cmd + R
```

---

## 📦 Recursos

### Plantillas de Splash:
- https://www.figma.com/community/file/809752844853856229
- https://www.canva.com/templates/s/splash-screen/

### Generadores de Iconos:
- https://www.appicon.co/ (Recomendado)
- https://icon.kitchen/ (Capacitor oficial)
- https://makeappicon.com/

### Colores Negroni:
```
Negro: #0A0A0A
Naranja: #EA580C
Blanco: #FFFFFF
```

---

## ✅ Checklist

**Splash Screen:**
- [ ] Imagen 2732x2732 creada
- [ ] Logo de Negroni visible
- [ ] Fondo negro
- [ ] Reemplazado en Xcode
- [ ] Clean + Rebuild
- [ ] Testeado en simulador

**App Icon:**
- [ ] Logo 1024x1024 creado
- [ ] Todos los tamaños generados
- [ ] Reemplazados en Xcode
- [ ] Clean + Rebuild
- [ ] Testeado en simulador

---

## 🎯 Resultado Esperado

**Antes:**
- Splash: Logo genérico de Capacitor
- Icon: Ícono genérico

**Después:**
- Splash: Logo de Negroni en negro
- Icon: Logo de Negroni profesional
- Branding consistente

---

**Próximo paso:** Consigue el logo de Negroni en alta resolución y reemplaza los assets en Xcode.
