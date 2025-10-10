import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: branches, error } = await supabase
      .from('branches')
      .select('*')
      .order('name')

    if (error) throw error

    return NextResponse.json(branches)
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
