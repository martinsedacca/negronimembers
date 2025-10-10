import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { member_ids } = await request.json()

    if (!member_ids || !Array.isArray(member_ids)) {
      return NextResponse.json(
        { error: 'member_ids array is required' },
        { status: 400 }
      )
    }

    // Create invitations for all members
    const invitations = member_ids.map((member_id: string) => ({
      event_id: params.id,
      member_id,
      status: 'invited',
    }))

    const { data, error } = await supabase
      .from('event_attendees')
      .upsert(invitations, { 
        onConflict: 'event_id,member_id',
        ignoreDuplicates: false 
      })
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      invited_count: data?.length || 0,
    })
  } catch (error: any) {
    console.error('Invite members error:', error)
    return NextResponse.json(
      { error: 'Error al invitar miembros', details: error.message },
      { status: 500 }
    )
  }
}
