# 📧 Configuración de Envío de Emails

## Servicio: Resend

Usamos **Resend** para enviar emails de forma confiable y moderna.

---

## 🚀 Setup Rápido (5 minutos)

### 1. Crear Cuenta en Resend

1. Ve a https://resend.com
2. Click en **"Sign Up"** (es gratis)
3. Confirma tu email

### 2. Obtener API Key

1. En el dashboard de Resend: https://resend.com/api-keys
2. Click en **"Create API Key"**
3. Nombre: `Negroni Production`
4. Permisos: **"Sending access"**
5. Click **"Add"**
6. **Copia la API Key** (solo se muestra una vez)

### 3. Configurar Variables de Entorno

Agrega a tu `.env.local`:

```bash
# Email Service (Resend)
RESEND_API_KEY=re_tu_api_key_aqui
EMAIL_FROM=Negroni <noreply@tudominio.com>
```

⚠️ **Importante:** Si aún no verificas un dominio, usa:
```bash
EMAIL_FROM=Negroni <onboarding@resend.dev>
```

### 4. (Opcional) Verificar Dominio Propio

Para enviar desde tu dominio (ej: `noreply@negroni.com`):

1. **Resend Dashboard → Domains**
2. Click **"Add Domain"**
3. Ingresa: `negroni.com`
4. Agrega los registros DNS que te proporciona Resend:
   - **SPF** (TXT)
   - **DKIM** (TXT)
   - **DMARC** (TXT)
5. Espera 24-48 hrs para verificación
6. Cambia `EMAIL_FROM` a tu dominio

---

## 🧪 Probar el Envío

### Desde el Dashboard

1. **Dashboard → Miembros → Ver detalles**
2. Asegúrate de que el miembro tenga **email**
3. Click en **"Enviar Tarjeta al Cliente"**
4. Revisa el inbox del miembro

### Email que Recibirá

El cliente recibirá un email HTML bonito con:

- ✅ **Botón "Agregar a Apple Wallet"** → Instala directamente
- ✅ **QR Code** → Para escanear desde otro dispositivo
- ✅ **Instrucciones paso a paso**
- ✅ **Beneficios de la membresía**

---

## 📊 Verificar Envíos

### Dashboard de Resend

1. Ve a https://resend.com/emails
2. Verás todos los emails enviados
3. **Estado:** Delivered / Bounced / Complained
4. Click en un email para ver detalles

### Logs del Servidor

```bash
# Busca estos logs en la terminal:
✅ [Email] Email sent successfully: <email_id>
```

---

## 🎨 Personalizar el Email

El template está en: `/lib/services/email.ts`

Puedes modificar:
- **Colores** (gradientes, backgrounds)
- **Textos** (encabezados, instrucciones)
- **Logo** (agrega tu logo en el header)
- **Footer** (info de contacto)

---

## 💰 Límites y Precios

### Plan Gratuito de Resend

- ✅ **100 emails/día**
- ✅ **3,000 emails/mes**
- ✅ Dominio verificado
- ✅ APIs completas

### Plan de Pago

Si necesitas más:
- **$20/mes** → 50,000 emails/mes
- **$80/mes** → 100,000 emails/mes

Para un negocio pequeño, el plan gratis es suficiente.

---

## 🐛 Troubleshooting

### Email no llega

**1. Revisa spam/junk** del destinatario

**2. Verifica la API key:**
```bash
echo $RESEND_API_KEY
# Debe empezar con "re_"
```

**3. Revisa logs del servidor:**
```bash
# Busca errores:
🔴 [Email] Error sending email: ...
```

**4. Verifica en Resend Dashboard:**
- Estado del email
- Razón del bounce si aplica

### Email va a spam

**Solución:**
1. **Verifica tu dominio** en Resend
2. Agrega **SPF, DKIM, DMARC** records
3. No uses palabras de spam ("FREE", "WINNER", etc.)
4. Mantén ratio de bounce bajo

### Error "Invalid API Key"

**Solución:**
1. Copia de nuevo la API key de Resend
2. Asegúrate de no tener espacios extras
3. Reinicia el servidor (`npm run dev`)

---

## 📝 Ejemplo de Email Enviado

```
De: Negroni <noreply@negroni.com>
Para: cliente@ejemplo.com
Asunto: 🎉 Tu Tarjeta de Membresía Negroni Gold

[HTML bonito con:]
- Encabezado con gradiente
- Botón grande "Agregar a Apple Wallet"
- QR Code para escanear
- Instrucciones paso a paso
- Lista de beneficios
- Footer con info de contacto
```

---

## 🔗 Referencias

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference/emails/send-email)
- [Verificar Dominio](https://resend.com/docs/dashboard/domains/introduction)
- [Email Best Practices](https://resend.com/docs/knowledge-base/email-best-practices)
