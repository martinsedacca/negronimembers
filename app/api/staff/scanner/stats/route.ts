import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getStaffSession } from '@/lib/staff-auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get session (lighter than requireStaffSession)
    const session = await getStaffSession(request)
    if (!session || !session.branch_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const branchId = session.branch_id
    const staffId = session.staff_id

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStart = today.toISOString()

    // Single optimized query - get all transactions for today at this branch
    const { data: transactions } = await supabase
      .from('card_usage')
      .select('amount_spent, member_id, points_earned, staff_id')
      .eq('branch_id', branchId)
      .gte('created_at', todayStart)

    // Calculate stats in memory (much faster than multiple queries)
    let totalSales = 0
    let totalTransactions = 0
    let totalPoints = 0
    const uniqueCustomers = new Set<string>()
    
    let staffSales = 0
    let staffTransactions = 0
    const staffCustomers = new Set<string>()

    transactions?.forEach(tx => {
      const amount = parseFloat(tx.amount_spent) || 0
      totalSales += amount
      totalTransactions++
      totalPoints += tx.points_earned || 0
      uniqueCustomers.add(tx.member_id)
      
      // Also count staff-specific stats
      if (tx.staff_id === staffId) {
        staffSales += amount
        staffTransactions++
        staffCustomers.add(tx.member_id)
      }
    })

    return NextResponse.json({
      branch: {
        id: branchId,
        name: session.staff.current_branch_id ? '' : '', // Will be filled by client
        today: {
          total_sales: totalSales,
          total_transactions: totalTransactions,
          unique_customers: uniqueCustomers.size,
          average_ticket: totalTransactions > 0 ? totalSales / totalTransactions : 0,
          total_points: totalPoints,
        },
      },
      staff: {
        id: staffId,
        name: session.staff.full_name,
        today: {
          total_sales: staffSales,
          total_transactions: staffTransactions,
          unique_customers: staffCustomers.size,
          average_ticket: staffTransactions > 0 ? staffSales / staffTransactions : 0,
        },
      },
    })
  } catch (error: any) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
