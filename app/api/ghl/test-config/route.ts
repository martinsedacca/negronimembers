import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get GHL configuration
    const { data: config, error: configError } = await supabase
      .from('system_config')
      .select('key, value')
      .in('key', ['ghl_api_token', 'ghl_location_id'])

    if (configError) {
      throw new Error(`Config error: ${configError.message}`)
    }

    const configMap = config?.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {} as Record<string, string>)

    const ghlToken = configMap?.ghl_api_token || process.env.GHL_API_SECRET
    const ghlLocationId = configMap?.ghl_location_id || '8CuDDsReJB6uihox2LBw'

    // Test basic API call to GHL
    let apiTest = null
    if (ghlToken) {
      try {
        const testResponse = await fetch(
          `https://services.leadconnectorhq.com/locations/${ghlLocationId}`,
          {
            headers: {
              'Authorization': `Bearer ${ghlToken}`,
              'Version': '2021-07-28',
            },
          }
        )
        
        apiTest = {
          status: testResponse.status,
          ok: testResponse.ok,
          statusText: testResponse.statusText,
        }

        if (!testResponse.ok) {
          const errorText = await testResponse.text()
          apiTest.error = errorText
        }
      } catch (apiError: any) {
        apiTest = {
          error: apiError.message,
          stack: apiError.stack,
        }
      }
    }

    return NextResponse.json({
      config: {
        hasToken: !!ghlToken,
        tokenLength: ghlToken?.length || 0,
        tokenSource: configMap?.ghl_api_token ? 'database' : 'env',
        locationId: ghlLocationId,
        configFromDB: config,
      },
      apiTest,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
