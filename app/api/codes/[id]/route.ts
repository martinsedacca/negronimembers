import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { code, description, expires_at, max_uses, is_active } = body

    // Update the code
    const { data: updatedCode, error } = await supabase
      .from('codes')
      .update({
        code: code?.toUpperCase(),
        description,
        expires_at: expires_at || null,
        max_uses: max_uses || null,
        is_active: is_active ?? true,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating code:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ code: updatedCode })
  } catch (error: any) {
    console.error('Error in PUT /api/codes/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Update only provided fields
    const { data: updatedCode, error } = await supabase
      .from('codes')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating code:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ code: updatedCode })
  } catch (error: any) {
    console.error('Error in PATCH /api/codes/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check if code has been used
    const { data: uses } = await supabase
      .from('member_codes')
      .select('id')
      .eq('code_id', params.id)
      .limit(1)

    if (uses && uses.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete code that has been used. Deactivate it instead.' },
        { status: 400 }
      )
    }

    // Delete the code
    const { error } = await supabase
      .from('codes')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting code:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Code deleted successfully' })
  } catch (error: any) {
    console.error('Error in DELETE /api/codes/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
