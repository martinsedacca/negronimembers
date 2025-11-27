import { NextResponse } from 'next/server'

export async function GET() {
  const webServiceURL = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1`
  
  return NextResponse.json({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    webServiceURL: webServiceURL,
    passTypeId: process.env.APPLE_WALLET_PASS_TYPE_ID,
    timestamp: new Date().toISOString()
  })
}
