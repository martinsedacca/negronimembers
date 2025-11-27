# 📦 ARCHIVOS DE MIGRACIÓN A SUPABASE CLOUD

**Todo listo para migrar de Supabase Local a Supabase Cloud**

---

## 🎯 INICIO RÁPIDO

**¿Primera vez?** Lee esto primero: 👉 `PASOS_RAPIDOS_MIGRACION.md`

**Solo toma 15-20 minutos y 7 pasos simples.**

---

## 📁 ARCHIVOS DISPONIBLES

### 🚀 MIGRACIÓN (En orden de uso)

| Archivo | Propósito | Cuándo usar |
|---------|-----------|-------------|
| **PASOS_RAPIDOS_MIGRACION.md** | Guía paso a paso ultra simple | **EMPIEZA AQUÍ** |
| **FULL_PRODUCTION_MIGRATION.sql** | Script completo de migración | Ejecutar en Supabase SQL Editor |
| **VERIFY_MIGRATION.sql** | Verificar que todo se creó bien | Después de ejecutar migración |
| **MIGRACION_A_SUPABASE_CLOUD.md** | Guía detallada completa | Si necesitas más detalles |

### 📝 CONFIGURACIÓN

| Archivo | Propósito |
|---------|-----------|
| **ENV_PRODUCTION_TEMPLATE.txt** | Template de variables de entorno |
| **POST_MIGRACION_CHECKLIST.md** | Qué hacer después de migrar |

### 🔧 EXTRAS (Ya creados antes)

| Archivo | Propósito |
|---------|-----------|
| **CREATE_CODES_TABLE.sql** | Crear tabla codes (ya incluido en FULL_PRODUCTION_MIGRATION) |
| **CREATE_MEMBER_CODES_TABLE.sql** | Crear relación member_codes (ya incluido) |
| **INSTRUCCIONES_TABLAS_CODES.md** | Info sobre sistema de códigos |

---

## ⚡ PROCESO DE 7 PASOS

```
1. Crear proyecto Supabase     → 5 min
2. Ejecutar migración SQL       → 5 min
3. Verificar tablas             → 2 min
4. Obtener credenciales         → 2 min
5. Actualizar .env.local        → 3 min
6. Reiniciar servidor           → 1 min
7. Probar login                 → 2 min
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL                          ~20 min
```

---

## 🎬 CÓMO EMPEZAR

### Opción A: Rápido (Recomendado)

```bash
# 1. Abre este archivo
open PASOS_RAPIDOS_MIGRACION.md

# 2. Sigue los 7 pasos
# 3. ¡Listo!
```

### Opción B: Detallado

```bash
# 1. Lee la guía completa
open MIGRACION_A_SUPABASE_CLOUD.md

# 2. Ejecuta paso a paso
# 3. Usa VERIFY_MIGRATION.sql para verificar
# 4. Revisa POST_MIGRACION_CHECKLIST.md
```

---

## ✅ LO QUE OBTIENES

### Después de la migración tendrás:

**✅ Database en la nube:**
- 23 tablas creadas
- Row Level Security configurado
- Políticas de acceso
- Triggers automáticos
- Índices optimizados

**✅ Datos de ejemplo:**
- 2 Membership Types (Member, Gold)
- 1 Branch (Aeroparque)
- 4 Códigos (AERO, VIP, PREMIUM, LAUNCH)

**✅ Seguridad:**
- RLS habilitado en todas las tablas
- Políticas por rol
- Foreign keys configuradas

**✅ Performance:**
- 15+ índices optimizados
- Queries optimizadas
- Caching strategies

---

## 🏗️ ESTRUCTURA DEL DATABASE

```
📊 23 TABLAS PRINCIPALES

CORE
├── members                 → Miembros
├── membership_types        → Tipos de membresía
├── promotions             → Benefits/Promociones
└── member_promotions      → Redemptions

CODES SYSTEM (NUEVO)
├── codes                  → Códigos disponibles
└── member_codes           → Códigos redimidos por miembros

BRANCHES
├── branches               → Sucursales
└── branch_users           → Usuarios por sucursal

EVENTS
├── events                 → Eventos
└── event_members          → Asistentes a eventos

WALLET
├── wallet_passes          → Apple Wallet passes
├── wallet_push_tokens     → Push tokens de Wallet
└── wallet_push_notifications → Notificaciones de Wallet

PUSH NOTIFICATIONS
├── push_subscriptions     → Suscripciones web push
├── push_notifications     → Notificaciones
└── push_notification_deliveries → Entregas

TRACKING
├── card_usage             → Uso de tarjetas
├── scanner_locations      → Ubicaciones de scanners
└── scanner_sessions       → Sesiones de escaneo

CONFIG
├── system_config          → Configuración del sistema
├── card_design_config     → Diseño de tarjetas
├── ghl_sync_log           → Log de sincronización GHL
├── onboarding_questions   → Preguntas de onboarding
└── member_segments        → Segmentos de miembros
```

---

## 🔑 CREDENCIALES NECESARIAS

Después de crear el proyecto en Supabase, necesitas:

```bash
# De Supabase (Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# URL de tu app
NEXT_PUBLIC_APP_URL=http://localhost:3000  # local
# NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app  # producción
```

**Opcional (para funciones avanzadas):**
- Resend API Key (emails)
- Apple Developer certificates (Wallet)
- VAPID keys (web push)

---

## 🆘 TROUBLESHOOTING

### Error: "relation already exists"
**Solución:** Reset database en Supabase y ejecuta migración de nuevo

### Error: "permission denied"  
**Solución:** Verifica que RLS esté habilitado (ya viene en el script)

### No puedo conectar desde la app
**Solución:** 
1. Verifica `.env.local` tiene las credenciales correctas
2. Reinicia el servidor (`npm run dev`)
3. Limpia caché del navegador

### Login no funciona
**Solución:**
1. Supabase → Authentication → Providers
2. Verifica que Email esté habilitado
3. Crea usuario desde Supabase Dashboard

---

## 📚 RECURSOS ADICIONALES

### Documentación del Proyecto
- `/docs/` - Documentación completa del sistema
- `/docs/BENEFITS_MULTI_SELECT.md` - Sistema de benefits
- `/docs/GUIA_UI_MOVIL.md` - UI móvil

### Documentación Externa
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)

---

## 🎯 CHECKLIST DE MIGRACIÓN

- [ ] Leí `PASOS_RAPIDOS_MIGRACION.md`
- [ ] Creé proyecto en Supabase Cloud
- [ ] Ejecuté `FULL_PRODUCTION_MIGRATION.sql`
- [ ] Ejecuté `VERIFY_MIGRATION.sql` (23 tablas ✅)
- [ ] Copié credenciales de Supabase
- [ ] Actualicé `.env.local`
- [ ] Reinicié servidor
- [ ] Probé login (funciona ✅)
- [ ] Creé miembro de prueba (funciona ✅)
- [ ] Revisé `POST_MIGRACION_CHECKLIST.md`

---

## 🚀 DEPLOY A PRODUCCIÓN (OPCIONAL)

### Después de que todo funcione localmente:

1. **Commit:**
   ```bash
   git add -A
   git commit -m "Migración a Supabase Cloud exitosa"
   git push origin main
   ```

2. **Vercel:**
   - Importa repo en Vercel
   - Agrega variables de entorno
   - Deploy automático

3. **Configuración adicional:**
   - Custom domain
   - Email service (Resend)
   - Analytics
   - Monitoring

**Guía detallada:** Ver `POST_MIGRACION_CHECKLIST.md`

---

## ⏭️ PRÓXIMOS PASOS

### Inmediato
1. ✅ Ejecutar migración (20 min)
2. ✅ Probar funcionalidades core
3. ✅ Crear datos de prueba

### Corto plazo
1. Deploy a Vercel
2. Configurar email service
3. Agregar custom domain

### Largo plazo
1. Apple Wallet integration
2. Analytics y monitoring
3. Backups automáticos adicionales
4. Testing automatizado

---

## 💡 CONSEJOS

1. **Empieza simple:** Solo migra primero, prueba que funcione
2. **No te apures:** Lee los mensajes de error con calma
3. **Backups:** Supabase hace backups automáticos (7 días en Free)
4. **Costs:** Plan Free es suficiente para empezar (500MB, 5GB bandwidth)
5. **Upgrade:** Cuando necesites más, Pro es $25/mes (8GB, 250GB bandwidth)

---

## 🎉 ¡ÉXITO!

Una vez completada la migración:

**Tendrás un sistema de membresías completamente funcional en la nube:**
- ✅ Database cloud escalable
- ✅ Auth configurado
- ✅ RLS + seguridad
- ✅ Performance optimizado
- ✅ Listo para producción

**Stack completo:**
- Database: Supabase Cloud
- Frontend: Next.js 15 + React 19
- Styling: Tailwind CSS 4
- Hosting: Localhost (luego Vercel)
- Auth: Supabase Auth

---

**¿Listo para empezar?** 👉 Abre `PASOS_RAPIDOS_MIGRACION.md`

**¿Necesitas ayuda?** Revisa los logs de error y pídeme asistencia específica.

---

_Última actualización: Enero 2025_  
_Versión: 2.0 - Incluye sistema de códigos_
