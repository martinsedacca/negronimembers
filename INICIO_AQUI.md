# 🚀 MIGRACIÓN A SUPABASE CLOUD

**Tiempo:** 20 minutos | **Dificultad:** Fácil

---

## ⚡ 7 PASOS RÁPIDOS

```
┌─────────────────────────────────────────────────────┐
│  1. Crear proyecto Supabase          → 5 min       │
│     https://supabase.com/dashboard                 │
│     • Name: negroni-membership                     │
│     • Region: South America                        │
│     • Plan: Free                                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  2. Ejecutar migración SQL            → 5 min       │
│     Supabase → SQL Editor → New Query              │
│     • Abre: FULL_PRODUCTION_MIGRATION.sql          │
│     • Copia TODO (Cmd+A)                           │
│     • Pega y RUN                                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  3. Verificar                         → 2 min       │
│     Ejecuta: VERIFY_MIGRATION.sql                  │
│     ✅ Debe mostrar 23 tablas                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  4. Obtener credenciales              → 2 min       │
│     Supabase → Settings → API                      │
│     • Copia Project URL                            │
│     • Copia anon key                               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  5. Actualizar .env.local             → 3 min       │
│     Reemplaza:                                     │
│     NEXT_PUBLIC_SUPABASE_URL=...                   │
│     NEXT_PUBLIC_SUPABASE_ANON_KEY=...              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  6. Reiniciar servidor                → 1 min       │
│     Ctrl+C                                         │
│     npm run dev                                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  7. Probar                            → 2 min       │
│     http://localhost:3000/auth/login               │
│     • Crea cuenta nueva                            │
│     • Verifica que muestre Dashboard               │
└─────────────────────────────────────────────────────┘
```

---

## 📁 ARCHIVOS PRINCIPALES

| Archivo | Descripción |
|---------|-------------|
| **README_MIGRACION.md** | Índice completo de archivos |
| **PASOS_RAPIDOS_MIGRACION.md** | Guía detallada paso a paso |
| **FULL_PRODUCTION_MIGRATION.sql** | Script SQL completo |
| **VERIFY_MIGRATION.sql** | Verificar instalación |
| **POST_MIGRACION_CHECKLIST.md** | Qué hacer después |

---

## ✅ RESULTADO

Después de los 7 pasos tendrás:

```
✅ Database en Supabase Cloud
✅ 23 tablas creadas
✅ 2 membership types (Member, Gold)
✅ 4 códigos de ejemplo (AERO, VIP, PREMIUM, LAUNCH)
✅ 1 branch (Aeroparque)
✅ RLS habilitado
✅ App conectada y funcionando
```

---

## 🎯 EMPIEZA AHORA

**Lee primero:**
```bash
open README_MIGRACION.md
```

**Luego ejecuta:**
```bash
open PASOS_RAPIDOS_MIGRACION.md
```

---

## 🆘 AYUDA RÁPIDA

### Error al ejecutar SQL
→ Copia el error y pídeme ayuda

### No conecta desde la app
→ Verifica `.env.local` y reinicia servidor

### Login no funciona
→ Supabase → Authentication → Providers → Habilita Email

---

## 📊 STACK FINAL

```
🗄️  Database:    Supabase Cloud
⚡  Framework:   Next.js 15 + React 19
🎨  Styling:     Tailwind CSS 4
🔐  Auth:        Supabase Auth
🚀  Deploy:      Local (luego Vercel)
```

---

**¿Listo? Sigue → README_MIGRACION.md**
