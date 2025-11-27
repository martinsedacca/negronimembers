# 📱 Plan Completo: Sistema de Membresías Negroni

**Versión:** 2.0 - Sistema Híbrido con Gamificación  
**Fecha:** Enero 2025  
**Estado:** 🟡 En Planificación

---

## 🎯 Resumen Ejecutivo

Sistema de fidelización híbrido que combina:
- **Planes** (Free/Premium/VIP) → Opcionales, de pago
- **Niveles** (1/2/3...) → Gratuitos, se ganan por actividad
- **Beneficios = Plan + Niveles acumulados**

**Stack:** Next.js 14 + Supabase + Twilio + PWA + Apple/Google Wallet

**Tiempo estimado:** 17-20 días de desarrollo

---

## 🗄️ Base de Datos

### Tablas Nuevas

```
membership_levels → Define niveles (1, 2, 3...)
level_benefits → Relaciona niveles con promociones
onboarding_questions → Preguntas del formulario
member_onboarding_responses → Respuestas de clientes
phone_verifications → Códigos SMS
```

### Modificar `members`

```sql
ADD current_level INT DEFAULT 1
ADD level_expires_at TIMESTAMPTZ
ADD visits_in_current_period INT DEFAULT 0
ADD date_of_birth DATE
ADD phone_verified BOOLEAN DEFAULT false
ADD onboarding_completed BOOLEAN DEFAULT false
```

---

## 📅 Plan de Implementación

### FASE 1: Base de Datos (1-2 días)
- [ ] Crear migraciones
- [ ] Poblar datos iniciales
- [ ] Regenerar tipos TypeScript

### FASE 2: Dashboard - Niveles (2 días)
- [ ] `/dashboard/levels` - CRUD niveles
- [ ] Editor con color picker e ícono

### FASE 3: Dashboard - Beneficios (2 días)
- [ ] `/dashboard/level-benefits` - Asignar promociones a niveles

### FASE 4: Dashboard - Onboarding Editor (2 días)
- [ ] `/dashboard/onboarding-editor` - Configurar preguntas
- [ ] Drag & drop, tipos de pregunta

### FASE 5: Dashboard - Respuestas (1 día)
- [ ] `/dashboard/onboarding-responses` - Ver insights
- [ ] Gráficos y exportar CSV

### FASE 6: Dashboard - Planes (1 día)
- [ ] `/dashboard/membership-plans` - CRUD planes de pago

### FASE 7: Auth SMS (2 días)
- [ ] Twilio integration
- [ ] Endpoints send-code / verify-code

### FASE 8: App Móvil - Login (1 día)
- [ ] `/member/auth` - Login con teléfono

### FASE 9: App Móvil - Onboarding (2 días)
- [ ] `/member/onboarding` - Formulario dinámico

### FASE 10: App Móvil - Pass (2 días)
- [ ] `/member/[id]` - QR + badge nivel

### FASE 11: App Móvil - Progreso (1-2 días)
- [ ] `/member/[id]/progress` - Círculo progreso

### FASE 12: App Móvil - Beneficios (2 días)
- [ ] `/member/[id]/benefits` - Explorador tabs

### FASE 13: App Móvil - Historial (1 día)
- [ ] `/member/[id]/history` - Timeline actividad

### FASE 14: Recálculo Automático (1 día)
- [ ] Función auto-actualizar nivel al escanear

### FASE 15: Notificaciones (1 día)
- [ ] Push/SMS cuando sube de nivel

### FASE 16: PWA (1 día)
- [ ] Manifest + Service Worker + íconos

### FASE 17: Optimización (1-2 días)
- [ ] Lighthouse >90
- [ ] Performance tuning

### FASE 18: Testing E2E (2 días)
- [ ] Flujos completos
- [ ] Dispositivos reales

### FASE 19: Deploy (1 día)
- [ ] Vercel + Supabase Cloud

### FASE 20: Documentación (1 día)
- [ ] Manuales de usuario
- [ ] Docs técnicas

---

## 🖥️ Dashboard - Páginas Nuevas

| Ruta | Funcionalidad |
|------|---------------|
| `/dashboard/levels` | CRUD niveles de fidelización |
| `/dashboard/level-benefits` | Asignar promociones a niveles |
| `/dashboard/onboarding-editor` | Configurar preguntas del formulario |
| `/dashboard/onboarding-responses` | Ver respuestas e insights |
| `/dashboard/membership-plans` | CRUD planes de pago |

---

## 📱 App Móvil - Páginas Nuevas

| Ruta | Público/Privado | Funcionalidad |
|------|-----------------|---------------|
| `/member/auth` | Público | Login con SMS |
| `/member/onboarding` | Privado | Formulario registro |
| `/member/[id]` | Privado | Pass digital con QR |
| `/member/[id]/progress` | Privado | Círculo progreso |
| `/member/[id]/benefits` | Privado | Explorador beneficios |
| `/member/[id]/history` | Privado | Historial actividad |

---

## 🔄 Flujos Principales

### 1. Registro Nuevo Cliente

```
1. Abre app → /member/auth
2. Ingresa teléfono → Recibe SMS código
3. Ingresa código → Verificado ✅
4. Redirige a /member/onboarding
5. Completa formulario (fecha + preguntas custom)
6. Sistema crea:
   - membership_type: "Free"
   - current_level: 1
   - onboarding_completed: true
7. Redirige a /member/[id] → Ve su pass
```

### 2. Cliente Escanea QR

```
1. Staff escanea QR del cliente
2. Sistema registra en card_usage
3. Sistema suma puntos (según rules)
4. Sistema cuenta visitas totales
5. Sistema compara con membership_levels.visits_min
6. Si cambió nivel:
   - Actualiza current_level
   - Actualiza level_expires_at
   - Envía notificación
7. Cliente ve actualización en tiempo real
```

### 3. Admin Configura Nivel

```
1. Admin → /dashboard/levels
2. Click "Agregar Nivel"
3. Completa:
   - Número: 4
   - Nombre: "VIP Elite"
   - Visitas min: 25
   - Color + ícono
4. Click "Guardar"
5. Sistema inserta en membership_levels
6. Clientes con 25+ visitas suben automáticamente
```

### 4. Admin Asigna Beneficio

```
1. Admin → /dashboard/level-benefits
2. Selecciona "Nivel 3"
3. Click "Agregar Beneficio"
4. Selecciona promoción existente
5. Sistema inserta en level_benefits
6. Clientes Nivel 3 ven nuevo beneficio
```

---

## 📊 Checklist de Progreso

### Infraestructura
- [ ] Migración de BD completada
- [ ] Tipos TypeScript generados
- [ ] Twilio configurado
- [ ] Variables de entorno en Vercel

### Dashboard
- [ ] Gestión de niveles
- [ ] Asignación de beneficios
- [ ] Editor de onboarding
- [ ] Vista de respuestas
- [ ] Gestión de planes
- [ ] Config SMS en settings

### App Móvil
- [ ] Login con SMS
- [ ] Onboarding dinámico
- [ ] Pass con QR
- [ ] Progreso de nivel
- [ ] Explorador de beneficios
- [ ] Historial de actividad

### PWA
- [ ] Manifest.json
- [ ] Service Worker
- [ ] Íconos generados
- [ ] Installable

### Testing
- [ ] Flujos E2E
- [ ] Testing en iOS
- [ ] Testing en Android
- [ ] Performance >90

### Producción
- [ ] Deploy a Vercel
- [ ] BD en Supabase Cloud
- [ ] Documentación
- [ ] Capacitación usuarios

---

## 🔧 Integraciones

### Twilio (SMS)
- Envío de códigos de verificación
- Notificaciones de subida de nivel
- Costo: ~$0.07 USD/SMS

### Apple Wallet
- Genera .pkpass
- Push notifications
- Ya implementado

### Google Wallet
- Genera JWT para Google Pay
- Ya implementado

### GoHighLevel
- Sincronización de contactos
- Ya implementado

### Resend (Email)
- Envío de tarjetas por email
- Ya implementado

---

Continúa en: [ESPECIFICACIONES_IOS.md](./ESPECIFICACIONES_IOS.md)
