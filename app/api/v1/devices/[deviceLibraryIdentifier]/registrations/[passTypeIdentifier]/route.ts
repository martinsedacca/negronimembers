import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Apple Wallet Protocol: GET /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}
 * Returns serial numbers of passes that have been updated since the given tag
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { deviceLibraryIdentifier: string; passTypeIdentifier: string } }
) {
  try {
    const { deviceLibraryIdentifier } = params
    const passesUpdatedSince = request.nextUrl.searchParams.get('passesUpdatedSince')

    console.log('📲 [Wallet] Checking for updates:', {
      device: deviceLibraryIdentifier,
      since: passesUpdatedSince
    })

    const supabase = createServiceClient()

    // Get all active tokens for this device with their associated passes
    const { data: tokens, error: tokensError } = await supabase
      .from('wallet_push_tokens')
      .select('pass_serial_number, updated_at')
      .eq('device_library_identifier', deviceLibraryIdentifier)
      .eq('is_active', true)

    if (tokensError) {
      console.error('🔴 [Wallet] Error fetching tokens:', tokensError)
      throw tokensError
    }

    if (!tokens || tokens.length === 0) {
      console.log('⚠️ [Wallet] No registered passes for device')
      return new NextResponse(null, { status: 204 })
    }

    // Get the wallet passes for these serial numbers
    const serialNumbers = tokens.map(t => t.pass_serial_number).filter(Boolean)
    
    const { data: passes, error: passesError } = await supabase
      .from('wallet_passes')
      .select('serial_number, updated_at, voided')
      .in('serial_number', serialNumbers)

    if (passesError) {
      console.error('🔴 [Wallet] Error fetching passes:', passesError)
      throw passesError
    }

    // Filter passes updated since the given timestamp
    let updatedSerials: string[] = []
    let lastUpdated = new Date(0)

    for (const pass of passes || []) {
      if (pass.voided) continue

      const passUpdatedAt = new Date(pass.updated_at)
      
      // Track the latest update time
      if (passUpdatedAt > lastUpdated) {
        lastUpdated = passUpdatedAt
      }

      // If no tag provided or pass was updated after the tag
      if (!passesUpdatedSince || passUpdatedAt > new Date(passesUpdatedSince)) {
        updatedSerials.push(pass.serial_number)
      }
    }

    if (updatedSerials.length === 0) {
      console.log('✅ [Wallet] No updates available')
      return new NextResponse(null, { status: 204 })
    }

    console.log(`✅ [Wallet] ${updatedSerials.length} passes need update`)

    return NextResponse.json({
      serialNumbers: updatedSerials,
      lastUpdated: lastUpdated.toISOString()
    })
  } catch (error: any) {
    console.error('🔴 [Wallet] Check updates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
