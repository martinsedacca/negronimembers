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
    
    console.log('Creating branch with body:', body)

    const { data, error } = await supabase
      .from('branches')
      .insert({
        name: body.name,
        address: body.address || null,
        city: body.city || null,
        phone: body.phone || null,
        email: body.email || null,
        manager_name: body.manager_name || null,
        is_active: body.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Create branch error:', error)
    return NextResponse.json(
      { error: error.message || 'Error creating location', details: error.details || error.hint },
      { status: 500 }
    )
  }
}
