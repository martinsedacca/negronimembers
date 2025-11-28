import { SignJWT } from 'jose';
import type { Database } from '@/lib/types/database';

type Member = Database['public']['Tables']['members']['Row'];

// Google Wallet API configuration
const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '';
const CLASS_ID = `${ISSUER_ID}.negroni_membership`;

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

// Create a loyalty object for a member
function createLoyaltyObject(member: Member): object {
  const objectId = `${ISSUER_ID}.${member.id.replace(/-/g, '_')}`;
  
  return {
    id: objectId,
    classId: CLASS_ID,
    state: 'ACTIVE',
    accountId: member.member_number,
    accountName: member.full_name || 'Member',
    barcode: {
      type: 'QR_CODE',
      value: member.id,
      alternateText: member.member_number,
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
        body: member.member_number,
      },
      {
        id: 'tier',
        header: 'TIER',
        body: member.membership_type?.toUpperCase() || 'MEMBER',
      },
    ],
    linksModuleData: {
      uris: [
        {
          uri: 'https://www.negronimembers.com/member',
          description: 'My Account',
        },
        {
          uri: 'https://www.negronimembers.com/member/benefits',
          description: 'View Benefits',
        },
      ],
    },
    hexBackgroundColor: '#000000',
  };
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

// Create loyalty class definition for JWT
function createLoyaltyClass(): object {
  return {
    id: CLASS_ID,
    issuerName: 'Negroni Restaurant',
    programName: 'Negroni Members',
    programLogo: {
      sourceUri: {
        uri: 'https://www.negronimembers.com/NEGRONI-Logo-hueso_png.png',
      },
    },
    hexBackgroundColor: '#1a1a1a',
    heroImage: {
      sourceUri: {
        uri: 'https://www.negronimembers.com/header-wallet.jpg',
      },
    },
    reviewStatus: 'UNDER_REVIEW',
  };
}

// Generate "Add to Google Wallet" URL
export async function generateGoogleWalletUrl(member: Member): Promise<string> {
  if (!ISSUER_ID) {
    throw new Error('GOOGLE_WALLET_ISSUER_ID is not configured');
  }

  const credentials = getCredentials();
  const loyaltyClass = createLoyaltyClass();
  const loyaltyObject = createLoyaltyObject(member);
  
  // Create JWT with class and object (required for demo mode)
  const now = Math.floor(Date.now() / 1000);
  const privateKey = await importPrivateKey(credentials.private_key);
  
  const claims = {
    iss: credentials.client_email,
    aud: 'google',
    typ: 'savetowallet',
    iat: now,
    origins: ['https://www.negronimembers.com'],
    loyaltyClasses: [loyaltyClass],
    loyaltyObjects: [loyaltyObject],
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
