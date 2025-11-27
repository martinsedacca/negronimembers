import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { questionId, newOrder } = body

    if (!questionId || typeof newOrder !== 'number') {
      return NextResponse.json(
        { error: 'questionId and newOrder are required' },
        { status: 400 }
      )
    }

    // Call the reorder function in Supabase
    const { error } = await supabase.rpc('reorder_onboarding_question', {
      question_uuid: questionId,
      new_order: newOrder
    })

    if (error) {
      console.error('Error reordering question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Question reordered successfully' })
  } catch (error: any) {
    console.error('Error in POST /api/onboarding/reorder:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
