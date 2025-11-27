# 🔄 Plan de Actualización y Finalización - Sistema Negroni

**Fecha:** Noviembre 4, 2025  
**Estado Actual:** Revisado después de analizar proyecto existente  
**Objetivo:** Completar funcionalidades faltantes

---

## ✅ Lo que YA EXISTE y funciona:

### Dashboard Admin:
- `/dashboard` - Overview con estadísticas
- `/dashboard/members` - Gestión de miembros
- `/dashboard/promotions` - Gestión de promociones/beneficios
- `/dashboard/branches` - Gestión de sucursales
- `/dashboard/scanner` - Escáner QR
- `/dashboard/events` - Gestión de eventos
- `/dashboard/segments` - Segmentos de clientes
- `/dashboard/settings` - Configuración
- `/dashboard/cards` - Diseño de tarjetas

### Base de Datos:
- `members` - Miembros (con phone básico)
- `membership_types` - Tipos de membresía
- `promotions` - Promociones/beneficios
- `card_usage` - Registro de uso
- `applied_promotions` - Promociones aplicadas
- `wallet_passes` - Passes de Wallet
- `branches` - Sucursales
- `events` - Eventos
- `push_notification_tokens` - Tokens de push
- `ghl_contacts` - Integración GoHighLevel

### App Móvil (UI completa):
- `/member/auth` - Login con SMS
- `/member/onboarding` - Onboarding dinámico
- `/member/pass` - Pass con QR
- `/member/progress` - Progreso circular
- `/member/benefits` - Beneficios
- `/member/history` - Historial

---

## 🔧 Lo que FALTA o necesita ACTUALIZACIÓN:

### 1. ❌ Campo de teléfono NO está separado
**Actual:**
```sql
phone TEXT
```

**Necesita:**
```sql
phone_country_code VARCHAR(5)
phone_number VARCHAR(15)
```

### 2. ❌ Fecha de nacimiento NO está en members
**Necesita:**
```sql
birth_day INTEGER
birth_month INTEGER  
birth_year INTEGER
date_of_birth DATE (generated)
```

### 3. ❌ Tabla onboarding_questions NO EXISTE
**Necesita crear:**
```sql
CREATE TABLE onboarding_questions (...)
CREATE TABLE member_onboarding_responses (...)
```

### 4. ❌ Sistema de cupones especiales NO EXISTE
**Necesita crear:**
```sql
CREATE TABLE special_coupons (...)
CREATE TABLE coupon_benefits (...)
CREATE TABLE member_coupons (...)
```

### 5. ⚠️ Tabla promotions le faltan campos
**Actual:**
- title, description, discount_type, discount_value
- start_date, end_date
- min_usage_count, max_usage_count
- is_active

**Le falta:**
- usage_type (once, multiple, daily, weekly, monthly)
- icon (emoji)
- category (lunch, takeaway, brunch, birthday)

### 6. ❌ NO existe /dashboard/onboarding
**Necesita crear:** Editor de preguntas onboarding

### 7. ❌ NO existe /dashboard/coupons
**Necesita crear:** Gestión de cupones especiales

### 8. ⚠️ /dashboard/promotions necesita mejoras
**Falta:** Configurar usage_type, icon, category

### 9. ⚠️ Analytics básico
**Mejorar:** Más estadísticas y gráficos

---

## 📅 PLAN REVISADO DE IMPLEMENTACIÓN

---

### **FASE 1: Actualizar Registro de Usuarios** (3-4 días)

#### 1.1 Backend - Agregar campos a members (1 día)

**Crear migración:**
`supabase/migrations/20241104_improve_member_registration.sql`

```sql
-- Agregar campos de teléfono separados
ALTER TABLE members
ADD COLUMN phone_country_code VARCHAR(5) DEFAULT '+1',
ADD COLUMN phone_number VARCHAR(15);

-- Migrar datos existentes
UPDATE members 
SET phone_number = phone 
WHERE phone IS NOT NULL;

-- Agregar campos de fecha de nacimiento
ALTER TABLE members
ADD COLUMN birth_day INTEGER CHECK (birth_day BETWEEN 1 AND 31),
ADD COLUMN birth_month INTEGER CHECK (birth_month BETWEEN 1 AND 12),
ADD COLUMN birth_year INTEGER CHECK (birth_year >= 1900 AND birth_year <= EXTRACT(YEAR FROM CURRENT_DATE));

-- Columna generada para fecha completa
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
CREATE INDEX idx_members_birthday_month_day ON members(birth_month, birth_day);
```

#### 1.2 App - Componentes de Input (2 días)

**Crear:** `app/member/auth/components/PhoneInput.tsx`
**Crear:** `app/member/onboarding/components/BirthdayInput.tsx`

**Actualizar:**
- `app/member/auth/page.tsx` - Usar nuevo PhoneInput
- `app/member/onboarding/page.tsx` - Usar nuevo BirthdayInput

#### 1.3 Integración con Twilio (1 día)

**Actualizar API routes:**
- `app/api/auth/send-code/route.ts`
- `app/api/auth/verify-code/route.ts`

---

### **FASE 2: Sistema de Onboarding Dinámico** (4-5 días)

#### 2.1 Backend - Tablas de Onboarding (1 día)

**Crear migración:**
`supabase/migrations/20241104_onboarding_questions.sql`

```sql
-- Tabla de preguntas configurables
CREATE TABLE onboarding_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('text', 'select', 'multi_select', 'yes_no', 'rating')),
  options JSONB, -- Para select/multi_select
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de respuestas
CREATE TABLE member_onboarding_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  question_id UUID REFERENCES onboarding_questions(id) ON DELETE CASCADE,
  response_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, question_id)
);

CREATE INDEX idx_onboarding_questions_order ON onboarding_questions(display_order);
CREATE INDEX idx_onboarding_responses_member ON member_onboarding_responses(member_id);

-- RLS
ALTER TABLE onboarding_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active questions" ON onboarding_questions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users manage questions" ON onboarding_questions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Members can insert their responses" ON member_onboarding_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users view all responses" ON member_onboarding_responses
  FOR SELECT USING (auth.role() = 'authenticated');
```

#### 2.2 Dashboard - Editor de Preguntas (2-3 días)

**Crear:** `app/dashboard/onboarding/page.tsx`

**Features:**
- Listar preguntas existentes
- Drag & drop para reordenar
- Crear nueva pregunta
  - Tipo de pregunta
  - Texto
  - Opciones (si aplica)
  - Required/Optional
- Editar pregunta
- Eliminar pregunta
- Toggle active/inactive
- Preview en tiempo real

**Componentes:**
- `components/onboarding/QuestionList.tsx`
- `components/onboarding/QuestionForm.tsx`
- `components/onboarding/QuestionPreview.tsx`

#### 2.3 App - Consumir Preguntas Dinámicas (1 día)

**Actualizar:** `app/member/onboarding/page.tsx`

- Fetch preguntas desde Supabase (en vez de mock)
- Renderizar tipos: text, select, multi_select, yes_no, rating
- Validar campos required
- Guardar respuestas en `member_onboarding_responses`

---

### **FASE 3: Mejorar Sistema de Beneficios** (2-3 días)

#### 3.1 Backend - Ampliar tabla promotions (1 día)

**Crear migración:**
`supabase/migrations/20241104_enhance_promotions.sql`

```sql
-- Agregar campos para beneficios
ALTER TABLE promotions
ADD COLUMN usage_type VARCHAR(20) CHECK (usage_type IN ('once', 'multiple', 'daily', 'weekly', 'monthly')) DEFAULT 'multiple',
ADD COLUMN icon VARCHAR(10) DEFAULT '🎁',
ADD COLUMN category VARCHAR(50), -- 'lunch', 'takeaway', 'brunch', 'birthday', 'standard'
ADD COLUMN promotion_type VARCHAR(20) CHECK (promotion_type IN ('standard', 'special')) DEFAULT 'standard';

-- Crear tabla de uso de beneficios
CREATE TABLE benefit_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX idx_benefit_usage_member ON benefit_usage(member_id);
CREATE INDEX idx_benefit_usage_promotion ON benefit_usage(promotion_id);
CREATE INDEX idx_benefit_usage_date ON benefit_usage(used_at);

-- RLS
ALTER TABLE benefit_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view all usage" ON benefit_usage
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users insert usage" ON benefit_usage
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insertar beneficios estándar (en inglés)
INSERT INTO promotions (
  title, description, icon, category, usage_type, discount_type, discount_value,
  start_date, end_date, is_active, promotion_type
) VALUES
(
  'Free Coffee at Lunch',
  'Get a complimentary coffee during lunch hours (12pm-3pm)',
  '☕',
  'lunch',
  'daily',
  'fixed',
  0,
  NOW(),
  NOW() + INTERVAL '10 years',
  true,
  'standard'
),
(
  '10% Off Takeaway',
  'Enjoy 10% discount on all takeaway orders',
  '📦',
  'takeaway',
  'multiple',
  'percentage',
  10,
  NOW(),
  NOW() + INTERVAL '10 years',
  true,
  'standard'
),
(
  'Free Drink at Brunch',
  'Complimentary drink of your choice during brunch (9am-12pm)',
  '🥂',
  'brunch',
  'weekly',
  'fixed',
  0,
  NOW(),
  NOW() + INTERVAL '10 years',
  true,
  'standard'
),
(
  'Birthday Special',
  'Birthday person eats free at tables of 6+ people (meal + drink)',
  '🎂',
  'birthday',
  'once',
  'fixed',
  0,
  NOW(),
  NOW() + INTERVAL '10 years',
  true,
  'standard'
);
```

#### 3.2 Dashboard - Mejorar /promotions (1 día)

**Actualizar:** `app/dashboard/promotions/page.tsx`

- Mostrar icon
- Editar usage_type
- Editar category
- Filtrar por category
- Agregar promotion_type

**Actualizar componentes:**
- `components/promotions/PromotionsList.tsx`
- `components/promotions/PromotionForm.tsx`

#### 3.3 App - Conectar Beneficios Reales (1 día)

**Actualizar:** `app/member/benefits/page.tsx`

- Fetch promotions desde Supabase (no mock)
- Mostrar por categoría
- Botón "Use Benefit"
- Registrar uso en `benefit_usage`
- Validar restricciones de uso (daily, weekly, once, etc.)

---

### **FASE 4: Sistema de Cupones Especiales** (5-6 días)

#### 4.1 Backend - Tablas de Cupones (1 día)

**Crear migración:**
`supabase/migrations/20241104_special_coupons.sql`

```sql
-- Tabla de cupones especiales
CREATE TABLE special_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  max_redemptions INTEGER, -- NULL = unlimited
  current_redemptions INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beneficios asociados a cupones
CREATE TABLE coupon_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES special_coupons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  usage_type VARCHAR(20) CHECK (usage_type IN ('once', 'multiple', 'daily', 'weekly', 'monthly')) DEFAULT 'once',
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  icon VARCHAR(10) DEFAULT '🎁',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cupones redimidos por miembros
CREATE TABLE member_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES special_coupons(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(member_id, coupon_id)
);

-- Uso de beneficios de cupones
CREATE TABLE coupon_benefit_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  coupon_benefit_id UUID REFERENCES coupon_benefits(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Índices
CREATE INDEX idx_coupons_code ON special_coupons(coupon_code);
CREATE INDEX idx_coupons_active ON special_coupons(is_active);
CREATE INDEX idx_coupon_benefits_coupon ON coupon_benefits(coupon_id);
CREATE INDEX idx_member_coupons_member ON member_coupons(member_id);
CREATE INDEX idx_member_coupons_coupon ON member_coupons(coupon_id);
CREATE INDEX idx_coupon_benefit_usage_member ON coupon_benefit_usage(member_id);

-- RLS
ALTER TABLE special_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_benefit_usage ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users manage coupons" ON special_coupons
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view active coupons" ON special_coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view coupon benefits" ON coupon_benefits
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users manage benefits" ON coupon_benefits
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Members can redeem coupons" ON member_coupons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Members view their coupons" ON member_coupons
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users view all redemptions" ON member_coupons
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Members can use coupon benefits" ON coupon_benefit_usage
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users view usage" ON coupon_benefit_usage
  FOR SELECT USING (auth.role() = 'authenticated');
```

#### 4.2 Dashboard - Gestión de Cupones (2-3 días)

**Crear:** `app/dashboard/coupons/page.tsx`

**Features:**
- Listar cupones
- Ver estadísticas (redemptions, usage)
- Crear nuevo cupón
  - Código único
  - Título
  - Descripción
  - Max redemptions
  - Fechas válidas
- Editar cupón
- Desactivar cupón
- Ver miembros que redimieron

**Crear:** `app/dashboard/coupons/[id]/page.tsx`

**Features:**
- Detalles del cupón
- Agregar beneficios al cupón
  - Título
  - Descripción
  - Usage type
  - Ícono
  - Fechas válidas
- Listar beneficios
- Editar/Eliminar beneficios
- Ver estadísticas de uso

**Componentes:**
- `components/coupons/CouponList.tsx`
- `components/coupons/CouponForm.tsx`
- `components/coupons/CouponBenefits.tsx`
- `components/coupons/CouponStats.tsx`

#### 4.3 API Routes - Cupones (1 día)

**Crear:**
- `app/api/coupons/validate/route.ts` - Validar código
- `app/api/coupons/redeem/route.ts` - Redimir cupón
- `app/api/coupons/[id]/benefits/route.ts` - Get beneficios
- `app/api/coupons/benefits/use/route.ts` - Usar beneficio

#### 4.4 App - Redimir y Usar Cupones (2 días)

**Crear:** `app/member/coupons/page.tsx`

**Features:**
- Input para código de cupón
- Validar código (API call)
- Mostrar título del cupón
- Redimir cupón (guardar en member_coupons)
- Ver beneficios del cupón

**Actualizar:** `app/member/benefits/page.tsx`

**Agregar:**
- Sección "Special Benefits"
- Mostrar cupones redimidos
- Por cada cupón:
  - Título (ej: "Aeroespacial 2025")
  - Beneficios del cupón
  - Botón "Use Benefit"
  - Indicar si ya se usó
- Registrar uso en `coupon_benefit_usage`

**Actualizar:** `app/member/layout.tsx`

**Agregar tab:**
- "Coupons" en bottom navigation

---

### **FASE 5: Mejorar Analytics** (2-3 días)

#### 5.1 Backend - Vistas de Analytics (1 día)

**Crear migración:**
`supabase/migrations/20241104_analytics_views.sql`

```sql
-- Vista: Registros por día
CREATE VIEW daily_member_registrations AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as count
FROM members
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Vista: Uso de beneficios estándar
CREATE VIEW benefit_usage_stats AS
SELECT 
  p.title,
  p.category,
  COUNT(bu.id) as times_used,
  COUNT(DISTINCT bu.member_id) as unique_members
FROM benefit_usage bu
JOIN promotions p ON bu.promotion_id = p.id
GROUP BY p.id, p.title, p.category;

-- Vista: Cupones activos y uso
CREATE VIEW coupon_stats AS
SELECT 
  sc.coupon_code,
  sc.title,
  sc.max_redemptions,
  COUNT(DISTINCT mc.member_id) as total_redemptions,
  COUNT(cbu.id) as total_benefit_uses
FROM special_coupons sc
LEFT JOIN member_coupons mc ON sc.id = mc.coupon_id AND mc.is_active = true
LEFT JOIN coupon_benefits cb ON sc.id = cb.coupon_id
LEFT JOIN coupon_benefit_usage cbu ON cb.id = cbu.coupon_benefit_id
WHERE sc.is_active = true
GROUP BY sc.id, sc.coupon_code, sc.title, sc.max_redemptions;

-- Vista: Preguntas onboarding más respondidas
CREATE VIEW onboarding_response_stats AS
SELECT 
  oq.question_text,
  oq.question_type,
  COUNT(mor.id) as response_count,
  CASE 
    WHEN oq.question_type IN ('select', 'multi_select', 'yes_no') 
    THEN jsonb_agg(DISTINCT mor.response_value)
    ELSE NULL
  END as common_responses
FROM onboarding_questions oq
LEFT JOIN member_onboarding_responses mor ON oq.id = mor.question_id
GROUP BY oq.id, oq.question_text, oq.question_type;
```

#### 5.2 Dashboard - Página de Analytics (2 días)

**Mejorar:** `app/dashboard/page.tsx`

**Agregar métricas:**
- Cupones activos (count)
- Beneficios usados hoy/semana
- Nuevos miembros hoy/semana/mes
- Tasa de conversión onboarding

**Agregar gráficos:**
- Registros por día (línea)
- Beneficios más usados (barras)
- Cupones por redemptions (barras)
- Distribución de edad (si hay fecha nacimiento)

**Opcional:** Crear `app/dashboard/analytics/page.tsx` con más detalles

---

### **FASE 6: Testing y Polish** (3-4 días)

#### 6.1 Testing End-to-End (2 días)

**Flujos críticos:**
1. Registro completo:
   - Login con teléfono (código país + número)
   - Completar onboarding con preguntas dinámicas
   - Ver pass con QR
2. Usar beneficio estándar:
   - Ver beneficio en app
   - Usar beneficio
   - Validar restricción (daily/weekly/once)
3. Redimir cupón:
   - Ingresar código AERO22
   - Ver beneficios especiales
   - Usar beneficio de cupón
4. Dashboard admin:
   - Crear pregunta onboarding
   - Crear cupón con beneficios
   - Ver analytics
   - Gestionar beneficios

#### 6.2 UX Improvements (1 día)

- Loading states en todas las páginas
- Error handling con mensajes claros
- Success toasts
- Validaciones en forms
- Animaciones suaves
- Empty states

#### 6.3 Mobile Testing (1 día)

- iOS simulator (varios dispositivos)
- Android simulator
- Dispositivos reales (si es posible)
- Landscape/Portrait
- Diferentes tamaños de pantalla

---

### **FASE 7: Deployment** (2-3 días)

#### 7.1 Preparar Base de Datos (1 día)

**Supabase:**
- Crear proyecto en Supabase Cloud
- Aplicar todas las migraciones en orden
- Verificar que todo esté creado
- Configurar RLS policies
- Crear backup inicial
- Configurar variables de entorno

#### 7.2 Deploy Backend y Web (1 día)

**Vercel:**
- Conectar repositorio
- Configurar variables de entorno
- Deploy a producción
- Verificar que dashboard funciona
- Probar endpoints API

#### 7.3 Deploy App Móvil (1 día)

**iOS:**
- Actualizar URL producción en capacitor.config.ts
- Sync cambios
- Archive en Xcode
- Upload a TestFlight

**Android:**
- Build signed bundle
- Upload a Play Console (internal testing)

---

## 📊 Cronograma Revisado

### Semana 1: Fundamentos
- **Días 1-4:** Mejorar registro (phone + birthday)
- **Días 5-7:** Sistema de onboarding dinámico (inicio)

### Semana 2: Onboarding + Beneficios
- **Días 8-9:** Onboarding (fin)
- **Días 10-12:** Mejorar sistema de beneficios

### Semana 3: Cupones Especiales
- **Días 13-18:** Sistema completo de cupones

### Semana 4: Analytics, Testing y Deploy
- **Días 19-21:** Mejorar analytics
- **Días 22-25:** Testing y polish
- **Días 26-28:** Deployment

### Total: 4 semanas (~28 días)

---

## ✅ Checklist Final

### Backend:
- [ ] Migración: phone separado
- [ ] Migración: fecha nacimiento separada
- [ ] Migración: onboarding_questions
- [ ] Migración: special_coupons y tablas relacionadas
- [ ] Migración: benefit_usage
- [ ] Migración: analytics views
- [ ] Aplicar todas las migraciones a Supabase Cloud
- [ ] RLS policies configuradas

### Dashboard Admin:
- [ ] /dashboard/onboarding - Editor de preguntas
- [ ] /dashboard/coupons - Gestión de cupones
- [ ] /dashboard/coupons/[id] - Detalles y beneficios de cupón
- [ ] /dashboard/promotions - Mejorado con icon, usage_type, category
- [ ] /dashboard - Mejorado con más estadísticas

### App Móvil:
- [ ] PhoneInput component
- [ ] BirthdayInput component
- [ ] /member/auth - Actualizado con nuevo phone
- [ ] /member/onboarding - Actualizado con birthday y fetch preguntas
- [ ] /member/benefits - Conectado a Supabase, uso de beneficios
- [ ] /member/coupons - Nueva página para redimir
- [ ] /member/benefits - Mostrar cupones especiales
- [ ] Bottom nav - Tab de Coupons

### API Routes:
- [ ] /api/auth/send-code - Actualizado
- [ ] /api/auth/verify-code - Actualizado
- [ ] /api/coupons/validate
- [ ] /api/coupons/redeem
- [ ] /api/coupons/[id]/benefits
- [ ] /api/coupons/benefits/use

### Testing:
- [ ] Registro completo funciona
- [ ] Onboarding dinámico funciona
- [ ] Beneficios estándar funcionan
- [ ] Cupones se pueden crear y redimir
- [ ] Beneficios de cupones se pueden usar
- [ ] Analytics muestran datos correctos
- [ ] Funciona en iOS
- [ ] Funciona en Android

### Deployment:
- [ ] Supabase en producción
- [ ] Migraciones aplicadas
- [ ] Next.js en Vercel
- [ ] Variables de entorno configuradas
- [ ] iOS en TestFlight
- [ ] Android en Play Console

---

## 🎯 Próximo Paso

**¿Empezamos con la FASE 1?**

Te creo:
1. Migración de BD para phone y birthday
2. Componente PhoneInput
3. Componente BirthdayInput
4. Actualizo auth y onboarding pages

**¿Procedemos?** 🚀
