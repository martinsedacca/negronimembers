import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendMembershipCardEmail } from '@/lib/services/email'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { member_id } = body

    if (!member_id) {
      return NextResponse.json(
        { error: 'member_id is required' },
        { status: 400 }
      )
    }

    // Get member full data
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', member_id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Miembro no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el miembro tenga email
    if (!member.email) {
      return NextResponse.json(
        { error: 'El miembro no tiene email registrado' },
        { status: 400 }
      )
    }

    console.log('📧 [Send Card] Sending card to:', member.email)

    // Prepare card URL - Link directo para instalar en Apple Wallet (sin login requerido)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const walletPassUrl = `${baseUrl}/api/wallet/apple/${member_id}`

    // Generate QR Code
    let qrCodeDataUrl: string | undefined
    try {
      qrCodeDataUrl = await QRCode.toDataURL(walletPassUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
    } catch (error) {
      console.error('⚠️ [Send Card] Error generating QR code:', error)
      // Continue without QR code
    }

    // Send email
    const emailResult = await sendMembershipCardEmail({
      to: member.email,
      memberName: member.full_name,
      memberNumber: member.member_number,
      membershipType: member.membership_type,
      walletPassUrl,
      qrCodeDataUrl,
    })

    if (!emailResult.success) {
      console.error('🔴 [Send Card] Email failed:', emailResult.error)
      throw new Error(`Error al enviar email: ${emailResult.error}`)
    }

    console.log('✅ [Send Card] Email sent successfully')

    // Log the action
    await supabase.from('card_usage').insert({
      member_id,
      event_type: 'event',
      amount_spent: 0,
      points_earned: 0,
      notes: `Tarjeta digital enviada a ${member.email}`,
    })

    return NextResponse.json({
      success: true,
      message: `Tarjeta enviada exitosamente a ${member.email}`,
      wallet_pass_url: walletPassUrl,
      email_id: emailResult.emailId,
    })
  } catch (error: any) {
    console.error('🔴 [Send Card] Error:', error)
    return NextResponse.json(
      {
        error: 'Error al enviar tarjeta',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
