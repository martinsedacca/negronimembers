# Análisis de Rediseño - App de Miembros Negroni

## Cambios Solicitados
1. **Eliminar History** - Se implementará en el futuro en sucursal
2. **Eliminar banner "Upgrade to Gold"** - No hay manera de subir de nivel que no sea con puntos/visitas

---

## Análisis de Tea Connection (Referencia)

### Estructura de la App

#### Pantalla Principal (Home)
- **Imagen de fondo grande** con foto lifestyle/comida
- **Saludo personalizado**: "Hola, [Nombre]!"
- **Menú minimalista** en la parte inferior:
  - Loyalty (con badge del nivel actual)
  - Delivery / Take Away
  - Nuestra carta
- **Botón "MI TEA PASS"** fijo en la parte inferior (sheet expandible)

#### MI TEA PASS (Modal deslizable)
- Se expande desde abajo (bottom sheet)
- Muestra el **nivel actual** (badge)
- **QR code grande** prominente para escanear
- **Código alfanumérico** debajo del QR
- **Lista de beneficios activos** del nivel actual
- Diseño enfocado y sin distracciones

#### Pantalla de Progreso/Nivel
- **Círculo de progreso visual** con el número de nivel grande
- **Mensaje motivacional**: "2 visitas más y pasas al próximo nivel"
- **Fecha de expiración** del nivel
- **Card con beneficios actuales**
- Navegación con paginación (dots)

#### Pantalla de Beneficios
- **Tabs por nivel** (NIVEL 1, NIVEL 2, NIVEL 3)
- **Subtítulo descriptivo**: "ARRANCAMOS" / "DESPUÉS DE 8 VISITAS"
- **Lista de beneficios** con iconos diferenciados:
  - ⭐ Beneficios destacados (estrellas naranjas)
  - ☕ Beneficios de productos (iconos específicos)
  - 🎂 Beneficios especiales (cumpleaños)
- **Link informativo**: "¿Cómo funcionan los niveles?"

---

## Patrones de Diseño Identificados

### 1. Bottom Sheet para el Pass
- El QR/Pass está siempre accesible desde cualquier pantalla
- Se expande con swipe up
- No ocupa una pestaña de navegación

### 2. Navegación Simplificada
- No usan tabs tradicionales de navegación
- Menú minimalista en home
- Contenido organizado en secciones expandibles

### 3. Progreso Visual
- Círculo de progreso claro y atractivo
- Número de nivel prominente
- Mensaje de cuánto falta para el próximo nivel

### 4. Beneficios Organizados
- Separados por nivel con tabs
- Fácil comparar qué se gana en cada nivel
- Iconos para diferenciar tipos de beneficios

### 5. Personalización
- Saludo con nombre del usuario
- Hace la app sentir más personal

---

## Problemas Actuales de Nuestra App

### Navegación
- 5 tabs (Pass, Progress, Benefits, History, Profile) - demasiados
- History no tiene contenido útil por ahora
- Navegación fragmentada

### Benefits
- Banner "Upgrade to Gold" sin sentido si no hay forma de upgrade manual
- No muestra claramente beneficios por nivel
- No hay comparativa entre niveles

### Pass
- Funciona bien pero está aislado en una pestaña
- Podría ser más accesible (bottom sheet)

### Progress
- Información útil pero podría integrarse mejor con Benefits

---

## Propuesta de Nueva Estructura

*(Pendiente de completar con más imágenes de referencia)*

### Opción A: Estilo Tea Connection
- **Home**: Saludo + menú simplificado
- **Bottom Sheet**: Pass/QR siempre accesible
- **Loyalty**: Combina Progress + Benefits
- **Profile**: Configuración y datos personales

### Opción B: Simplificación de Tabs
- Reducir a 3-4 tabs máximo
- Combinar Progress y Benefits en una sola vista
- Mantener Pass como tab principal
- Profile como tab secundario

---

## Imágenes de Referencia Analizadas

1. ✅ MI TEA PASS (modal con QR)
2. ✅ Pantalla de Nivel/Progreso
3. ✅ Beneficios Nivel 1
4. ✅ Beneficios Nivel 2
5. ✅ Home con menú

---

## Tutorial "¿Cómo funcionan los niveles?" (Carousel)

Es un **carousel educativo** con 5 slides que se abre como modal. Explica el programa de lealtad paso a paso:

### Slide 1 - El QR
- Muestra el QR grande
- **Mensaje**: "Cada vez que vengas a nuestros locales, vas a poder escanear tu QR y sumar visitas"
- Lista de beneficios debajo con descripción de uso

### Slide 2 - Visitas por nivel
- Muestra tabs de niveles con "DESPUÉS DE 4 VISITAS" resaltado
- **Mensaje**: "Acá podés ver cuantas veces tenés que venir para poder completar cada uno"
- Lista de beneficios del nivel

### Slide 3 - El círculo de progreso
- Muestra el círculo visual con el número de nivel
- **Mensaje**: "Cada vez que vengas, vas a ver como vas llenando el círculo y acercándote al próximo nivel"
- Beneficios del nivel actual

### Slide 4 - Expiración
- Círculo con explicación de expiración
- **Mensaje**: "La primera vez que entres a la app y cuando cambies de nivel, vas a tener 4 meses para subir de vuelta, 3 visitas más y mantenes tu nivel"
- **Fecha de expiración** resaltada
- Lista de beneficios

### Slide 5 - Beneficios por nivel
- Muestra tabs de niveles con NIVEL 3 seleccionado
- **Mensaje**: "También vas a poder chequear que beneficios se desbloquean en cada nivel"
- Lista completa de beneficios del nivel máximo

### Características del Tutorial
- **Navegación**: Flechas laterales + dots de paginación
- **Overlay**: Fondo semi-transparente sobre el contenido
- **Interactivo**: Muestra las pantallas reales con explicaciones superpuestas
- **Botón cerrar**: X en esquina superior derecha

---

## Insights Adicionales

### Mecánica de Niveles en Tea Connection
- **Nivel 1**: Inicio (0 visitas)
- **Nivel 2**: Después de 4 visitas
- **Nivel 3**: Después de 8 visitas más
- **Expiración**: 4 meses para mantener el nivel con 3 visitas
- **Sistema basado en VISITAS, no puntos**

### Beneficios Progresivos
Cada nivel agrega beneficios:
- ⭐ 1 café o té gratis
- ⭐ 1 copa de vino de cortesía
- ☕ Refill de té o café en desayunos
- 💧 1 agua invitada en todas las visitas
- 🍽️ 20% off en cenas SIEMPRE
- 🎂 30% off semana de cumpleaños
- 🛒 20% off en próxima compra web

---

## Pantalla "Mi cuenta" (Perfil)

### Header
- Foto de perfil circular
- Nombre completo
- Subtítulo: "Sumá puntos con cada compra y desbloqueá regalos"

### Sección "Sobre mi"
- **Datos personales** → editar nombre, email, teléfono
- **Tea Test** → (quiz de preferencias, específico de Tea Connection)
- **Notificaciones** → configuración de notificaciones

### Sección "Sobre la app"
- **Términos y Condiciones**
- **Eliminar cuenta** ⚠️
- **Cerrar sesión**

### Footer
- Versión de la app (ej: "Versión: 1.9.3")

---

## Pantalla de Notificaciones

Toggles simples:
- **Email** (on/off)
- **Push notifications** (on/off)

Ambas habilitadas por defecto.

---

## Buscador de Sucursales

- **Mapa interactivo** con pins de ubicaciones
- **Buscador** con campo de texto
- **Lista de sucursales** debajo del mapa:
  - Número de sucursal
  - Nombre (ej: "Nordelta", "Unicenter")
  - Dirección completa

---

## ⚠️ Nota sobre "Eliminar cuenta"

**Es OBLIGATORIO** para publicar en App Store (desde 2022) y Google Play (desde 2023).

Si la app permite crear una cuenta, debe permitir eliminarla. No es opcional si queremos estar en las stores.

Implementación requerida:
1. Botón "Eliminar cuenta" en perfil
2. Confirmación con advertencia de que es irreversible
3. Posiblemente requerir re-autenticación
4. Eliminar datos del usuario de la base de datos

---

## Resumen de Funcionalidades de Tea Connection

| Funcionalidad | Tea Connection | Negroni Actual | Acción |
|---------------|----------------|----------------|--------|
| QR/Pass accesible | Bottom sheet | Tab dedicado | Evaluar |
| Progreso visual | Círculo animado | Barra de progreso | ✅ Similar |
| Beneficios por nivel | Tabs comparativos | Lista simple | Mejorar |
| Tutorial de niveles | Carousel educativo | No existe | Agregar |
| Buscador sucursales | Mapa + lista | No existe | Evaluar necesidad |
| Notificaciones toggle | Email + Push | No existe | Agregar |
| Eliminar cuenta | Sí | No | **Obligatorio** |
| Historial | No visible | Tab (vacío) | Eliminar por ahora |

---

## Scanner de QR (para escanear menú)

Tea Connection tiene un scanner integrado:
- Abre la cámara del dispositivo
- Texto: "Escanea el QR en tu mesa"
- Sirve para ver el menú digital de la sucursal

**Para Negroni**: Podría usarse para:
- Escanear menú de la mesa
- Escanear promociones especiales
- Check-in en sucursal

---

## 🎯 Decisión: App Nativa para Stores

**Objetivo**: Publicar en App Store y Google Play

### Requisitos Técnicos
Para convertir la web app en app nativa, opciones:
1. **Capacitor** (recomendado) - Envuelve la web app existente
2. **React Native** - Reescribir desde cero
3. **PWA Builder** - Genera apps desde PWA

### Requisitos de las Stores

#### Apple App Store
- 💵 Cuenta de desarrollador: **$99/año**
- 📋 Política de Privacidad (URL)
- 📋 Términos y Condiciones (URL)
- 🗑️ Opción de eliminar cuenta
- 📧 Email de soporte
- 🔒 HTTPS obligatorio
- 📱 Screenshots para diferentes dispositivos
- 📝 Descripción de la app
- 🎂 Clasificación de edad

#### Google Play Store
- 💵 Cuenta de desarrollador: **$25 (única vez)**
- 📋 Política de Privacidad (URL)
- 🗑️ Opción de eliminar cuenta
- 📧 Email de soporte
- 📱 Screenshots
- 📝 Descripción
- 🔒 Declaración de permisos usados

### Checklist para Negroni

| Requisito | Estado | Acción |
|-----------|--------|--------|
| Política de Privacidad | ❌ | Crear página /privacy |
| Términos y Condiciones | ❌ | Crear página /terms |
| Eliminar cuenta | ❌ | Agregar en Profile |
| Email de soporte | ❌ | Definir email |
| HTTPS | ✅ | Ya está (Vercel) |
| Funcionalidad nativa | ✅ | Apple Wallet Pass |
| Scanner QR | ❌ | Agregar |

---

## Propuesta de Nueva Estructura de la App

### Navegación (3-4 tabs)

**Opción A - 3 Tabs:**
```
[ Home ]  [ Loyalty ]  [ Profile ]
```
- **Home**: Saludo + accesos rápidos + scanner
- **Loyalty**: Pass (QR) + Progreso + Beneficios (todo junto)
- **Profile**: Datos + Notificaciones + Legal + Eliminar cuenta

**Opción B - 4 Tabs:**
```
[ Pass ]  [ Progress ]  [ Benefits ]  [ Profile ]
```
- Similar a actual pero sin History
- Mejorar Benefits con tabs por nivel

### Funcionalidades Nuevas a Agregar
1. ✅ Scanner de QR (para menú/promociones)
2. ✅ Eliminar cuenta
3. ✅ Toggle de notificaciones
4. ✅ Política de Privacidad
5. ✅ Términos y Condiciones
6. ⚡ Tutorial "¿Cómo funcionan los niveles?" (nice to have)

### Funcionalidades a Eliminar
1. 🗑️ History (por ahora)
2. 🗑️ Banner "Upgrade to Gold"

---

## Próximos Pasos

1. **Definir estructura** - ¿Opción A o B?
2. **Crear páginas legales** - Privacy + Terms
3. **Implementar cambios** en la app
4. **Configurar Capacitor** para generar apps nativas
5. **Crear cuentas** de desarrollador (Apple + Google)
6. **Preparar assets** - Screenshots, iconos, descripciones
7. **Publicar** en las stores
