import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import AdmZip from 'adm-zip'

export async function GET(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const supabase = await createClient()
    
    // Fetch member
    const { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('id', params.memberId)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Generate pass
    const { generateApplePass } = await import('@/lib/wallet/apple-wallet')
    const authToken = 'debug-token-12345'
    const passBuffer = await generateApplePass(member, authToken)

    // Extract pass.json from the .pkpass (which is a ZIP file)
    const zip = new AdmZip(passBuffer)
    const passJsonEntry = zip.getEntry('pass.json')
    
    if (!passJsonEntry) {
      return NextResponse.json({ error: 'pass.json not found in pkpass' }, { status: 500 })
    }

    const passJson = JSON.parse(passJsonEntry.getData().toString('utf8'))

    return NextResponse.json({
      hasWebServiceURL: !!passJson.webServiceURL,
      webServiceURL: passJson.webServiceURL,
      hasAuthToken: !!passJson.authenticationToken,
      authenticationToken: passJson.authenticationToken ? passJson.authenticationToken.substring(0, 10) + '...' : null,
      serialNumber: passJson.serialNumber,
      passTypeIdentifier: passJson.passTypeIdentifier,
      allKeys: Object.keys(passJson)
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
