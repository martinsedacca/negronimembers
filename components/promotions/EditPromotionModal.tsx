'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'
import DatePicker from '@/components/ui/DatePicker'
import ApplicabilitySection from './ApplicabilitySection'

type Promotion = Database['public']['Tables']['promotions']['Row']
type MembershipType = Database['public']['Tables']['membership_types']['Row']

interface EditPromotionModalProps {
  promotion: Promotion
  membershipTypes: MembershipType[]
  onClose: () => void
  onUpdate: () => void
}

export default function EditPromotionModal({ 
  promotion, 
  membershipTypes,
  onClose, 
  onUpdate 
}: EditPromotionModalProps) {
  const supabase = createClient()
  const [codes, setCodes] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [isAllLocations, setIsAllLocations] = useState(true)
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: promotion.title,
    description: promotion.description || '',
    discount_type: promotion.discount_type,
    discount_value: promotion.discount_value?.toString() || '',
    start_date: new Date(promotion.start_date).toISOString().slice(0, 16),
    end_date: promotion.end_date ? new Date(promotion.end_date).toISOString().slice(0, 16) : '',
    min_usage_count: promotion.min_usage_count.toString(),
    max_usage_count: promotion.max_usage_count?.toString() || '',
    is_active: promotion.is_active,
    terms_conditions: promotion.terms_conditions || '',
  })
  const [isAllMembers, setIsAllMembers] = useState(true)
  const [selectedTiers, setSelectedTiers] = useState<string[]>([])
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Initialize from promotion's applicable_to
  useEffect(() => {
    const applicable_to = promotion.applicable_to || ['all']
    
    if (applicable_to.includes('all')) {
      setIsAllMembers(true)
      setSelectedTiers([])
      setSelectedCodes([])
    } else {
      setIsAllMembers(false)
      
      // Extract tiers
      const tiers = applicable_to
        .filter(item => item.startsWith('tier:'))
        .map(item => item.replace('tier:', ''))
      setSelectedTiers(tiers)
      
      // Extract codes - need to match by code name after fetching
      const codeNames = applicable_to
        .filter(item => item.startsWith('code:'))
        .map(item => item.replace('code:', ''))
      
      // Will set selectedCodes after codes are fetched
      if (codeNames.length > 0) {
        supabase
          .from('codes')
          .select('id, code')
          .in('code', codeNames)
          .then(({ data }) => {
            if (data) {
              setSelectedCodes(data.map(c => c.id))
            }
          })
      }
    }
  }, [promotion])

  useEffect(() => {
    async function fetchData() {
      // Fetch codes
      const { data: codesData } = await supabase
        .from('codes')
        .select('id, code, description')
        .eq('is_active', true)
        .order('code')
      if (codesData) setCodes(codesData)
      
      // Fetch branches
      const { data: branchesData } = await supabase
        .from('branches')
        .select('id, name')
        .order('name')
      if (branchesData) setBranches(branchesData)
    }
    fetchData()
    
    // Initialize locations from promotion
    const applicableBranches = promotion.applicable_branches
    if (!applicableBranches || applicableBranches.length === 0) {
      setIsAllLocations(true)
      setSelectedBranches([])
    } else {
      setIsAllLocations(false)
      setSelectedBranches(applicableBranches)
    }
  }, [supabase, promotion])

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

  const toggleBranch = (branchId: string) => {
    setSelectedBranches(prev => 
      prev.includes(branchId) ? prev.filter(b => b !== branchId) : [...prev, branchId]
    )
  }

  const handleSave = async () => {
    setSaving(true)
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
        
        if (applicable_to.length === 0) {
          applicable_to = ['all']
        }
      }

      // Build applicable_branches array
      const applicable_branches = isAllLocations ? null : selectedBranches.length > 0 ? selectedBranches : null

      const response = await fetch(`/api/promotions/${promotion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          discount_type: formData.discount_type,
          discount_value: formData.discount_type === 'perk' ? null : parseFloat(formData.discount_value),
          start_date: new Date(formData.start_date).toISOString(),
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : new Date('2099-12-31').toISOString(),
          min_usage_count: parseInt(formData.min_usage_count),
          max_usage_count: formData.max_usage_count ? parseInt(formData.max_usage_count) : null,
          applicable_to,
          applicable_branches,
          is_active: formData.is_active,
          terms_conditions: formData.terms_conditions || null,
        }),
      })

      if (!response.ok) throw new Error('Error saving benefit')

      onUpdate()
      onClose()
    } catch (error: any) {
      alert('Error saving: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this benefit?')) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/promotions/${promotion.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error deleting benefit')

      onUpdate()
      onClose()
    } catch (error: any) {
      alert('Error deleting: ' + error.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">Edit Benefit</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Discount Type *
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
                <option value="points">Points</option>
                <option value="perk">Perk (Non-monetary benefit)</option>
              </select>
            </div>
            {formData.discount_type !== 'perk' && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {formData.discount_type === 'percentage' ? 'Percentage' : formData.discount_type === 'points' ? 'Points' : 'Amount'} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <DatePicker
                label="Start Date"
                value={formData.start_date}
                onChange={(value) => setFormData({ ...formData, start_date: value })}
                required
                type="datetime"
              />
            </div>
            <div>
              <DatePicker
                label="End Date"
                value={formData.end_date}
                onChange={(value) => setFormData({ ...formData, end_date: value })}
                type="datetime"
              />
              <p className="text-xs text-neutral-500 mt-1">Leave empty for no expiration</p>
            </div>
          </div>

          {/* Usage Counts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Minimum Usage Required
              </label>
              <input
                type="number"
                value={formData.min_usage_count}
                onChange={(e) => setFormData({ ...formData, min_usage_count: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Maximum Usage Allowed (optional)
              </label>
              <input
                type="number"
                value={formData.max_usage_count}
                onChange={(e) => setFormData({ ...formData, max_usage_count: e.target.value })}
                placeholder="Unlimited"
                className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
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

          {/* LOCATIONS SECTION */}
          <div className="border border-neutral-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Available at Locations</h3>
            
            {branches.length === 0 ? (
              <p className="text-neutral-500 text-sm">No locations found. The benefit will be available at all locations.</p>
            ) : (
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="locations"
                    checked={isAllLocations}
                    onChange={() => {
                      setIsAllLocations(true)
                      setSelectedBranches([])
                    }}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-neutral-600"
                  />
                  <span className="text-neutral-300">All locations</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="locations"
                    checked={!isAllLocations}
                    onChange={() => setIsAllLocations(false)}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-neutral-600"
                  />
                  <span className="text-neutral-300">Specific locations only</span>
                </label>
                
                {!isAllLocations && (
                  <div className="ml-7 mt-2 space-y-2 p-3 bg-neutral-900/50 rounded-lg">
                    {branches.map((branch) => (
                      <label key={branch.id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBranches.includes(branch.id)}
                          onChange={() => toggleBranch(branch.id)}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-neutral-600 rounded"
                        />
                        <span className="text-neutral-300">{branch.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-300">
              Benefit Active
            </label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                formData.is_active ? 'bg-green-500' : 'bg-neutral-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  formData.is_active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Terms & Conditions
            </label>
            <textarea
              value={formData.terms_conditions}
              onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
              rows={3}
              placeholder="Optional..."
              className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-800 border-t border-neutral-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
