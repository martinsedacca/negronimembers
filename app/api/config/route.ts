import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('system_config')
      .select('*')

    if (error) throw error

    // Convert to key-value object
    const config = data?.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(config || {})
  } catch (error: any) {
    console.error('Get config error:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const body = await request.json()

    // Update each config key
    const updates = Object.entries(body).map(([key, value]) => ({
      key,
      value,
      updated_by: user?.id,
    }))

    const { error } = await supabase
      .from('system_config')
      .upsert(updates)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update config error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración', details: error.message },
      { status: 500 }
    )
  }
}
