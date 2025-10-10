# 🚀 Migración a Producción - Supabase Cloud

## Guía paso a paso para migrar de Supabase Local a Supabase Cloud

---

## 📋 Resumen

Esta guía te ayudará a:
1. ✅ Crear proyecto en Supabase Cloud
2. ✅ Ejecutar todas las migraciones
3. ✅ Configurar variables de entorno
4. ✅ Migrar datos existentes (opcional)
5. ✅ Deploy en Vercel

**Tiempo estimado:** 15-20 minutos

---

## 🎯 Paso 1: Crear Proyecto en Supabase Cloud

### 1.1 Ir a Supabase Dashboard

Ve a: https://supabase.com/dashboard

### 1.2 Crear Nuevo Proyecto

1. Click en **"New Project"**
2. **Completa:**
   - **Name:** `negroni-membership` (o el que prefieras)
   - **Database Password:** Genera y **guarda** esta contraseña
   - **Region:** `South America (São Paulo)` (más cercano)
   - **Pricing Plan:** `Free` (hasta 500MB, suficiente para empezar)
3. Click **"Create new project"**
4. **Espera 2-3 minutos** mientras se crea

---

## 📝 Paso 2: Ejecutar Migraciones

### 2.1 Abrir SQL Editor

1. En tu nuevo proyecto de Supabase
2. Ve a **SQL Editor** (en el menú lateral)
3. Click en **"New Query"**

### 2.2 Ejecutar Script de Producción

1. **Abre el archivo:** `supabase/PRODUCTION_SETUP.sql`
2. **Copia TODO el contenido** (es un archivo grande ~2000 líneas)
3. **Pégalo** en el SQL Editor de Supabase
4. Click en **"Run"** (esquina inferior derecha)
5. **Espera 30-60 segundos**

**✅ Si ves:** `Success. No rows returned` → ¡Perfecto!
**❌ Si ves errores:** Cópialos y pídeme ayuda

### 2.3 Verificar que Todo Se Creó

Ejecuta este query para verificar:

```sql
SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

Deberías ver **todas estas tablas:**

- `branches`
- `card_design_config`
- `card_usage`
- `event_members`
- `events`
- `ghl_sync_log`
- `member_promotions`
- `member_segments`
- `members`
- `membership_types`
- `promotions`
- `push_notification_deliveries`
- `push_notifications`
- `push_subscriptions`
- `scanner_locations`
- `scanner_sessions`
- `system_config`
- `wallet_passes`
- `wallet_push_notifications`
- `wallet_push_tokens`

---

## 🔑 Paso 3: Obtener Credenciales

### 3.1 API Keys

1. Ve a **Settings → API**
2. **Copia estos valores:**

```bash
# Project URL
Project URL: https://tu-proyecto-id.supabase.co

# anon/public key (safe to use in browser)
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role key (NEVER expose in browser, server only)
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2 Database Connection String (opcional, para backups)

1. Ve a **Settings → Database**
2. **Copia:** Connection string (URI)

```
postgresql://postgres:[YOUR-PASSWORD]@db.tu-proyecto-id.supabase.co:5432/postgres
```

---

## 🔧 Paso 4: Actualizar Variables de Entorno

### 4.1 Actualizar `.env.local` (desarrollo)

```bash
# Supabase PRODUCTION
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Todas las demás variables quedan igual
```

### 4.2 Actualizar Vercel (producción)

1. Ve a tu proyecto en Vercel
2. **Settings → Environment Variables**
3. **Edita:**
   - `NEXT_PUBLIC_SUPABASE_URL` → Nueva URL de producción
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Nueva anon key
4. **Redeploy** el proyecto

---

## 📊 Paso 5: Migrar Datos Existentes (Opcional)

Si tienes datos en tu Supabase local que quieres migrar:

### Opción A: Export/Import Manual (Pocos datos)

**1. Exportar de Local:**

```sql
-- En tu Supabase local
COPY members TO '/tmp/members.csv' WITH CSV HEADER;
COPY promotions TO '/tmp/promotions.csv' WITH CSV HEADER;
-- etc...
```

**2. Importar a Producción:**

1. En Supabase Cloud Dashboard
2. **Table Editor → Import data from CSV**
3. Sube cada archivo CSV

### Opción B: Usar pg_dump (Muchos datos)

```bash
# 1. Exportar de local
pg_dump -h localhost -U postgres -d postgres --data-only --table=members --table=promotions > data_export.sql

# 2. Importar a producción
psql "postgresql://postgres:[PASSWORD]@db.tu-proyecto-id.supabase.co:5432/postgres" < data_export.sql
```

### Opción C: Empezar desde Cero (Recomendado)

Si estás en desarrollo, es más limpio empezar desde cero en producción.

---

## ✅ Paso 6: Verificar Todo Funciona

### 6.1 Crear Usuario de Prueba

1. Ve a **Authentication → Users**
2. Click **"Add user"** → **"Create new user"**
3. Ingresa email y contraseña

### 6.2 Probar Login

1. Abre tu app: `http://localhost:3000`
2. Haz login con el usuario que creaste
3. Deberías ver el dashboard

### 6.3 Crear Miembro de Prueba

1. Dashboard → Miembros → Nuevo Miembro
2. Completa datos y guarda
3. Verifica que aparezca en la lista

---

## 🚀 Paso 7: Deploy a Vercel

### 7.1 Commit y Push

```bash
git add -A
git commit -m "chore: Configurar para producción"
git push origin main
```

### 7.2 Configurar Variables en Vercel

Ve a **Vercel → Settings → Environment Variables** y agrega:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Apple Wallet
APPLE_PASS_TYPE_ID=pass.com.onetimeleads.negroni
APPLE_TEAM_ID=G736PJ3Z4Z
APPLE_PASS_KEY_PASSPHRASE=Negroni1.2

# Apple Wallet Push
APPLE_WALLET_PUSH_KEY=-----BEGIN PRIVATE KEY-----...
APPLE_WALLET_KEY_ID=P645UUK6Y8
APPLE_WALLET_PASS_TYPE_ID=pass.com.onetimeleads.negroni

# Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEiEh...
VAPID_PRIVATE_KEY=xyz...
VAPID_SUBJECT=mailto:admin@negroni.com

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=Negroni <onboarding@resend.dev>

# App URL
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```

### 7.3 Redeploy

Vercel deployará automáticamente o puedes forzar:
- **Deployments → Click en "..." → Redeploy**

---

## 🔐 Paso 8: Configurar Row Level Security (RLS)

Las migraciones ya incluyen políticas RLS, pero verifica:

1. **Table Editor → Cada tabla**
2. **Verifica que diga:** `RLS enabled`
3. Si no, ejecuta:

```sql
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
-- etc... (ya está en el script)
```

---

## 📊 Paso 9: Monitoreo

### 9.1 Database Usage

Ve a **Settings → Billing** para ver:
- **Database size** (máx 500MB en plan free)
- **Bandwidth** (máx 5GB en plan free)
- **Number of rows**

### 9.2 Logs

Ve a **Logs** para ver:
- **API logs:** Requests y errores
- **Database logs:** Queries lentas
- **Auth logs:** Logins y signups

---

## 🆘 Troubleshooting

### Error: "relation already exists"

**Causa:** Ya ejecutaste parte del script antes.

**Solución:**
1. **Settings → Database → Reset database** (⚠️ borra todo!)
2. Ejecuta el script completo de nuevo

### Error: "permission denied"

**Causa:** Falta configurar RLS.

**Solución:**
```sql
ALTER TABLE nombre_tabla ENABLE ROW LEVEL SECURITY;
```

### Error: "function already exists"

**Causa:** Ejecutaste dos veces la migración.

**Solución:** Ignóralo, no afecta.

### Database lleno (500MB)

**Solución:**
1. **Upgradear a Pro** ($25/mes, 8GB)
2. O limpiar datos antiguos:
   ```sql
   DELETE FROM card_usage WHERE created_at < NOW() - INTERVAL '6 months';
   ```

---

## 📝 Checklist Final

Antes de considerar la migración completa:

- [ ] ✅ Proyecto creado en Supabase Cloud
- [ ] ✅ Script PRODUCTION_SETUP.sql ejecutado sin errores
- [ ] ✅ Todas las tablas creadas (20 tablas)
- [ ] ✅ Usuario de prueba creado en Authentication
- [ ] ✅ Variables de entorno actualizadas en Vercel
- [ ] ✅ App desplegada en Vercel
- [ ] ✅ Login funciona en producción
- [ ] ✅ Crear miembro funciona
- [ ] ✅ Tarjetas Wallet funcionan
- [ ] ✅ Emails funcionan

---

## 🎉 ¡Listo para Producción!

Tu app ahora está corriendo en:
- **Database:** Supabase Cloud (producción)
- **Hosting:** Vercel (edge network global)
- **SSL:** Automático con Vercel

---

## 🔗 Enlaces Útiles

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**¿Problemas?** Revisa los logs de Supabase y Vercel, y busca los mensajes de error específicos.
