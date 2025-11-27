'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Loader2, Award, FileText } from 'lucide-react'
import Link from 'next/link'

export default function NewMembershipTypePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: 0,
    visits_required: 0,
    is_active: true,
    benefits: {
      access: 'standard',
      events: true,
      discounts: 'basic'
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('membership_types')
        .insert({
          name: formData.name,
          description: formData.description,
          points_required: formData.points_required,
          visits_required: formData.visits_required,
          is_active: formData.is_active,
          benefits: formData.benefits
        })

      if (insertError) throw insertError

      router.push('/dashboard/membership-types')
    } catch (err: any) {
      console.error('Error creating membership type:', err)
      setError(err.message || 'Failed to create membership type')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/membership-types"
          className="p-2 hover:bg-neutral-800 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">New Membership Level</h1>
          <p className="text-neutral-400">Create a new membership tier</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            Basic Information
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Level Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Gold, Platinum, VIP"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the benefits of this level"
              rows={3}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-neutral-600 bg-neutral-900 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="is_active" className="text-sm text-neutral-300">
              Active (visible to members)
            </label>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            Level Requirements
          </h2>
          <p className="text-sm text-neutral-400">
            Members need to meet these requirements to reach this level. Set to 0 if not required.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Points Required
              </label>
              <input
                type="number"
                min="0"
                value={formData.points_required}
                onChange={(e) => setFormData({ ...formData, points_required: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-neutral-500 mt-1">Accumulated points needed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Visits Required
              </label>
              <input
                type="number"
                min="0"
                value={formData.visits_required}
                onChange={(e) => setFormData({ ...formData, visits_required: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-neutral-500 mt-1">Number of visits needed</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Link
            href="/dashboard/membership-types"
            className="flex-1 py-3 px-4 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition text-center font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.name}
            className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Level
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
