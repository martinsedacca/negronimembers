import { NextResponse } from 'next/server';
import { isGoogleWalletConfigured } from '@/lib/wallet/google-wallet';

export async function GET() {
  const configured = isGoogleWalletConfigured();
  const hasIssuerId = !!process.env.GOOGLE_WALLET_ISSUER_ID;
  const hasCredentials = !!process.env.GOOGLE_WALLET_CREDENTIALS;
  
  return NextResponse.json({
    configured,
    hasIssuerId,
    hasCredentials,
    issuerId: process.env.GOOGLE_WALLET_ISSUER_ID ? 'set' : 'missing',
  });
}
