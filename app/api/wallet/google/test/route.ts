import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function GET() {
  try {
    const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '';
    const credentialsJson = process.env.GOOGLE_WALLET_CREDENTIALS;
    
    if (!credentialsJson) {
      return NextResponse.json({ error: 'No credentials' }, { status: 500 });
    }

    const credentials = JSON.parse(credentialsJson);
    
    // Test member data
    const testMember = {
      id: 'test-member-456',
      full_name: 'Test User',
      member_number: 'NM-0001',
      membership_type: 'GOLD',
    };

    const classId = `${ISSUER_ID}.negroni_generic`;
    const objectId = `${ISSUER_ID}.member_${Date.now()}`;

    // Use Generic Pass instead of Loyalty
    const genericClass = {
      id: classId,
      classTemplateInfo: {
        cardTemplateOverride: {
          cardRowTemplateInfos: [{
            oneItem: {
              item: {
                firstValue: {
                  fields: [{
                    fieldPath: "object.textModulesData['member_number']"
                  }]
                }
              }
            }
          }]
        }
      }
    };

    const genericObject = {
      id: objectId,
      classId: classId,
      cardTitle: {
        defaultValue: {
          language: 'en',
          value: 'Negroni Members'
        }
      },
      header: {
        defaultValue: {
          language: 'en',
          value: testMember.full_name
        }
      },
      subheader: {
        defaultValue: {
          language: 'en',
          value: testMember.membership_type
        }
      },
      textModulesData: [{
        id: 'member_number',
        header: 'MEMBER #',
        body: testMember.member_number
      }],
      barcode: {
        type: 'QR_CODE',
        value: testMember.id
      },
      hexBackgroundColor: '#1a1a1a'
    };

    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      origins: ['https://www.negronimembers.com'],
      genericClasses: [genericClass],
      genericObjects: [genericObject],
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
      class_id: classId,
      object_id: objectId,
      claims_preview: {
        iss: claims.iss,
        aud: claims.aud,
        typ: claims.typ,
        genericObjects_count: claims.genericObjects.length,
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
