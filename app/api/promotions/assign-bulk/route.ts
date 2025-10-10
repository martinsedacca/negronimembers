import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { member_ids, promotion_id, auto_apply } = await request.json()

    if (!member_ids || !promotion_id) {
      return NextResponse.json(
        { error: 'member_ids and promotion_id are required' },
        { status: 400 }
      )
    }

    // Create assignments for all members
    const assignments = member_ids.map((member_id: string) => ({
      member_id,
      promotion_id,
      auto_apply: auto_apply || false,
      assigned_by: user?.id,
      status: 'pending',
    }))

    const { data, error } = await supabase
      .from('member_assigned_promotions')
      .upsert(assignments, { 
        onConflict: 'member_id,promotion_id',
        ignoreDuplicates: false 
      })
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      assigned_count: data?.length || 0,
      member_ids,
    })
  } catch (error: any) {
    console.error('Bulk assign error:', error)
    return NextResponse.json(
      { error: 'Error al asignar promociones', details: error.message },
      { status: 500 }
    )
  }
}
