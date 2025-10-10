import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { GHLSyncService } from '@/lib/services/ghl-sync'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { active_only = true } = body

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
    const ghlLocationId = configMap?.ghl_location_id || '8CuDDsReJB6uihox2LBw'

    if (!ghlToken) {
      return NextResponse.json(
        { 
          error: 'GHL API token not configured',
          details: 'Configure GHL_API_SECRET in environment or system_config'
        },
        { status: 400 }
      )
    }

    // Get all members with stats
    let query = supabase.from('member_stats').select('*')
    
    if (active_only) {
      query = query.eq('status', 'active')
    }

    const { data: members, error: membersError } = await query

    if (membersError) {
      throw membersError
    }

    if (!members || members.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No members to sync',
        results: {
          total: 0,
          synced: 0,
          created: 0,
          updated: 0,
          failed: 0,
        }
      })
    }

    console.log(`🔵 [GHL Sync All] Starting sync for ${members.length} members...`)

    // Sync all members
    const ghlService = new GHLSyncService(ghlToken, ghlLocationId)
    const results = await ghlService.syncMembers(members)

    console.log('✅ [GHL Sync All] Sync completed:', results)

    // Log bulk sync
    await supabase.from('ghl_sync_log').insert({
      member_id: null,
      action: 'bulk_sync',
      success: true,
      synced_at: new Date().toISOString(),
      metadata: results,
    })

    return NextResponse.json({
      success: true,
      message: `Synced ${results.synced} of ${results.total} members`,
      results,
    })
  } catch (error: any) {
    console.error('🔴 [GHL Sync All] Error:', error)
    return NextResponse.json(
      {
        error: 'Error syncing members to GHL',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
