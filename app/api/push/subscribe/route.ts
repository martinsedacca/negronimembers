import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { subscription, member_id, user_agent, device_name } = body

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    // Store the subscription
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        member_id: member_id || null,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        user_agent,
        device_name,
        is_active: true,
        last_used_at: new Date().toISOString(),
      }, {
        onConflict: 'endpoint',
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ Push subscription registered:', data.id)

    return NextResponse.json({
      success: true,
      subscription_id: data.id,
    })
  } catch (error: any) {
    console.error('❌ Error registering push subscription:', error)
    return NextResponse.json(
      { error: 'Failed to register subscription', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      )
    }

    // Mark subscription as inactive
    const { error } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('endpoint', endpoint)

    if (error) throw error

    console.log('✅ Push subscription unregistered:', endpoint)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error unregistering push subscription:', error)
    return NextResponse.json(
      { error: 'Failed to unregister subscription', details: error.message },
      { status: 500 }
    )
  }
}
