import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create Supabase admin client lazily to avoid build errors
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key)
}

export async function DELETE(request: NextRequest) {
  try {
    const { memberId } = await request.json()

    if (!memberId) {
      return NextResponse.json({ error: 'Missing memberId' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Get member's user_id first
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('user_id')
      .eq('id', memberId)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Delete member record (cascades to related tables)
    const { error: deleteError } = await supabaseAdmin
      .from('members')
      .delete()
      .eq('id', memberId)

    if (deleteError) {
      console.error('Error deleting member:', deleteError)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    // Delete auth user if exists
    if (member.user_id) {
      await supabaseAdmin.auth.admin.deleteUser(member.user_id)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
