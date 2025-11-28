import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import AdmZip from 'adm-zip'
import { generateApplePass } from '@/lib/wallet/apple-wallet'

/**
 * Debug endpoint that generates a pass and analyzes its content
 * This shows exactly what would be downloaded by a user
 */
export async function GET() {
  try {
    // Use service role if available, otherwise use anon key
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseKey) {
      return NextResponse.json({ error: 'No Supabase key available' }, { status: 500 })
    }
    
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey
    )
    
    // Try to get a member from the database
    let member: any = null
    let existingPass: any = null
    let authToken = 'test-token-for-debug-12345'
    
    const { data: members } = await supabase
      .from('members')
      .select('*')
      .limit(1)

    if (members && members.length > 0) {
      member = members[0]
      
      // Try to get existing pass
      const { data: pass } = await supabase
        .from('wallet_passes')
        .select('*')
        .eq('member_id', member.id)
        .maybeSingle()
      
      existingPass = pass
      authToken = pass?.authentication_token || authToken
    } else {
      // Use mock member data for testing
      member = {
        id: 'test-member-id',
        full_name: 'Test Member',
        member_number: 'M-000000',
        email: 'test@example.com',
        membership_type: 'Member',
        status: 'active',
        points: 0,
        joined_date: new Date().toISOString()
      }
    }
    
    console.log('🔍 [Debug Analyze] Generating pass...')
    console.log('🔍 [Debug Analyze] Using authToken:', authToken.substring(0, 20) + '...')
    console.log('🔍 [Debug Analyze] NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
    
    // Generate the pass
    const passBuffer = await generateApplePass(member, authToken)
    
    console.log('🔍 [Debug Analyze] Pass generated, size:', passBuffer.length)

    // Extract and analyze pass.json
    const zip = new AdmZip(passBuffer)
    const passJsonEntry = zip.getEntry('pass.json')
    
    if (!passJsonEntry) {
      return NextResponse.json({ error: 'pass.json not found in generated pkpass' }, { status: 500 })
    }

    const passJson = JSON.parse(passJsonEntry.getData().toString('utf8'))
    
    // List all files
    const allFiles = zip.getEntries().map(e => e.entryName)

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        name: member.full_name,
        member_number: member.member_number
      },
      existingPassInDB: existingPass ? {
        id: existingPass.id,
        auth_token_preview: existingPass.authentication_token?.substring(0, 20) + '...',
        created_at: existingPass.created_at
      } : null,
      
      // THE CRITICAL FIELDS
      passAnalysis: {
        webServiceURL: passJson.webServiceURL || '❌ MISSING!',
        authenticationToken: passJson.authenticationToken ? '✅ Present' : '❌ MISSING!',
        authTokenPreview: passJson.authenticationToken?.substring(0, 20) + '...',
        
        hasWebServiceURL: !!passJson.webServiceURL,
        hasAuthToken: !!passJson.authenticationToken,
        
        passTypeIdentifier: passJson.passTypeIdentifier,
        serialNumber: passJson.serialNumber,
        teamIdentifier: passJson.teamIdentifier,
      },
      
      allKeysInPass: Object.keys(passJson),
      filesInPkpass: allFiles,
      
      verdict: {
        canReceivePushNotifications: !!passJson.webServiceURL && !!passJson.authenticationToken,
        issue: !passJson.webServiceURL 
          ? '🔴 CRITICAL: webServiceURL is MISSING - Apple will NEVER register this pass'
          : !passJson.authenticationToken 
            ? '🔴 CRITICAL: authenticationToken is MISSING - Apple will NEVER register this pass'
            : '✅ Pass is correctly configured for push notifications'
      },
      
      appleWillCall: {
        registerEndpoint: passJson.webServiceURL 
          ? `POST ${passJson.webServiceURL}/v1/devices/{deviceId}/registrations/${passJson.passTypeIdentifier}/${passJson.serialNumber}`
          : 'N/A - webServiceURL missing',
        logEndpoint: passJson.webServiceURL
          ? `POST ${passJson.webServiceURL}/v1/log`
          : 'N/A - webServiceURL missing',
        authTokenLength: passJson.authenticationToken?.length || 0,
        authTokenValid: (passJson.authenticationToken?.length || 0) >= 16,
        note: 'authenticationToken must be at least 16 characters'
      }
    })
  } catch (error: any) {
    console.error('Error in download-and-analyze:', error)
    return NextResponse.json({ 
      error: error.message, 
      stack: error.stack 
    }, { status: 500 })
  }
}
