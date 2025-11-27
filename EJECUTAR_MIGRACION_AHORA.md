# ⚡ EJECUTAR MIGRACIÓN AHORA - 2 MINUTOS

**Tu proyecto:** `hlfqsserfifjnarboqfj`  
**URL:** https://hlfqsserfifjnarboqfj.supabase.co

---

## 🚀 PASOS EXACTOS (2 MINUTOS)

### 1. Abrir SQL Editor (30 seg)

**Click en este enlace:**  
👉 https://supabase.com/dashboard/project/hlfqsserfifjnarboqfj/sql/new

Esto abrirá directamente un nuevo query en tu proyecto.

---

### 2. Copiar Script (30 seg)

**En tu computadora:**

1. Abre el archivo: `FULL_PRODUCTION_MIGRATION.sql`
2. Selecciona TODO (Cmd+A o Ctrl+A)
3. Copia (Cmd+C o Ctrl+C)

---

### 3. Pegar y Ejecutar (1 min)

**En el SQL Editor de Supabase:**

1. Pega el contenido (Cmd+V o Ctrl+V)
2. Click en el botón **"RUN"** (esquina inferior derecha)
3. ⏳ Espera 30-60 segundos

---

### 4. Verificar (30 seg)

**Deberías ver:**

```
✅ Success. No rows returned
```

**Luego ejecuta este query para verificar:**

```sql
SELECT 
  tablename,
  '✅' as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Resultado esperado:** 23 tablas ✅

---

## 📋 ALTERNATIVA: Copy-Paste Directo

Si el archivo es muy largo, aquí está el contenido completo:

**Archivo:** `FULL_PRODUCTION_MIGRATION.sql`  
**Líneas:** 640  
**Tamaño:** ~22KB

---

## ✅ DESPUÉS DE EJECUTAR

### Actualizar variables de entorno locales

En tu `.env.local`, actualiza:

```bash
# Cambiar de local a producción
NEXT_PUBLIC_SUPABASE_URL=https://hlfqsserfifjnarboqfj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZnFzc2VyZmlmam5hcmJvcWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMDQzNzEsImV4cCI6MjA3Nzg4MDM3MX0.Bnd1WHgWp39ntHAK1MwfnKhNFyRQv0oAJ_ieLGlmDwk
```

### Reiniciar servidor

```bash
# Detener (Ctrl+C)
# Reiniciar
npm run dev
```

### Probar

```
http://localhost:3000/auth/login
```

---

## 🎯 CHECKLIST RÁPIDO

- [ ] Abrí SQL Editor con el enlace directo
- [ ] Copié contenido de FULL_PRODUCTION_MIGRATION.sql
- [ ] Pegué en SQL Editor
- [ ] Click "RUN"
- [ ] Vi "Success" ✅
- [ ] Verifiqué 23 tablas
- [ ] Actualicé .env.local
- [ ] Reinicié servidor
- [ ] Login funciona ✅

---

## 🆘 SI ALGO FALLA

### Error: "already exists"
→ Algunas tablas ya existen, ignora el error si es solo warning

### Error: "permission denied"
→ Verifica que estés usando tu cuenta de admin en Supabase

### No veo el SQL Editor
→ Verifica que estés logueado en Supabase.com

---

## 🎉 ¡LISTO!

Una vez completado, tu app estará **100% conectada a Supabase Cloud**.

**Datos de ejemplo incluidos:**
- ✅ 2 Membership Types (Member, Gold)
- ✅ 4 Códigos (AERO, VIP, PREMIUM, LAUNCH)  
- ✅ 1 Branch (Aeroparque)

**Próximo paso:** Crear tu primer miembro en la UI.

---

**Enlace directo:** https://supabase.com/dashboard/project/hlfqsserfifjnarboqfj/sql/new
