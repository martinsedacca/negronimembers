import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Create a new segment (save filter configuration)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const body = await request.json()

    const { name, description, filters, member_count } = body

    const { data, error } = await supabase
      .from('segments')
      .insert({
        name,
        description,
        filters,
        member_count,
        created_by: user?.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Create segment error:', error)
    return NextResponse.json(
      { error: 'Error al crear segmento', details: error.message },
      { status: 500 }
    )
  }
}

// Get all saved segments
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('segments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Get segments error:', error)
    return NextResponse.json(
      { error: 'Error al obtener segmentos', details: error.message },
      { status: 500 }
    )
  }
}

// Delete a segment
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('segments')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete segment error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar segmento', details: error.message },
      { status: 500 }
    )
  }
}
