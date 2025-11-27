import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import QuestionForm from '../components/QuestionForm'

export default function NewQuestionPage() {
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
          <h1 className="text-3xl font-bold text-white">New Onboarding Question</h1>
          <p className="mt-2 text-neutral-400">
            Create a new question for the member registration flow
          </p>
        </div>
      </div>

      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
        <QuestionForm />
      </div>
    </div>
  )
}
