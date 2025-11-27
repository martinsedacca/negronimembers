'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'
import { Loader2 } from 'lucide-react'
import DatePicker from '@/components/ui/DatePicker'
import ApplicabilitySection from './ApplicabilitySection'

type MembershipType = Database['public']['Tables']['membership_types']['Row']

interface NewPromotionFormProps {
  membershipTypes: MembershipType[]
}

type ApplicabilityType = 'all' | 'tier' | 'code'

export default function NewPromotionForm({ membershipTypes }: NewPromotionFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [codes, setCodes] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed' | 'points' | 'perk',
    discount_value: '',
    start_date: new Date().toISOString().split('T')[0], // Today's date
    end_date: '',
    min_usage_count: '0',
    max_usage_count: '',
    is_active: true,
    terms_conditions: '',
  })

  const [isAllMembers, setIsAllMembers] = useState(true)
  const [selectedTiers, setSelectedTiers] = useState<string[]>([])
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])

  useEffect(() => {
    async function fetchCodes() {
      const { data } = await supabase
        .from('codes')
        .select('id, code, description')
        .eq('is_active', true)
        .order('code')
      if (data) setCodes(data)
    }
    fetchCodes()
  }, [])

  const toggleTier = (tier: string) => {
    setSelectedTiers(prev => 
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    )
  }

  const toggleCode = (codeId: string) => {
    setSelectedCodes(prev => 
      prev.includes(codeId) ? prev.filter(c => c !== codeId) : [...prev, codeId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Build applicable_to array
      let applicable_to: string[] = ['all']
      
      if (!isAllMembers) {
        applicable_to = [
          ...selectedTiers.map(tier => `tier:${tier}`),
          ...selectedCodes.map(codeId => {
            const code = codes.find(c => c.id === codeId)
            return `code:${code?.code}`
          }).filter(Boolean)
        ]
        
        // If nothing selected, default to all
        if (applicable_to.length === 0) {
          applicable_to = ['all']
        }
      }

      const { error: insertError } = await supabase.from('promotions').insert({
        title: formData.title,
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: formData.discount_type === 'perk' ? null : parseFloat(formData.discount_value),
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : new Date().toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        min_usage_count: parseInt(formData.min_usage_count) || 0,
        max_usage_count: formData.max_usage_count ? parseInt(formData.max_usage_count) : null,
        applicable_to,
        is_active: formData.is_active,
        terms_conditions: formData.terms_conditions || null,
      })

      if (insertError) throw insertError

      router.push('/dashboard/promotions')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-md">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-300">
            Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
            placeholder="e.g., Summer Discount"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-300">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
            placeholder="Describe the promotion details"
          />
        </div>

        {/* Discount Type & Value */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="discount_type" className="block text-sm font-medium text-neutral-300">
              Discount Type *
            </label>
            <select
              id="discount_type"
              required
              value={formData.discount_type}
              onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
              className="mt-1 block w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
              <option value="points">Points</option>
              <option value="perk">Perk (Non-monetary benefit)</option>
            </select>
          </div>

          {formData.discount_type !== 'perk' && (
            <div>
              <label htmlFor="discount_value" className="block text-sm font-medium text-neutral-300">
                {formData.discount_type === 'percentage' ? 'Percentage' : formData.discount_type === 'points' ? 'Points' : 'Amount'} *
              </label>
              <input
                type="number"
                id="discount_value"
                required
                step="0.01"
                min="0"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
                placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
              />
            </div>
          )}
        </div>

        {/* Start & End Date */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <DatePicker
              label="Start Date"
              value={formData.start_date}
              onChange={(value) => setFormData({ ...formData, start_date: value })}
              type="date"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Leave empty to start immediately
            </p>
          </div>
          <div>
            <DatePicker
              label="End Date"
              value={formData.end_date}
              onChange={(value) => setFormData({ ...formData, end_date: value })}
              type="date"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Leave empty for no expiration
            </p>
          </div>
        </div>

        {/* Usage Requirements */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="min_usage_count" className="block text-sm font-medium text-neutral-300">
              Minimum Usage Required
            </label>
            <input
              type="number"
              id="min_usage_count"
              min="0"
              value={formData.min_usage_count}
              onChange={(e) => setFormData({ ...formData, min_usage_count: e.target.value })}
              className="mt-1 block w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Number of times member must have used their card
            </p>
          </div>

          <div>
            <label htmlFor="max_usage_count" className="block text-sm font-medium text-neutral-300">
              Maximum Usage Allowed
            </label>
            <input
              type="number"
              id="max_usage_count"
              min="1"
              value={formData.max_usage_count}
              onChange={(e) => setFormData({ ...formData, max_usage_count: e.target.value })}
              className="mt-1 block w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
              placeholder="Unlimited"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Leave empty for unlimited usage
            </p>
          </div>
        </div>

        {/* APPLICABILITY SECTION */}
        <ApplicabilitySection
          membershipTypes={membershipTypes}
          codes={codes}
          selectedTiers={selectedTiers}
          selectedCodes={selectedCodes}
          isAllMembers={isAllMembers}
          onToggleAll={setIsAllMembers}
          onToggleTier={toggleTier}
          onToggleCode={toggleCode}
        />

        {/* Terms & Conditions */}
        <div>
          <label htmlFor="terms_conditions" className="block text-sm font-medium text-neutral-300">
            Terms & Conditions
          </label>
          <textarea
            id="terms_conditions"
            rows={4}
            value={formData.terms_conditions}
            onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
            placeholder="Terms and conditions of the promotion"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 text-brand-500 focus:ring-orange-500 border-neutral-600 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-white">
            Activate promotion immediately
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-700">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm text-sm font-medium hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? 'Creating...' : 'Create Benefit'}
        </button>
      </div>
    </form>
  )
}
