import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      member_id,
      event_type = 'purchase',
      amount_spent = 0,
      branch_location,
      applied_promotions = [],
      notes,
    } = await request.json()

    if (!member_id) {
      return NextResponse.json(
        { error: 'member_id is required' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Calculate points earned (1 point per dollar spent, or 10 points for events/visits)
    let points_earned = 0
    if (event_type === 'purchase' && amount_spent > 0) {
      points_earned = Math.floor(amount_spent)
    } else if (event_type === 'event' || event_type === 'visit') {
      points_earned = 10
    }

    // Insert card usage record
    const { data: cardUsage, error: usageError } = await supabase
      .from('card_usage')
      .insert({
        member_id,
        event_type,
        amount_spent,
        branch_location,
        served_by: user?.id,
        points_earned,
        notes,
        location: branch_location, // For backward compatibility
      })
      .select()
      .single()

    if (usageError) {
      throw usageError
    }

    // Update member points - Get current points first
    const { data: currentMember } = await supabase
      .from('members')
      .select('points')
      .eq('id', member_id)
      .single()

    if (currentMember) {
      await supabase
        .from('members')
        .update({ 
          points: (currentMember.points || 0) + points_earned
        })
        .eq('id', member_id)
    }

    // Apply promotions
    let total_discount = 0
    for (const promo_id of applied_promotions) {
      // Get promotion details
      const { data: promo } = await supabase
        .from('promotions')
        .select('*')
        .eq('id', promo_id)
        .single()

      if (!promo) continue

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
    }

    // Get updated member info to check for tier changes
    const { data: updatedMember } = await supabase
      .from('members')
      .select('membership_type')
      .eq('id', member_id)
      .single()

    // Check if tier changed (the trigger should have already updated it)
    const { data: tierHistory } = await supabase
      .from('tier_history')
      .select('new_tier')
      .eq('member_id', member_id)
      .order('changed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const tier_changed = tierHistory && tierHistory.new_tier === updatedMember?.membership_type

    return NextResponse.json({
      success: true,
      card_usage_id: cardUsage.id,
      points_earned,
      total_discount,
      new_tier: tier_changed ? tierHistory.new_tier : null,
      message: tier_changed 
        ? `¡Felicidades! Has subido a ${tierHistory.new_tier}!`
        : 'Transacción registrada exitosamente',
    })
  } catch (error: any) {
    console.error('Scanner record error:', error)
    return NextResponse.json(
      { error: 'Error al registrar transacción', details: error.message },
      { status: 500 }
    )
  }
}
