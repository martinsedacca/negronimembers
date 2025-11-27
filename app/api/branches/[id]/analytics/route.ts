import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get branch info
    const { data: branch, error: branchError } = await supabase
      .from('branches')
      .select('*')
      .eq('id', params.id)
      .single()

    if (branchError || !branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      )
    }

    // Get all transactions for this branch
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        *,
        members(id, full_name, email, membership_type)
      `)
      .eq('branch_id', params.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
      return NextResponse.json(
        { error: transactionsError.message },
        { status: 500 }
      )
    }

    // Calculate stats
    const totalTransactions = transactions?.length || 0
    const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // Get unique members who visited
    const uniqueMemberIds = new Set(transactions?.map(t => t.member_id) || [])
    const activeMembers = uniqueMemberIds.size

    // Get member breakdown by tier
    const membersByTier: { [key: string]: number } = {}
    transactions?.forEach(t => {
      const tier = t.members?.membership_type || 'Unknown'
      membersByTier[tier] = (membersByTier[tier] || 0) + 1
    })

    // Top members (by total spent)
    const memberSpending: { [key: string]: { amount: number, visits: number, member: any } } = {}
    transactions?.forEach(t => {
      if (t.member_id) {
        if (!memberSpending[t.member_id]) {
          memberSpending[t.member_id] = {
            amount: 0,
            visits: 0,
            member: t.members
          }
        }
        memberSpending[t.member_id].amount += t.amount || 0
        memberSpending[t.member_id].visits += 1
      }
    })

    const topMembers = Object.entries(memberSpending)
      .map(([memberId, data]) => ({
        member_id: memberId,
        full_name: data.member?.full_name || 'Unknown',
        email: data.member?.email || '',
        membership_type: data.member?.membership_type || 'Member',
        total_spent: data.amount,
        visit_count: data.visits
      }))
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 10)

    // Daily revenue trend (last 30 days)
    const dailyRevenue: { [key: string]: number } = {}
    const dailyVisits: { [key: string]: number } = {}
    
    transactions?.forEach(t => {
      const date = new Date(t.created_at).toISOString().split('T')[0]
      dailyRevenue[date] = (dailyRevenue[date] || 0) + (t.amount || 0)
      dailyVisits[date] = (dailyVisits[date] || 0) + 1
    })

    // Fill in missing dates with 0
    const revenueData = []
    const visitsData = []
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      revenueData.push({
        date: dateStr,
        revenue: dailyRevenue[dateStr] || 0
      })
      visitsData.push({
        date: dateStr,
        visits: dailyVisits[dateStr] || 0
      })
    }

    // Peak hours analysis
    const hourlyVisits: { [key: number]: number } = {}
    transactions?.forEach(t => {
      const hour = new Date(t.created_at).getHours()
      hourlyVisits[hour] = (hourlyVisits[hour] || 0) + 1
    })

    const peakHours = Object.entries(hourlyVisits)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        visits: count
      }))
      .sort((a, b) => b.visits - a.visits)

    // Recent transactions
    const recentTransactions = transactions?.slice(0, 10).map(t => ({
      id: t.id,
      amount: t.amount,
      points_earned: t.points_earned,
      created_at: t.created_at,
      member: {
        full_name: t.members?.full_name || 'Unknown',
        membership_type: t.members?.membership_type || 'Member'
      }
    }))

    return NextResponse.json({
      branch,
      period: {
        days,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      },
      overview: {
        total_transactions: totalTransactions,
        total_revenue: totalRevenue,
        average_transaction: avgTransaction,
        active_members: activeMembers
      },
      members: {
        by_tier: membersByTier,
        top_spenders: topMembers
      },
      trends: {
        daily_revenue: revenueData,
        daily_visits: visitsData,
        peak_hours: peakHours
      },
      recent_transactions: recentTransactions
    })
  } catch (error: any) {
    console.error('Error in GET /api/branches/[id]/analytics:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
