'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'
import { Loader2, ImagePlus, X, Upload } from 'lucide-react'
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
    image_url: '',
    discount_type: 'percentage' as 'percentage' | 'fixed' | 'points' | 'perk',
    discount_value: '',
    start_date: new Date().toISOString().split('T')[0], // Today's date
    end_date: '',
    min_usage_count: '0',
    max_usage_count: '',
    max_uses_per_member: '',
    is_active: true,
    terms_conditions: '',
  })

  const [validDays, setValidDays] = useState<number[]>([]) // Empty = all days valid
  
  const dayNames = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ]

  const toggleDay = (day: number) => {
    setValidDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    )
  }

  const [isAllMembers, setIsAllMembers] = useState(true)
  const [selectedTiers, setSelectedTiers] = useState<string[]>([])
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [isAllLocations, setIsAllLocations] = useState(true)
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    async function fetchData() {
      // Fetch codes
      const { data: codesData } = await supabase
        .from('codes')
        .select('id, code, description')
        .eq('is_active', true)
        .order('code')
      if (codesData) setCodes(codesData)
      
      // Fetch branches/locations (without is_active filter in case column doesn't exist)
      const { data: branchesData, error } = await supabase
        .from('branches')
        .select('id, name')
        .order('name')
      
      if (error) {
        console.error('Error fetching branches:', error)
      }
      if (branchesData) {
        setBranches(branchesData)
      }
    }
    fetchData()
  }, [supabase])

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploadingImage(true)
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `promotions/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('promo-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL (no expiration for public buckets)
      const { data: { publicUrl } } = supabase.storage
        .from('promo-images')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, image_url: publicUrl }))
    } catch (error: any) {
      console.error('Upload error:', error)
      alert('Error uploading image: ' + error.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!formData.image_url) return

    // Extract file path from URL
    const urlParts = formData.image_url.split('/promo-images/')
    if (urlParts.length > 1) {
      const filePath = urlParts[1]
      await supabase.storage.from('promo-images').remove([filePath])
    }
    
    setFormData(prev => ({ ...prev, image_url: '' }))
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
          ...selectedTiers.map(tierId => `tier_id:${tierId}`),
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

      // Build applicable_branches array
      const applicable_branches = isAllLocations ? null : selectedBranches.length > 0 ? selectedBranches : null

      const { error: insertError } = await supabase.from('promotions').insert({
        title: formData.title,
        description: formData.description || null,
        image_url: formData.image_url || null,
        discount_type: formData.discount_type,
        discount_value: formData.discount_type === 'perk' ? null : parseFloat(formData.discount_value),
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : new Date().toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : new Date('2099-12-31').toISOString(),
        min_usage_count: parseInt(formData.min_usage_count) || 0,
        max_usage_count: formData.max_usage_count ? parseInt(formData.max_usage_count) : null,
        max_uses_per_member: formData.max_uses_per_member ? parseInt(formData.max_uses_per_member) : null,
        valid_days: validDays.length > 0 ? validDays : null,
        applicable_to,
        applicable_branches,
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

        {/* Promo Image */}
        <div className="border border-neutral-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            <div className="flex items-center gap-2">
              <ImagePlus className="w-4 h-4" />
              Promo Image (optional)
            </div>
          </label>
          <p className="text-xs text-neutral-500 mb-3">
            If set, this image will be shown instead of text in the member app
          </p>
          
          {formData.image_url ? (
            <div className="relative">
              <img 
                src={formData.image_url} 
                alt="Preview" 
                className="w-full h-40 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-600 border-dashed rounded-lg cursor-pointer bg-neutral-700/50 hover:bg-neutral-700 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-8 h-8 mb-2 text-orange-500 animate-spin" />
                    <p className="text-sm text-neutral-400">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-2 text-neutral-400" />
                    <p className="text-sm text-neutral-400">Click to upload image</p>
                    <p className="text-xs text-neutral-500">PNG, JPG, GIF or WebP (max 5MB)</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
          )}
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
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => {
                  const today = new Date()
                  setFormData({ ...formData, end_date: today.toISOString().split('T')[0] })
                }}
                className="px-2 py-1 text-[10px] bg-neutral-700 text-neutral-300 rounded hover:bg-neutral-600 transition"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextWeek = new Date()
                  nextWeek.setDate(nextWeek.getDate() + 7)
                  setFormData({ ...formData, end_date: nextWeek.toISOString().split('T')[0] })
                }}
                className="px-2 py-1 text-[10px] bg-neutral-700 text-neutral-300 rounded hover:bg-neutral-600 transition"
              >
                +1 Week
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextMonth = new Date()
                  nextMonth.setMonth(nextMonth.getMonth() + 1)
                  setFormData({ ...formData, end_date: nextMonth.toISOString().split('T')[0] })
                }}
                className="px-2 py-1 text-[10px] bg-neutral-700 text-neutral-300 rounded hover:bg-neutral-600 transition"
              >
                +1 Month
              </button>
              <button
                type="button"
                onClick={() => {
                  const endYear = new Date()
                  endYear.setMonth(11, 31)
                  setFormData({ ...formData, end_date: endYear.toISOString().split('T')[0] })
                }}
                className="px-2 py-1 text-[10px] bg-neutral-700 text-neutral-300 rounded hover:bg-neutral-600 transition"
              >
                End of Year
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, end_date: '' })}
                className="px-2 py-1 text-[10px] bg-neutral-700 text-neutral-300 rounded hover:bg-neutral-600 transition"
              >
                No Expiry
              </button>
            </div>
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
              Total Usage Limit
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
              Max times this benefit can be used by all members combined
            </p>
          </div>
        </div>

        {/* Per-Member Limit */}
        <div>
          <label htmlFor="max_uses_per_member" className="block text-sm font-medium text-neutral-300">
            Limit Per Member
          </label>
          <input
            type="number"
            id="max_uses_per_member"
            min="1"
            value={formData.max_uses_per_member}
            onChange={(e) => setFormData({ ...formData, max_uses_per_member: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
            placeholder="Unlimited"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Max times each member can use this benefit. Leave empty for unlimited.
          </p>
        </div>

        {/* Valid Days */}
        <div className="border border-neutral-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">Valid Days</h3>
          <p className="text-xs text-neutral-500 mb-3">
            Select specific days when this benefit is available. Leave all unselected for every day.
          </p>
          <div className="flex flex-wrap gap-2">
            {dayNames.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  validDays.includes(day.value)
                    ? 'bg-orange-500 text-white'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
          {validDays.length > 0 && (
            <p className="mt-2 text-xs text-orange-400">
              Only available on: {validDays.map(d => dayNames.find(dn => dn.value === d)?.label).join(', ')}
            </p>
          )}
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
