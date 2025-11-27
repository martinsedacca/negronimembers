import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: questions, error } = await supabase
      .from('onboarding_questions')
      .select('id, question_text, question_type, options')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching onboarding questions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(questions || [])
  } catch (error: any) {
    console.error('Error in GET /api/onboarding/questions:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
