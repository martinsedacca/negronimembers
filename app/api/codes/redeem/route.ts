import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { code, member_id } = body

    if (!code || !member_id) {
      return NextResponse.json(
        { error: 'Code and member ID are required' },
        { status: 400 }
      )
    }

    // Find and validate the code
    const { data: codeData, error: codeError } = await supabase
      .from('codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (codeError || !codeData) {
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

    // Check if member already has this code
    const { data: existingMemberCode } = await supabase
      .from('member_codes')
      .select('id')
      .eq('code_id', codeData.id)
      .eq('member_id', member_id)
      .single()

    if (existingMemberCode) {
      return NextResponse.json(
        { error: 'You have already redeemed this code' },
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

    // Create member_code record
    const { data: memberCode, error: memberCodeError } = await supabase
      .from('member_codes')
      .insert([{
        code_id: codeData.id,
        member_id,
        redeemed_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (memberCodeError) {
      console.error('Error creating member_code:', memberCodeError)
      return NextResponse.json(
        { error: memberCodeError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      memberCode,
      message: `Successfully redeemed code ${codeData.code}! You now have access to special benefits.`,
      code: {
        code: codeData.code,
        description: codeData.description,
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/codes/redeem:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
