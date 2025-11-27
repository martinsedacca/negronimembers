import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendBulkPushNotifications } from '@/lib/services/push-notifications'

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 [Push] Starting push notification send')
    
    const supabase = await createClient()
    const body = await request.json()
    
    console.log('🔔 [Push] Request body:', JSON.stringify(body, null, 2))
    
    const { 
      title, 
      body: message, 
      url, 
      icon,
      target_type = 'segment',
      target_filter = {},
      member_ids = [],
      segment_name = null,
    } = body

    // Get current user (admin sending the notification)
    const { data: { user } } = await supabase.auth.getUser()

    if (!title || !message) {
      console.error('🔴 [Push] Missing title or message')
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      )
    }

    console.log('🔔 [Push] Preparing to send notification:', { title, target_type, target_filter })

    // Create notification record with reporting fields
    const { data: notification, error: notificationError } = await supabase
      .from('push_notifications')
      .insert({
        title,
        body: message,
        icon,
        url,
        target_type,
        target_filter,
        segment_name,
        segment_filters: target_filter,
        sent_by: user?.id || null,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (notificationError) throw notificationError

    // Get subscriptions based on target
    let subscriptionsQuery = supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true)

    // Use member_ids directly (frontend already filtered)
    if (member_ids.length > 0) {
      console.log(`🔔 [Push] Filtering by ${member_ids.length} member IDs`)
      subscriptionsQuery = subscriptionsQuery.in('member_id', member_ids)
    } else if (target_type === 'all') {
      console.log('🔔 [Push] Sending to all members')
      // No filter, send to all
    } else {
      console.log('⚠️ [Push] No member IDs provided and not sending to all')
      return NextResponse.json({
        success: false,
        message: 'No members specified',
      })
    }

    const { data: subscriptions, error: subError } = await subscriptionsQuery

    if (subError) throw subError

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️ [Push] No active subscriptions found')
      
      await supabase
        .from('push_notifications')
        .update({ 
          total_sent: 0,
          total_failed: 0,
        })
        .eq('id', notification.id)

      return NextResponse.json({
        success: false,
        message: 'No active subscriptions found',
      })
    }

    // Calculate unique members and total devices
    const uniqueMemberIds = [...new Set(subscriptions.map(s => s.member_id).filter(Boolean))]
    const totalMembers = uniqueMemberIds.length
    const totalDevices = subscriptions.length

    console.log(`🔔 [Push] Sending to ${totalMembers} members across ${totalDevices} devices`)

    // Send notifications
    const result = await sendBulkPushNotifications(
      subscriptions.map(sub => ({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      })),
      {
        title,
        body: message,
        url,
        icon,
      }
    )

    console.log(`✅ [Push] Results: ${result.sent} sent, ${result.failed} failed`)

    // Update notification stats
    await supabase
      .from('push_notifications')
      .update({
        total_sent: result.sent,
        total_failed: result.failed,
        total_members: totalMembers,
        total_devices: totalDevices,
        status: 'sent',
      })
      .eq('id', notification.id)

    // Helper to detect browser from endpoint
    const detectBrowser = (endpoint: string): { device_type: string, browser: string } => {
      if (endpoint.includes('push.apple.com')) {
        return { device_type: 'safari', browser: 'Safari (APNs)' }
      } else if (endpoint.includes('fcm.googleapis.com')) {
        return { device_type: 'chrome', browser: 'Chrome/Firefox (FCM)' }
      } else if (endpoint.includes('mozilla.com')) {
        return { device_type: 'firefox', browser: 'Firefox' }
      }
      return { device_type: 'unknown', browser: 'Unknown' }
    }

    // Log deliveries with device info
    const deliveries = subscriptions.map((sub) => {
      const error = result.errors.find(e => e.endpoint === sub.endpoint)
      const browserInfo = detectBrowser(sub.endpoint)
      return {
        notification_id: notification.id,
        subscription_id: sub.id,
        member_id: sub.member_id,
        device_type: browserInfo.device_type,
        browser: browserInfo.browser,
        status: error ? 'failed' : 'sent',
        error: error?.error || null,
        delivered_at: new Date().toISOString(),
      }
    })

    await supabase.from('push_notification_deliveries').insert(deliveries)

    // Mark expired subscriptions as inactive
    const expiredEndpoints = result.errors
      .filter(e => e.error === 'subscription_expired')
      .map(e => e.endpoint)

    if (expiredEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .in('endpoint', expiredEndpoints)
    }

    return NextResponse.json({
      success: true,
      notification_id: notification.id,
      stats: {
        total_members: totalMembers,
        total_devices: totalDevices,
        sent: result.sent,
        failed: result.failed,
      },
    })
  } catch (error: any) {
    console.error('❌ [Push] Error sending notifications:', error)
    console.error('❌ [Push] Error stack:', error.stack)
    console.error('❌ [Push] Error details:', JSON.stringify(error, null, 2))
    
    return NextResponse.json(
      { 
        error: 'Failed to send notifications', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
