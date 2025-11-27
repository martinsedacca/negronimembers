import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

// Test endpoint to debug push notifications
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get VAPID config
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@negroni.com'

    console.log('🔧 [Push Test] VAPID Config:', {
      publicKeyLength: vapidPublicKey?.length,
      privateKeyLength: vapidPrivateKey?.length,
      subject: vapidSubject,
    })

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({
        error: 'VAPID keys not configured',
        publicKey: !!vapidPublicKey,
        privateKey: !!vapidPrivateKey,
      }, { status: 500 })
    }

    // Configure webpush
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

    // Get the latest subscription
    const { data: subscription, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !subscription) {
      return NextResponse.json({
        error: 'No subscription found',
        details: error?.message,
      }, { status: 404 })
    }

    console.log('🔧 [Push Test] Subscription:', {
      id: subscription.id,
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      p256dh: subscription.p256dh?.substring(0, 20) + '...',
      auth: subscription.auth?.substring(0, 10) + '...',
    })

    // Build subscription object
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    }

    // Send test notification
    const payload = JSON.stringify({
      title: '🧪 Test Notification',
      body: 'If you see this, push notifications work!',
    })

    console.log('🔧 [Push Test] Sending notification...')
    
    const result = await webpush.sendNotification(pushSubscription, payload)
    
    console.log('🔧 [Push Test] Result:', result)

    return NextResponse.json({
      success: true,
      message: 'Push notification sent!',
      statusCode: result.statusCode,
    })
  } catch (error: any) {
    console.error('🔧 [Push Test] Error:', error)
    
    return NextResponse.json({
      error: 'Failed to send push',
      message: error.message,
      statusCode: error.statusCode,
      body: error.body,
    }, { status: 500 })
  }
}
