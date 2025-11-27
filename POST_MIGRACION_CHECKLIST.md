# ✅ POST-MIGRACIÓN CHECKLIST

**Después de migrar a Supabase Cloud**

---

## 🎯 TAREAS INMEDIATAS

### 1. Crear Usuario Admin

**Opción A: Desde Supabase Dashboard**
```
Supabase → Authentication → Users → "Add user"
Email: admin@negroni.com
Password: [tu contraseña segura]
✅ Check "Auto Confirm User"
```

**Opción B: Desde tu app**
```
http://localhost:3000/auth/register
```

---

### 2. Crear Datos Base

#### Membership Types (Ya creados automáticamente ✅)
- Member (Standard)
- Gold (Premium)

#### Branch Principal (Ya creado ✅)
- Aeroparque

#### Códigos de Ejemplo (Ya creados ✅)
- AERO
- VIP
- PREMIUM
- LAUNCH

---

### 3. Probar Funcionalidades Core

#### ✅ Autenticación
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Logout funciona
- [ ] Password reset funciona (si configuraste email)

#### ✅ Miembros
- [ ] Crear miembro nuevo
- [ ] Ver lista de miembros
- [ ] Editar miembro
- [ ] Ver perfil de miembro

#### ✅ Benefits
- [ ] Crear benefit nuevo
- [ ] Asignar a tier específico
- [ ] Asignar a código específico
- [ ] Asignar a múltiples criterios (tier + código)
- [ ] Redimir benefit

#### ✅ Eventos
- [ ] Crear evento
- [ ] Asignar a branch
- [ ] Registrar asistente
- [ ] Marcar asistencia

#### ✅ Códigos
- [ ] Ver lista de códigos
- [ ] Redimir código
- [ ] Ver redemptions por código

---

## 🔧 CONFIGURACIÓN ADICIONAL

### Email (Resend)

Si quieres enviar emails:

1. Crea cuenta en: https://resend.com
2. Obtén API key
3. Agrega a `.env.local`:
   ```bash
   RESEND_API_KEY=re_tu_api_key
   EMAIL_FROM=Negroni <noreply@tudominio.com>
   ```
4. Reinicia servidor

---

### Apple Wallet (Opcional)

Si quieres tarjetas Apple Wallet:

1. **Necesitas:** Cuenta Apple Developer ($99/año)
2. **Archivos necesarios:**
   - Pass Type ID
   - Team ID
   - Certificado (.p12)
3. **Documentación:** `/docs/APPLE_WALLET_SETUP.md`

**Nota:** Es opcional, puedes usar el sistema sin Apple Wallet

---

### Push Notifications (Opcional)

Ya configuradas con VAPID keys de ejemplo.

**Para producción, genera nuevas:**
```bash
npx web-push generate-vapid-keys
```

Actualiza en `.env.local`:
```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_nueva_public_key
VAPID_PRIVATE_KEY=tu_nueva_private_key
```

---

## 🚀 DEPLOY A PRODUCCIÓN

### Preparar Deploy

1. **Commit cambios:**
   ```bash
   git add -A
   git commit -m "feat: Conectar a Supabase Cloud"
   git push origin main
   ```

2. **Vercel:**
   - Ve a: https://vercel.com
   - Importa tu repositorio
   - Agrega variables de entorno (ver abajo)

---

### Variables de Entorno para Vercel

**Mínimas necesarias:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```

**Opcionales (si las tienes):**
```bash
RESEND_API_KEY=re_...
EMAIL_FROM=Negroni <noreply@negroni.com>
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BGQ...
VAPID_PRIVATE_KEY=TZe...
VAPID_SUBJECT=mailto:admin@negroni.com
```

**Apple Wallet (si lo usas):**
```bash
APPLE_PASS_TYPE_ID=pass.com.onetimeleads.negroni
APPLE_TEAM_ID=G736PJ3Z4Z
APPLE_PASS_KEY_PASSPHRASE=Negroni1.2
APPLE_WALLET_PUSH_KEY=[tu private key]
APPLE_WALLET_KEY_ID=P645UUK6Y8
APPLE_WALLET_PASS_TYPE_ID=pass.com.onetimeleads.negroni
```

---

## 📊 MONITOREO

### En Supabase

**Database:**
- Settings → Billing → Ver uso actual
- Database size: máx 500MB en Free
- Bandwidth: máx 5GB/mes

**Logs:**
- Logs → Postgres Logs (queries lentas)
- Logs → API (requests y errores)
- Authentication → Logs (logins)

**Backups:**
- Automáticos cada 24h (Free plan)
- Retención 7 días
- Para más, upgrade a Pro

---

### En Vercel

**Analytics:**
- Dashboard → Analytics
- Ver tráfico, performance, errores

**Logs:**
- Functions → Ver logs en tiempo real
- Runtime Logs → Errores de servidor

---

## 🔐 SEGURIDAD

### ✅ Ya Configurado

- [x] RLS habilitado en todas las tablas
- [x] Políticas de acceso por rol
- [x] Triggers de seguridad
- [x] Índices optimizados

### 🔒 Recomendaciones

1. **No compartas:**
   - `.env.local` con valores reales
   - `service_role` key (solo para backend)
   - Database password

2. **Usa en producción:**
   - HTTPS (automático en Vercel)
   - Variables de entorno (no hardcodeadas)
   - Validación de inputs

3. **Monitorea:**
   - Failed login attempts
   - API rate limits
   - Database usage

---

## 📈 OPTIMIZACIÓN

### Performance

1. **Índices:** Ya creados automáticamente ✅
2. **Caching:** Considera Next.js ISR
3. **Images:** Usa Next.js Image Optimization

### Database

```sql
-- Ver queries más lentas
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Cleanup

```sql
-- Limpiar datos antiguos (ejecutar mensualmente)
DELETE FROM card_usage 
WHERE created_at < NOW() - INTERVAL '6 months';

DELETE FROM push_notification_deliveries 
WHERE created_at < NOW() - INTERVAL '3 months';

DELETE FROM ghl_sync_log 
WHERE created_at < NOW() - INTERVAL '1 month';
```

---

## 🆘 SOPORTE

### Documentación

- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs

### Logs de Errores

**Desarrollo:**
```bash
# Terminal donde corre npm run dev
# Consola del navegador (F12)
```

**Producción:**
```
Vercel → Functions → Runtime Logs
Supabase → Logs → API
```

---

## ✅ CHECKLIST FINAL

### Desarrollo
- [ ] Migración exitosa
- [ ] Login funciona localmente
- [ ] Crear miembro funciona
- [ ] Benefits funcionan
- [ ] Eventos funcionan
- [ ] Códigos funcionan

### Producción (Opcional)
- [ ] Deploy en Vercel exitoso
- [ ] Variables de entorno configuradas
- [ ] Login funciona en producción
- [ ] Custom domain configurado (opcional)
- [ ] SSL activo (automático)

### Mantenimiento
- [ ] Backups configurados (automático)
- [ ] Monitoreo activo
- [ ] Alertas configuradas (opcional)

---

## 🎉 ¡FELICITACIONES!

Tu sistema de membresías Negroni está **100% online** 🚀

**Stack:**
- ✅ Database: Supabase Cloud
- ✅ Frontend: Next.js 15
- ✅ Backend: Next.js API Routes
- ✅ Auth: Supabase Auth
- ✅ Hosting: Vercel (si deployaste)

---

## 📞 PRÓXIMOS PASOS OPCIONALES

1. **Custom Domain:** Configura tu dominio en Vercel
2. **Email Notifications:** Activa Resend
3. **Apple Wallet:** Si tienes Apple Developer
4. **Analytics:** Configura Google Analytics
5. **Monitoring:** Sentry para tracking de errores
6. **Backups:** Configura backups adicionales
7. **Testing:** Agrega tests con Jest/Playwright
8. **CI/CD:** GitHub Actions para testing automático

---

**¿Necesitas ayuda?** Revisa los logs y documentación, o pídeme asistencia específica.
