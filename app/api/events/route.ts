import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('event_stats')
      .select('*')
      .order('event_date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: 'Error al obtener eventos', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const body = await request.json()

    const { data, error } = await supabase
      .from('events')
      .insert({
        ...body,
        created_by: user?.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: 'Error al crear evento', details: error.message },
      { status: 500 }
    )
  }
}
