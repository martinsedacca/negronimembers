import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// Google Wallet API configuration
const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '';

interface GoogleWalletCredentials {
  client_email: string;
  private_key: string;
}

function getCredentials(): GoogleWalletCredentials {
  const credentialsJson = process.env.GOOGLE_WALLET_CREDENTIALS;
  if (!credentialsJson) {
    throw new Error('GOOGLE_WALLET_CREDENTIALS is not configured');
  }
  return JSON.parse(credentialsJson);
}

async function getAccessToken(credentials: GoogleWalletCredentials): Promise<string> {
  const { SignJWT } = await import('jose');
  const privateKey = await importPrivateKey(credentials.private_key);
  
  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/wallet_object.issuer',
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(credentials.client_email)
    .setSubject(credentials.client_email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function importPrivateKey(pem: string) {
  const { importPKCS8 } = await import('jose');
  return importPKCS8(pem, 'RS256');
}

// Send message to a Google Wallet pass object
async function sendMessageToObject(
  objectId: string, 
  header: string, 
  body: string, 
  link: string | undefined,
  accessToken: string
): Promise<boolean> {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Build message body with optional link
  let messageBody = body;
  if (link) {
    messageBody += ` <a href="${link}">Ver más</a>`;
  }
  
  const message = {
    header: header,
    body: messageBody,
    id: messageId,
    messageType: 'TEXT_AND_NOTIFY',
  };

  const response = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/genericObject/${objectId}/addMessage`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error(`❌ [Google Wallet Push] Failed for ${objectId}:`, error);
    return false;
  }

  console.log(`✅ [Google Wallet Push] Message sent to ${objectId}`);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { header, body, link, member_ids } = await request.json();

    if (!header || !body) {
      return NextResponse.json(
        { error: 'Header and body are required' },
        { status: 400 }
      );
    }

    if (!member_ids || member_ids.length === 0) {
      return NextResponse.json(
        { error: 'No members specified' },
        { status: 400 }
      );
    }

    if (!ISSUER_ID) {
      return NextResponse.json(
        { error: 'Google Wallet is not configured' },
        { status: 500 }
      );
    }

    const supabase = createServiceClient();
    const credentials = getCredentials();
    const accessToken = await getAccessToken(credentials);

    // Get Google Wallet passes for the specified members
    const { data: walletPasses, error: passError } = await supabase
      .from('wallet_passes')
      .select('member_id, authentication_token')
      .in('member_id', member_ids)
      .eq('platform', 'google')
      .eq('voided', false);

    if (passError) {
      console.error('Error fetching wallet passes:', passError);
      return NextResponse.json(
        { error: 'Failed to fetch wallet passes' },
        { status: 500 }
      );
    }

    if (!walletPasses || walletPasses.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No members have Google Wallet installed',
        stats: { sent: 0, failed: 0, total: member_ids.length },
      });
    }

    console.log(`🤖 [Google Wallet Push] Sending to ${walletPasses.length} passes`);

    // Send messages to each pass
    let sent = 0;
    let failed = 0;

    for (const pass of walletPasses) {
      // The authentication_token stores the Google Wallet object ID
      const objectId = pass.authentication_token;
      
      if (!objectId) {
        failed++;
        continue;
      }

      try {
        const success = await sendMessageToObject(objectId, header, body, link, accessToken);
        if (success) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Error sending to ${objectId}:`, error);
        failed++;
      }
    }

    console.log(`🤖 [Google Wallet Push] Complete: ${sent} sent, ${failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Notifications sent to Google Wallet`,
      stats: {
        sent,
        failed,
        total: member_ids.length,
        googleWalletUsers: walletPasses.length,
      },
    });

  } catch (error: any) {
    console.error('🔴 [Google Wallet Push] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send Google Wallet notifications', details: error.message },
      { status: 500 }
    );
  }
}
