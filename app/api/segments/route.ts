import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const body = await request.json()

    const { data, error } = await supabase
      .from('member_segments')
      .insert({
        ...body,
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

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('member_segments')
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
