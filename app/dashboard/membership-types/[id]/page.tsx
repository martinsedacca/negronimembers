'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Loader2, Award, FileText, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function EditMembershipTypePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const id = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: 0,
    visits_required: 0,
    is_active: true,
    benefits: {} as Record<string, any>
  })

  // Load existing data
  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from('membership_types')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setError('Failed to load membership type')
        setLoading(false)
        return
      }

      if (data) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          points_required: (data as any).points_required || 0,
          visits_required: (data as any).visits_required || 0,
          is_active: data.is_active ?? true,
          benefits: (data.benefits as Record<string, any>) || {}
        })
      }
      setLoading(false)
    }

    loadData()
  }, [id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('membership_types')
        .update({
          name: formData.name,
          description: formData.description,
          points_required: formData.points_required,
          visits_required: formData.visits_required,
          is_active: formData.is_active,
          benefits: formData.benefits,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) throw updateError

      router.push('/dashboard/membership-types')
    } catch (err: any) {
      console.error('Error updating membership type:', err)
      setError(err.message || 'Failed to update membership type')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this membership level? This cannot be undone.')) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      const { error: deleteError } = await supabase
        .from('membership_types')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      router.push('/dashboard/membership-types')
    } catch (err: any) {
      console.error('Error deleting membership type:', err)
      setError(err.message || 'Failed to delete membership type')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/membership-types"
            className="p-2 hover:bg-neutral-800 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Membership Level</h1>
            <p className="text-neutral-400">Update level settings</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
          title="Delete level"
        >
          {deleting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
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
            Members need to meet <strong>at least one</strong> of these requirements to reach this level. Set to 0 if not required.
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
            disabled={saving || !formData.name}
            className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
