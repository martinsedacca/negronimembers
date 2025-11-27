# 🚀 MIGRACIÓN COMPLETA A SUPABASE CLOUD

**Fecha:** Enero 2025  
**Objetivo:** Migrar de Supabase Local (Docker) a Supabase Cloud en Producción

---

## 📋 RESUMEN RÁPIDO

**Tiempo Total:** ~30 minutos  
**Dificultad:** Fácil (copy & paste)

**Pasos:**
1. ✅ Crear proyecto en Supabase Cloud
2. ✅ Ejecutar script de migración completo
3. ✅ Obtener credenciales
4. ✅ Actualizar variables de entorno
5. ✅ Probar conexión
6. ✅ Deploy a Vercel (opcional)

---

## 🎯 PASO 1: Crear Proyecto en Supabase Cloud

### 1.1 Ir a Supabase
👉 **https://supabase.com/dashboard**

### 1.2 Crear Nuevo Proyecto

1. Click en **"New Project"**
2. Completa los datos:

```
Organization: [Tu organización o crea una nueva]
Name: negroni-membership
Database Password: [GENERA UNA Y GUÁRDALA - LA NECESITARÁS]
Region: South America (São Paulo)  ← MÁS CERCANO
Pricing Plan: Free (500MB, suficiente para empezar)
```

3. Click **"Create new project"**
4. ⏳ **Espera 2-3 minutos** mientras se crea el proyecto

---

## 📝 PASO 2: Ejecutar Script de Migración

### 2.1 Abrir SQL Editor

1. En tu proyecto recién creado
2. Ve a **SQL Editor** (menú lateral izquierdo)
3. Click en **"+ New Query"**

### 2.2 Ejecutar Script Completo

**IMPORTANTE:** Ejecuta el archivo `FULL_PRODUCTION_MIGRATION.sql` que está en la raíz del proyecto.

1. **Abre:** `/membership-cards/FULL_PRODUCTION_MIGRATION.sql`
2. **Copia TODO** el contenido (Cmd+A → Cmd+C)
3. **Pégalo** en el SQL Editor de Supabase
4. Click en **"RUN"** (esquina inferior derecha)
5. ⏳ **Espera 30-60 segundos**

**✅ Éxito:** Verás `Success. No rows returned`  
**❌ Error:** Copia el mensaje y pídeme ayuda

### 2.3 Verificar Tablas Creadas

Ejecuta este query:

```sql
SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Deberías ver 23 tablas:**

- ✅ `branches`
- ✅ `branch_users`
- ✅ `card_design_config`
- ✅ `card_usage`
- ✅ `codes` ← NUEVA
- ✅ `event_members`
- ✅ `events`
- ✅ `ghl_sync_log`
- ✅ `member_codes` ← NUEVA
- ✅ `member_promotions`
- ✅ `member_segments`
- ✅ `members`
- ✅ `membership_types`
- ✅ `onboarding_questions` ← NUEVA
- ✅ `promotions`
- ✅ `push_notification_deliveries`
- ✅ `push_notifications`
- ✅ `push_subscriptions`
- ✅ `scanner_locations`
- ✅ `scanner_sessions`
- ✅ `system_config`
- ✅ `wallet_passes`
- ✅ `wallet_push_notifications`
- ✅ `wallet_push_tokens`

---

## 🔑 PASO 3: Obtener Credenciales

### 3.1 API Keys

1. Ve a **Settings → API**
2. **Copia estos valores:**

```bash
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi...
```

**⚠️ IMPORTANTE:**
- `anon key` = Se puede usar en el navegador ✅
- `service_role key` = NUNCA exponer en el navegador ❌

---

## 🔧 PASO 4: Actualizar Variables de Entorno

### 4.1 Actualizar `.env.local`

Reemplaza las líneas de Supabase en tu archivo `.env.local`:

```bash
# ============================================
# SUPABASE PRODUCTION (CLOUD)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# MANTÉN LAS DEMÁS VARIABLES IGUAL
# ============================================
```

### 4.2 Reiniciar Servidor de Desarrollo

```bash
# Detener servidor (Ctrl+C)
# Reiniciar
npm run dev
```

---

## ✅ PASO 5: Verificar Todo Funciona

### 5.1 Crear Usuario Admin

**Opción A: Desde Supabase Dashboard**
1. Ve a **Authentication → Users**
2. Click **"Add user"** → **"Create new user"**
3. Email: `admin@negroni.com` (o el que quieras)
4. Password: `[tu contraseña segura]`
5. ✅ Check **"Auto Confirm User"**

**Opción B: Desde tu app**
1. Ve a `/auth/register`
2. Crea una cuenta nueva

### 5.2 Probar Login

1. Abre: `http://localhost:3000/auth/login`
2. Ingresa credenciales
3. ✅ **Deberías ver el Dashboard**

### 5.3 Crear Datos de Prueba

#### Crear Membership Type
```sql
-- Ejecuta en SQL Editor
INSERT INTO membership_types (name, description, price, benefits, is_active)
VALUES 
  ('Member', 'Standard membership', 0, '{"benefit1": "Access to events"}', true),
  ('Gold', 'Premium membership', 50, '{"benefit1": "VIP access", "benefit2": "Free drinks"}', true);
```

#### Crear Branch
```sql
INSERT INTO branches (name, address, is_active)
VALUES ('Aeroparque', 'Av. Costanera Rafael Obligado 5790', true);
```

#### Crear Código
```sql
INSERT INTO codes (code, description, is_active)
VALUES ('AERO', 'Access to Aeroparque benefits', true);
```

### 5.4 Crear Miembro desde la UI

1. **Dashboard → Miembros → Nuevo Miembro**
2. Completa todos los datos
3. Guarda
4. ✅ **Debería aparecer en la lista**

---

## 🚀 PASO 6: Deploy a Vercel (Opcional)

### 6.1 Preparar para Deploy

```bash
# Asegúrate de que todo esté commiteado
git add -A
git commit -m "feat: Conectar a Supabase Cloud"
git push origin main
```

### 6.2 Configurar Variables en Vercel

1. Ve a: **https://vercel.com/dashboard**
2. Selecciona tu proyecto
3. **Settings → Environment Variables**
4. Agrega/actualiza:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# App URL
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app

# Apple Wallet (si tienes)
APPLE_PASS_TYPE_ID=pass.com.onetimeleads.negroni
APPLE_TEAM_ID=G736PJ3Z4Z
APPLE_PASS_KEY_PASSPHRASE=Negroni1.2

# Web Push (si tienes)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEiEh...
VAPID_PRIVATE_KEY=xyz...
VAPID_SUBJECT=mailto:admin@negroni.com

# Email (si tienes)
RESEND_API_KEY=re_...
EMAIL_FROM=Negroni <noreply@negroni.com>
```

### 6.3 Redeploy

Vercel deployará automáticamente cuando hagas push, o manualmente:
- **Deployments → "..." → Redeploy**

---

## 📊 PASO 7: Monitoreo y Límites

### 7.1 Plan Free - Límites

✅ **Database:** 500MB  
✅ **Bandwidth:** 5GB/mes  
✅ **Requests:** 500K/mes  
✅ **Usuarios:** Sin límite

### 7.2 Ver Uso Actual

1. **Settings → Billing**
2. Revisa:
   - Database size
   - API requests
   - Bandwidth

### 7.3 Ver Logs

**Database Logs:**
- **Logs → Postgres Logs**
- Ver queries lentas

**API Logs:**
- **Logs → API**
- Ver requests y errores

**Auth Logs:**
- **Authentication → Logs**
- Ver logins/signups

---

## 🔐 SEGURIDAD - Ya Configurada

El script de migración ya incluye:

✅ **Row Level Security (RLS)** en todas las tablas  
✅ **Políticas de acceso** por rol  
✅ **Triggers automáticos**  
✅ **Índices optimizados**

### Verificar RLS

```sql
SELECT 
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**Todas deberían tener:** `rowsecurity = true`

---

## 🆘 TROUBLESHOOTING

### Error: "relation already exists"

**Causa:** Ya ejecutaste parte del script.

**Solución:**
```sql
-- OPCIÓN 1: Resetear database (⚠️ BORRA TODO)
-- Settings → Database → Reset database

-- OPCIÓN 2: Drop y recrear
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
-- Luego ejecuta el script de nuevo
```

### Error: "permission denied"

**Causa:** Faltan políticas RLS.

**Solución:** El script ya las incluye, pero si falla:
```sql
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
-- Ejecuta para cada tabla
```

### Error al conectar desde la app

**Verifica:**
1. ✅ Variables de entorno correctas en `.env.local`
2. ✅ Reiniciaste el servidor (`npm run dev`)
3. ✅ URL no tiene espacios ni caracteres raros
4. ✅ anon key es la correcta (no service_role)

### Database lleno (500MB)

**Soluciones:**
1. **Upgrade a Pro:** $25/mes → 8GB
2. **Limpiar datos:**
   ```sql
   -- Eliminar registros viejos
   DELETE FROM card_usage WHERE created_at < NOW() - INTERVAL '6 months';
   DELETE FROM push_notification_deliveries WHERE created_at < NOW() - INTERVAL '3 months';
   ```

---

## ✅ CHECKLIST FINAL

Antes de considerar la migración completa:

- [ ] ✅ Proyecto creado en Supabase Cloud
- [ ] ✅ Script FULL_PRODUCTION_MIGRATION.sql ejecutado sin errores
- [ ] ✅ 23 tablas creadas
- [ ] ✅ Variables de entorno actualizadas en `.env.local`
- [ ] ✅ Servidor dev reiniciado
- [ ] ✅ Login funciona
- [ ] ✅ Crear miembro funciona
- [ ] ✅ Membership types creados
- [ ] ✅ Branch creado
- [ ] ✅ Códigos creados
- [ ] ✅ (Opcional) Deploy en Vercel exitoso
- [ ] ✅ (Opcional) Variables configuradas en Vercel

---

## 🎉 ¡MIGRACIÓN COMPLETA!

Tu app ahora está corriendo en:

- **Database:** Supabase Cloud ☁️
- **Servidor Local:** `http://localhost:3000` 💻
- **Producción (si deployaste):** Vercel 🚀

---

## 📚 PRÓXIMOS PASOS

1. **Backups Automáticos:**
   - Supabase hace backups diarios (retención 7 días en Free)
   - Para más, upgrade a Pro

2. **Custom Domain en Vercel:**
   - Settings → Domains
   - Agrega tu dominio

3. **Monitoring:**
   - Configura alertas en Supabase
   - Usa Vercel Analytics

4. **Optimización:**
   - Revisa queries lentas en Postgres Logs
   - Agrega índices si es necesario

---

## 🔗 ENLACES ÚTILES

- 🔗 [Supabase Dashboard](https://supabase.com/dashboard)
- 🔗 [Vercel Dashboard](https://vercel.com/dashboard)
- 📚 [Supabase Docs](https://supabase.com/docs)
- 📚 [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**¿Problemas durante la migración?**  
Revisa los logs de Supabase (Logs → API/Postgres) y busca mensajes de error específicos.
