import { createClient } from '@/lib/supabase/server';
import { generateApplePass } from '@/lib/wallet/apple-wallet';
import { NextResponse } from 'next/server';

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

    // Generate the pass
    const passBuffer = await generateApplePass(member);

    // Save pass info to database
    const { error: passError } = await supabase
      .from('wallet_passes')
      .upsert({
        member_id: member.id,
        pass_type: 'apple',
        pass_id: `apple_${member.member_number}`,
        serial_number: member.member_number,
        pass_data: {
          generated_at: new Date().toISOString(),
          membership_type: member.membership_type,
          points: member.points,
        },
        last_updated: new Date().toISOString(),
      }, {
        onConflict: 'pass_id',
      });

    if (passError) {
      console.error('Error saving pass to database:', passError);
    }

    // Return the pass file
    return new NextResponse(passBuffer, {
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
