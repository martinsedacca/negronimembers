'use client'

import { useState, useEffect } from 'react'
import { GripVertical, Edit, Trash2, Eye, EyeOff, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  question_text: string
  question_type: string
  options?: any
  is_required: boolean
  is_active: boolean
  display_order: number
}

interface QuestionStat {
  question_id: string
  total_responses: number
  response_distribution?: any
}

interface QuestionsListProps {
  questions: Question[]
  stats: QuestionStat[]
}

export default function QuestionsList({ questions, stats }: QuestionsListProps) {
  const router = useRouter()
  const [localQuestions, setLocalQuestions] = useState(questions)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Sync local state with server state when questions change
  useEffect(() => {
    setLocalQuestions(questions)
  }, [questions])

  const getQuestionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      // Member profile fields
      full_name: '📋 Full Name',
      email: '📧 Email',
      phone: '📱 Phone',
      date_of_birth: '🎂 Date of Birth',
      // Custom question types
      text: 'Text',
      select: 'Single Choice',
      multi_select: 'Multiple Choice',
      yes_no: 'Yes/No',
      rating: 'Rating (1-5)',
    }
    return labels[type] || type
  }

  const getQuestionTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      // Member profile fields (green tones)
      full_name: 'bg-green-500/20 text-green-400',
      email: 'bg-green-500/20 text-green-400',
      phone: 'bg-green-500/20 text-green-400',
      date_of_birth: 'bg-green-500/20 text-green-400',
      // Custom question types
      text: 'bg-blue-500/20 text-blue-400',
      select: 'bg-purple-500/20 text-purple-400',
      multi_select: 'bg-pink-500/20 text-pink-400',
      yes_no: 'bg-yellow-500/20 text-yellow-400',
      rating: 'bg-orange-500/20 text-orange-400',
    }
    return colors[type] || 'bg-neutral-500/20 text-neutral-400'
  }

  const getStats = (questionId: string) => {
    return stats.find(s => s.question_id === questionId)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    // Optimistic update - reorder locally first
    const reorderedQuestions = [...localQuestions]
    const [movedQuestion] = reorderedQuestions.splice(draggedIndex, 1)
    reorderedQuestions.splice(dropIndex, 0, movedQuestion)
    
    // Update display_order for all questions
    const updatedQuestions = reorderedQuestions.map((q, index) => ({
      ...q,
      display_order: index + 1
    }))
    
    setLocalQuestions(updatedQuestions)
    setDraggedIndex(null)
    setDragOverIndex(null)

    // Update in background
    try {
      const response = await fetch('/api/onboarding/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          questionId: movedQuestion.id, 
          newOrder: dropIndex + 1 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to reorder question')
      }

      // Soft refresh to sync with server without full page reload
      router.refresh()
    } catch (error) {
      console.error('Error reordering:', error)
      // Revert to original order on error
      setLocalQuestions(questions)
    }
  }

  const handleToggleActive = async (questionId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/onboarding/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle question')
      }

      router.refresh()
    } catch (error) {
      console.error('Error toggling:', error)
      alert('Failed to toggle question status')
    }
  }

  const handleDeactivate = async (questionId: string, questionText: string) => {
    if (!confirm(`¿Desactivar la pregunta "${questionText}"?\n\nLa pregunta seguirá existiendo con todas sus respuestas históricas, pero no se mostrará en el formulario de onboarding.`)) {
      return
    }

    try {
      const response = await fetch(`/api/onboarding/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false })
      })

      if (!response.ok) {
        throw new Error('Failed to deactivate question')
      }

      router.refresh()
    } catch (error) {
      console.error('Error deactivating:', error)
      alert('Error al desactivar la pregunta')
    }
  }

  const handleDelete = async (questionId: string, questionText: string, hasResponses: boolean) => {
    if (hasResponses) {
      alert('⚠️ ATENCIÓN: Esta pregunta tiene respuestas de miembros.\n\nNo se puede eliminar permanentemente. Use "Desactivar" para ocultarla del formulario manteniendo el historial de respuestas.')
      return
    }

    if (!confirm(`⚠️ ELIMINAR PERMANENTEMENTE\n\n¿Estás seguro de eliminar "${questionText}"?\n\nEsta acción NO SE PUEDE DESHACER.\n\nSolo se puede eliminar porque no tiene respuestas aún.`)) {
      return
    }

    try {
      const response = await fetch(`/api/onboarding/${questionId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete question')
      }

      router.refresh()
    } catch (error: any) {
      console.error('Error deleting:', error)
      alert(`Error al eliminar: ${error.message}`)
    }
  }

  if (localQuestions.length === 0) {
    return null
  }

  return (
    <div className="divide-y divide-neutral-700">
      {localQuestions.map((question, index) => {
        const questionStats = getStats(question.id)
        
        return (
          <div
            key={question.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(index)}
            className={`p-6 hover:bg-neutral-700/50 transition-all duration-200 cursor-move ${
              draggedIndex === index ? 'opacity-50 scale-95' : ''
            } ${
              dragOverIndex === index && draggedIndex !== index ? 'border-t-2 border-orange-500' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Drag Handle */}
              <div className="flex-shrink-0 pt-1">
                <GripVertical className="w-5 h-5 text-neutral-500" />
              </div>

              {/* Question Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-neutral-500">
                        #{question.display_order}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${getQuestionTypeColor(
                          question.question_type
                        )}`}
                      >
                        {getQuestionTypeLabel(question.question_type)}
                      </span>
                      {question.is_required && (
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-red-500/20 text-red-400">
                          Required
                        </span>
                      )}
                      {!question.is_active && (
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-neutral-600/20 text-neutral-500">
                          Inactive
                        </span>
                      )}
                      {questionStats && questionStats.total_responses > 0 && (
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-500/20 text-blue-400">
                          {questionStats.total_responses} {questionStats.total_responses === 1 ? 'respuesta' : 'respuestas'}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-base font-medium text-white mb-1">
                      {question.question_text}
                    </h3>

                    {/* Options Preview */}
                    {question.options && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(Array.isArray(question.options) ? question.options : []).slice(0, 3).map((option: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded text-xs"
                          >
                            {option}
                          </span>
                        ))}
                        {Array.isArray(question.options) && question.options.length > 3 && (
                          <span className="px-2 py-1 text-neutral-500 text-xs">
                            +{question.options.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    {questionStats && (
                      <div className="flex items-center gap-4 mt-3 text-sm text-neutral-400">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>{questionStats.total_responses} responses</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/onboarding/${question.id}`}
                      className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    
                    <button
                      onClick={() => handleToggleActive(question.id, question.is_active)}
                      className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition"
                      title={question.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {question.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(
                        question.id, 
                        question.question_text,
                        (questionStats?.total_responses || 0) > 0
                      )}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-neutral-700 rounded-lg transition"
                      title={(questionStats?.total_responses || 0) > 0 ? 'Cannot delete - has responses' : 'Delete permanently'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
