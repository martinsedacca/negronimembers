import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { error } = await supabase
      .from('branches')
      .update(body)
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update branch error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar sucursal', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check if branch has transactions
    const { count } = await supabase
      .from('card_usage')
      .select('*', { count: 'exact', head: true })
      .eq('branch_id', params.id)

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una sucursal con transacciones registradas' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete branch error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar sucursal', details: error.message },
      { status: 500 }
    )
  }
}
