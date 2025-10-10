import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const memberId = params.id

    // Get wallet passes for this member
    const { data: passes, error } = await supabase
      .from('wallet_passes')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching wallet passes:', error)
      throw error
    }

    const hasWallet = passes && passes.length > 0

    return NextResponse.json({
      has_wallet: hasWallet,
      passes: passes?.map(pass => ({
        pass_type: pass.pass_type,
        pass_id: pass.pass_id,
        serial_number: pass.serial_number,
        installed_at: pass.created_at,
        last_updated: pass.last_updated,
      })) || [],
    })
  } catch (error: any) {
    console.error('Wallet status error:', error)
    return NextResponse.json(
      {
        error: 'Error al obtener estado de tarjeta',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
