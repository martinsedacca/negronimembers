import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function GET() {
  try {
    const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '';
    const CLASS_ID = `${ISSUER_ID}.negroni_membership`;
    const credentialsJson = process.env.GOOGLE_WALLET_CREDENTIALS;
    
    if (!credentialsJson) {
      return NextResponse.json({ error: 'No credentials' }, { status: 500 });
    }

    const credentials = JSON.parse(credentialsJson);
    
    // Test member data
    const testMember = {
      id: 'test-member-789',
      full_name: 'Test User',
      member_number: 'NM-0001',
      membership_type: 'GOLD',
    };

    const objectId = `${ISSUER_ID}.member_${Date.now()}`;

    // Simple loyalty object - matches what worked in create-class
    const loyaltyObject = {
      id: objectId,
      classId: CLASS_ID,
      state: 'active',
      accountId: testMember.member_number,
      accountName: testMember.full_name,
    };

    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      origins: ['https://www.negronimembers.com'],
      loyaltyObjects: [loyaltyObject],
    };
    
    const classId = CLASS_ID;

    // Import private key
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

    const token = await new SignJWT(claims)
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .sign(privateKey);

    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    return NextResponse.json({
      success: true,
      issuer_id: ISSUER_ID,
      class_id: classId,
      object_id: objectId,
      claims_preview: {
        iss: claims.iss,
        aud: claims.aud,
        typ: claims.typ,
        loyaltyObjects_count: claims.loyaltyObjects.length,
      },
      save_url: saveUrl,
      token_length: token.length,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
