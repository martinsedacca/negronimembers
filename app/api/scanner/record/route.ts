import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { GHLSyncService } from '@/lib/services/ghl-sync'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    let body
    try {
      body = await request.json()
    } catch (e: any) {
      console.error('JSON parse error:', e)
      return NextResponse.json(
        { error: 'Invalid JSON', details: e.message },
        { status: 400 }
      )
    }

    const {
      transaction_id,
      member_id,
      event_type = 'purchase',
      amount_spent = 0,
      branch_id,
      branch_location, // Backward compatibility
      applied_promotions = [],
      notes,
    } = body

    if (!member_id) {
      return NextResponse.json(
        { error: 'member_id is required' },
        { status: 400 }
      )
    }

    console.log('🔵 [Scanner Record] Request received:', { 
      transaction_id, 
      member_id, 
      event_type, 
      amount_spent, 
      branch_id, 
      timestamp: new Date().toISOString() 
    })
    
    // Check for duplicate transaction_id
    if (transaction_id) {
      const { data: existingTransaction } = await supabase
        .from('card_usage')
        .select('id')
        .eq('transaction_id', transaction_id)
        .maybeSingle()
      
      if (existingTransaction) {
        console.warn('⚠️ [Scanner Record] Duplicate transaction detected:', transaction_id)
        return NextResponse.json(
          { 
            error: 'Duplicate transaction', 
            details: 'This transaction has already been processed',
            transaction_id 
          },
          { status: 409 } // Conflict
        )
      }
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    console.log('User authenticated:', user?.id)

    // Calculate points earned (1 point per dollar spent, or 10 points for events/visits)
    let points_earned = 0
    if (event_type === 'purchase' && amount_spent > 0) {
      points_earned = Math.floor(amount_spent)
    } else if (event_type === 'event' || event_type === 'visit') {
      points_earned = 10
    }
    console.log('Points to earn:', points_earned)

    // Insert card usage record
    console.log('🟢 [Scanner Record] Inserting card usage...', { 
      transaction_id,
      member_id, 
      event_type, 
      amount_spent, 
      points_earned 
    })
    const { data: cardUsage, error: usageError } = await supabase
      .from('card_usage')
      .insert({
        transaction_id,
        member_id,
        event_type,
        amount_spent,
        branch_id: branch_id || null,
        branch_location: branch_location || null,
        served_by: user?.id,
        points_earned,
        notes,
        location: branch_location, // For backward compatibility
      })
      .select()
      .single()

    if (usageError) {
      console.error('🔴 [Scanner Record] Card usage insert error:', usageError)
      // Check if it's a duplicate key error
      if (usageError.code === '23505') { // PostgreSQL unique violation
        return NextResponse.json(
          { 
            error: 'Duplicate transaction', 
            details: 'This transaction has already been processed',
            transaction_id 
          },
          { status: 409 }
        )
      }
      throw usageError
    }
    console.log('✅ [Scanner Record] Card usage created:', {
      id: cardUsage.id,
      transaction_id: cardUsage.transaction_id
    })

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

    // Sync member stats to GHL asynchronously (non-blocking)
    console.log('🔵 [Scanner Record] Triggering GHL sync for member:', member_id)
    
    // Run GHL sync in background (don't wait for it)
    const syncToGHL = async () => {
      try {
        // Get GHL config
        const { data: config } = await supabase
          .from('system_config')
          .select('key, value')
          .in('key', ['ghl_api_token', 'ghl_location_id'])

        const configMap = config?.reduce((acc, item) => {
          acc[item.key] = item.value
          return acc
        }, {} as Record<string, string>)

        const ghlToken = configMap?.ghl_api_token || process.env.GHL_API_SECRET
        const ghlLocationId = configMap?.ghl_location_id || '8CuDDsReJB6uihox2LBw'

        if (!ghlToken) {
          console.log('⚠️ [Scanner Record] GHL not configured, skipping sync')
          return
        }

        // Get member with stats
        const { data: memberData } = await supabase
          .from('member_stats')
          .select('*')
          .eq('id', member_id)
          .single()

        if (!memberData) {
          console.log('⚠️ [Scanner Record] Member not found for sync')
          return
        }

        // Get stored contact ID
        const { data: memberRecord } = await supabase
          .from('members')
          .select('ghl_contact_id')
          .eq('id', member_id)
          .single()

        const existingContactId = memberRecord?.ghl_contact_id || null

        // Sync to GHL
        const ghlService = new GHLSyncService(ghlToken, ghlLocationId)
        const result = await ghlService.syncMember(memberData, existingContactId)

        if (result.success) {
          console.log('✅ [Scanner Record] Member synced to GHL successfully')
          
          // Save contact ID if new
          if (result.contactId && result.contactId !== existingContactId) {
            await supabase
              .from('members')
              .update({ ghl_contact_id: result.contactId })
              .eq('id', member_id)
          }

          // Log the sync
          await supabase.from('ghl_sync_log').insert({
            member_id,
            contact_id: result.contactId,
            action: result.created ? 'create' : 'update',
            success: true,
            synced_at: new Date().toISOString(),
          })
        } else {
          console.error('🔴 [Scanner Record] GHL sync failed:', result.error)
        }
      } catch (err) {
        console.error('🔴 [Scanner Record] GHL sync exception:', err)
      }
    }

    // Start sync in background
    syncToGHL()

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
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        error: 'Error al registrar transacción', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      },
      { status: 500 }
    )
  }
}
