# ⚡ MIGRACIÓN RÁPIDA A SUPABASE CLOUD

**Tiempo total:** 15-20 minutos  
**Archivos necesarios:** Ya están listos ✅

---

## 🚀 PASOS EXACTOS

### 1️⃣ Crear Proyecto Supabase (5 min)

1. Ve a: https://supabase.com/dashboard
2. Click **"New Project"**
3. Completa:
   - Name: `negroni-membership`
   - Password: [**GENERA Y GUARDA**]
   - Region: `South America (São Paulo)`
   - Plan: `Free`
4. Click **"Create"**
5. ⏳ Espera 2-3 minutos

---

### 2️⃣ Ejecutar Migración (5 min)

1. En Supabase → **SQL Editor**
2. Click **"+ New Query"**
3. Abre el archivo: `FULL_PRODUCTION_MIGRATION.sql`
4. **Copia TODO** (Cmd+A → Cmd+C)
5. **Pega** en SQL Editor
6. Click **"RUN"**
7. ⏳ Espera 30-60 segundos
8. ✅ Deberías ver: `Success. No rows returned`

---

### 3️⃣ Verificar (2 min)

1. En SQL Editor, **nueva query**
2. Abre el archivo: `VERIFY_MIGRATION.sql`
3. **Copia TODO** y pega
4. Click **"RUN"**
5. ✅ Verifica que muestre **23 tablas**

---

### 4️⃣ Obtener Credenciales (2 min)

1. Ve a **Settings → API**
2. **Copia estos 2 valores:**

```
Project URL: https://xxxxx.supabase.co
anon key: eyJhbGci...
```

---

### 5️⃣ Actualizar .env.local (3 min)

1. Abre tu archivo `.env.local`
2. **Reemplaza estas líneas:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

3. **Guarda el archivo**

---

### 6️⃣ Reiniciar Servidor (1 min)

```bash
# Detén el servidor (Ctrl+C)
# Reinicia
npm run dev
```

---

### 7️⃣ Probar (2 min)

1. Ve a: http://localhost:3000/auth/login
2. Crea una cuenta nueva
3. ✅ Deberías ver el Dashboard

---

## ✅ CHECKLIST

- [ ] Proyecto creado en Supabase
- [ ] Script de migración ejecutado sin errores
- [ ] Verificación muestra 23 tablas
- [ ] Credenciales copiadas
- [ ] `.env.local` actualizado
- [ ] Servidor reiniciado
- [ ] Login funciona

---

## 🆘 SI ALGO FALLA

### Error al ejecutar migración:
→ Copia el mensaje de error y pídeme ayuda

### Error al conectar desde la app:
1. Verifica que las credenciales en `.env.local` sean correctas
2. Verifica que reiniciaste el servidor
3. Abre la consola del navegador (F12) y busca errores

### No puedo crear cuenta:
1. Ve a Supabase → **Authentication → Providers**
2. Verifica que **Email** esté habilitado

---

## 📁 ARCHIVOS DE REFERENCIA

- `MIGRACION_A_SUPABASE_CLOUD.md` - Guía completa detallada
- `FULL_PRODUCTION_MIGRATION.sql` - Script de migración
- `VERIFY_MIGRATION.sql` - Script de verificación
- `ENV_PRODUCTION_TEMPLATE.txt` - Template de variables

---

## 🎉 PRÓXIMOS PASOS (OPCIONAL)

### Deploy a Vercel:

1. Push a GitHub:
   ```bash
   git add -A
   git commit -m "Conectar a Supabase Cloud"
   git push
   ```

2. En Vercel → **Settings → Environment Variables**
3. Agrega las mismas variables de `.env.local`
4. Redeploy

---

**¿Listo?** Sigue los 7 pasos y en 15-20 minutos estarás 100% online 🚀
