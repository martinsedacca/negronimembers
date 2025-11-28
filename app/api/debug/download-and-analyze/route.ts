import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import AdmZip from 'adm-zip'
import { generateApplePass } from '@/lib/wallet/apple-wallet'

/**
 * Debug endpoint that generates a pass and analyzes its content
 * This shows exactly what would be downloaded by a user
 */
export async function GET() {
  try {
    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Get the member
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('member_number', 'M-851115')
      .single()

    if (memberError || !member) {
      return NextResponse.json({ 
        error: 'Member not found', 
        details: memberError?.message 
      }, { status: 404 })
    }

    // Get existing pass to use the same auth token
    const { data: existingPass } = await supabase
      .from('wallet_passes')
      .select('*')
      .eq('member_id', member.id)
      .maybeSingle()

    const authToken = existingPass?.authentication_token || 'test-token-for-analysis'
    
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
