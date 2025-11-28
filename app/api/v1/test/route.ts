import { NextResponse } from 'next/server'

/**
 * Test endpoint to verify /api/v1/ routes are accessible
 * Visit: https://your-domain.com/api/v1/test
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Apple Wallet API v1 is accessible',
    timestamp: new Date().toISOString(),
    endpoints: {
      register: 'POST /api/v1/devices/{deviceId}/registrations/{passTypeId}/{serialNumber}',
      unregister: 'DELETE /api/v1/devices/{deviceId}/registrations/{passTypeId}/{serialNumber}',
      getPass: 'GET /api/v1/passes/{passTypeId}/{serialNumber}',
      log: 'POST /api/v1/log'
    }
  })
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'POST to /api/v1/test works',
    timestamp: new Date().toISOString()
  })
}
