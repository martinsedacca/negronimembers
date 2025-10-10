import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendMembershipCardEmailParams {
  to: string
  memberName: string
  memberNumber: string
  membershipType: string
  walletPassUrl: string
  qrCodeDataUrl?: string
}

export async function sendMembershipCardEmail({
  to,
  memberName,
  memberNumber,
  membershipType,
  walletPassUrl,
  qrCodeDataUrl,
}: SendMembershipCardEmailParams) {
  const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Tarjeta de Membresía Negroni</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #f5f5f5; margin: 0; font-size: 28px; font-weight: 700;">¡Tu Tarjeta de Membresía está Lista! 🎉</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hola <strong>${memberName}</strong>,
              </p>
              
              <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                ¡Bienvenido a Negroni! Tu tarjeta de membresía <strong>${membershipType}</strong> #${memberNumber} está lista para usar.
              </p>

              <!-- Wallet Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px;">
                <tr>
                  <td align="center">
                    <a href="${walletPassUrl}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                      📱 Agregar a Apple Wallet
                    </a>
                  </td>
                </tr>
              </table>

              ${qrCodeDataUrl ? `
              <!-- QR Code -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px;">
                <tr>
                  <td align="center" style="padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                    <p style="color: #666; font-size: 14px; margin: 0 0 15px;">
                      <strong>O escanea este código QR con tu iPhone:</strong>
                    </p>
                    <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 200px; height: 200px; border: 4px solid #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Instructions -->
              <div style="background-color: #f0f7ff; border-left: 4px solid #1a73e8; padding: 20px; border-radius: 4px; margin: 0 0 30px;">
                <h3 style="color: #1a73e8; margin: 0 0 12px; font-size: 16px;">📋 Instrucciones:</h3>
                <ol style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Abre este email en tu iPhone</li>
                  <li>Haz click en el botón "Agregar a Apple Wallet"</li>
                  <li>Confirma la instalación</li>
                  <li>¡Listo! Tu tarjeta estará en tu Wallet</li>
                </ol>
              </div>

              <!-- Benefits -->
              <div style="border-top: 1px solid #e0e0e0; padding-top: 30px;">
                <h3 style="color: #333; margin: 0 0 15px; font-size: 18px;">✨ Beneficios de tu membresía:</h3>
                <ul style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Acumula puntos en cada visita</li>
                  <li>Recibe promociones exclusivas</li>
                  <li>Accede a eventos especiales</li>
                  <li>Sube de nivel y obtén más beneficios</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; font-size: 13px; margin: 0 0 10px;">
                ¿Necesitas ayuda? Contáctanos
              </p>
              <p style="color: #666; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Negroni. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Negroni <onboarding@resend.dev>',
      to: [to],
      subject: `🎉 Tu Tarjeta de Membresía Negroni ${membershipType}`,
      html: emailHtml,
    })

    if (error) {
      console.error('🔴 [Email] Error sending email:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ [Email] Email sent successfully:', data?.id)
    return { success: true, emailId: data?.id }
  } catch (error: any) {
    console.error('🔴 [Email] Exception sending email:', error)
    return { success: false, error: error.message }
  }
}
