import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { filters } = await request.json()

    // Start with base query from member_stats view
    let query = supabase.from('member_stats').select('*')

    // Apply filters - Points (Primary)
    if (filters.points_min) {
      query = query.gte('points', filters.points_min)
    }
    
    if (filters.points_max) {
      query = query.lte('points', filters.points_max)
    }

    // Visits
    if (filters.total_visits_min) {
      query = query.gte('total_visits', filters.total_visits_min)
    }
    
    if (filters.total_visits_max) {
      query = query.lte('total_visits', filters.total_visits_max)
    }

    if (filters.visits_last_30_days_min) {
      query = query.gte('visits_last_30_days', filters.visits_last_30_days_min)
    }

    // Spending
    if (filters.total_spent_min) {
      query = query.gte('lifetime_spent', filters.total_spent_min)
    }

    if (filters.total_spent_max) {
      query = query.lte('lifetime_spent', filters.total_spent_max)
    }

    if (filters.spent_last_30_days_min) {
      query = query.gte('spent_last_30_days', filters.spent_last_30_days_min)
    }

    // Wallet Push filter
    if (filters.has_wallet_push) {
      query = query.eq('has_wallet_push', true)
    }

    // Support both old (membership_types by name) and new (membership_type_ids by ID)
    if (filters.membership_type_ids && filters.membership_type_ids.length > 0) {
      query = query.in('membership_type_id', filters.membership_type_ids)
    } else if (filters.membership_types && filters.membership_types.length > 0) {
      // Fallback for old format
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
    
    // Filter by wallet platform
    const hasWalletPlatformFilter = filters.has_apple_wallet || filters.has_google_wallet || filters.has_no_wallet
    if (hasWalletPlatformFilter && filteredMembers.length > 0) {
      const memberIds = filteredMembers.map(m => m.id)
      
      // Get wallet passes for these members
      const { data: walletPasses } = await supabase
        .from('wallet_passes')
        .select('member_id, platform')
        .in('member_id', memberIds)
        .eq('voided', false)
      
      // Create a map of member_id -> platforms[]
      const memberPlatforms: Record<string, string[]> = {}
      walletPasses?.forEach(pass => {
        if (!memberPlatforms[pass.member_id]) {
          memberPlatforms[pass.member_id] = []
        }
        if (!memberPlatforms[pass.member_id].includes(pass.platform)) {
          memberPlatforms[pass.member_id].push(pass.platform)
        }
      })
      
      filteredMembers = filteredMembers.filter(m => {
        const platforms = memberPlatforms[m.id] || []
        const hasApple = platforms.includes('apple')
        const hasGoogle = platforms.includes('google')
        const hasNone = platforms.length === 0
        
        // If multiple filters are selected, treat as OR
        if (filters.has_apple_wallet && hasApple) return true
        if (filters.has_google_wallet && hasGoogle) return true
        if (filters.has_no_wallet && hasNone) return true
        
        return false
      })
    }

    // Filter by onboarding responses
    if (filters.onboarding_responses && Object.keys(filters.onboarding_responses).length > 0) {
      const memberIdsToCheck = filteredMembers.map(m => m.id)
      
      if (memberIdsToCheck.length > 0) {
        // For each question filter, get members who answered with the selected options
        const matchingMemberIds = new Set<string>()
        
        for (const [questionId, selectedOptions] of Object.entries(filters.onboarding_responses)) {
          const options = selectedOptions as string[]
          if (options && options.length > 0) {
            const { data: responses } = await supabase
              .from('member_onboarding_responses')
              .select('member_id, response_value')
              .eq('question_id', questionId)
              .in('member_id', memberIdsToCheck)
            
            if (responses) {
              const matchingIds = responses
                .filter(r => options.includes(r.response_value))
                .map(r => r.member_id)
              
              // Add matching member IDs to the set
              matchingIds.forEach(id => matchingMemberIds.add(id))
            }
          }
        }
        
        // Filter members to only include those who match at least one onboarding response filter
        filteredMembers = filteredMembers.filter(m => matchingMemberIds.has(m.id))
      }
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
