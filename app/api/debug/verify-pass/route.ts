import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import AdmZip from 'adm-zip'

/**
 * Debug endpoint to verify the exact content of a generated pass
 * This uses service role to bypass RLS
 */
export async function GET() {
  try {
    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Get the first member
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .limit(1)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'No members found', details: memberError?.message }, { status: 404 })
    }

    // Get existing pass info
    const { data: existingPass } = await supabase
      .from('wallet_passes')
      .select('*')
      .eq('member_id', member.id)
      .maybeSingle()

    // Generate pass with the same logic as the download endpoint
    const { generateApplePass } = await import('@/lib/wallet/apple-wallet')
    const authToken = existingPass?.authentication_token || 'test-token-12345'
    
    console.log('🔍 [Debug] Generating pass with authToken:', authToken.substring(0, 20) + '...')
    
    const passBuffer = await generateApplePass(member, authToken)

    // Extract pass.json from the .pkpass (which is a ZIP file)
    const zip = new AdmZip(passBuffer)
    const passJsonEntry = zip.getEntry('pass.json')
    
    if (!passJsonEntry) {
      return NextResponse.json({ error: 'pass.json not found in pkpass' }, { status: 500 })
    }

    const passJson = JSON.parse(passJsonEntry.getData().toString('utf8'))

    // Get all files in the pass
    const allFiles = zip.getEntries().map(e => ({
      name: e.entryName,
      size: e.header.size
    }))

    return NextResponse.json({
      member: {
        id: member.id,
        name: member.full_name,
        member_number: member.member_number
      },
      existingPassInDB: existingPass ? {
        has_auth_token: !!existingPass.authentication_token,
        auth_token_preview: existingPass.authentication_token?.substring(0, 20) + '...',
        created_at: existingPass.created_at
      } : null,
      passContent: {
        // Critical fields for push notifications
        webServiceURL: passJson.webServiceURL,
        authenticationToken: passJson.authenticationToken,
        hasWebServiceURL: !!passJson.webServiceURL,
        hasAuthToken: !!passJson.authenticationToken,
        
        // Other important fields
        passTypeIdentifier: passJson.passTypeIdentifier,
        teamIdentifier: passJson.teamIdentifier,
        serialNumber: passJson.serialNumber,
        
        // All keys for reference
        allTopLevelKeys: Object.keys(passJson)
      },
      filesInPass: allFiles,
      diagnosis: {
        canReceivePushNotifications: !!passJson.webServiceURL && !!passJson.authenticationToken,
        issue: !passJson.webServiceURL ? 'MISSING webServiceURL - Apple will NOT register this pass' :
               !passJson.authenticationToken ? 'MISSING authenticationToken - Apple will NOT register this pass' :
               'Pass appears correctly configured for push notifications'
      }
    })
  } catch (error: any) {
    console.error('Error in verify-pass:', error)
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
  }
}
