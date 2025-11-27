import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Create Supabase admin client lazily to avoid build errors
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key)
}

// Initialize Resend if API key exists
const getResend = () => process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { memberId, email } = await request.json()

    if (!memberId || !email) {
      return NextResponse.json({ error: 'Missing memberId or email' }, { status: 400 })
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const supabaseAdmin = getSupabaseAdmin()

    // Delete any existing unused codes for this member
    await supabaseAdmin
      .from('email_otp_codes')
      .delete()
      .eq('member_id', memberId)
      .eq('used', false)

    // Insert new code
    const { error: insertError } = await supabaseAdmin
      .from('email_otp_codes')
      .insert({
        member_id: memberId,
        email: email,
        code: code,
      })

    if (insertError) {
      console.error('Error inserting OTP:', insertError)
      return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 })
    }

    // Send email with OTP
    const resend = getResend()
    if (resend) {
      await resend.emails.send({
        from: 'Negroni Members <noreply@onetimeleads.com>',
        to: email,
        subject: 'Your verification code',
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Verify your email</h2>
            <p style="color: #666;">Use this code to verify your new email address:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ea580c;">${code}</span>
            </div>
            <p style="color: #999; font-size: 12px;">This code expires in 10 minutes.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      })
    } else {
      // Fallback: log the code (for development)
      console.log(`📧 Email OTP for ${email}: ${code}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Send email OTP error:', error)
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
