import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireStaffSession } from '@/lib/staff-auth'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Verify staff session
    const { session, error } = await requireStaffSession(request)
    if (error) {
      return NextResponse.json({ error: error.error }, { status: error.status })
    }

    const supabase = await createClient()
    const {
      member_id,
      event_type = 'purchase',
      amount_spent = 0,
      applied_promotions = [],
      notes,
    } = await request.json()

    if (!member_id) {
      return NextResponse.json(
        { error: 'member_id is required' },
        { status: 400 }
      )
    }

    const staffSession = session!
    const branchId = staffSession.branch_id
    const staffId = staffSession.staff_id

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`

    console.log('🔵 [Staff Scanner] Recording transaction:', {
      transaction_id: transactionId,
      member_id,
      branch_id: branchId,
      staff_id: staffId,
      amount_spent,
    })

    // Get points rules from system_config
    const { data: configRows } = await supabase
      .from('system_config')
      .select('key, value')
      .eq('key', 'points_rules')
      .single()

    const pointsRules = configRows?.value || {
      per_dollar_spent: 1,
      per_visit: 10,
      per_event_attended: 20,
    }

    // Calculate points earned based on configured rules from system_config
    // Rules: per_visit (always), per_dollar_spent (if spent), per_event_attended (events)
    let points_earned = 0
    
    if (event_type === 'event') {
      // Event attendance
      points_earned = pointsRules.per_event_attended || 20
    } else {
      // Visit/Purchase: always get visit points + spending points if any
      points_earned = pointsRules.per_visit || 10
      
      if (amount_spent > 0) {
        // Add points for spending
        points_earned += Math.floor(amount_spent * (pointsRules.per_dollar_spent || 1))
      }
    }

    // Get branch name
    const { data: branch } = await supabase
      .from('branches')
      .select('name')
      .eq('id', branchId)
      .single()

    // Determine actual event type based on amount
    const actualEventType = amount_spent > 0 ? 'purchase' : 
                            event_type === 'event' ? 'event' : 'visit'

    // Insert card usage record
    const { data: cardUsage, error: usageError } = await supabase
      .from('card_usage')
      .insert({
        transaction_id: transactionId,
        member_id,
        usage_type: actualEventType,
        event_type: actualEventType,
        amount_spent,
        branch_id: branchId,
        branch_location: branch?.name,
        staff_id: staffId,
        served_by: null, // We use staff_id now
        points_earned,
        notes,
        location: branch?.name,
      })
      .select()
      .single()

    if (usageError) {
      console.error('🔴 [Staff Scanner] Card usage insert error:', usageError)
      throw usageError
    }

    console.log('✅ [Staff Scanner] Card usage created:', cardUsage.id)

    // Update member points, total_spent, and total_visits
    const { data: currentMember } = await supabase
      .from('members')
      .select('points, total_spent, total_visits, full_name')
      .eq('id', member_id)
      .single()

    if (currentMember) {
      await supabase
        .from('members')
        .update({ 
          points: (currentMember.points || 0) + points_earned,
          total_spent: (parseFloat(currentMember.total_spent) || 0) + amount_spent,
          total_visits: (currentMember.total_visits || 0) + 1,
        })
        .eq('id', member_id)
    }

    // Apply promotions with validation
    let total_discount = 0
    const applied_details = []
    const currentDay = new Date().getDay()

    for (const promo_id of applied_promotions) {
      // Get promotion details with all restriction fields
      const { data: promo } = await supabase
        .from('promotions')
        .select('*, max_usage_count, max_uses_per_member, valid_days')
        .eq('id', promo_id)
        .single()

      if (!promo) continue

      // SECURITY: Validate promotion is still usable
      // Check if promotion is active and not expired
      if (!promo.is_active || (promo.end_date && new Date(promo.end_date) < new Date())) {
        console.warn(`⚠️ Promotion ${promo_id} is inactive or expired, skipping`)
        continue
      }

      // Check valid days
      if (promo.valid_days && promo.valid_days.length > 0 && !promo.valid_days.includes(currentDay)) {
        console.warn(`⚠️ Promotion ${promo_id} not valid today, skipping`)
        continue
      }

      // Check total usage limit
      if (promo.max_usage_count) {
        const { count } = await supabase
          .from('applied_promotions')
          .select('*', { count: 'exact', head: true })
          .eq('promotion_id', promo_id)
        
        if (count && count >= promo.max_usage_count) {
          console.warn(`⚠️ Promotion ${promo_id} sold out, skipping`)
          continue
        }
      }

      // Check per-member limit
      if (promo.max_uses_per_member) {
        const { count } = await supabase
          .from('applied_promotions')
          .select('*', { count: 'exact', head: true })
          .eq('promotion_id', promo_id)
          .eq('member_id', member_id)
        
        if (count && count >= promo.max_uses_per_member) {
          console.warn(`⚠️ Member ${member_id} already used promotion ${promo_id} max times, skipping`)
          continue
        }
      }

      // Calculate discount amount
      let discount_amount = 0
      if (promo.discount_type === 'percentage' && amount_spent > 0) {
        discount_amount = (amount_spent * promo.discount_value) / 100
      } else if (promo.discount_type === 'fixed') {
        discount_amount = promo.discount_value
      }

      total_discount += discount_amount

      // Record applied promotion
      await supabase
        .from('applied_promotions')
        .insert({
          member_id,
          promotion_id: promo_id,
          card_usage_id: cardUsage.id,
          discount_amount,
        })

      // Update assigned promotion status if it exists
      await supabase
        .from('member_assigned_promotions')
        .update({
          status: 'used',
          used_at: new Date().toISOString(),
        })
        .eq('member_id', member_id)
        .eq('promotion_id', promo_id)
        .eq('status', 'pending')

      applied_details.push({
        title: promo.title,
        discount_amount,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
      })
    }

    // Notify wallet to update
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/wallet/update-member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id }),
    }).catch(err => console.error('Wallet notification error:', err))

    return NextResponse.json({
      success: true,
      transaction_id: transactionId,
      card_usage_id: cardUsage.id,
      member_name: currentMember?.full_name,
      points_earned,
      new_total_points: (currentMember?.points || 0) + points_earned,
      total_discount,
      applied_promotions: applied_details,
      branch: branch?.name,
      recorded_by: staffSession.staff.full_name,
    })
  } catch (error: any) {
    console.error('Staff scanner record error:', error)
    return NextResponse.json(
      { error: 'Failed to record transaction', details: error.message },
      { status: 500 }
    )
  }
}
