import { createServiceClient } from '@/lib/supabase/service'
import { generateApplePass } from '@/lib/wallet/apple-wallet'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Apple Wallet Protocol: GET /v1/passes/{passTypeIdentifier}/{serialNumber}
 * Called by Apple Wallet to get the latest version of a pass
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { passTypeIdentifier: string; serialNumber: string } }
) {
  try {
    const { serialNumber } = params
    const authHeader = request.headers.get('Authorization')

    console.log('📲 [Wallet] Pass update request:', {
      serial: serialNumber,
      hasAuth: !!authHeader
    })

    // Validate authentication token
    if (!authHeader || !authHeader.startsWith('ApplePass ')) {
      console.error('🔴 [Wallet] Missing or invalid authorization')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authToken = authHeader.replace('ApplePass ', '')
    const supabase = createServiceClient()

    console.log('🔍 [Wallet] Looking for pass:', {
      serialNumber,
      authTokenPreview: authToken.substring(0, 20) + '...'
    })

    // First, find the pass by serial number to debug
    const { data: passCheck } = await supabase
      .from('wallet_passes')
      .select('id, serial_number, authentication_token, member_id')
      .eq('serial_number', serialNumber)
      .single()

    if (passCheck) {
      console.log('🔍 [Wallet] Pass found in DB:', {
        id: passCheck.id,
        serial: passCheck.serial_number,
        dbTokenPreview: passCheck.authentication_token?.substring(0, 20) + '...',
        tokenMatch: passCheck.authentication_token === authToken
      })
    } else {
      console.log('🔴 [Wallet] No pass found with serial:', serialNumber)
    }

    // Find the wallet pass by serial number and verify token
    const { data: walletPass, error: passError } = await supabase
      .from('wallet_passes')
      .select('*')
      .eq('serial_number', serialNumber)
      .eq('authentication_token', authToken)
      .single()

    if (passError || !walletPass) {
      console.error('🔴 [Wallet] Pass not found or token invalid:', serialNumber, passError?.message)
      return NextResponse.json({ error: 'Pass not found' }, { status: 404 })
    }

    console.log('🔍 [Wallet] Pass record:', {
      id: walletPass.id,
      member_id: walletPass.member_id,
      voided: walletPass.voided
    })

    if (walletPass.voided) {
      console.log('⚠️ [Wallet] Pass is voided:', serialNumber)
      return NextResponse.json({ error: 'Pass voided' }, { status: 410 })
    }

    // Fetch member separately using member_id
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', walletPass.member_id)
      .maybeSingle()

    console.log('🔍 [Wallet] Member query result:', {
      found: !!member,
      member_id: walletPass.member_id,
      error: memberError?.message || null
    })

    if (memberError) {
      console.error('🔴 [Wallet] Member query error:', memberError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!member) {
      console.error('🔴 [Wallet] Member not found for pass:', serialNumber, 'member_id:', walletPass.member_id)
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    console.log('✅ [Wallet] Generating updated pass for:', member.full_name)

    // Generate fresh pass with latest member data - pass the existing authToken
    const passBuffer = await generateApplePass(member, walletPass.authentication_token)

    // Update last_updated timestamp
    await supabase
      .from('wallet_passes')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', walletPass.id)

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(passBuffer)

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Last-Modified': new Date().toUTCString(),
      },
    })
  } catch (error: any) {
    console.error('🔴 [Wallet] Pass update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
