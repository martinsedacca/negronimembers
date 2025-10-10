import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { member_id, email, phone, full_name } = body

    if (!member_id) {
      return NextResponse.json(
        { error: 'member_id is required' },
        { status: 400 }
      )
    }

    // Get webhook URL from system config
    const { data: config } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'ghl_webhook_url')
      .single()

    const webhookUrl = config?.value

    if (!webhookUrl) {
      return NextResponse.json(
        { 
          error: 'Webhook no configurado', 
          details: 'Configura la URL del webhook de GoHighLevel en Configuración' 
        },
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

    // Prepare card URL
    const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cards/${member_id}`

    // Prepare webhook payload
    const webhookPayload = {
      event: 'send_membership_card',
      timestamp: new Date().toISOString(),
      member: {
        id: member.id,
        member_number: member.member_number,
        full_name: member.full_name,
        email: member.email,
        phone: member.phone,
        membership_type: member.membership_type,
        points: member.points,
      },
      card_url: cardUrl,
      qr_code_url: cardUrl, // Same URL, GHL can generate QR if needed
    }

    console.log('🔵 [Send Card] Sending webhook to GHL:', {
      url: webhookUrl,
      member_id,
      email,
    })

    // Send webhook to GoHighLevel
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('🔴 [Send Card] Webhook failed:', errorText)
      throw new Error(`Webhook failed: ${webhookResponse.status} - ${errorText}`)
    }

    console.log('✅ [Send Card] Webhook sent successfully')

    // Log the action
    await supabase.from('card_usage').insert({
      member_id,
      event_type: 'event',
      amount_spent: 0,
      points_earned: 0,
      notes: `Tarjeta digital enviada a ${email || phone}`,
    })

    return NextResponse.json({
      success: true,
      message: 'Tarjeta enviada exitosamente',
      card_url: cardUrl,
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
