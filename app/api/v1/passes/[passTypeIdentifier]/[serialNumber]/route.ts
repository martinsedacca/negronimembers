import { createClient } from '@/lib/supabase/server'
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
    const supabase = await createClient()

    // Find the wallet pass by serial number and verify token
    const { data: walletPass, error: passError } = await supabase
      .from('wallet_passes')
      .select('*, members(*)')
      .eq('serial_number', serialNumber)
      .eq('authentication_token', authToken)
      .single()

    if (passError || !walletPass) {
      console.error('🔴 [Wallet] Pass not found or token invalid:', serialNumber)
      return NextResponse.json({ error: 'Pass not found' }, { status: 404 })
    }

    if (walletPass.voided) {
      console.log('⚠️ [Wallet] Pass is voided:', serialNumber)
      return NextResponse.json({ error: 'Pass voided' }, { status: 410 })
    }

    const member = walletPass.members
    if (!member) {
      console.error('🔴 [Wallet] Member not found for pass:', serialNumber)
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    console.log('✅ [Wallet] Generating updated pass for:', member.full_name)

    // Generate fresh pass with latest member data
    const passBuffer = await generateApplePass(member)

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
