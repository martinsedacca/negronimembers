import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find the code
    const { data: codeData, error } = await supabase
      .from('codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !codeData) {
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 404 }
      )
    }

    // Check if active
    if (!codeData.is_active) {
      return NextResponse.json(
        { error: 'This code is no longer active' },
        { status: 400 }
      )
    }

    // Check if expired
    if (codeData.expires_at && new Date(codeData.expires_at) <= new Date()) {
      return NextResponse.json(
        { error: 'This code has expired' },
        { status: 400 }
      )
    }

    // Check usage limit
    if (codeData.max_uses) {
      const { data: uses } = await supabase
        .from('member_codes')
        .select('id')
        .eq('code_id', codeData.id)

      const useCount = uses?.length || 0

      if (useCount >= codeData.max_uses) {
        return NextResponse.json(
          { error: 'This code has reached its usage limit' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({ code: codeData, valid: true })
  } catch (error: any) {
    console.error('Error in GET /api/codes/validate:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
