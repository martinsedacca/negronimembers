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

// Create or get loyalty object via API
async function createOrGetLoyaltyObject(member: Member, accessToken: string): Promise<string> {
  const objectId = `${ISSUER_ID}.member_${member.id.replace(/-/g, '_')}`;
  
  // Try to get existing object
  const getResponse = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`,
    {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
  );
  
  if (getResponse.ok) {
    return objectId; // Object exists
  }
  
  // Create new object
  const loyaltyObject = {
    id: objectId,
    classId: CLASS_ID,
    state: 'ACTIVE',
    accountId: member.member_number || 'MEMBER',
    accountName: member.full_name || 'Member',
  };
  
  const createResponse = await fetch(
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
  
  // Step 2: Create the object via API (this works!)
  const objectId = await createOrGetLoyaltyObject(member, accessToken);
  
  // Step 3: Generate save URL with just the object ID
  const now = Math.floor(Date.now() / 1000);
  const privateKey = await importPrivateKey(credentials.private_key);
  
  const claims = {
    iss: credentials.client_email,
    aud: 'google',
    typ: 'savetowallet',
    iat: now,
    origins: ['https://www.negronimembers.com'],
    loyaltyObjects: [{
      id: objectId,
      classId: CLASS_ID,
      state: 'ACTIVE',
      accountId: member.member_number || 'MEMBER',
      accountName: member.full_name || 'Member',
    }],
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
