import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('is_active')

    let query = supabase
      .from('branches')
      .select('*')
      .order('name')

    // Filtrar por is_active si se proporciona
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: branches, error } = await query

    if (error) throw error

    return NextResponse.json({ branches: branches || [] })
  } catch (error: any) {
    console.error('Get branches error:', error)
    return NextResponse.json(
      { error: 'Error al obtener sucursales', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('branches')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Create branch error:', error)
    return NextResponse.json(
      { error: 'Error al crear sucursal', details: error.message },
      { status: 500 }
    )
  }
}
