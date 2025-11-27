# ☕ Negroni Membership System - Digital Membership Platform

Complete membership management system with Member & Gold tiers, digital wallet cards (Apple/Google Wallet), coupons, analytics, and administrative dashboard.

## 🚀 Key Features

### Core System
- ✅ **Two-Tier Membership** - Member (free) & Gold (premium $199)
- ✅ **Admin Dashboard** - Real-time stats, member management, analytics
- ✅ **Member App** - Modern PWA with progress tracking and benefits
- ✅ **Digital Wallet Cards** - Generate passes for Apple Wallet & Google Wallet
- ✅ **Points System** - Automatic point accumulation on purchases
- ✅ **Branch Management** - Multi-location support with individual analytics

### New Features (2025)
- ✅ **Coupons System** - Create branch-specific discount codes
  - Percentage & fixed amount discounts
  - Expiration dates & redemption limits
  - One-time use per member validation
- ✅ **Branch Analytics** - Comprehensive performance metrics
  - Revenue & visits tracking
  - Peak hours analysis
  - Top spenders & member segmentation
  - Period filters (7/30/90 days)
- ✅ **Promotions** - Tier-based benefits and rewards
- ✅ **Events System** - Create events and invite members
- ✅ **Segmentation** - Filter members and send notifications

### UI/UX
- ✅ **100% English Interface** - All components, forms, and messages
- ✅ **Modern Design** - Tailwind CSS with custom brand colors
- ✅ **Responsive** - Mobile-first design
- ✅ **Dark Theme** - Professional dark UI

## 📋 Requisitos Previos

- Node.js 18+ 
- Docker Desktop (para Supabase local)
- npm o yarn

## 🛠️ Instalación y Configuración

### 1. Clonar e instalar dependencias

```bash
cd membership-cards
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Local Development
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### 3. Iniciar Supabase Local

```bash
npx supabase start
```

Este comando:
- Descarga e inicia los contenedores Docker necesarios
- Aplica las migraciones automáticamente
- Crea las tablas y datos iniciales
- Te muestra las credenciales de acceso

**Nota:** La primera vez puede tardar varios minutos mientras descarga las imágenes de Docker.

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📊 Database Structure

### Main Tables

- **members** - Member information with Member/Gold tiers
- **membership_types** - Membership types (Member & Gold only)
- **branches** - Branch locations with analytics
- **transactions** - Purchase history and points
- **coupons** - Discount codes with validation rules
- **coupon_redemptions** - Redemption tracking
- **promotions** - Tier-based benefits and rewards
- **events** - Special events with member invitations
- **wallet_passes** - Apple/Google Wallet pass data

### Key Features
- Row Level Security (RLS) enabled
- Automatic timestamps
- Foreign key constraints
- Indexes for performance

## 🎯 Using the System

### Getting Started

1. Access http://localhost:3000
2. Use the seed data or create a new admin account
3. Explore the dashboard

### Managing Members

1. Navigate to "Members" in the dashboard
2. Click "New Member" to add a member
3. Fill in member details (name, email, phone, tier)
4. System auto-generates unique member numbers
5. Choose between Member (free) or Gold ($199)

### Creating Coupons

1. Go to "Coupons" in the menu
2. Click "New Coupon"
3. Define:
   - Unique coupon code (e.g., SUMMER2024)
   - Description
   - Discount type (percentage or fixed amount)
   - Optional: specific branch
   - Optional: expiration date
   - Optional: maximum redemptions
4. Members can redeem coupons from the member app

### Branch Analytics

1. Go to "Branches"
2. Click "Analytics" on any branch
3. View:
   - Revenue and transaction trends
   - Peak hours analysis
   - Top spending members
   - Member tier breakdown
4. Filter by period (7/30/90 days)

## 🔧 Comandos Útiles

### Supabase

```bash
# Ver estado de Supabase
npx supabase status

# Detener Supabase
npx supabase stop

# Resetear la base de datos (borra todos los datos)
npx supabase db reset

# Acceder a Supabase Studio
# Después de iniciar, ve a: http://127.0.0.1:54323
```

### Next.js

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start

# Linting
npm run lint
```

## 🌐 Migración a Producción

Cuando estés listo para migrar a Supabase en la nube:

### 1. Crear proyecto en Supabase

Ve a https://supabase.com y crea un nuevo proyecto.

### 2. Vincular el proyecto

```bash
npx supabase link --project-ref tu-project-ref
```

### 3. Aplicar migraciones

```bash
npx supabase db push
```

### 4. Actualizar variables de entorno

Actualiza `.env.local` con tus credenciales de producción:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-produccion
```

## 📱 Current Status & Roadmap

### ✅ Completed (90%)
- ✅ Member/Gold tier system
- ✅ Dashboard with 8 pages
- ✅ Member app (3 pages)
- ✅ Coupons system (create, edit, redeem)
- ✅ Branch analytics with charts
- ✅ Digital wallet cards UI
- ✅ Events & invitations
- ✅ Member segmentation
- ✅ Points system
- ✅ 100% English interface

### 🔄 Optional / Future
- [ ] SMS Authentication (Twilio/SNS integration)
- [ ] Membership types CRUD page
- [ ] Real-time wallet pass updates API
- [ ] Push notifications to wallet cards
- [ ] QR scanner for validation
- [ ] Data export (CSV/Excel)
- [ ] Public API for integrations
- [ ] Advanced reporting dashboards

## 🏗️ Technologies Used

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Icons:** Lucide React
- **Dates:** date-fns
- **QR Codes:** qrcode.react
- **Deployment:** Vercel-ready

## 📝 Notas de Desarrollo

- El sistema usa Row Level Security (RLS) para proteger los datos
- Las migraciones están en `supabase/migrations/`
- Los tipos de TypeScript se generan automáticamente desde el schema
- El middleware maneja la autenticación automáticamente

## 🤝 Contribuir

Este es un proyecto en desarrollo activo. Las contribuciones son bienvenidas.

## 📄 Licencia

MIT
