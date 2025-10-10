import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendBulkWalletPushNotifications } from '@/lib/services/wallet-push'

export async function POST(request: NextRequest) {
  try {
    console.log('📲 [Wallet Push] Starting notification send')
    
    const supabase = await createClient()
    const body = await request.json()
    
    console.log('📲 [Wallet Push] Request body:', JSON.stringify(body, null, 2))
    
    const { 
      title,
      message, 
      target_type = 'segment',
      target_filter = {},
      member_ids = []
    } = body

    if (!message) {
      console.error('🔴 [Wallet Push] Missing message')
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    console.log('📲 [Wallet Push] Preparing to send notification:', { title, message, target_type })

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from('wallet_push_notifications')
      .insert({
        title,
        message,
        target_type,
        target_filter,
      })
      .select()
      .single()

    if (notificationError) throw notificationError

    // Get push tokens based on target
    let tokensQuery = supabase
      .from('wallet_push_tokens')
      .select('push_token, member_id')
      .eq('is_active', true)

    // Use member_ids directly (frontend already filtered)
    if (member_ids.length > 0) {
      console.log(`📲 [Wallet Push] Filtering by ${member_ids.length} member IDs`)
      tokensQuery = tokensQuery.in('member_id', member_ids)
    } else if (target_type === 'all') {
      console.log('📲 [Wallet Push] Sending to all members')
      // No filter, send to all
    } else {
      console.log('⚠️ [Wallet Push] No member IDs provided and not sending to all')
      return NextResponse.json({
        success: false,
        message: 'No members specified',
      })
    }

    const { data: tokens, error: tokensError } = await tokensQuery

    if (tokensError) throw tokensError

    if (!tokens || tokens.length === 0) {
      console.log('⚠️ [Wallet Push] No active push tokens found')
      
      await supabase
        .from('wallet_push_notifications')
        .update({ 
          total_sent: 0,
          total_failed: 0,
        })
        .eq('id', notification.id)

      return NextResponse.json({
        success: false,
        message: 'No active wallet push tokens found',
      })
    }

    console.log(`📲 [Wallet Push] Sending to ${tokens.length} devices`)

    // Send notifications
    const pushTokens = tokens.map(t => t.push_token)
    const result = await sendBulkWalletPushNotifications(pushTokens, {
      title,
      message,
    })

    console.log(`✅ [Wallet Push] Results: ${result.sent} sent, ${result.failed} failed`)

    // Update notification stats
    await supabase
      .from('wallet_push_notifications')
      .update({
        total_sent: result.sent,
        total_failed: result.failed,
      })
      .eq('id', notification.id)

    // Mark failed tokens as inactive if they're invalid
    const invalidTokens = result.errors
      .filter(e => e.error.includes('Invalid') || e.error.includes('Unregistered'))
      .map(e => e.token)

    if (invalidTokens.length > 0) {
      console.log(`📲 [Wallet Push] Marking ${invalidTokens.length} tokens as inactive`)
      await supabase
        .from('wallet_push_tokens')
        .update({ is_active: false })
        .in('push_token', invalidTokens)
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
    console.error('❌ [Wallet Push] Error sending notifications:', error)
    console.error('❌ [Wallet Push] Error stack:', error.stack)
    console.error('❌ [Wallet Push] Error details:', JSON.stringify(error, null, 2))
    
    return NextResponse.json(
      { 
        error: 'Failed to send wallet push notifications', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
