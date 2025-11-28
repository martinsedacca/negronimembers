import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '';
    const CLASS_ID = `${ISSUER_ID}.negroni_membership`;

    // Get member data
    const supabase = await createClient();
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const objectId = `${ISSUER_ID}.${member.id.replace(/-/g, '_')}`;

    return NextResponse.json({
      issuer_id: ISSUER_ID,
      class_id: CLASS_ID,
      object_id: objectId,
      member: {
        id: member.id,
        full_name: member.full_name,
        member_number: member.member_number,
        membership_type: member.membership_type,
      },
      credentials_configured: !!process.env.GOOGLE_WALLET_CREDENTIALS,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
