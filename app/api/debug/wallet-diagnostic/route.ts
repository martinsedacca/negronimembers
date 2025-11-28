import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Comprehensive Apple Wallet diagnostic endpoint
 * Visit: https://www.negronimembers.com/api/debug/wallet-diagnostic
 */
export async function GET() {
  const supabase = await createClient()
  
  // Get wallet passes
  const { data: passes, error: passesError } = await supabase
    .from('wallet_passes')
    .select('*, members(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(10)
  
  // Get push tokens
  const { data: tokens, error: tokensError } = await supabase
    .from('wallet_push_tokens')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  
  // Get incoming requests log (if exists)
  const { data: requestLogs } = await supabase
    .from('wallet_request_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)
  
  const webServiceURL = `${process.env.NEXT_PUBLIC_APP_URL}/api`
  const passTypeId = process.env.APPLE_WALLET_PASS_TYPE_ID || 'pass.com.onetimeleads.negroni'
  
  // Check if we have real tokens (not test data)
  const realTokens = tokens?.filter(t => 
    t.device_library_identifier !== 'test' && 
    t.device_library_identifier !== 'martin-iphone-manual' &&
    t.push_token?.length > 30
  ) || []
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    
    configuration: {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      webServiceURL: webServiceURL,
      passTypeId: passTypeId,
      expectedEndpoints: {
        note: 'Apple adds /v1/ prefix to all paths',
        register: `POST ${webServiceURL}/v1/devices/{deviceId}/registrations/${passTypeId}/{serialNumber}`,
        unregister: `DELETE ${webServiceURL}/v1/devices/{deviceId}/registrations/${passTypeId}/{serialNumber}`,
        getUpdates: `GET ${webServiceURL}/v1/devices/{deviceId}/registrations/${passTypeId}`,
        getPass: `GET ${webServiceURL}/v1/passes/${passTypeId}/{serialNumber}`,
        log: `POST ${webServiceURL}/v1/log`
      }
    },
    
    status: {
      totalPasses: passes?.length || 0,
      totalTokens: tokens?.length || 0,
      realTokensFromApple: realTokens.length,
      appleHasCalledEndpoint: realTokens.length > 0,
      passesError: passesError?.message,
      tokensError: tokensError?.message
    },
    
    passes: passes?.map(p => ({
      serial_number: p.serial_number,
      member: (p.members as any)?.full_name,
      has_auth_token: !!p.authentication_token,
      auth_token_preview: p.authentication_token?.substring(0, 10) + '...',
      created_at: p.created_at,
      updated_at: p.updated_at
    })),
    
    tokens: tokens?.map(t => ({
      device_id_preview: t.device_library_identifier?.substring(0, 20) + (t.device_library_identifier?.length > 20 ? '...' : ''),
      push_token_preview: t.push_token?.substring(0, 20) + (t.push_token?.length > 20 ? '...' : ''),
      is_real_token: t.device_library_identifier !== 'test' && t.device_library_identifier !== 'martin-iphone-manual',
      is_active: t.is_active,
      created_at: t.created_at
    })),
    
    requestLogs: requestLogs?.map(log => ({
      method: log.method,
      path: log.path,
      user_agent: log.user_agent?.substring(0, 50) + '...',
      response_status: log.response_status,
      error_message: log.error_message,
      created_at: log.created_at
    })) || [],
    
    diagnosis: {
      issue: realTokens.length === 0 ? 'Apple has NOT called the registration endpoint' : 'Apple HAS registered at least one device',
      possibleCauses: realTokens.length === 0 ? [
        '1. Pass was tested on iOS Simulator (simulators do NOT register for push)',
        '2. The passTypeIdentifier in the pass does not match the signing certificate',
        '3. The webServiceURL is not reachable from the internet',
        '4. The pass was installed but there was an error validating the signature',
        '5. The device does not have network connectivity when adding the pass'
      ] : [],
      nextSteps: realTokens.length === 0 ? [
        'Test on a REAL iPhone device (not simulator)',
        'Remove the pass from wallet and re-add it',
        'Check Vercel logs for any incoming requests to /api/v1/',
        'Verify the passTypeIdentifier matches your Apple Developer certificate'
      ] : ['System is working correctly!']
    }
  }, {
    headers: {
      'Cache-Control': 'no-cache'
    }
  })
}
