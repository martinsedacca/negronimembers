# 🎫 Membership Cards - Sistema de Gestión de Tarjetas Digitales

Sistema completo para gestionar tarjetas de membresía digitales para Apple Wallet y Google Wallet, con dashboard administrativo, gestión de miembros, promociones y seguimiento de uso.

## 🚀 Características

- ✅ **Dashboard Administrativo** - Panel de control con estadísticas en tiempo real
- ✅ **Gestión de Miembros** - CRUD completo de miembros con diferentes tipos de membresía
- ✅ **Sistema de Promociones** - Crea y gestiona promociones basadas en uso
- ✅ **Seguimiento de Uso** - Registra cada vez que un miembro usa su tarjeta
- ✅ **Sistema de Puntos** - Acumulación automática de puntos por uso
- ✅ **Apple Wallet** - Generación de passes para Apple Wallet (IMPLEMENTADO)
- 🔄 **Google Wallet** - Generación de passes para Google Wallet (próximamente)
- 🔐 **Autenticación** - Sistema completo con Supabase Auth

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

## 📊 Estructura de la Base de Datos

### Tablas Principales

- **members** - Información de miembros y sus membresías
- **membership_types** - Tipos de membresía (Basic, Silver, Gold, Platinum)
- **promotions** - Promociones y descuentos
- **card_usage** - Registro de uso de tarjetas
- **applied_promotions** - Promociones aplicadas a miembros
- **wallet_passes** - Datos de passes de Apple/Google Wallet

## 🎯 Uso del Sistema

### Primer Inicio

1. Accede a http://localhost:3000
2. Haz clic en "Registrarse" para crear una cuenta de administrador
3. Inicia sesión con tu cuenta

### Gestión de Miembros

1. Ve a "Miembros" en el menú
2. Haz clic en "Nuevo Miembro"
3. Completa el formulario con los datos del miembro
4. El sistema genera automáticamente un número de miembro único

### Crear Promociones

1. Ve a "Promociones" en el menú
2. Haz clic en "Nueva Promoción"
3. Define:
   - Tipo de descuento (porcentaje, monto fijo, o puntos)
   - Fechas de vigencia
   - Requisitos de uso mínimo/máximo
   - Tipos de membresía aplicables

### Tipos de Promociones

- **Porcentaje** - Descuento del X% sobre el total
- **Monto Fijo** - Descuento de $X
- **Puntos** - Otorga X puntos adicionales

Las promociones se aplican automáticamente según:
- Tipo de membresía del usuario
- Cantidad de veces que ha usado su tarjeta
- Fechas de vigencia

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

## 📱 Próximas Funcionalidades

- [ ] Generación de passes para Apple Wallet
- [ ] Generación de passes para Google Wallet
- [ ] API para actualizar passes en tiempo real
- [ ] Notificaciones push a las tarjetas
- [ ] Códigos QR para validación
- [ ] Reportes y analytics avanzados
- [ ] Exportación de datos
- [ ] API pública para integraciones

## 🏗️ Tecnologías Utilizadas

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Icons:** Lucide React
- **Dates:** date-fns

## 📝 Notas de Desarrollo

- El sistema usa Row Level Security (RLS) para proteger los datos
- Las migraciones están en `supabase/migrations/`
- Los tipos de TypeScript se generan automáticamente desde el schema
- El middleware maneja la autenticación automáticamente

## 🤝 Contribuir

Este es un proyecto en desarrollo activo. Las contribuciones son bienvenidas.

## 📄 Licencia

MIT
