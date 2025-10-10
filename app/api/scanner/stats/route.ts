import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const branch = searchParams.get('branch')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Build query
    let query = supabase
      .from('card_usage')
      .select('*')
      .gte('usage_date', today.toISOString())

    if (branch) {
      query = query.eq('branch_location', branch)
    }

    const { data: todayUsage, error } = await query

    if (error) throw error

    // Calculate stats
    const stats = {
      total_transactions: todayUsage?.length || 0,
      total_sales: todayUsage?.reduce((sum, u) => sum + (u.amount_spent || 0), 0) || 0,
      purchases: todayUsage?.filter(u => u.event_type === 'purchase').length || 0,
      events: todayUsage?.filter(u => u.event_type === 'event').length || 0,
      visits: todayUsage?.filter(u => u.event_type === 'visit').length || 0,
      average_purchase: 0,
      unique_customers: new Set(todayUsage?.map(u => u.member_id) || []).size,
    }

    const purchasesWithAmount = todayUsage?.filter(u => u.event_type === 'purchase' && u.amount_spent > 0) || []
    if (purchasesWithAmount.length > 0) {
      stats.average_purchase = purchasesWithAmount.reduce((sum, u) => sum + u.amount_spent, 0) / purchasesWithAmount.length
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Scanner stats error:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas', details: error.message },
      { status: 500 }
    )
  }
}
