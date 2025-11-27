import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import QuestionsList from './components/QuestionsList'

export default async function OnboardingPage() {
  const supabase = await createClient()

  // Fetch onboarding questions
  const { data: questions, error } = await supabase
    .from('onboarding_questions')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching onboarding questions:', error)
  }

  // Fetch response stats
  const { data: stats } = await supabase
    .from('onboarding_response_stats')
    .select('*')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Onboarding Questions</h1>
          <p className="mt-2 text-neutral-400">
            Configure the questions new members answer during registration
          </p>
        </div>
        <Link
          href="/dashboard/onboarding/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Question
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
            <h3 className="text-sm font-medium text-neutral-400">Total Questions</h3>
            <p className="mt-2 text-3xl font-semibold text-white">
              {questions?.length || 0}
            </p>
          </div>
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
            <h3 className="text-sm font-medium text-neutral-400">Active Questions</h3>
            <p className="mt-2 text-3xl font-semibold text-white">
              {questions?.filter(q => q.is_active).length || 0}
            </p>
          </div>
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
            <h3 className="text-sm font-medium text-neutral-400">Total Responses</h3>
            <p className="mt-2 text-3xl font-semibold text-white">
              {stats.reduce((sum, s) => sum + (s.total_responses || 0), 0)}
            </p>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg">
        <div className="px-6 py-4 border-b border-neutral-700">
          <h2 className="text-lg font-medium text-white">Questions</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Drag to reorder. Click to edit.
          </p>
        </div>
        <QuestionsList 
          questions={questions || []} 
          stats={stats || []}
        />
      </div>

      {/* Empty State */}
      {(!questions || questions.length === 0) && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-neutral-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">No questions</h3>
          <p className="mt-1 text-sm text-neutral-400">
            Get started by creating a new onboarding question.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/onboarding/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Question
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
