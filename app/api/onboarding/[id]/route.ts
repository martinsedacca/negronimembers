import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET single question
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data: question, error } = await supabase
      .from('onboarding_questions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json(question)
  } catch (error: any) {
    console.error('Error in GET /api/onboarding/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT update question
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()

    const { question_text, question_type, options, placeholder, is_required, help_text } = body

    // Validate required fields
    if (!question_text || !question_type) {
      return NextResponse.json(
        { error: 'Question text and type are required' },
        { status: 400 }
      )
    }

    // Validate options for select types
    if (['select', 'multi_select', 'yes_no'].includes(question_type)) {
      if (!options || options.length === 0) {
        return NextResponse.json(
          { error: 'Options are required for this question type' },
          { status: 400 }
        )
      }
    }

    // Update the question
    const { data: question, error } = await supabase
      .from('onboarding_questions')
      .update({
        question_text,
        question_type,
        options: options || null,
        placeholder: placeholder || null,
        is_required: is_required || false,
        help_text: help_text || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(question)
  } catch (error: any) {
    console.error('Error in PUT /api/onboarding/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH toggle active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()

    const { is_active } = body

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active must be a boolean' },
        { status: 400 }
      )
    }

    const { data: question, error } = await supabase
      .from('onboarding_questions')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(question)
  } catch (error: any) {
    console.error('Error in PATCH /api/onboarding/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE question
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    // Check if question has responses
    const { data: responses, error: responsesError } = await supabase
      .from('member_onboarding_responses')
      .select('id')
      .eq('question_id', id)
      .limit(1)

    if (responsesError) {
      console.error('Error checking responses:', responsesError)
      return NextResponse.json({ error: responsesError.message }, { status: 500 })
    }

    // If has responses, soft delete (set inactive) instead of hard delete
    if (responses && responses.length > 0) {
      const { error } = await supabase
        .from('onboarding_questions')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        console.error('Error soft deleting question:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ 
        message: 'Question has responses. Set to inactive instead of deleting.',
        soft_delete: true 
      })
    }

    // No responses, safe to hard delete
    const { error } = await supabase
      .from('onboarding_questions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Question deleted successfully' })
  } catch (error: any) {
    console.error('Error in DELETE /api/onboarding/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
