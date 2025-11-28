import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { member_id, member_number } = await request.json()

    // Accept either member_id (UUID from QR) or member_number (legacy)
    if (!member_id && !member_number) {
      return NextResponse.json(
        { error: 'member_id or member_number is required' },
        { status: 400 }
      )
    }

    // Get member info - prefer member_id (UUID) if provided
    let query = supabase.from('members').select('*')
    
    if (member_id) {
      query = query.eq('id', member_id)
    } else {
      query = query.eq('member_number', member_number)
    }
    
    const { data: member, error: memberError } = await query.single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Miembro no encontrado' },
        { status: 404 }
      )
    }

    // Get member stats
    const { data: stats } = await supabase
      .from('member_stats')
      .select('*')
      .eq('id', member.id)
      .single()

    // Get available promotions
    const { data: availablePromotions } = await supabase
      .from('member_available_promotions')
      .select(`
        promotion_id,
        title,
        description,
        discount_type,
        discount_value,
        start_date,
        end_date,
        icon,
        usage_type,
        applicable_branches,
        is_assigned
      `)
      .eq('member_id', member.id)

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
          discount_value
        )
      `)
      .eq('member_id', member.id)
      .eq('status', 'pending')

    // Get recent usage history
    const { data: recentUsage } = await supabase
      .from('card_usage')
      .select('*')
      .eq('member_id', member.id)
      .order('usage_date', { ascending: false })
      .limit(5)

    // Get wallet status
    const { data: walletPasses } = await supabase
      .from('wallet_passes')
      .select('pass_type, pass_id, created_at, last_updated')
      .eq('member_id', member.id)
      .order('created_at', { ascending: false })

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
        points: member.points,
      },
      stats: stats || {
        total_visits: 0,
        lifetime_spent: 0,
        visits_last_30_days: 0,
        spent_last_30_days: 0,
        last_visit: null,
        average_purchase: 0,
      },
      available_promotions: availablePromotions || [],
      assigned_promotions: assignedPromotions || [],
      recent_usage: recentUsage || [],
      wallet_status: {
        has_wallet: walletPasses && walletPasses.length > 0,
        passes: walletPasses?.map(pass => ({
          pass_type: pass.pass_type,
          installed_at: pass.created_at,
          last_updated: pass.last_updated,
        })) || [],
      },
    })
  } catch (error: any) {
    console.error('Scanner verify error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        error: 'Error al verificar miembro', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      },
      { status: 500 }
    )
  }
}
