import { NextRequest, NextResponse } from 'next/server'

/**
 * Apple Wallet Protocol: POST /v1/log
 * Receives log messages from Apple Wallet for debugging
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log the messages from Apple Wallet
    console.log('📲 [Wallet Log] Received from Apple:', JSON.stringify(body, null, 2))
    
    // Apple expects 200 OK
    return NextResponse.json({}, { status: 200 })
  } catch (error: any) {
    console.error('🔴 [Wallet Log] Error:', error)
    return NextResponse.json({}, { status: 200 })
  }
}
