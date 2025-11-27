'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Star, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import BirthdayInput from './components/BirthdayInput'

interface OnboardingQuestion {
  id: string
  question_text: string
  question_type: string
  options?: string[]
  placeholder?: string
  is_required: boolean
  help_text?: string
  member_field?: string | null
}

interface MemberData {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  date_of_birth: string | null
  onboarding_completed: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [memberData, setMemberData] = useState<MemberData | null>(null)
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  // Fetch questions and member data from Supabase
  const fetchData = useCallback(async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/member/auth')
        return
      }

      // Get member with profile fields
      const { data: member } = await supabase
        .from('members')
        .select('id, onboarding_completed, full_name, email, phone, date_of_birth')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!member) {
        router.push('/member/auth')
        return
      }

      // If already completed, redirect - no more questions ever
      if (member.onboarding_completed) {
        router.push('/member/pass')
        return
      }

      setMemberId(member.id)
      setMemberData(member as MemberData)

      // Get active questions
      const { data: questionsData, error } = await supabase
        .from('onboarding_questions')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      
      // Filter out questions for member fields that are already filled
      const filteredQuestions = (questionsData || []).filter((q: OnboardingQuestion) => {
        if (!q.member_field) return true // Custom questions always show
        
        // Check if the member already has this field filled
        const memberValue = member[q.member_field as keyof typeof member]
        return !memberValue // Only show if field is empty/null
      })
      
      setQuestions(filteredQuestions)

      // If no questions, mark onboarding as complete and redirect
      if (filteredQuestions.length === 0) {
        await supabase
          .from('members')
          .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
          .eq('id', member.id)
        router.push('/member/pass')
        return
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalSteps = questions.length
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0

  const currentQuestion = questions[currentStep]

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Completar onboarding - guardar todo en la BD
      if (!memberId) return
      
      setSaving(true)
      try {
        // 1. Build member update data from member field questions
        const updateData: Record<string, any> = {
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        }

        // Collect member field values
        const memberFieldQuestions = questions.filter(q => q.member_field)
        for (const q of memberFieldQuestions) {
          const answer = answers[q.id]
          if (!answer) continue
          
          switch (q.member_field) {
            case 'full_name':
            case 'email':
            case 'phone':
              updateData[q.member_field] = answer
              break
            case 'date_of_birth':
              if (answer.day && answer.month && answer.year) {
                updateData.date_of_birth = `${answer.year}-${answer.month.padStart(2, '0')}-${answer.day.padStart(2, '0')}`
              }
              break
          }
        }

        const { error: memberError } = await supabase
          .from('members')
          .update(updateData)
          .eq('id', memberId)

        if (memberError) throw memberError

        // 2. Save custom question responses (non-member-field questions)
        const customQuestions = questions.filter(q => !q.member_field)
        const responsesToSave = customQuestions
          .filter(q => answers[q.id] !== undefined)
          .map(q => ({
            member_id: memberId,
            question_id: q.id,
            response: typeof answers[q.id] === 'object' ? JSON.stringify(answers[q.id]) : String(answers[q.id]),
          }))

        if (responsesToSave.length > 0) {
          // Delete existing responses first
          await supabase
            .from('onboarding_responses')
            .delete()
            .eq('member_id', memberId)

          // Insert new responses
          const { error: responsesError } = await supabase
            .from('onboarding_responses')
            .insert(responsesToSave)

          if (responsesError) {
            console.error('Error saving responses:', responsesError)
          }
        }

        router.push('/member/pass')
      } catch (error) {
        console.error('Error completing onboarding:', error)
        setSaving(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canContinue = () => {
    if (!currentQuestion) return false
    
    if (currentQuestion.is_required) {
      const answer = answers[currentQuestion.id]
      
      // Special handling for date_of_birth type
      if (currentQuestion.question_type === 'date_of_birth') {
        return answer && answer.day && answer.month && answer.year
      }
      
      // For multi_select, check if array has items
      if (currentQuestion.question_type === 'multi_select') {
        return Array.isArray(answer) && answer.length > 0
      }
      
      // Email validation
      if (currentQuestion.question_type === 'email' && answer) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer)
      }
      
      return answer !== undefined && answer !== ''
    }
    return true
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    return (
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-white">{currentQuestion.question_text}</h2>
        {currentQuestion.help_text && (
          <p className="text-neutral-400">{currentQuestion.help_text}</p>
        )}
        {!currentQuestion.is_required && (
          <span className="text-sm text-neutral-500">(Optional)</span>
        )}

        {/* Full Name */}
        {currentQuestion.question_type === 'full_name' && (
          <input
            type="text"
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-800 text-white border border-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
            placeholder="Enter your full name"
          />
        )}

        {/* Email */}
        {currentQuestion.question_type === 'email' && (
          <input
            type="email"
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-800 text-white border border-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
            placeholder="Enter your email address"
          />
        )}

        {/* Phone */}
        {currentQuestion.question_type === 'phone' && (
          <input
            type="tel"
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-800 text-white border border-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
            placeholder="Enter your phone number"
          />
        )}

        {/* Date of Birth */}
        {currentQuestion.question_type === 'date_of_birth' && (
          <BirthdayInput
            value={answers[currentQuestion.id] || { day: '', month: '', year: '' }}
            onChange={(value) => setAnswers({ ...answers, [currentQuestion.id]: value })}
          />
        )}

        {/* Texto libre */}
        {currentQuestion.question_type === 'text' && (
          <textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-800 text-white border border-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition resize-none"
            rows={4}
            placeholder={currentQuestion.placeholder || "Write here..."}
          />
        )}

        {/* Select (radio) */}
        {currentQuestion.question_type === 'select' && currentQuestion.options && (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => setAnswers({ ...answers, [currentQuestion.id]: option })}
                className={`w-full p-4 rounded-xl border-2 transition text-left ${
                  answers[currentQuestion.id] === option
                    ? 'border-orange-500 bg-orange-500/10 text-white'
                    : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion.id] === option
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-neutral-600'
                    }`}
                  >
                    {answers[currentQuestion.id] === option && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Multi select (checkboxes) */}
        {currentQuestion.question_type === 'multi_select' && currentQuestion.options && (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => {
              const selected = (answers[currentQuestion.id] || []).includes(option)
              return (
                <button
                  key={option}
                  onClick={() => {
                    const current = answers[currentQuestion.id] || []
                    const updated = selected
                      ? current.filter((o: string) => o !== option)
                      : [...current, option]
                    setAnswers({ ...answers, [currentQuestion.id]: updated })
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition text-left ${
                    selected
                      ? 'border-orange-500 bg-orange-500/10 text-white'
                      : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                        selected
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-neutral-600'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Yes/No */}
        {currentQuestion.question_type === 'yes_no' && (
          <div className="grid grid-cols-2 gap-4">
            {['Yes', 'No'].map((option) => (
              <button
                key={option}
                onClick={() => setAnswers({ ...answers, [currentQuestion.id]: option === 'Yes' })}
                className={`p-6 rounded-xl border-2 transition font-semibold ${
                  answers[currentQuestion.id] === (option === 'Yes')
                    ? 'border-orange-500 bg-orange-500/10 text-white'
                    : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Rating */}
        {currentQuestion.question_type === 'rating' && (
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setAnswers({ ...answers, [currentQuestion.id]: rating })}
                className="transition transform hover:scale-110"
              >
                <Star
                  className={`w-12 h-12 ${
                    (answers[currentQuestion.id] || 0) >= rating
                      ? 'fill-orange-500 text-orange-500'
                      : 'text-neutral-700'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Loading questions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur-lg border-b border-neutral-800">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm text-orange-500 font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">{renderQuestion()}</AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800">
        <div className="max-w-lg mx-auto px-6 py-4 flex gap-4">
          {currentStep > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleBack}
              className="px-6 py-3 bg-neutral-800 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-neutral-700 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={!canContinue() || saving}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : currentStep === totalSteps - 1 ? (
              <>
                Complete
                <Check className="w-5 h-5" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
