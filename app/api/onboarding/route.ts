import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET all questions
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: questions, error } = await supabase
      .from('onboarding_questions')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(questions || [])
  } catch (error: any) {
    console.error('Error in GET /api/onboarding:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST create new question
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { question_text, question_type, options, placeholder, is_required, help_text, member_field } = body

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

    // Get the next display_order
    const { data: lastQuestion } = await supabase
      .from('onboarding_questions')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = lastQuestion ? lastQuestion.display_order + 1 : 1

    // Insert the question
    const { data: question, error } = await supabase
      .from('onboarding_questions')
      .insert({
        question_text,
        question_type,
        options: options || null,
        placeholder: placeholder || null,
        is_required: is_required || false,
        help_text: help_text || null,
        display_order: nextOrder,
        is_active: true,
        member_field: member_field || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(question, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/onboarding:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
