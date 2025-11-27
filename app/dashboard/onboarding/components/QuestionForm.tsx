'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Save } from 'lucide-react'

interface QuestionFormProps {
  question?: {
    id: string
    question_text: string
    question_type: string
    options?: string[]
    placeholder?: string
    is_required: boolean
    help_text?: string
  }
}

export default function QuestionForm({ question }: QuestionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    question_text: question?.question_text || '',
    question_type: question?.question_type || 'text',
    options: question?.options || [],
    placeholder: question?.placeholder || '',
    is_required: question?.is_required || false,
    help_text: question?.help_text || ''
  })

  const [newOption, setNewOption] = useState('')

  // Member field types (save directly to members table)
  const memberFieldTypes = [
    { value: 'full_name', label: 'Full Name', description: 'Saves to member profile', memberField: 'full_name' },
    { value: 'email', label: 'Email Address', description: 'Saves to member profile', memberField: 'email' },
    { value: 'phone', label: 'Phone Number', description: 'Saves to member profile', memberField: 'phone' },
    { value: 'date_of_birth', label: 'Date of Birth', description: 'Saves to member profile', memberField: 'date_of_birth' },
  ]

  // Custom question types
  const customQuestionTypes = [
    { value: 'text', label: 'Text Input', description: 'Free text answer' },
    { value: 'select', label: 'Single Choice', description: 'Select one option' },
    { value: 'multi_select', label: 'Multiple Choice', description: 'Select multiple options' },
    { value: 'yes_no', label: 'Yes/No', description: 'Simple yes or no' },
    { value: 'rating', label: 'Rating', description: '1-5 star rating' },
  ]

  const questionTypes = [...memberFieldTypes, ...customQuestionTypes]
  const isMemberField = memberFieldTypes.some(t => t.value === formData.question_type)

  const needsOptions = ['select', 'multi_select', 'yes_no'].includes(formData.question_type)

  const handleAddOption = () => {
    if (!newOption.trim()) return
    setFormData({
      ...formData,
      options: [...formData.options, newOption.trim()]
    })
    setNewOption('')
  }

  const handleRemoveOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = question ? `/api/onboarding/${question.id}` : '/api/onboarding'
      const method = question ? 'PUT' : 'POST'

      // Find if this is a member field type
      const memberFieldType = memberFieldTypes.find(t => t.value === formData.question_type)
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          member_field: memberFieldType?.memberField || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save question')
      }

      router.push('/dashboard/onboarding')
      router.refresh()
    } catch (error: any) {
      console.error('Error saving question:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Question Text <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.question_text}
          onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
          placeholder="e.g., What's your favorite drink?"
          className="w-full px-4 py-3 bg-neutral-900 text-white border border-neutral-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          required
        />
      </div>

      {/* Question Type */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Question Type <span className="text-red-500">*</span>
        </label>
        
        {/* Member Profile Fields */}
        <div className="mb-4">
          <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Member Profile Fields</p>
          <p className="text-xs text-neutral-400 mb-3">These save directly to the member's profile. Skip if already filled.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {memberFieldTypes.map((type) => (
              <label
                key={type.value}
                className={`relative flex items-start p-4 cursor-pointer border rounded-lg transition ${
                  formData.question_type === type.value
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-neutral-700 hover:border-neutral-600'
                }`}
              >
                <input
                  type="radio"
                  name="question_type"
                  value={type.value}
                  checked={formData.question_type === type.value}
                  onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{type.label}</div>
                  <div className="text-xs text-green-400 mt-1">{type.description}</div>
                </div>
                {formData.question_type === type.value && (
                  <div className="ml-2 flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Custom Questions */}
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Custom Questions</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customQuestionTypes.map((type) => (
              <label
                key={type.value}
                className={`relative flex items-start p-4 cursor-pointer border rounded-lg transition ${
                  formData.question_type === type.value
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-neutral-700 hover:border-neutral-600'
                }`}
              >
                <input
                  type="radio"
                  name="question_type"
                  value={type.value}
                  checked={formData.question_type === type.value}
                  onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{type.label}</div>
                  <div className="text-xs text-neutral-400 mt-1">{type.description}</div>
                </div>
                {formData.question_type === type.value && (
                  <div className="ml-2 flex-shrink-0">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Options (for select types) */}
      {needsOptions && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Options <span className="text-red-500">*</span>
          </label>
          
          {/* Options List */}
          {formData.options.length > 0 && (
            <div className="space-y-2 mb-3">
              {formData.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-neutral-900 border border-neutral-700 rounded-lg"
                >
                  <span className="flex-1 text-white">{option}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="p-1 text-neutral-400 hover:text-red-500 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Option */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddOption()
                }
              }}
              placeholder="Enter an option and press Enter"
              className="flex-1 px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
            <button
              type="button"
              onClick={handleAddOption}
              className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          
          {formData.options.length === 0 && (
            <p className="text-xs text-neutral-500 mt-2">
              Add at least one option for this question type
            </p>
          )}
        </div>
      )}

      {/* Placeholder (for text inputs) */}
      {formData.question_type === 'text' && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Placeholder Text
          </label>
          <input
            type="text"
            value={formData.placeholder}
            onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
            placeholder="e.g., Type your answer here..."
            className="w-full px-4 py-3 bg-neutral-900 text-white border border-neutral-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          />
        </div>
      )}

      {/* Help Text */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Help Text
        </label>
        <textarea
          value={formData.help_text}
          onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
          placeholder="Optional help text to display below the question"
          rows={2}
          className="w-full px-4 py-3 bg-neutral-900 text-white border border-neutral-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      {/* Is Required */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_required"
          checked={formData.is_required}
          onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
          className="w-4 h-4 text-orange-500 bg-neutral-900 border-neutral-700 rounded focus:ring-orange-500"
        />
        <label htmlFor="is_required" className="text-sm font-medium text-white cursor-pointer">
          This question is required
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-700">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !formData.question_text || (needsOptions && formData.options.length === 0)}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : question ? 'Update Question' : 'Create Question'}
        </button>
      </div>
    </form>
  )
}
