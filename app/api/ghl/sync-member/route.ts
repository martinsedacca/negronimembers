import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { GHLSyncService } from '@/lib/services/ghl-sync'

export async function POST(request: NextRequest) {
  const logs: string[] = []
  const log = (message: string) => {
    console.log(message)
    logs.push(message)
  }
  
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { member_id } = body

    log('🔵 [GHL Sync] Starting sync for member: ' + member_id)

    if (!member_id) {
      return NextResponse.json(
        { error: 'member_id is required' },
        { status: 400 }
      )
    }

    // Get GHL configuration
    log('🔵 [GHL Sync] Fetching GHL config...')
    const { data: config, error: configError } = await supabase
      .from('system_config')
      .select('key, value')
      .in('key', ['ghl_api_token', 'ghl_location_id'])

    if (configError) {
      log('🔴 [GHL Sync] Config error: ' + configError.message)
      throw new Error(`Config fetch failed: ${configError.message}`)
    }

    const configMap = config?.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {} as Record<string, string>)

    const ghlToken = configMap?.ghl_api_token || process.env.GHL_API_SECRET
    const ghlLocationId = configMap?.ghl_location_id || '8CuDDsReJB6uihox2LBw'

    log(`🔵 [GHL Sync] Config loaded: hasToken=${!!ghlToken}, locationId=${ghlLocationId}, tokenSource=${configMap?.ghl_api_token ? 'database' : 'env'}`)

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
    log('🔵 [GHL Sync] Fetching member data...')
    const { data: member, error: memberError } = await supabase
      .from('member_stats')
      .select('*')
      .eq('id', member_id)
      .single()

    if (memberError) {
      log('🔴 [GHL Sync] Member fetch error: ' + memberError.message)
      throw new Error(`Member fetch failed: ${memberError.message}`)
    }

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    log(`🔵 [GHL Sync] Member data loaded: ${member.full_name} (${member.email})`)

    // Check if we already have a GHL contact ID stored
    const { data: memberRecord } = await supabase
      .from('members')
      .select('ghl_contact_id')
      .eq('id', member_id)
      .single()
    
    let existingContactId = memberRecord?.ghl_contact_id || null
    log(`🔵 [GHL Sync] Stored GHL contact ID: ${existingContactId || 'None'}`)
    
    // If no stored ID, try to find it from the last successful sync
    if (!existingContactId) {
      const { data: lastSync } = await supabase
        .from('ghl_sync_log')
        .select('contact_id')
        .eq('member_id', member_id)
        .eq('success', true)
        .not('contact_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (lastSync?.contact_id) {
        existingContactId = lastSync.contact_id
        log(`🔵 [GHL Sync] Found contact ID from sync log: ${existingContactId}`)
        // Save it to the member record for future use
        await supabase
          .from('members')
          .update({ ghl_contact_id: existingContactId })
          .eq('id', member_id)
      }
    }

    // Sync to GHL
    log('🔵 [GHL Sync] Calling GHL API...')
    const ghlService = new GHLSyncService(ghlToken, ghlLocationId)
    const result = await ghlService.syncMember(member, existingContactId)

    log('🔵 [GHL Sync] API call result: ' + JSON.stringify(result))

    if (!result.success) {
      const errorDetail = result.error || 'Unknown error'
      log('🔴 [GHL Sync] Sync failed: ' + errorDetail)
      throw new Error(`Failed to sync member to GHL: ${errorDetail}`)
    }

    log(`✅ [GHL Sync] Member synced successfully: contact_id=${result.contactId}, created=${result.created}`)

    // Save GHL contact ID to database
    if (result.contactId && result.contactId !== existingContactId) {
      log(`🔵 [GHL Sync] Saving contact ID to database: ${result.contactId}`)
      await supabase
        .from('members')
        .update({ ghl_contact_id: result.contactId })
        .eq('id', member_id)
    }

    // Log the sync action (don't fail if this fails)
    try {
      console.log('🔵 [GHL Sync] Logging to ghl_sync_log...')
      await supabase.from('ghl_sync_log').insert({
        member_id,
        contact_id: result.contactId,
        action: result.created ? 'create' : 'update',
        success: true,
        synced_at: new Date().toISOString(),
      })
    } catch (logError: any) {
      console.error('⚠️ [GHL Sync] Failed to log sync (non-critical):', logError.message)
    }

    return NextResponse.json({
      success: true,
      contact_id: result.contactId,
      created: result.created,
      message: result.created 
        ? 'Contact created in GHL successfully'
        : 'Contact updated in GHL successfully',
      logs,
    })
  } catch (error: any) {
    log('🔴 [GHL Sync] Error: ' + error.message)
    console.error('🔴 [GHL Sync] Error stack:', error.stack)
    return NextResponse.json(
      {
        error: 'Error syncing member to GHL',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        logs,
      },
      { status: 500 }
    )
  }
}
