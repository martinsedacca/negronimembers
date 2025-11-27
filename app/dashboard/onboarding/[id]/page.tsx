import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import QuestionForm from '../components/QuestionForm'

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params (Next.js 15 requirement)
  const { id } = await params
  const supabase = await createClient()

  const { data: question, error } = await supabase
    .from('onboarding_questions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !question) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/onboarding"
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Onboarding Question</h1>
          <p className="mt-2 text-neutral-400">
            Update the question for the member registration flow
          </p>
        </div>
      </div>

      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
        <QuestionForm question={question} />
      </div>
    </div>
  )
}
