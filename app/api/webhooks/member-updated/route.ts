/**
 * Webhook endpoint for automatic GHL sync when members are created/updated
 * This is called by Supabase trigger via Edge Function
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GHLSyncService } from '@/lib/services/ghl-sync'

export const dynamic = 'force-dynamic'

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE'
  table: string
  record: {
    id: string
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 [Webhook] Member updated webhook triggered')

    // Verify webhook secret (optional but recommended)
    const webhookSecret = request.headers.get('x-webhook-secret')
    const expectedSecret = process.env.WEBHOOK_SECRET

    if (expectedSecret && webhookSecret !== expectedSecret) {
      console.error('🔴 [Webhook] Invalid webhook secret')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload: WebhookPayload = await request.json()
    console.log('🔵 [Webhook] Payload:', payload)

    // Only process member updates
    if (payload.table !== 'members') {
      return NextResponse.json({ message: 'Not a member update' })
    }

    const supabase = await createClient()

    // Fetch GHL configuration
    const { data: config } = await supabase
      .from('system_config')
      .select('config_value')
      .in('config_key', ['ghl_api_token', 'ghl_location_id'])

    if (!config || config.length < 2) {
      console.log('⚠️ [Webhook] GHL not configured, skipping sync')
      return NextResponse.json({ 
        message: 'GHL not configured, sync skipped' 
      })
    }

    const ghlToken = config.find((c: any) => c.config_value.key === 'ghl_api_token')?.config_value.value
    const ghlLocationId = config.find((c: any) => c.config_value.key === 'ghl_location_id')?.config_value.value

    if (!ghlToken || !ghlLocationId) {
      console.log('⚠️ [Webhook] GHL credentials missing, skipping sync')
      return NextResponse.json({ 
        message: 'GHL credentials missing, sync skipped' 
      })
    }

    // Fetch member with stats
    const { data: member, error: memberError } = await supabase
      .from('member_stats')
      .select('*')
      .eq('id', payload.record.id)
      .single()

    if (memberError || !member) {
      console.error('🔴 [Webhook] Failed to fetch member:', memberError)
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    console.log('🔵 [Webhook] Syncing member:', member.email)

    // Sync to GHL
    const syncService = new GHLSyncService(ghlToken, ghlLocationId)
    const result = await syncService.syncMember({
      id: member.id,
      full_name: member.full_name,
      email: member.email,
      phone: member.phone,
      member_number: member.member_number,
      membership_type: member.membership_type,
      status: member.status,
      points: member.points || 0,
      joined_date: member.joined_date,
      total_visits: member.total_visits || 0,
      lifetime_spent: member.lifetime_spent || 0,
      last_visit: member.last_visit,
      average_purchase: member.average_purchase || 0,
    })

    console.log('🔵 [Webhook] Sync result:', result)

    // Log the sync
    await supabase.from('ghl_sync_log').insert({
      member_id: member.id,
      sync_type: payload.type === 'INSERT' ? 'create' : 'update',
      success: result.success,
      error_message: result.error || null,
      ghl_contact_id: result.contactId || null,
    })

    if (result.success) {
      return NextResponse.json({
        message: 'Member synced successfully',
        contact_id: result.contactId,
        created: result.created,
      })
    } else {
      return NextResponse.json(
        {
          error: 'Sync failed',
          details: result.error,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('🔴 [Webhook] Exception:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
