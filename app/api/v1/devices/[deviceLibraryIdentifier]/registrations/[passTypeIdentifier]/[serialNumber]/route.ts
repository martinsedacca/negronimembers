import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Helper to log requests to database
async function logRequest(
  supabase: any,
  method: string,
  path: string,
  request: NextRequest,
  body: any,
  responseStatus: number,
  errorMessage?: string
) {
  try {
    await supabase.from('wallet_request_logs').insert({
      method,
      path,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      response_status: responseStatus,
      error_message: errorMessage
    })
  } catch (e) {
    console.error('Failed to log request:', e)
  }
}

/**
 * Register a device to receive push notifications for a pass
 * Apple Wallet Protocol: POST /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { deviceLibraryIdentifier: string; passTypeIdentifier: string; serialNumber: string } }
) {
  const supabase = await createClient()
  const path = request.nextUrl.pathname
  let body: any = {}
  
  try {
    const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = params
    
    // Clone request to read body (can only read once)
    const clonedRequest = request.clone()
    try {
      body = await clonedRequest.json()
    } catch {
      body = {}
    }
    
    const { pushToken } = body

    console.log('📲 [Wallet] === DEVICE REGISTRATION REQUEST ===' )
    console.log('📲 [Wallet] Path:', path)
    console.log('📲 [Wallet] Device:', deviceLibraryIdentifier)
    console.log('📲 [Wallet] PassType:', passTypeIdentifier)
    console.log('📲 [Wallet] Serial:', serialNumber)
    console.log('📲 [Wallet] PushToken:', pushToken?.substring(0, 30) + '...')
    console.log('📲 [Wallet] Auth Header:', request.headers.get('authorization')?.substring(0, 30) + '...')
    console.log('📲 [Wallet] User-Agent:', request.headers.get('user-agent'))

    if (!pushToken) {
      console.error('🔴 [Wallet] No pushToken in request body!')
      await logRequest(supabase, 'POST', path, request, body, 400, 'pushToken is required')
      return NextResponse.json(
        { error: 'pushToken is required' },
        { status: 400 }
      )
    }

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

    // Mark member as having wallet push enabled
    await supabase
      .from('members')
      .update({ 
        has_wallet_push: true,
        wallet_push_registered_at: new Date().toISOString()
      })
      .eq('id', pass.member_id)

    console.log('✅ [Wallet] Device registered successfully for member:', pass.member_id)
    
    // Log successful registration
    await logRequest(supabase, 'POST', path, request, body, 201)

    // Apple expects 201 Created for first registration, 200 OK for updates
    return NextResponse.json({}, { status: 201 })
  } catch (error: any) {
    console.error('🔴 [Wallet] Registration error:', error)
    await logRequest(supabase, 'POST', path, request, body, 500, error?.message)
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
  const supabase = await createClient()
  const path = request.nextUrl.pathname
  
  try {
    const { deviceLibraryIdentifier, serialNumber } = params

    console.log('📲 [Wallet] === DEVICE UNREGISTRATION REQUEST ===')
    console.log('📲 [Wallet] Path:', path)
    console.log('📲 [Wallet] Device:', deviceLibraryIdentifier)
    console.log('📲 [Wallet] Serial:', serialNumber)

    // Mark token as inactive using serial number directly
    await supabase
      .from('wallet_push_tokens')
      .update({ is_active: false })
      .eq('pass_serial_number', serialNumber)
      .eq('device_library_identifier', deviceLibraryIdentifier)

    // Check if member has any other active tokens
    const { data: activeTokens } = await supabase
      .from('wallet_push_tokens')
      .select('id, member_id')
      .eq('pass_serial_number', serialNumber)
      .eq('is_active', true)

    // If no more active tokens, update member status
    if (!activeTokens || activeTokens.length === 0) {
      // Get member_id from the pass
      const { data: pass } = await supabase
        .from('wallet_passes')
        .select('member_id')
        .eq('serial_number', serialNumber)
        .single()

      if (pass?.member_id) {
        await supabase
          .from('members')
          .update({ 
            has_wallet_push: false,
            wallet_push_unregistered_at: new Date().toISOString()
          })
          .eq('id', pass.member_id)
        
        console.log('📲 [Wallet] Member wallet push disabled:', pass.member_id)
      }
    }

    console.log('✅ [Wallet] Device unregistered successfully')
    await logRequest(supabase, 'DELETE', path, request, {}, 200)

    return NextResponse.json({}, { status: 200 })
  } catch (error: any) {
    console.error('🔴 [Wallet] Unregister error:', error)
    await logRequest(supabase, 'DELETE', path, request, {}, 200, error?.message)
    return NextResponse.json({}, { status: 200 }) // Apple expects 200 even on error
  }
}
