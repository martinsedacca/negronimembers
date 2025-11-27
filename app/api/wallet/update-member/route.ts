import { createClient } from '@/lib/supabase/server'
import { sendWalletPushNotification } from '@/lib/services/wallet-push'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Notifies Apple Wallet that a member's pass needs to be updated
 * This should be called whenever member data changes (points, tier, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const { member_id } = await request.json()

    if (!member_id) {
      return NextResponse.json(
        { error: 'member_id is required' },
        { status: 400 }
      )
    }

    console.log('📲 [Wallet Update] Triggering update for member:', member_id)

    const supabase = await createClient()

    // Get the member's wallet pass
    const { data: walletPass, error: passError } = await supabase
      .from('wallet_passes')
      .select('id, serial_number')
      .eq('member_id', member_id)
      .eq('voided', false)
      .maybeSingle()

    if (passError) throw passError

    if (!walletPass) {
      console.log('⚠️ [Wallet Update] No wallet pass found for member')
      return NextResponse.json({
        success: false,
        message: 'No wallet pass registered for this member'
      })
    }

    // Update the wallet_passes updated_at to trigger update check
    await supabase
      .from('wallet_passes')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', walletPass.id)

    // Get all active push tokens for this pass
    const { data: tokens, error: tokensError } = await supabase
      .from('wallet_push_tokens')
      .select('push_token')
      .eq('pass_id', walletPass.id)
      .eq('is_active', true)

    if (tokensError) throw tokensError

    if (!tokens || tokens.length === 0) {
      console.log('⚠️ [Wallet Update] No active push tokens for pass')
      return NextResponse.json({
        success: true,
        message: 'Pass updated but no devices to notify',
        devices_notified: 0
      })
    }

    // Send silent push to all registered devices
    // Apple Wallet will then call our /v1/passes endpoint to get the updated pass
    let successCount = 0
    let failCount = 0

    for (const token of tokens) {
      const result = await sendWalletPushNotification(token.push_token)
      if (result.success) {
        successCount++
      } else {
        failCount++
        // Mark invalid tokens as inactive
        if (result.error?.includes('Invalid') || result.error?.includes('Unregistered')) {
          await supabase
            .from('wallet_push_tokens')
            .update({ is_active: false })
            .eq('push_token', token.push_token)
        }
      }
    }

    console.log(`✅ [Wallet Update] Notified ${successCount} devices, ${failCount} failed`)

    return NextResponse.json({
      success: true,
      message: 'Update notifications sent',
      devices_notified: successCount,
      devices_failed: failCount
    })
  } catch (error: any) {
    console.error('🔴 [Wallet Update] Error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger wallet update', details: error.message },
      { status: 500 }
    )
  }
}
