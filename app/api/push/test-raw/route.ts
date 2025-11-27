import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Raw test using fetch directly to FCM (bypassing web-push library)
export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get subscription
    const { data: sub } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!sub) {
      return NextResponse.json({ error: 'No subscription' }, { status: 404 })
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!

    // Import web-push and send with minimal payload
    const webpush = require('web-push')
    webpush.setVapidDetails(
      'mailto:admin@negronimembers.com',
      vapidPublicKey,
      vapidPrivateKey
    )

    // Minimal payload - just a string
    const payload = 'Test'

    console.log('🧪 [Raw Test] Sending minimal push...')
    console.log('🧪 [Raw Test] Endpoint:', sub.endpoint)
    console.log('🧪 [Raw Test] p256dh:', sub.p256dh?.substring(0, 30))
    console.log('🧪 [Raw Test] auth:', sub.auth)

    const result = await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      },
      payload,
      {
        TTL: 60,
        urgency: 'high',
      }
    )

    console.log('🧪 [Raw Test] Result status:', result.statusCode)
    console.log('🧪 [Raw Test] Result headers:', result.headers)
    console.log('🧪 [Raw Test] Result body:', result.body)

    return NextResponse.json({
      success: true,
      statusCode: result.statusCode,
      headers: result.headers,
      body: result.body,
    })
  } catch (error: any) {
    console.error('🧪 [Raw Test] Error:', error)
    return NextResponse.json({
      error: error.message,
      statusCode: error.statusCode,
      body: error.body,
      headers: error.headers,
    }, { status: 500 })
  }
}
