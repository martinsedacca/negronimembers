import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: codes, error } = await supabase
      .from('codes')
      .select(`
        *,
        member_codes(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching codes:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ codes }, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/codes:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { code, description, expires_at, max_uses, is_active } = body

    // Validate required fields
    if (!code || !description) {
      return NextResponse.json(
        { error: 'Code and description are required' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const { data: existing } = await supabase
      .from('codes')
      .select('id')
      .eq('code', code.toUpperCase())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 400 }
      )
    }

    // Create the code
    const { data: newCode, error } = await supabase
      .from('codes')
      .insert([{
        code: code.toUpperCase(),
        description,
        expires_at: expires_at || null,
        max_uses: max_uses || null,
        is_active: is_active ?? true,
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating code:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ code: newCode }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/codes:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
