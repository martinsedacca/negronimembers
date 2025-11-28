import { SignJWT } from 'jose';
import type { Database } from '@/lib/types/database';

type Member = Database['public']['Tables']['members']['Row'];

// Google Wallet API configuration
const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '';
const GENERIC_CLASS_ID = `${ISSUER_ID}.negroni_members_v3`;

interface GoogleWalletCredentials {
  client_email: string;
  private_key: string;
}

// Get credentials from environment
function getCredentials(): GoogleWalletCredentials {
  const credentialsJson = process.env.GOOGLE_WALLET_CREDENTIALS;
  if (!credentialsJson) {
    throw new Error('GOOGLE_WALLET_CREDENTIALS environment variable is not set');
  }
  
  try {
    return JSON.parse(credentialsJson);
  } catch {
    throw new Error('Invalid GOOGLE_WALLET_CREDENTIALS JSON');
  }
}

// Import private key for signing
async function importPrivateKey(pem: string) {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  
  const binaryDer = Buffer.from(pemContents, 'base64');
  
  return crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    true,
    ['sign']
  );
}

// Get access token for Google API
async function getAccessToken(credentials: GoogleWalletCredentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const privateKey = await importPrivateKey(credentials.private_key);

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

// Ensure Generic class exists
async function ensureGenericClass(accessToken: string): Promise<void> {
  // Check if class exists
  const getResponse = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/genericClass/${GENERIC_CLASS_ID}`,
    {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
  );
  
  if (getResponse.ok) {
    return; // Class exists
  }
  
  // Create class with nice design
  const genericClass = {
    id: GENERIC_CLASS_ID,
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.textModulesData['member_name']" }]
                }
              },
              endItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.textModulesData['member_number']" }]
                }
              }
            }
          },
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.textModulesData['tier']" }]
                }
              },
              endItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.textModulesData['valid_until']" }]
                }
              }
            }
          }
        ]
      }
    }
  };
  
  const createResponse = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/genericClass`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(genericClass),
    }
  );
  
  if (!createResponse.ok) {
    const error = await createResponse.json();
    console.error('Failed to create class:', error);
  }
}

// Create or get generic object via API
async function createOrGetGenericObject(member: Member, accessToken: string): Promise<string> {
  const objectId = `${ISSUER_ID}.member_gen_${member.id.replace(/-/g, '_')}`;
  
  // Format expiry date
  const expiryDate = member.expiry_date 
    ? new Date(member.expiry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Unlimited';

  // Generic object with better design
  const genericObject = {
    id: objectId,
    classId: GENERIC_CLASS_ID,
    state: 'ACTIVE',
    heroImage: {
      sourceUri: {
        uri: 'https://www.negronimembers.com/header-wallet.jpg',
      },
      contentDescription: {
        defaultValue: {
          language: 'en',
          value: 'Negroni Members',
        },
      },
    },
    logo: {
      sourceUri: {
        uri: 'https://www.negronimembers.com/NEGRONI-Logo-hueso_png.png',
      },
      contentDescription: {
        defaultValue: {
          language: 'en',
          value: 'Negroni Logo',
        },
      },
    },
    cardTitle: {
      defaultValue: {
        language: 'en',
        value: 'Negroni Members',
      },
    },
    subheader: {
      defaultValue: {
        language: 'en',
        value: member.membership_type?.toUpperCase() || 'MEMBER',
      },
    },
    header: {
      defaultValue: {
        language: 'en',
        value: member.full_name || 'Member',
      },
    },
    barcode: {
      type: 'QR_CODE',
      value: member.id,
      alternateText: member.member_number || 'MEMBER',
    },
    textModulesData: [
      {
        id: 'member_name',
        header: "MEMBER'S NAME",
        body: member.full_name || 'Member',
      },
      {
        id: 'member_number',
        header: 'MEMBER #',
        body: member.member_number || 'N/A',
      },
      {
        id: 'tier',
        header: 'TIER',
        body: member.membership_type?.toUpperCase() || 'MEMBER',
      },
      {
        id: 'valid_until',
        header: 'VALID UNTIL',
        body: expiryDate,
      },
    ],
    linksModuleData: {
      uris: [
        {
          uri: 'https://www.negronimembers.com/member',
          description: 'My Account',
          id: 'my_account',
        },
        {
          uri: 'https://www.negronimembers.com/member/benefits',
          description: 'View Benefits',
          id: 'benefits',
        },
      ],
    },
    hexBackgroundColor: '#000000',
  };
  
  // Ensure class exists first
  await ensureGenericClass(accessToken);
  
  // Try to get existing object
  const getResponse = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/genericObject/${objectId}`,
    {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
  );
  
  if (getResponse.ok) {
    // Update existing object
    await fetch(
      `https://walletobjects.googleapis.com/walletobjects/v1/genericObject/${objectId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(genericObject),
      }
    );
    return objectId;
  }
  
  // Create new object
  const createResponse = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/genericObject`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(genericObject),
    }
  );
  
  if (!createResponse.ok) {
    const error = await createResponse.json();
    throw new Error(`Failed to create object: ${JSON.stringify(error)}`);
  }
  
  return objectId;
}

// Generate "Add to Google Wallet" URL
export async function generateGoogleWalletUrl(member: Member): Promise<string> {
  if (!ISSUER_ID) {
    throw new Error('GOOGLE_WALLET_ISSUER_ID is not configured');
  }

  const credentials = getCredentials();
  
  // Step 1: Get access token
  const accessToken = await getAccessToken(credentials);
  
  // Step 2: Create the generic object via API
  const objectId = await createOrGetGenericObject(member, accessToken);
  
  // Step 3: Generate save URL
  const now = Math.floor(Date.now() / 1000);
  const privateKey = await importPrivateKey(credentials.private_key);
  
  // Format expiry date
  const expiryDate = member.expiry_date 
    ? new Date(member.expiry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Unlimited';

  const claims = {
    iss: credentials.client_email,
    aud: 'google',
    typ: 'savetowallet',
    iat: now,
    origins: ['https://www.negronimembers.com'],
    payload: {
      genericObjects: [{
        id: objectId,
        classId: GENERIC_CLASS_ID,
        state: 'ACTIVE',
        heroImage: {
          sourceUri: {
            uri: 'https://www.negronimembers.com/header-wallet.jpg',
          },
        },
        logo: {
          sourceUri: {
            uri: 'https://www.negronimembers.com/NEGRONI-Logo-hueso_png.png',
          },
        },
        cardTitle: {
          defaultValue: {
            language: 'en',
            value: 'Negroni Members',
          },
        },
        subheader: {
          defaultValue: {
            language: 'en',
            value: member.membership_type?.toUpperCase() || 'MEMBER',
          },
        },
        header: {
          defaultValue: {
            language: 'en',
            value: member.full_name || 'Member',
          },
        },
        barcode: {
          type: 'QR_CODE',
          value: member.id,
          alternateText: member.member_number || 'MEMBER',
        },
        textModulesData: [
          {
            id: 'member_name',
            header: "MEMBER'S NAME",
            body: member.full_name || 'Member',
          },
          {
            id: 'member_number',
            header: 'MEMBER #',
            body: member.member_number || 'N/A',
          },
          {
            id: 'tier',
            header: 'TIER',
            body: member.membership_type?.toUpperCase() || 'MEMBER',
          },
          {
            id: 'valid_until',
            header: 'VALID UNTIL',
            body: expiryDate,
          },
        ],
        linksModuleData: {
          uris: [
            {
              uri: 'https://www.negronimembers.com/member',
              description: 'My Account',
              id: 'my_account',
            },
          ],
        },
        hexBackgroundColor: '#000000',
      }],
    },
  };
  
  const token = await new SignJWT(claims)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(privateKey);
  
  return `https://pay.google.com/gp/v/save/${token}`;
}

// Check if Google Wallet is configured
export function isGoogleWalletConfigured(): boolean {
  return !!(
    process.env.GOOGLE_WALLET_ISSUER_ID &&
    process.env.GOOGLE_WALLET_CREDENTIALS
  );
}
