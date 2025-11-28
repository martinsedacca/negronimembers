import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Apple Wallet Protocol: POST /v1/log
 * Receives log messages from Apple Wallet for debugging
 * Apple sends error logs here when something fails
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log the messages from Apple Wallet
    console.log('📲 [Wallet Log] === APPLE WALLET ERROR LOG ===')
    console.log('📲 [Wallet Log] Received from Apple:', JSON.stringify(body, null, 2))
    console.log('📲 [Wallet Log] User-Agent:', request.headers.get('user-agent'))
    
    // Store in database for later analysis
    const supabase = await createClient()
    await supabase.from('wallet_request_logs').insert({
      method: 'POST',
      path: '/api/v1/log',
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      response_status: 200,
      error_message: 'Apple Wallet Log: ' + JSON.stringify(body?.logs || body)
    })
    
    // Apple expects 200 OK
    return NextResponse.json({}, { status: 200 })
  } catch (error: any) {
    console.error('🔴 [Wallet Log] Error:', error)
    return NextResponse.json({}, { status: 200 })
  }
}
