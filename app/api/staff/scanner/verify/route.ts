import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireStaffSession } from '@/lib/staff-auth'

export async function POST(request: NextRequest) {
  try {
    // Verify staff session
    const { session, error } = await requireStaffSession(request)
    if (error) {
      return NextResponse.json({ error: error.error }, { status: error.status })
    }

    const supabase = await createClient()
    const { member_id, member_number, search_query } = await request.json()

    // Accept member_id, member_number, or search_query
    if (!member_id && !member_number && !search_query) {
      return NextResponse.json(
        { error: 'member_id, member_number, or search_query is required' },
        { status: 400 }
      )
    }

    let member = null

    // Find member by ID or number
    if (member_id || member_number) {
      let query = supabase.from('members').select('*')
      
      if (member_id) {
        query = query.eq('id', member_id)
      } else {
        query = query.eq('member_number', member_number)
      }
      
      const { data, error: memberError } = await query.single()
      if (memberError || !data) {
        return NextResponse.json(
          { error: 'Member not found' },
          { status: 404 }
        )
      }
      member = data
    }

    // Search by query
    if (search_query && !member) {
      const searchTerms = search_query.trim().toLowerCase().split(/\s+/)
      
      let query = supabase
        .from('members')
        .select('*')
        .eq('status', 'active')
        .limit(10)

      // Build search conditions
      const searchConditions = searchTerms.map((term: string) => 
        `full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,member_number.ilike.%${term}%`
      ).join(',')

      const { data: searchResults } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'active')
        .or(searchConditions)
        .limit(10)

      if (!searchResults || searchResults.length === 0) {
        return NextResponse.json(
          { error: 'No members found', results: [] },
          { status: 404 }
        )
      }

      // If multiple results, return list for selection
      if (searchResults.length > 1) {
        return NextResponse.json({
          multiple_results: true,
          results: searchResults.map(m => ({
            id: m.id,
            full_name: m.full_name,
            email: m.email,
            phone: m.phone,
            member_number: m.member_number,
            membership_type: m.membership_type,
            membership_type_id: m.membership_type_id,
          })),
        })
      }

      member = searchResults[0]
    }

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Calculate stats directly from card_usage (single source of truth)
    const { data: usageData } = await supabase
      .from('card_usage')
      .select('amount_spent, points_earned, created_at')
      .eq('member_id', member.id)

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    let totalVisits = 0
    let lifetimeSpent = 0
    let totalPoints = 0
    let visitsLast30 = 0
    let spentLast30 = 0
    let lastVisit: string | null = null

    if (usageData && usageData.length > 0) {
      totalVisits = usageData.length
      lastVisit = usageData[0]?.created_at || null
      
      usageData.forEach(tx => {
        const amount = parseFloat(String(tx.amount_spent)) || 0
        lifetimeSpent += amount
        totalPoints += tx.points_earned || 0
        
        const txDate = new Date(tx.created_at)
        if (txDate >= thirtyDaysAgo) {
          visitsLast30++
          spentLast30 += amount
        }
      })
    }

    const stats = {
      total_visits: totalVisits,
      lifetime_spent: lifetimeSpent,
      total_points: totalPoints,
      visits_last_30_days: visitsLast30,
      spent_last_30_days: spentLast30,
      last_visit: lastVisit,
      average_purchase: totalVisits > 0 ? lifetimeSpent / totalVisits : 0,
    }

    // Update member record in background if values differ
    if (member.total_spent !== lifetimeSpent || member.total_visits !== totalVisits || member.points !== totalPoints) {
      supabase
        .from('members')
        .update({ 
          total_spent: lifetimeSpent, 
          total_visits: totalVisits,
          points: totalPoints 
        })
        .eq('id', member.id)
        .then(() => console.log('✅ Member stats synced'))
    }

    // Get available promotions filtered by current branch
    const { data: allPromotions } = await supabase
      .from('promotions')
      .select(`
        id,
        title,
        description,
        discount_type,
        discount_value,
        start_date,
        end_date,
        icon,
        usage_type,
        applicable_branches,
        applicable_to,
        max_usage_count,
        max_uses_per_member,
        valid_days,
        is_active
      `)
      .eq('is_active', true)
      .lte('start_date', new Date().toISOString())

    // Get usage counts for each promotion
    const { data: appliedPromotionsData } = await supabase
      .from('applied_promotions')
      .select('promotion_id, member_id')

    // Calculate usage counts
    const promotionTotalUsage: Record<string, number> = {}
    const promotionMemberUsage: Record<string, number> = {}
    
    const appliedList = appliedPromotionsData || []
    for (const ap of appliedList) {
      if (!ap.promotion_id) continue // Skip null promotion_ids
      // Total usage count
      promotionTotalUsage[ap.promotion_id] = (promotionTotalUsage[ap.promotion_id] || 0) + 1
      // Member-specific usage count
      if (ap.member_id === member.id) {
        promotionMemberUsage[ap.promotion_id] = (promotionMemberUsage[ap.promotion_id] || 0) + 1
      }
    }

    const currentBranchId = session!.branch_id
    const currentDay = new Date().getDay() // 0 = Sunday, 6 = Saturday

    // Process promotions with availability status
    const availablePromotions = (allPromotions || [])
      .filter(promo => {
        // Filter out expired promotions (don't show at all)
        if (promo.end_date && new Date(promo.end_date) < new Date()) {
          return false
        }
        return true
      })
      .filter(promo => {
        // Filter by branch
        if (promo.applicable_branches && promo.applicable_branches.length > 0) {
          if (!promo.applicable_branches.includes(currentBranchId)) {
            return false
          }
        }
        return true
      })
      .filter(promo => {
        // Filter by member tier - support both old (tier:name) and new (tier_id:uuid) formats
        if (promo.applicable_to && !promo.applicable_to.includes('all')) {
          const memberTierIdTag = member.membership_type_id ? `tier_id:${member.membership_type_id}` : null
          const memberTierNameTag = `tier:${member.membership_type}`
          
          const hasAccess = promo.applicable_to.some((tag: string) => 
            tag === memberTierIdTag || tag === memberTierNameTag
          )
          
          if (!hasAccess) {
            return false
          }
        }
        return true
      })
      .map(promo => {
        const totalUsed = promotionTotalUsage[promo.id] || 0
        const memberUsed = promotionMemberUsage[promo.id] || 0
        
        let is_blocked = false
        let block_reason: string | null = null

        // Check total usage limit
        if (promo.max_usage_count && totalUsed >= promo.max_usage_count) {
          is_blocked = true
          block_reason = 'sold_out'
        }
        // Check per-member limit
        else if (promo.max_uses_per_member && memberUsed >= promo.max_uses_per_member) {
          is_blocked = true
          block_reason = 'already_used'
        }
        // Check valid days
        else if (promo.valid_days && promo.valid_days.length > 0 && !promo.valid_days.includes(currentDay)) {
          is_blocked = true
          block_reason = 'not_today'
        }

        return {
          promotion_id: promo.id,
          title: promo.title,
          description: promo.description,
          discount_type: promo.discount_type,
          discount_value: promo.discount_value,
          start_date: promo.start_date,
          end_date: promo.end_date,
          icon: promo.icon,
          usage_type: promo.usage_type,
          applicable_branches: promo.applicable_branches,
          valid_days: promo.valid_days,
          max_usage_count: promo.max_usage_count,
          max_uses_per_member: promo.max_uses_per_member,
          total_used: totalUsed,
          member_used: memberUsed,
          is_blocked,
          block_reason,
        }
      })
      // Sort: available first, blocked last
      .sort((a, b) => (a.is_blocked ? 1 : 0) - (b.is_blocked ? 1 : 0))

    // Get assigned promotions that are pending
    const { data: assignedPromotions } = await supabase
      .from('member_assigned_promotions')
      .select(`
        id,
        promotion_id,
        auto_apply,
        assigned_at,
        promotions (
          title,
          description,
          discount_type,
          discount_value,
          applicable_branches
        )
      `)
      .eq('member_id', member.id)
      .eq('status', 'pending')

    // Filter assigned by branch too
    const filteredAssigned = (assignedPromotions || []).filter(ap => {
      const promo = ap.promotions as any
      if (!promo?.applicable_branches || promo.applicable_branches.length === 0) {
        return true
      }
      return promo.applicable_branches.includes(currentBranchId)
    })

    // Get recent usage at this branch
    const { data: recentUsage } = await supabase
      .from('card_usage')
      .select('*')
      .eq('member_id', member.id)
      .eq('branch_id', currentBranchId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get current branch name
    const { data: branch } = await supabase
      .from('branches')
      .select('name')
      .eq('id', currentBranchId)
      .single()

    return NextResponse.json({
      member: {
        id: member.id,
        full_name: member.full_name,
        email: member.email,
        phone: member.phone,
        membership_type: member.membership_type,
        membership_type_id: member.membership_type_id,
        status: member.status,
        member_number: member.member_number,
        points: totalPoints, // Use calculated value
        total_spent: lifetimeSpent, // Use calculated value
        total_visits: totalVisits, // Use calculated value
      },
      stats,
      available_promotions: availablePromotions,
      assigned_promotions: filteredAssigned,
      recent_usage: recentUsage || [],
      branch: {
        id: currentBranchId,
        name: branch?.name || 'Unknown',
      },
    })
  } catch (error: any) {
    console.error('Staff scanner verify error:', error)
    return NextResponse.json(
      { error: 'Failed to verify member', details: error.message },
      { status: 500 }
    )
  }
}
