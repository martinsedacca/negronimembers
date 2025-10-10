import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendBulkPushNotifications } from '@/lib/services/push-notifications'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { 
      title, 
      body: message, 
      url, 
      icon,
      target_type = 'segment',
      target_filter = {},
      member_ids = []
    } = body

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      )
    }

    console.log('🔔 [Push] Preparing to send notification:', { title, target_type })

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from('push_notifications')
      .insert({
        title,
        body: message,
        icon,
        url,
        target_type,
        target_filter,
      })
      .select()
      .single()

    if (notificationError) throw notificationError

    // Get subscriptions based on target
    let subscriptionsQuery = supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true)

    if (target_type === 'individual' && member_ids.length > 0) {
      subscriptionsQuery = subscriptionsQuery.in('member_id', member_ids)
    } else if (target_type === 'segment' && Object.keys(target_filter).length > 0) {
      // Get member IDs that match the filter
      const { data: filteredMembers } = await supabase
        .from('member_stats')
        .select('id')
        .match(target_filter)

      if (filteredMembers && filteredMembers.length > 0) {
        const memberIds = filteredMembers.map(m => m.id)
        subscriptionsQuery = subscriptionsQuery.in('member_id', memberIds)
      } else {
        console.log('⚠️ [Push] No members found matching filter')
        return NextResponse.json({
          success: false,
          message: 'No members found matching filter',
        })
      }
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

    console.log(`🔔 [Push] Sending to ${subscriptions.length} subscriptions`)

    // Send notifications
    const result = await sendBulkPushNotifications(
      subscriptions.map(sub => ({
        endpoint: sub.endpoint,
        keys: sub.keys,
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
      })
      .eq('id', notification.id)

    // Log deliveries
    const deliveries = subscriptions.map((sub, index) => {
      const error = result.errors.find(e => e.endpoint === sub.endpoint)
      return {
        notification_id: notification.id,
        subscription_id: sub.id,
        member_id: sub.member_id,
        status: error ? 'failed' : 'sent',
        error_message: error?.error,
        sent_at: new Date().toISOString(),
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
        total: result.total,
        sent: result.sent,
        failed: result.failed,
      },
    })
  } catch (error: any) {
    console.error('❌ [Push] Error sending notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications', details: error.message },
      { status: 500 }
    )
  }
}
