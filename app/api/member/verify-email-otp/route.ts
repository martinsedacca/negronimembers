import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create Supabase admin client lazily to avoid build errors
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const { memberId, email, code } = await request.json()

    if (!memberId || !email || !code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Find valid OTP code
    const { data: otpRecord, error: findError } = await supabaseAdmin
      .from('email_otp_codes')
      .select('*')
      .eq('member_id', memberId)
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (findError || !otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    // Mark code as used
    await supabaseAdmin
      .from('email_otp_codes')
      .update({ used: true })
      .eq('id', otpRecord.id)

    // Update member email
    const { error: updateError } = await supabaseAdmin
      .from('members')
      .update({ email: email })
      .eq('id', memberId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update email' }, { status: 500 })
    }

    // Also update auth user email if possible
    const { data: member } = await supabaseAdmin
      .from('members')
      .select('user_id')
      .eq('id', memberId)
      .single()

    if (member?.user_id) {
      await supabaseAdmin.auth.admin.updateUserById(member.user_id, {
        email: email,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Verify email OTP error:', error)
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
