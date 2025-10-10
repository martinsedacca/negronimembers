# 📱 Integración de Apple Wallet y Google Wallet

Este documento describe cómo implementar la generación de passes para Apple Wallet y Google Wallet.

## 🍎 Apple Wallet (PassKit)

### Requisitos

1. **Cuenta de Apple Developer** ($99/año)
2. **Pass Type ID Certificate** - Certificado para firmar los passes
3. **Team ID** - ID de tu equipo de desarrollo

### Estructura de un Pass

Un pass de Apple Wallet es un archivo `.pkpass` que contiene:

```
pass.pkpass/
├── pass.json          # Metadata y contenido del pass
├── manifest.json      # Hash SHA1 de todos los archivos
├── signature          # Firma digital del manifest
├── icon.png          # Icono 29x29 px
├── icon@2x.png       # Icono 58x58 px
├── icon@3x.png       # Icono 87x87 px
├── logo.png          # Logo 160x50 px
├── logo@2x.png       # Logo 320x100 px
├── logo@3x.png       # Logo 480x150 px
└── (otros assets)
```

### Implementación

#### 1. Instalar dependencias

```bash
npm install passkit-generator node-forge
```

#### 2. Crear el generador de passes

```typescript
// lib/wallet/apple-wallet.ts
import { PKPass } from 'passkit-generator';
import path from 'path';

export async function generateApplePass(member: Member) {
  const pass = new PKPass({
    model: path.resolve('./wallet-templates/apple'),
    certificates: {
      wwdr: path.resolve('./certificates/wwdr.pem'),
      signerCert: path.resolve('./certificates/signerCert.pem'),
      signerKey: path.resolve('./certificates/signerKey.pem'),
      signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE,
    },
  });

  // Configurar el pass
  pass.type = 'storeCard';
  pass.serialNumber = member.member_number;
  pass.organizationName = 'Tu Organización';
  pass.description = 'Tarjeta de Membresía';

  // Información del miembro
  pass.primaryFields.push({
    key: 'member',
    label: 'MIEMBRO',
    value: member.full_name,
  });

  pass.secondaryFields.push({
    key: 'memberNumber',
    label: 'NÚMERO',
    value: member.member_number,
  });

  pass.auxiliaryFields.push({
    key: 'points',
    label: 'PUNTOS',
    value: member.points.toString(),
    changeMessage: 'Tus puntos han cambiado a %@',
  });

  pass.backFields.push({
    key: 'email',
    label: 'Email',
    value: member.email,
  });

  // Código de barras
  pass.barcodes = [{
    format: 'PKBarcodeFormatQR',
    message: member.member_number,
    messageEncoding: 'iso-8859-1',
  }];

  // Color de fondo según tipo de membresía
  const colors = {
    basic: 'rgb(107, 114, 128)',
    silver: 'rgb(192, 192, 192)',
    gold: 'rgb(255, 215, 0)',
    platinum: 'rgb(229, 228, 226)',
  };
  pass.backgroundColor = colors[member.membership_type] || colors.basic;

  return pass.getAsBuffer();
}
```

#### 3. Crear endpoint para descargar el pass

```typescript
// app/api/wallet/apple/[memberId]/route.ts
import { createClient } from '@/lib/supabase/server';
import { generateApplePass } from '@/lib/wallet/apple-wallet';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  const supabase = await createClient();
  
  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', params.memberId)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  const passBuffer = await generateApplePass(member);

  return new NextResponse(passBuffer, {
    headers: {
      'Content-Type': 'application/vnd.apple.pkpass',
      'Content-Disposition': `attachment; filename="membership-${member.member_number}.pkpass"`,
    },
  });
}
```

#### 4. Actualizar passes en tiempo real

```typescript
// app/api/wallet/apple/update/route.ts
export async function POST(request: Request) {
  const { memberId } = await request.json();
  
  // Obtener todos los dispositivos registrados para este pass
  const devices = await getRegisteredDevices(memberId);
  
  // Enviar notificación push a cada dispositivo
  for (const device of devices) {
    await sendPushNotification(device.pushToken);
  }
  
  return NextResponse.json({ success: true });
}
```

### Configuración de Web Service

Apple Wallet requiere un web service para:
- Registrar dispositivos
- Obtener passes actualizados
- Recibir notificaciones de cambios

Endpoints requeridos:

```
POST   /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}
GET    /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}
DELETE /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}
GET    /v1/passes/{passTypeIdentifier}/{serialNumber}
POST   /v1/log
```

## 🤖 Google Wallet

### Requisitos

1. **Google Cloud Project**
2. **Google Wallet API habilitada**
3. **Service Account** con permisos

### Implementación

#### 1. Instalar dependencias

```bash
npm install googleapis
```

#### 2. Crear el generador de passes

```typescript
// lib/wallet/google-wallet.ts
import { google } from 'googleapis';

const credentials = require('../../google-wallet-credentials.json');

export async function generateGooglePass(member: Member) {
  const httpClient = google.auth.fromJSON(credentials);
  httpClient.scopes = ['https://www.googleapis.com/auth/wallet_object.issuer'];

  const walletClient = google.walletobjects({
    version: 'v1',
    auth: httpClient,
  });

  const genericObject = {
    id: `${process.env.GOOGLE_ISSUER_ID}.${member.member_number}`,
    classId: `${process.env.GOOGLE_ISSUER_ID}.membership_class`,
    genericType: 'GENERIC_TYPE_UNSPECIFIED',
    hexBackgroundColor: getColorForMembershipType(member.membership_type),
    logo: {
      sourceUri: {
        uri: 'https://tu-dominio.com/logo.png',
      },
    },
    cardTitle: {
      defaultValue: {
        language: 'es',
        value: 'Tarjeta de Membresía',
      },
    },
    header: {
      defaultValue: {
        language: 'es',
        value: member.membership_type.toUpperCase(),
      },
    },
    textModulesData: [
      {
        header: 'MIEMBRO',
        body: member.full_name,
        id: 'member_name',
      },
      {
        header: 'NÚMERO',
        body: member.member_number,
        id: 'member_number',
      },
      {
        header: 'PUNTOS',
        body: member.points.toString(),
        id: 'points',
      },
    ],
    barcode: {
      type: 'QR_CODE',
      value: member.member_number,
    },
  };

  await walletClient.genericobject.insert({
    requestBody: genericObject,
  });

  // Generar JWT para el botón "Add to Google Wallet"
  const claims = {
    iss: credentials.client_email,
    aud: 'google',
    origins: ['https://tu-dominio.com'],
    typ: 'savetowallet',
    payload: {
      genericObjects: [genericObject],
    },
  };

  const token = jwt.sign(claims, credentials.private_key, {
    algorithm: 'RS256',
  });

  return `https://pay.google.com/gp/v/save/${token}`;
}
```

#### 3. Crear clase de pass (una sola vez)

```typescript
export async function createGooglePassClass() {
  const genericClass = {
    id: `${process.env.GOOGLE_ISSUER_ID}.membership_class`,
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [{
                    fieldPath: 'object.textModulesData["member_name"]',
                  }],
                },
              },
              endItem: {
                firstValue: {
                  fields: [{
                    fieldPath: 'object.textModulesData["points"]',
                  }],
                },
              },
            },
          },
        ],
      },
    },
  };

  await walletClient.genericclass.insert({
    requestBody: genericClass,
  });
}
```

## 🔄 Actualización Automática de Passes

### Cuando actualizar un pass:

1. **Cambio de puntos** - Después de cada uso de tarjeta
2. **Cambio de tipo de membresía** - Upgrade/downgrade
3. **Nueva promoción aplicable** - Notificar al usuario
4. **Expiración cercana** - Recordatorio

### Implementar con Supabase Functions

```typescript
// supabase/functions/update-wallet-pass/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { memberId, updateType } = await req.json()
  
  // Obtener información del miembro
  const member = await getMember(memberId)
  
  // Actualizar pass de Apple
  await updateApplePass(member)
  
  // Actualizar pass de Google
  await updateGooglePass(member)
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Trigger automático en cambios

```sql
-- Trigger para actualizar passes cuando cambian los puntos
CREATE OR REPLACE FUNCTION notify_wallet_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://tu-proyecto.supabase.co/functions/v1/update-wallet-pass',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object('memberId', NEW.id, 'updateType', 'points')::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wallet_update_on_points_change
AFTER UPDATE OF points ON members
FOR EACH ROW
WHEN (OLD.points IS DISTINCT FROM NEW.points)
EXECUTE FUNCTION notify_wallet_update();
```

## 📊 Tracking y Analytics

### Eventos a trackear:

1. **Pass creado** - Cuando se genera un nuevo pass
2. **Pass descargado** - Cuando el usuario lo agrega a su wallet
3. **Pass visto** - Cuando el usuario abre el pass
4. **Pass actualizado** - Cuando se actualiza el contenido
5. **Pass eliminado** - Cuando el usuario lo elimina

### Implementar en la tabla wallet_passes:

```sql
ALTER TABLE wallet_passes ADD COLUMN analytics JSONB DEFAULT '{
  "created_at": null,
  "downloaded_at": null,
  "last_viewed_at": null,
  "view_count": 0,
  "update_count": 0
}'::jsonb;
```

## 🔐 Seguridad

### Mejores prácticas:

1. **Validar identidad** - Verificar que el usuario tiene permiso para generar el pass
2. **Rate limiting** - Limitar generación de passes por IP/usuario
3. **Expiración de URLs** - URLs de descarga con tiempo limitado
4. **Logs de auditoría** - Registrar todas las generaciones y actualizaciones
5. **Certificados seguros** - Mantener certificados en variables de entorno

## 📝 Próximos Pasos

1. ✅ Obtener certificados de Apple Developer
2. ✅ Configurar Google Cloud Project
3. ✅ Crear templates de diseño para los passes
4. ✅ Implementar generadores de passes
5. ✅ Crear endpoints API
6. ✅ Implementar web service para Apple
7. ✅ Configurar notificaciones push
8. ✅ Testing en dispositivos reales
9. ✅ Documentar para usuarios finales

## 🔗 Referencias

- [Apple Wallet Developer Guide](https://developer.apple.com/wallet/)
- [Google Wallet API](https://developers.google.com/wallet)
- [PassKit Generator](https://github.com/alexandercerutti/passkit-generator)
