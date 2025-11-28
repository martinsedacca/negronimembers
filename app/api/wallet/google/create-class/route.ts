import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

async function getAccessToken(credentials: { client_email: string; private_key: string }) {
  const now = Math.floor(Date.now() / 1000);
  
  const pemContents = credentials.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  
  const binaryDer = Buffer.from(pemContents, 'base64');
  
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    true,
    ['sign']
  );

  const jwt = await new SignJWT({
    iss: credentials.client_email,
    sub: credentials.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/wallet_object.issuer'
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(privateKey);

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResponse.json();
  
  if (!tokenResponse.ok) {
    throw new Error(`Token error: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
}

export async function GET() {
  try {
    const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '';
    const CLASS_ID = `${ISSUER_ID}.negroni_membership`;
    const credentialsJson = process.env.GOOGLE_WALLET_CREDENTIALS;
    
    if (!credentialsJson) {
      return NextResponse.json({ error: 'No credentials' }, { status: 500 });
    }

    const credentials = JSON.parse(credentialsJson);
    
    // Step 1: Get access token
    const accessToken = await getAccessToken(credentials);
    
    // Step 2: Try to get the existing class
    const getClassResponse = await fetch(
      `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${CLASS_ID}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    const getClassData = await getClassResponse.json();
    
    // Step 3: Try to create a test object
    const objectId = `${ISSUER_ID}.test_object_${Date.now()}`;
    
    const loyaltyObject = {
      id: objectId,
      classId: CLASS_ID,
      state: 'ACTIVE',
      accountId: 'TEST-001',
      accountName: 'Test User',
    };
    
    const createObjectResponse = await fetch(
      `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loyaltyObject),
      }
    );
    
    const createObjectData = await createObjectResponse.json();

    return NextResponse.json({
      issuer_id: ISSUER_ID,
      class_id: CLASS_ID,
      access_token_obtained: !!accessToken,
      get_class: {
        status: getClassResponse.status,
        ok: getClassResponse.ok,
        data: getClassData,
      },
      create_object: {
        status: createObjectResponse.status,
        ok: createObjectResponse.ok,
        data: createObjectData,
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
