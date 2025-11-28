import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateGoogleWalletUrl, isGoogleWalletConfigured } from '@/lib/wallet/google-wallet';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;

    // Check if Google Wallet is configured
    if (!isGoogleWalletConfigured()) {
      return NextResponse.json(
        { error: 'Google Wallet not configured', details: 'Missing GOOGLE_WALLET_ISSUER_ID or GOOGLE_WALLET_CREDENTIALS' },
        { status: 503 }
      );
    }

    // Get member data
    const supabase = await createClient();
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Generate the Google Wallet URL
    const walletUrl = await generateGoogleWalletUrl(member);

    return NextResponse.json({ url: walletUrl });
  } catch (error) {
    console.error('Error generating Google Wallet pass:', error);
    return NextResponse.json(
      { error: 'Failed to generate pass', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
