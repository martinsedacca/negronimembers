import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Register a device to receive push notifications for a pass
 * Apple Wallet Protocol: POST /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { deviceLibraryIdentifier: string; passTypeIdentifier: string; serialNumber: string } }
) {
  try {
    const { deviceLibraryIdentifier, serialNumber } = params
    const body = await request.json()
    const { pushToken } = body

    console.log('📲 [Wallet] Registering device:', {
      device: deviceLibraryIdentifier,
      serial: serialNumber,
      pushToken: pushToken?.substring(0, 20) + '...'
    })

    if (!pushToken) {
      return NextResponse.json(
        { error: 'pushToken is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find the wallet pass
    const { data: pass, error: passError } = await supabase
      .from('wallet_passes')
      .select('id, member_id, serial_number')
      .eq('serial_number', serialNumber)
      .single()

    if (passError || !pass) {
      console.error('🔴 [Wallet] Pass not found:', serialNumber)
      return NextResponse.json(
        { error: 'Pass not found' },
        { status: 404 }
      )
    }

    // Register or update push token using correct column names
    const { error: tokenError } = await supabase
      .from('wallet_push_tokens')
      .upsert({
        pass_serial_number: pass.serial_number,
        member_id: pass.member_id,
        device_library_identifier: deviceLibraryIdentifier,
        push_token: pushToken,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'device_library_identifier,pass_serial_number',
      })

    if (tokenError) {
      console.error('🔴 [Wallet] Error saving push token:', tokenError)
      throw tokenError
    }

    console.log('✅ [Wallet] Device registered successfully')

    // Apple expects 201 Created for first registration, 200 OK for updates
    return NextResponse.json({}, { status: 201 })
  } catch (error: any) {
    console.error('🔴 [Wallet] Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Unregister a device from receiving push notifications
 * Apple Wallet Protocol: DELETE /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { deviceLibraryIdentifier: string; passTypeIdentifier: string; serialNumber: string } }
) {
  try {
    const { deviceLibraryIdentifier, serialNumber } = params

    console.log('📲 [Wallet] Unregistering device:', {
      device: deviceLibraryIdentifier,
      serial: serialNumber
    })

    const supabase = await createClient()

    // Mark token as inactive using serial number directly
    await supabase
      .from('wallet_push_tokens')
      .update({ is_active: false })
      .eq('pass_serial_number', serialNumber)
      .eq('device_library_identifier', deviceLibraryIdentifier)

    console.log('✅ [Wallet] Device unregistered successfully')

    return NextResponse.json({}, { status: 200 })
  } catch (error: any) {
    console.error('🔴 [Wallet] Unregister error:', error)
    return NextResponse.json({}, { status: 200 }) // Apple expects 200 even on error
  }
}
