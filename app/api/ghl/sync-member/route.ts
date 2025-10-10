import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { GHLSyncService } from '@/lib/services/ghl-sync'

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

    // Get GHL configuration
    const { data: config } = await supabase
      .from('system_config')
      .select('key, value')
      .in('key', ['ghl_api_token', 'ghl_location_id'])

    const configMap = config?.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {} as Record<string, string>)

    const ghlToken = configMap?.ghl_api_token || process.env.GHL_API_SECRET
    const ghlLocationId = configMap?.ghl_location_id || '8CuDDsReJB6uihox2LBw' // Default Doral

    if (!ghlToken) {
      return NextResponse.json(
        { 
          error: 'GHL API token not configured',
          details: 'Configure GHL_API_SECRET in environment or system_config'
        },
        { status: 400 }
      )
    }

    // Get member data with stats
    const { data: member, error: memberError } = await supabase
      .from('member_stats')
      .select('*')
      .eq('id', member_id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    console.log('🔵 [GHL Sync] Syncing member:', {
      member_id,
      name: member.full_name,
      email: member.email,
      tier: member.membership_type,
    })

    // Sync to GHL
    const ghlService = new GHLSyncService(ghlToken, ghlLocationId)
    const result = await ghlService.syncMember(member)

    if (!result.success) {
      throw new Error('Failed to sync member to GHL')
    }

    console.log('✅ [GHL Sync] Member synced successfully:', {
      contact_id: result.contactId,
      created: result.created,
    })

    // Log the sync action
    await supabase.from('ghl_sync_log').insert({
      member_id,
      contact_id: result.contactId,
      action: result.created ? 'create' : 'update',
      success: true,
      synced_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      contact_id: result.contactId,
      created: result.created,
      message: result.created 
        ? 'Contact created in GHL successfully'
        : 'Contact updated in GHL successfully',
    })
  } catch (error: any) {
    console.error('🔴 [GHL Sync] Error:', error)
    return NextResponse.json(
      {
        error: 'Error syncing member to GHL',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
