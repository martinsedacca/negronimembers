# 🚀 Plan de Implementación a Producción - Negroni Membership App

**Fecha:** Noviembre 4, 2025  
**Objetivo:** App 100% funcional + Dashboard completo  
**Tiempo estimado:** 3-4 semanas

---

## 📋 Resumen Ejecutivo

### ✅ Lo que YA funciona:
- PWA móvil completa (UI en inglés)
- Capacitor configurado (iOS + Android)
- Login con SMS (mock)
- Onboarding dinámico
- Pass con QR
- Progreso circular
- Benefits explorer
- History timeline
- Bottom navigation
- Supabase configurado
- Admin dashboard base

### 🔧 Lo que hay que implementar:

1. **Mejorar Registro**
   - Campo teléfono: código país + 10 dígitos
   - Fecha nacimiento: día/mes/año separados

2. **Dashboard Admin**
   - Configurar preguntas onboarding
   - Ver estadísticas y métricas
   - Gestionar beneficios

3. **Beneficios Predefinidos**
   - Free coffee at lunch
   - 10% off takeaway
   - 1 free drink at brunch
   - Birthday special (6+ people)

4. **Sistema de Cupones Especiales**
   - Crear cupones (ej: AERO22)
   - Asignar beneficios a cupones
   - Miembros redimen cupones
   - Control de uso y vencimiento

---

## 🗄️ Base de Datos - Nuevas Tablas/Columnas

### 1. Modificar tabla `members`:
```sql
ALTER TABLE members
ADD COLUMN phone_country_code VARCHAR(5) DEFAULT '+1',
ADD COLUMN phone_number VARCHAR(15),
ADD COLUMN birth_day INTEGER,
ADD COLUMN birth_month INTEGER,
ADD COLUMN birth_year INTEGER,
ADD COLUMN date_of_birth DATE GENERATED ALWAYS AS (
  make_date(birth_year, birth_month, birth_day)
) STORED;
```

### 2. Nueva tabla `special_coupons`:
```sql
CREATE TABLE special_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER, -- NULL = unlimited
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coupons_code ON special_coupons(coupon_code);
CREATE INDEX idx_coupons_active ON special_coupons(is_active);
```

### 3. Nueva tabla `coupon_benefits`:
```sql
CREATE TABLE coupon_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES special_coupons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  usage_type VARCHAR(20) CHECK (usage_type IN ('once', 'multiple', 'daily', 'weekly', 'monthly')),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  icon VARCHAR(10) DEFAULT '🎁',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coupon_benefits_coupon ON coupon_benefits(coupon_id);
```

### 4. Nueva tabla `member_coupons`:
```sql
CREATE TABLE member_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES special_coupons(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(member_id, coupon_id)
);

CREATE INDEX idx_member_coupons_member ON member_coupons(member_id);
CREATE INDEX idx_member_coupons_active ON member_coupons(is_active);
```

### 5. Nueva tabla `benefit_usage`:
```sql
CREATE TABLE benefit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  benefit_id UUID, -- Puede ser de promotions o coupon_benefits
  benefit_type VARCHAR(20) CHECK (benefit_type IN ('standard', 'coupon')),
  used_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

CREATE INDEX idx_benefit_usage_member ON benefit_usage(member_id);
CREATE INDEX idx_benefit_usage_date ON benefit_usage(used_at);
```

### 6. Modificar tabla `promotions` (beneficios estándar):
```sql
ALTER TABLE promotions
ADD COLUMN usage_type VARCHAR(20) CHECK (usage_type IN ('once', 'multiple', 'daily', 'weekly', 'monthly')) DEFAULT 'multiple',
ADD COLUMN icon VARCHAR(10) DEFAULT '🎁',
ADD COLUMN category VARCHAR(50); -- 'lunch', 'takeaway', 'brunch', 'birthday'
```

---

## 📅 Plan de Implementación por Fases

---

### **FASE 1: Mejorar Registro de Usuarios** (3-4 días)

#### 1.1 Backend - Campos de Teléfono (1 día)

**Migración de BD:**
```bash
supabase migration new improve_member_registration
```

**Archivo SQL:**
```sql
-- 001_improve_registration.sql
ALTER TABLE members
ADD COLUMN phone_country_code VARCHAR(5) DEFAULT '+1',
ADD COLUMN phone_number VARCHAR(15),
ADD COLUMN birth_day INTEGER CHECK (birth_day BETWEEN 1 AND 31),
ADD COLUMN birth_month INTEGER CHECK (birth_month BETWEEN 1 AND 12),
ADD COLUMN birth_year INTEGER CHECK (birth_year >= 1900 AND birth_year <= EXTRACT(YEAR FROM CURRENT_DATE));

-- Generated column para fecha completa
ALTER TABLE members
ADD COLUMN date_of_birth DATE GENERATED ALWAYS AS (
  CASE 
    WHEN birth_day IS NOT NULL AND birth_month IS NOT NULL AND birth_year IS NOT NULL
    THEN make_date(birth_year, birth_month, birth_day)
    ELSE NULL
  END
) STORED;

-- Índices
CREATE INDEX idx_members_phone ON members(phone_country_code, phone_number);
CREATE INDEX idx_members_birthday ON members(birth_month, birth_day);
```

**Aplicar:**
```bash
supabase db reset
```

#### 1.2 App - Componente de Teléfono (1 día)

**Crear:** `app/member/auth/components/PhoneInput.tsx`

```typescript
'use client'

import { useState } from 'react'

interface PhoneInputProps {
  value: { countryCode: string; number: string }
  onChange: (value: { countryCode: string; number: string }) => void
  className?: string
}

export default function PhoneInput({ value, onChange, className }: PhoneInputProps) {
  const countryCodes = [
    { code: '+1', country: 'US', flag: '🇺🇸' },
    { code: '+1', country: 'CA', flag: '🇨🇦' },
    { code: '+52', country: 'MX', flag: '🇲🇽' },
    { code: '+54', country: 'AR', flag: '🇦🇷' },
  ]

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Country Code Selector */}
      <select
        value={value.countryCode}
        onChange={(e) => onChange({ ...value, countryCode: e.target.value })}
        className="w-24 px-3 py-4 bg-neutral-800 text-white border border-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
      >
        {countryCodes.map((c) => (
          <option key={c.code + c.country} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>

      {/* Phone Number */}
      <input
        type="tel"
        value={value.number}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10)
          onChange({ ...value, number: cleaned })
        }}
        placeholder="(305) 123-4567"
        className="flex-1 px-4 py-4 bg-neutral-800 text-white border border-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
        maxLength={14}
      />
    </div>
  )
}
```

**Actualizar:** `app/member/auth/page.tsx` para usar el nuevo componente

#### 1.3 App - Fecha de Nacimiento Separada (1 día)

**Crear:** `app/member/auth/components/BirthdayInput.tsx`

```typescript
'use client'

interface BirthdayInputProps {
  value: { day: string; month: string; year: string }
  onChange: (value: { day: string; month: string; year: string }) => void
  className?: string
}

export default function BirthdayInput({ value, onChange, className }: BirthdayInputProps) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      {/* Day */}
      <select
        value={value.day}
        onChange={(e) => onChange({ ...value, day: e.target.value })}
        className="px-3 py-4 bg-neutral-800 text-white border border-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
      >
        <option value="">Day</option>
        {days.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Month */}
      <select
        value={value.month}
        onChange={(e) => onChange({ ...value, month: e.target.value })}
        className="px-3 py-4 bg-neutral-800 text-white border border-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
      >
        <option value="">Month</option>
        {months.map((m, i) => (
          <option key={m} value={i + 1}>{m}</option>
        ))}
      </select>

      {/* Year */}
      <select
        value={value.year}
        onChange={(e) => onChange({ ...value, year: e.target.value })}
        className="px-3 py-4 bg-neutral-800 text-white border border-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
      >
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  )
}
```

**Actualizar:** `app/member/onboarding/page.tsx`

#### 1.4 Integrar SMS Real con Twilio (1 día)

**API Route:** `app/api/auth/send-code/route.ts`
**API Route:** `app/api/auth/verify-code/route.ts`

Ya tienes Twilio configurado, solo conectar con los nuevos campos.

---

### **FASE 2: Beneficios Estándar** (2-3 días)

#### 2.1 Backend - Crear Beneficios (1 día)

**Migración:**
```sql
-- 002_standard_benefits.sql

-- Agregar campos a promotions
ALTER TABLE promotions
ADD COLUMN usage_type VARCHAR(20) DEFAULT 'multiple',
ADD COLUMN icon VARCHAR(10) DEFAULT '🎁',
ADD COLUMN category VARCHAR(50);

-- Insertar beneficios estándar
INSERT INTO promotions (
  title, description, icon, category, usage_type, active, promotion_type
) VALUES
(
  'Free Coffee at Lunch',
  'Get a complimentary coffee during lunch hours (12pm-3pm)',
  '☕',
  'lunch',
  'daily',
  true,
  'standard'
),
(
  '10% Off Takeaway',
  'Enjoy 10% discount on all takeaway orders',
  '📦',
  'takeaway',
  'multiple',
  true,
  'standard'
),
(
  'Free Drink at Brunch',
  'Complimentary drink of your choice during brunch (9am-12pm)',
  '🥂',
  'brunch',
  'weekly',
  true,
  'standard'
),
(
  'Birthday Special',
  'Birthday person eats free at tables of 6+ people (meal + drink)',
  '🎂',
  'birthday',
  'once',
  true,
  'standard'
);
```

#### 2.2 Dashboard - Gestión de Beneficios (1 día)

**Crear:** `app/dashboard/benefits/page.tsx`

**Features:**
- Listar beneficios
- Crear/Editar/Eliminar
- Toggle active/inactive
- Configurar usage_type
- Asignar íconos
- Categorías

#### 2.3 App - Mostrar Beneficios (1 día)

**Actualizar:** `app/member/benefits/page.tsx`

- Fetch beneficios desde Supabase
- Mostrar por categoría
- Indicar cuántas veces puede usarse
- Botón "Use Benefit"
- Registro de uso en `benefit_usage`

---

### **FASE 3: Sistema de Cupones Especiales** (5-6 días)

#### 3.1 Backend - Tablas de Cupones (1 día)

**Migración:**
```sql
-- 003_special_coupons.sql

CREATE TABLE special_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE coupon_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES special_coupons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  usage_type VARCHAR(20) DEFAULT 'once',
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  icon VARCHAR(10) DEFAULT '🎁',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE member_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES special_coupons(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(member_id, coupon_id)
);

CREATE TABLE benefit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  benefit_id UUID,
  benefit_type VARCHAR(20) CHECK (benefit_type IN ('standard', 'coupon')),
  used_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);
```

#### 3.2 Dashboard - Gestión de Cupones (2 días)

**Crear:** `app/dashboard/coupons/page.tsx`

**Features:**
- Listar cupones
- Crear nuevo cupón
  - Código único
  - Título
  - Descripción
  - Límite de usos
  - Fechas validez
- Agregar beneficios al cupón
- Ver estadísticas de uso
- Desactivar cupón

**Ejemplo UI:**
```
┌─────────────────────────────────────┐
│ Special Coupons                     │
├─────────────────────────────────────┤
│ [+ New Coupon]                      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ AERO22                          │ │
│ │ Aeroespacial 2025               │ │
│ │ Active | 45/100 uses            │ │
│ │ 3 benefits | Expires: Dec 31    │ │
│ │ [Edit] [Deactivate]             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 3.3 API Routes - Cupones (1 día)

**Crear:**
- `app/api/coupons/redeem/route.ts` - Redimir cupón
- `app/api/coupons/validate/route.ts` - Validar código
- `app/api/coupons/benefits/route.ts` - Get beneficios de cupón

#### 3.4 App - Redimir Cupón (2 días)

**Crear:** `app/member/coupons/page.tsx`

**Features:**
- Input para código
- Validar código
- Mostrar beneficios del cupón
- Sección "Special Benefits for [Título]"
- Usar beneficios
- Ver beneficios usados

**Flujo:**
```
1. Member → "Redeem Coupon"
2. Ingresa código: AERO22
3. Valida código
4. Guarda en member_coupons
5. Muestra beneficios especiales
6. Member puede usar beneficios
7. Se registra en benefit_usage
```

---

### **FASE 4: Dashboard - Configuración Onboarding** (2-3 días)

#### 4.1 Backend - Ya existe tabla (0 días)

Ya tienes `onboarding_questions` en la BD.

#### 4.2 Dashboard - Editor de Preguntas (2 días)

**Crear:** `app/dashboard/onboarding/page.tsx`

**Features:**
- Listar preguntas
- Drag & drop para reordenar
- Crear pregunta
  - Tipo: text, select, multi_select, yes_no, rating
  - Opciones (si aplica)
  - Required/Optional
- Editar/Eliminar
- Preview en tiempo real

**Ejemplo UI:**
```
┌─────────────────────────────────────┐
│ Onboarding Questions                │
├─────────────────────────────────────┤
│ [+ New Question]                    │
│                                     │
│ ☰ 1. What's your favorite drink?   │
│    Type: Select | Required          │
│    Options: Coffee, Tea, Juice      │
│    [Edit] [Delete]                  │
│                                     │
│ ☰ 2. What do you like to do?       │
│    Type: Multi-select | Required    │
│    [Edit] [Delete]                  │
└─────────────────────────────────────┘
```

#### 4.3 App - Consumir Preguntas Dinámicas (1 día)

**Actualizar:** `app/member/onboarding/page.tsx`

- Fetch preguntas desde Supabase
- Renderizar dinámicamente
- Guardar respuestas

---

### **FASE 5: Dashboard - Estadísticas y Métricas** (3-4 días)

#### 5.1 Backend - Vistas de Analytics (1 día)

**Crear vistas SQL:**
```sql
-- Vista: Registros por día
CREATE VIEW daily_registrations AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as count
FROM members
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Vista: Uso de beneficios
CREATE VIEW benefit_usage_stats AS
SELECT 
  b.title,
  COUNT(bu.id) as times_used,
  COUNT(DISTINCT bu.member_id) as unique_members
FROM benefit_usage bu
JOIN promotions b ON bu.benefit_id = b.id::text
GROUP BY b.title;

-- Vista: Cupones activos
CREATE VIEW active_coupons_stats AS
SELECT 
  sc.coupon_code,
  sc.title,
  COUNT(mc.id) as redemptions,
  sc.max_uses
FROM special_coupons sc
LEFT JOIN member_coupons mc ON sc.id = mc.coupon_id
WHERE sc.is_active = true
GROUP BY sc.id;
```

#### 5.2 Dashboard - Página de Analytics (2-3 días)

**Crear:** `app/dashboard/analytics/page.tsx`

**Métricas:**
- Total miembros
- Nuevos miembros (hoy/semana/mes)
- Beneficios más usados
- Cupones activos y redenciones
- Gráficos:
  - Registros por día (línea)
  - Uso de beneficios (barras)
  - Distribución por edad
  - Horarios de uso

**Librerías:**
- ApexCharts (ya instalado)
- React ApexCharts

---

### **FASE 6: Polish y Testing** (3-4 días)

#### 6.1 Testing End-to-End (2 días)

**Flujos a probar:**
1. Registro completo de usuario
2. Redimir cupón
3. Usar beneficio estándar
4. Usar beneficio de cupón
5. Admin crea pregunta onboarding
6. Admin crea cupón
7. Ver estadísticas

#### 6.2 UX Improvements (1 día)

- Loading states
- Error handling
- Success messages
- Validaciones
- Animaciones suaves

#### 6.3 Mobile Testing (1 día)

- iOS simulator
- Android simulator
- Dispositivos reales
- Diferentes tamaños de pantalla

---

### **FASE 7: Deployment** (2-3 días)

#### 7.1 Preparar Producción (1 día)

**Supabase:**
- Migrar a Supabase Cloud
- Aplicar migraciones
- Configurar RLS policies
- Backup de datos

**Vercel:**
- Deploy Next.js
- Variables de entorno
- Domains

#### 7.2 App Móvil (1-2 días)

**iOS:**
- Configurar Apple Developer
- Provisioning profiles
- Archive & Upload
- TestFlight

**Android:**
- Configurar Play Console
- Signing keys
- Build AAB
- Internal testing

#### 7.3 Monitoring (1 día)

- Sentry para errors
- Supabase dashboard
- Vercel analytics
- Push notifications setup

---

## 📊 Cronograma

### Semana 1: Registro + Beneficios
- **Días 1-4:** Mejorar registro (teléfono + fecha)
- **Días 5-7:** Beneficios estándar

### Semana 2: Cupones Especiales
- **Días 8-13:** Sistema completo de cupones

### Semana 3: Dashboard
- **Días 14-16:** Editor onboarding
- **Días 17-20:** Analytics y estadísticas

### Semana 4: Testing y Deploy
- **Días 21-23:** Testing + Polish
- **Días 24-26:** Deployment
- **Día 27:** Launch! 🚀

---

## ✅ Checklist de Producción

### Backend:
- [ ] Todas las migraciones aplicadas
- [ ] RLS policies configuradas
- [ ] Índices optimizados
- [ ] Backups configurados

### App Móvil:
- [ ] Registro con teléfono funciona
- [ ] Fecha de nacimiento separada
- [ ] Beneficios se muestran correctamente
- [ ] Cupones se pueden redimir
- [ ] Uso de beneficios se registra
- [ ] Push notifications funcionan

### Dashboard:
- [ ] Editor de preguntas onboarding
- [ ] Gestión de beneficios
- [ ] Gestión de cupones
- [ ] Analytics y métricas
- [ ] Exportar datos

### Deployment:
- [ ] Supabase en producción
- [ ] Next.js en Vercel
- [ ] iOS en TestFlight
- [ ] Android en Play Store (internal)
- [ ] Monitoring activo

---

## 🎯 Próximo Paso Inmediato

**Empezar FASE 1:** Mejorar registro de usuarios

1. Crear migración de BD
2. Crear componente PhoneInput
3. Crear componente BirthdayInput
4. Actualizar auth page
5. Actualizar onboarding page
6. Testing

**¿Empezamos con la Fase 1?** 🚀
