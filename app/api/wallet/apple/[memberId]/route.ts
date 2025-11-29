import { createClient } from '@/lib/supabase/server';
import { generateApplePass } from '@/lib/wallet/apple-wallet';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

const PASS_TYPE_IDENTIFIER = process.env.APPLE_WALLET_PASS_TYPE_ID || 'pass.com.negroni.membership';

// Generate a secure authentication token for the pass
function generateAuthToken(): string {
  return randomBytes(32).toString('hex');
}

export async function GET(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch member data
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', params.memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Check if pass already exists
    const { data: existingPass } = await supabase
      .from('wallet_passes')
      .select('id, authentication_token')
      .eq('member_id', member.id)
      .maybeSingle();

    // Use existing token or generate new one
    const authToken = existingPass?.authentication_token || generateAuthToken();

    console.log('🎫 [Wallet Download] === GENERATING PASS ===')
    console.log('🎫 [Wallet Download] Member:', member.full_name, member.member_number)
    console.log('🎫 [Wallet Download] AuthToken exists:', !!authToken)
    console.log('🎫 [Wallet Download] AuthToken preview:', authToken?.substring(0, 20) + '...')
    console.log('🎫 [Wallet Download] NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
    console.log('🎫 [Wallet Download] Expected webServiceURL:', `${process.env.NEXT_PUBLIC_APP_URL}/api/v1`)

    // Generate the pass with the auth token
    const passBuffer = await generateApplePass(member, authToken);
    
    console.log('🎫 [Wallet Download] Pass generated, size:', passBuffer.length, 'bytes')

    // Save pass info to database
    const { error: passError } = await supabase
      .from('wallet_passes')
      .upsert({
        member_id: member.id,
        platform: 'apple',
        pass_type_identifier: PASS_TYPE_IDENTIFIER,
        serial_number: member.member_number,
        authentication_token: authToken,
        voided: false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'member_id,platform',
      });

    if (passError) {
      console.error('Error saving pass to database:', passError);
    }

    console.log('✅ [Wallet] Pass generated for member:', member.full_name);

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(passBuffer);

    // Return the pass file
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="membership-${member.member_number}.pkpass"`,
        'Content-Length': passBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error in Apple Wallet endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate pass',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
