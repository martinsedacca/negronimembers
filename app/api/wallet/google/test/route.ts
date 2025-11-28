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
      id: 'test-member-123',
      full_name: 'Test User',
      member_number: 'NM-0001',
      membership_type: 'GOLD',
    };

    const objectId = `${ISSUER_ID}.test_member_123`;

    const loyaltyClass = {
      id: CLASS_ID,
      issuerName: 'Negroni Restaurant',
      programName: 'Negroni Members',
      programLogo: {
        sourceUri: {
          uri: 'https://www.negronimembers.com/NEGRONI-Logo-hueso_png.png',
        },
      },
      hexBackgroundColor: '#1a1a1a',
      reviewStatus: 'UNDER_REVIEW',
    };

    const loyaltyObject = {
      id: objectId,
      classId: CLASS_ID,
      state: 'ACTIVE',
      accountId: testMember.member_number,
      accountName: testMember.full_name,
      barcode: {
        type: 'QR_CODE',
        value: testMember.id,
        alternateText: testMember.member_number,
      },
      textModulesData: [
        {
          id: 'member_name',
          header: 'MEMBER NAME',
          body: testMember.full_name,
        },
        {
          id: 'member_number',
          header: 'MEMBER #',
          body: testMember.member_number,
        },
      ],
      hexBackgroundColor: '#1a1a1a',
    };

    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      origins: ['https://www.negronimembers.com'],
      loyaltyClasses: [loyaltyClass],
      loyaltyObjects: [loyaltyObject],
    };

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
      class_id: CLASS_ID,
      object_id: objectId,
      claims_preview: {
        iss: claims.iss,
        aud: claims.aud,
        typ: claims.typ,
        loyaltyClasses_count: claims.loyaltyClasses.length,
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
