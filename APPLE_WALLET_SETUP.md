# ✅ Apple Wallet - Configuración Completada

## 🎉 Estado: IMPLEMENTADO

La generación de passes de Apple Wallet está completamente implementada y lista para usar.

## 📋 Configuración Actual

### Certificados
- ✅ Pass Type ID: `pass.com.onetimeleads.negroni`
- ✅ Team ID: `G736PJ3Z4Z`
- ✅ Certificados convertidos a PEM
- ✅ Contraseña configurada en `.env.local`

### Archivos Creados
- ✅ Template de pass: `wallet-templates/apple.pass/pass.json`
- ✅ Imágenes placeholder (icon y logo en 3 tamaños)
- ✅ Generador de passes: `lib/wallet/apple-wallet.ts`
- ✅ API endpoint: `app/api/wallet/apple/[memberId]/route.ts`
- ✅ UI actualizada: Botón funcional en página de Tarjetas

## 🚀 Cómo Usar

### 1. Verificar Certificados

Asegúrate de que tienes estos 3 archivos en `certificates/`:
```bash
ls -la certificates/
```

Deberías ver:
- `wwdr.pem` - Certificado WWDR de Apple
- `signerCert.pem` - Tu certificado de Pass Type ID
- `signerKey.pem` - Tu clave privada

### 2. Generar un Pass

1. Ve a http://localhost:3000/dashboard/cards
2. Verás todos los miembros activos con diseño de tarjeta
3. Haz clic en **"Generar Apple Wallet"** en cualquier tarjeta
4. El archivo `.pkpass` se descargará automáticamente

### 3. Probar el Pass

#### En iPhone/iPad:
1. Envía el archivo `.pkpass` a tu dispositivo (AirDrop, email, etc.)
2. Abre el archivo
3. Haz clic en "Agregar" para agregarlo a Apple Wallet
4. ¡Listo! La tarjeta aparecerá en tu Wallet

#### En Mac (para desarrollo):
1. Haz doble clic en el archivo `.pkpass`
2. Se abrirá en Simulator (si tienes Xcode instalado)
3. O puedes usar https://pkpassvalidator.com para validar el pass

## 🎨 Personalización

### Cambiar Colores

Edita `lib/wallet/apple-wallet.ts`:
```typescript
const getMembershipColor = (type: string): string => {
  const colors: Record<string, string> = {
    basic: 'rgb(107, 114, 128)',    // Gris
    silver: 'rgb(192, 192, 192)',   // Plata
    gold: 'rgb(255, 215, 0)',       // Oro
    platinum: 'rgb(229, 228, 226)', // Platino
  };
  return colors[type.toLowerCase()] || colors.basic;
};
```

### Cambiar Imágenes

Reemplaza las imágenes en `wallet-templates/apple.pass/`:

**Icon (ícono de la app):**
- `icon.png` - 29x29 px
- `icon@2x.png` - 58x58 px
- `icon@3x.png` - 87x87 px

**Logo (logo de la empresa):**
- `logo.png` - 160x50 px
- `logo@2x.png` - 320x100 px
- `logo@3x.png` - 480x150 px

**Recomendaciones:**
- Usa PNG con transparencia
- Colores que contrasten con el fondo
- Logo simple y legible

### Modificar Campos

Edita `wallet-templates/apple.pass/pass.json` para cambiar:
- Campos mostrados
- Etiquetas
- Orden de los campos
- Mensajes de cambio

## 📱 Características del Pass

### Información Mostrada

**Frente de la tarjeta:**
- Tipo de membresía (header)
- Nombre del miembro (primary)
- Número de miembro (secondary)
- Puntos acumulados (secondary)
- Fecha de expiración (auxiliary)
- Código QR con número de miembro

**Reverso de la tarjeta:**
- Email
- Teléfono (si existe)
- Fecha de ingreso
- Términos y condiciones

### Actualizaciones Automáticas

El pass se actualiza automáticamente cuando:
- Los puntos del miembro cambian
- La información del miembro se actualiza
- Se aplica una promoción

**Nota:** Para que las actualizaciones funcionen, necesitas implementar el Web Service de Apple Wallet (ver `WALLET_INTEGRATION.md`).

## 🔍 Troubleshooting

### Error: "Cannot find certificates"

**Solución:**
```bash
# Verifica que los certificados existen
ls -la certificates/

# Si no existen, vuelve a ejecutar los comandos de conversión
openssl pkcs12 -in certificates/Certificates.p12 -clcerts -nokeys -out certificates/signerCert.pem -passin pass:Negroni1.2
openssl pkcs12 -in certificates/Certificates.p12 -nocerts -out certificates/signerKey.pem -passin pass:Negroni1.2 -passout pass:Negroni1.2
openssl x509 -inform DER -in certificates/AppleWWDRCAG4.cer -out certificates/wwdr.pem
```

### Error: "Invalid passphrase"

**Solución:** Verifica que la contraseña en `.env.local` sea correcta:
```bash
grep APPLE_PASS_KEY_PASSPHRASE .env.local
```

Debería mostrar:
```
APPLE_PASS_KEY_PASSPHRASE=Negroni1.2
```

### Error: "Pass Type ID mismatch"

**Solución:** Verifica que el Pass Type ID en `.env.local` coincida con el de Apple Developer:
```bash
grep APPLE_PASS_TYPE_ID .env.local
```

Debería mostrar:
```
APPLE_PASS_TYPE_ID=pass.com.onetimeleads.negroni
```

### El pass no se agrega a Wallet

**Posibles causas:**
1. **Certificado expirado** - Verifica en Apple Developer
2. **Pass Type ID incorrecto** - Debe coincidir exactamente
3. **Team ID incorrecto** - Verifica en Apple Developer
4. **Imágenes faltantes** - Asegúrate de tener todas las imágenes

**Validar el pass:**
- Usa https://pkpassvalidator.com
- Sube el archivo `.pkpass`
- Verá errores específicos si los hay

### Error en la consola del navegador

**Solución:** Abre las DevTools del navegador (F12) y revisa la consola para ver el error específico.

## 🔐 Seguridad

### Proteger Certificados

**IMPORTANTE:** Los certificados NO deben subirse a Git.

Verifica que `.gitignore` incluye:
```
certificates/
*.pem
*.p12
*.cer
```

### Variables de Entorno en Producción

Cuando despliegues a producción (Vercel, etc.):

1. Sube los certificados a un lugar seguro (ej: Vercel Secrets)
2. Configura las variables de entorno:
   - `APPLE_PASS_TYPE_ID`
   - `APPLE_TEAM_ID`
   - `APPLE_PASS_KEY_PASSPHRASE`

## 📊 Tracking

Cada vez que se genera un pass, se guarda en la tabla `wallet_passes`:
- Tipo de pass (apple)
- ID del pass
- Número de serie
- Datos del pass (JSON)
- Fecha de última actualización

Puedes ver esto en Supabase Studio:
http://127.0.0.1:54323 → Table Editor → wallet_passes

## 🎯 Próximos Pasos

### Implementar Web Service (Opcional pero Recomendado)

Para que los passes se actualicen automáticamente, necesitas:

1. **Endpoints de registro:**
   - POST `/v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}`
   - GET `/v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}`
   - DELETE `/v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}`

2. **Endpoint de actualización:**
   - GET `/v1/passes/{passTypeIdentifier}/{serialNumber}`

3. **Notificaciones Push:**
   - Cuando cambien los puntos
   - Cuando se aplique una promoción
   - Cuando expire la membresía

Ver guía completa en `WALLET_INTEGRATION.md`.

### Mejorar Diseño

1. Crea imágenes profesionales para icon y logo
2. Ajusta colores según tu marca
3. Agrega imagen de fondo (opcional)
4. Personaliza mensajes de cambio

### Analytics

Trackea:
- Cuántos passes se generan
- Cuántos se agregan a Wallet
- Cuántos se actualizan
- Tasa de uso

## ✅ Checklist de Verificación

Antes de usar en producción:

- [ ] Certificados válidos y no expirados
- [ ] Variables de entorno configuradas
- [ ] Imágenes personalizadas (no placeholders)
- [ ] Pass probado en dispositivo real
- [ ] Colores ajustados a la marca
- [ ] Términos y condiciones actualizados
- [ ] Web Service implementado (opcional)
- [ ] Certificados protegidos (no en Git)
- [ ] Backup de certificados guardado
- [ ] Documentación para el equipo

---

## 🎉 ¡Listo para Usar!

La integración de Apple Wallet está completa y funcional. Puedes:
1. Generar passes para todos tus miembros activos
2. Descargarlos y agregarlos a Apple Wallet
3. Los miembros pueden usar sus tarjetas digitales

**¿Preguntas?** Consulta `WALLET_INTEGRATION.md` para más detalles técnicos.
