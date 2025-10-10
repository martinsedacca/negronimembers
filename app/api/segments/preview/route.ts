import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { filters } = await request.json()

    // Start with base query from member_stats view
    let query = supabase.from('member_stats').select('*')

    // Apply filters
    if (filters.total_spent_min) {
      query = query.gte('lifetime_spent', filters.total_spent_min)
    }

    if (filters.total_spent_max) {
      query = query.lte('lifetime_spent', filters.total_spent_max)
    }

    if (filters.spent_last_30_days_min) {
      query = query.gte('spent_last_30_days', filters.spent_last_30_days_min)
    }

    if (filters.total_visits_min) {
      query = query.gte('total_visits', filters.total_visits_min)
    }

    if (filters.visits_last_30_days_min) {
      query = query.gte('visits_last_30_days', filters.visits_last_30_days_min)
    }

    if (filters.membership_types && filters.membership_types.length > 0) {
      query = query.in('membership_type', filters.membership_types)
    }

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters.last_visit_after) {
      query = query.gte('last_visit', filters.last_visit_after)
    }

    if (filters.last_visit_before) {
      query = query.lte('last_visit', filters.last_visit_before)
    }

    const { data: members, error } = await query.order('lifetime_spent', { ascending: false })

    if (error) throw error

    // Additional filter for never used promotions (client-side for now)
    let filteredMembers = members || []
    
    if (filters.never_used_promotions) {
      filteredMembers = filteredMembers.filter(m => (m.promotions_used || 0) === 0)
    }

    return NextResponse.json({ members: filteredMembers })
  } catch (error: any) {
    console.error('Segment preview error:', error)
    return NextResponse.json(
      { error: 'Error al previsualizar segmento', details: error.message },
      { status: 500 }
    )
  }
}
