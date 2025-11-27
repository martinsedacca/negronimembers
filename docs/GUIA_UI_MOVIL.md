# 📱 Guía de UI Móvil - Negroni App

**Estado:** ✅ Implementación completa con datos mock  
**URL:** http://localhost:3001/member  
**Última actualización:** Enero 2025

---

## 🎯 Resumen

Toda la UI de la app móvil está implementada y funcional con datos de ejemplo. Puedes navegar por todas las pantallas, ver animaciones, y probar la experiencia completa.

**⚠️ Importante:** Los datos son simulados (mock data), no hay conexión real con la base de datos.

---

## 🗺️ Mapa de Navegación

### Flujo Completo

```
1. /member → Redirige automáticamente
   ↓
2. /member/auth → Login con teléfono
   ├─ Ingresa cualquier teléfono
   ├─ Click "Continuar"
   ├─ Ingresa código: 123456 (cualquier 6 dígitos)
   └─ Click "Verificar"
      ↓
3. Decisión aleatoria:
   ├─ 50% → /member/onboarding (nuevo usuario)
   └─ 50% → /member/pass (usuario existente)
      ↓
4. Si onboarding:
   ├─ Fecha de nacimiento
   ├─ 4 preguntas dinámicas
   └─ Click "Completar" → /member/pass
      ↓
5. /member/pass → Pantalla principal
   ├─ Ver QR code
   ├─ Ver nivel actual
   ├─ Ver beneficios
   └─ Navegación bottom bar:
      ├─ Pass
      ├─ Progreso
      ├─ Beneficios
      └─ Historial
```

---

## 📱 Pantallas Implementadas

### 1. Login (/member/auth)

**Qué ver:**
- ✨ Animación de entrada suave
- Logo animado con spring
- Input de teléfono
- Transición entre "phone" y "code"
- Validación visual

**Cómo probar:**
1. Ingresa cualquier número (ej: +54 9 11 1234-5678)
2. Click "Continuar"
3. Espera animación de carga (1.5s)
4. Ingresa 6 dígitos (ej: 123456)
5. Click "Verificar"
6. Te lleva a onboarding o pass (aleatorio)

**Animaciones:**
- Fade in/out con slide
- Scale del logo
- Loading spinners
- Button tap feedback

---

### 2. Onboarding (/member/onboarding)

**Qué ver:**
- Barra de progreso animada
- 5 pasos totales:
  1. Fecha de nacimiento
  2. Bebida favorita (select)
  3. ¿Qué haces? (multi-select)
  4. ¿Restricciones? (yes/no)
  5. Calificación (rating con estrellas)
- Navegación atrás/adelante
- Validación de campos requeridos

**Cómo probar:**
1. Selecciona fecha de nacimiento
2. Click "Continuar"
3. Responde cada pregunta
4. Click "Completar" al final
5. Te lleva al Pass principal

**Animaciones:**
- Progress bar suave
- Slide entre preguntas
- Star hover effects
- Button transitions

---

### 3. Pass Principal (/member/pass)

**Qué ver:**
- Panel desplegable animado
- Badge de nivel con color dinámico
- QR Code generado en tiempo real
- Número de membresía
- Botón "Agregar a Apple Wallet"
- Stats (puntos, visitas)
- Lista de beneficios activos
- Toggle para mostrar/ocultar panel

**Cómo probar:**
1. Observa el panel abierto por defecto
2. Click en ▼ para colapsar
3. Click en ▲ para expandir
4. Scroll para ver todos los beneficios
5. Click en tabs del bottom nav

**Animaciones:**
- Scale del badge
- QR code genera con spring
- Panel collapse/expand suave
- Beneficios stagger animation

**Datos mock:**
- Usuario: María González
- Nivel: 2 (Ya nos conocemos) ⭐
- Puntos: 145
- Visitas: 10

---

### 4. Progreso (/member/progress)

**Qué ver:**
- Círculo de progreso SVG animado
- Gradient dinámico según nivel
- Info de nivel actual y siguiente
- Fecha de expiración
- Lista de beneficios del nivel
- Preview del próximo nivel

**Cómo probar:**
1. Observa el círculo animarse (1.5s)
2. Verás: 10 de 16 visitas
3. Faltán 6 visitas para Nivel 3
4. Scroll para ver beneficios
5. Observa preview de Nivel 3 (difuminado)

**Animaciones:**
- Circle stroke animado
- Gradient color transition
- Stagger de beneficios
- Fade in secuencial

---

### 5. Beneficios (/member/benefits)

**Qué ver:**
- Tabs para Nivel 1, 2, 3
- Tab activo con indicador animado
- Info de cada nivel
- Lista de beneficios con íconos
- Leyenda de tipos (principal, especial, recurrente)
- Modal de ayuda "¿Cómo funcionan?"

**Cómo probar:**
1. Click en tabs para cambiar nivel
2. Observa transición suave
3. Click en (i) arriba derecha
4. Lee modal informativo
5. Click "Entendido" para cerrar
6. Observa que Nivel 2 es el actual (badge "Actual")

**Animaciones:**
- LayoutId transition entre tabs
- Fade + slide al cambiar nivel
- Stagger de beneficios
- Modal fade + slide up

**Beneficios por nivel:**
- Nivel 1: 2 beneficios
- Nivel 2: 6 beneficios (incluye Nivel 1)
- Nivel 3: 11 beneficios (incluye anteriores)

---

### 6. Historial (/member/history)

**Qué ver:**
- Stats summary (puntos, visitas, actividades)
- Timeline vertical con línea
- 6 eventos de ejemplo:
  - Subida de nivel (amarillo)
  - Visitas (azul)
  - Compras (verde)
  - Promoción (morado)
- Fechas relativas ("Hace X horas")
- Puntos ganados por evento
- Montos de compras
- End marker con fecha de registro

**Cómo probar:**
1. Observa stats arriba
2. Scroll por el timeline
3. Lee cada evento
4. Verás puntos ganados (+10, +25, etc.)
5. Compras muestran monto en $
6. Tipos identificados con color

**Animaciones:**
- Icons scale al aparecer
- Stagger de eventos (0.1s cada uno)
- Line progress effect
- End marker fade in

---

## 🎨 Sistema de Diseño

### Colores

```
Fondo: gradient from-neutral-950 via-neutral-900
Superficie: from-neutral-800 to-neutral-900
Bordes: border-neutral-700
Texto: text-white / text-neutral-400
Acento: orange-500 (botones, highlights)

Niveles:
- Nivel 1: #8FA888 (verde) 🌱
- Nivel 2: #E8955E (naranja) ⭐
- Nivel 3: #E8C55E (amarillo) 👑

Timeline:
- Visita: #60A5FA (azul) 🗺️
- Compra: #34D399 (verde) 🛒
- Promoción: #A78BFA (morado) 🎁
- Level up: #E8955E (naranja) ⭐
```

### Animaciones

**Tipos usados:**
- `motion.div` con `initial/animate/exit`
- `whileTap={{ scale: 0.98 }}` en botones
- `layoutId` para tab transitions
- `spring` para bouncy effects
- `ease: 'easeInOut'` para suavidad
- `stagger` para listas (delay incremental)

**Duraciones:**
- Transiciones: 0.2-0.3s
- Animaciones largas: 1-1.5s
- Stagger delay: 0.05-0.1s por item

---

## 🎯 Bottom Navigation

**4 tabs:**

| Ícono | Ruta | Label |
|-------|------|-------|
| 💳 | /member/pass | Pass |
| 📈 | /member/progress | Progreso |
| 🎁 | /member/benefits | Beneficios |
| 🕒 | /member/history | Historial |

**Características:**
- Active indicator animado (layoutId)
- Color naranja en activo
- Badge "Actual" en tab activo
- Tap feedback
- Fixed position bottom

---

## 📊 Datos Mock

**Archivo:** `lib/mock-data.ts`

**Incluye:**
- `mockMember` → Usuario María González
- `mockLevels` → 3 niveles configurados
- `mockBenefits` → Beneficios por nivel
- `mockHistory` → 6 eventos de actividad
- `mockOnboardingQuestions` → 4 preguntas
- `mockPlans` → Free, Premium, VIP

**Editables:** Puedes modificar `mock-data.ts` para:
- Cambiar nombre de usuario
- Cambiar nivel actual
- Agregar/quitar beneficios
- Modificar colores de niveles
- Agregar más eventos al historial

---

## ✅ Features Implementadas

### Navegación
- [x] Rutas funcionando
- [x] Bottom navigation
- [x] Active state visual
- [x] Redirects automáticos

### Animaciones
- [x] Framer Motion integrado
- [x] Page transitions
- [x] Button feedback
- [x] Loading states
- [x] Stagger animations
- [x] Spring physics
- [x] LayoutId transitions

### Componentes
- [x] QR Code generator
- [x] Circle progress SVG
- [x] Timeline vertical
- [x] Tabs con swipe (visual)
- [x] Modales
- [x] Badges dinámicos
- [x] Cards con gradients

### UX
- [x] Dark mode nativo
- [x] Responsive
- [x] Touch feedback
- [x] Loading spinners
- [x] Error states
- [x] Empty states
- [x] Validaciones visuales

---

## 🔧 Cómo Modificar

### Cambiar usuario mock

```typescript
// lib/mock-data.ts
export const mockMember = {
  full_name: 'TU NOMBRE',
  current_level: 3, // Cambiar nivel
  points: 250, // Cambiar puntos
  visits_in_current_period: 20, // Cambiar visitas
  // ...
}
```

### Agregar beneficio

```typescript
// lib/mock-data.ts
export const mockBenefits = {
  '2': [
    // ... existentes
    {
      id: 'b-nuevo',
      title: 'Nuevo beneficio',
      description: 'Descripción aquí',
      icon: '🎉',
      type: 'especial',
    },
  ],
}
```

### Cambiar colores de nivel

```typescript
// lib/mock-data.ts
{
  level_number: 2,
  name: 'Ya nos conocemos',
  color: '#FF6B6B', // Cambiar a rojo
  icon: '🔥', // Cambiar emoji
}
```

---

## 🐛 Troubleshooting

### QR no aparece
- Espera 1-2 segundos (genera en cliente)
- Verifica consola del navegador

### Animaciones lentas
- Normal en primera carga
- Refresh para mejor performance

### Bottom nav no aparece
- Solo visible en /pass, /progress, /benefits, /history
- No aparece en /auth ni /onboarding (intencional)

### Transición no funciona
- Verifica que `<AnimatePresence>` esté en lugar
- Usa mode="wait" para evitar overlap

---

## 📱 Testing en Móvil

### Opción 1: Responsive mode

1. Abre DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Selecciona iPhone 14 Pro
4. Navega por la app

### Opción 2: Dispositivo real

1. Obtén IP de tu máquina
2. Asegúrate que móvil esté en misma red WiFi
3. Abre: http://[TU_IP]:3001/member
4. Prueba touch gestures reales

---

## 🚀 Próximos Pasos

**Para hacer funcional:**

1. **Backend:**
   - Implementar endpoints de auth
   - Conectar con Supabase
   - SMS con Twilio

2. **Reemplazar mock data:**
   - `lib/mock-data.ts` → API calls
   - `useState` → `useQuery` / `useSWR`
   - Agregar loading states reales

3. **PWA:**
   - Manifest.json
   - Service Worker
   - Offline support

4. **Testing:**
   - Unit tests (Jest)
   - E2E tests (Playwright)
   - Visual regression

---

## 📝 Notas

- Diseño optimizado para iPhone (375-430px)
- Funciona en desktop pero se ve mejor en móvil
- Todas las animaciones son performantes (GPU)
- No hay llamadas API reales
- Datos persisten mientras no refresques

---

**¡Disfruta explorando la UI!** 🎉

Para feedback o cambios, edita los archivos en:
- `app/member/*` → Pantallas
- `lib/mock-data.ts` → Datos
- `components/*` → Componentes reutilizables
