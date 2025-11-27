import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { member_ids, promotion_id } = await request.json()

    if (!member_ids || !promotion_id || member_ids.length === 0) {
      return NextResponse.json(
        { error: 'member_ids and promotion_id are required' },
        { status: 400 }
      )
    }

    // Create assignments for all members using member_promotions table
    const assignments = member_ids.map((member_id: string) => ({
      member_id,
      promotion_id,
    }))

    // Insert assignments (skip duplicates)
    let assignedCount = 0
    for (const assignment of assignments) {
      const { error } = await supabase
        .from('member_promotions')
        .insert(assignment)
      
      if (!error) {
        assignedCount++
      } else if (error.code !== '23505') { // Not a duplicate key error
        console.error('Insert error:', error)
      }
    }

    return NextResponse.json({
      success: true,
      assigned_count: assignedCount,
      total_requested: member_ids.length,
    })
  } catch (error: any) {
    console.error('Bulk assign error:', error)
    return NextResponse.json(
      { error: 'Error al asignar promociones', details: error.message },
      { status: 500 }
    )
  }
}
