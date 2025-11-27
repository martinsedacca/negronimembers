'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Tag, Users } from 'lucide-react'
import DatePicker from '@/components/ui/DatePicker'

interface Code {
  id?: string
  code: string
  description: string
  expires_at: string | null
  max_uses: number | null
  is_active: boolean
}

interface CodeFormProps {
  code?: Code
}

export default function CodeForm({ code }: CodeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<Code>({
    code: code?.code || '',
    description: code?.description || '',
    expires_at: code?.expires_at || null,
    max_uses: code?.max_uses || null,
    is_active: code?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = code?.id 
        ? `/api/codes/${code.id}`
        : '/api/codes'
      
      const method = code?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save code')
      }

      router.push('/dashboard/codes')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-800 border border-neutral-700 rounded-xl p-6">
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-md">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Code */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-300 mb-2">
          <Tag className="w-4 h-4" />
          Code *
        </label>
        <input
          type="text"
          required
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono uppercase"
          placeholder="AERO"
          maxLength={20}
        />
        <p className="text-xs text-neutral-500 mt-1">
          Unique code that members can redeem (e.g., AERO, VIP2024)
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Description *
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          placeholder="Access to special benefits at Aeroparque location"
          rows={3}
        />
      </div>

      {/* Expiration Date */}
      <DatePicker
        label="Expiration Date (Optional)"
        value={formData.expires_at || ''}
        onChange={(value) => setFormData({ ...formData, expires_at: value || null })}
        type="datetime"
      />

      {/* Max Uses */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-300 mb-2">
          <Users className="w-4 h-4" />
          Maximum Uses (Optional)
        </label>
        <input
          type="number"
          min="1"
          value={formData.max_uses || ''}
          onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
          className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Unlimited"
        />
        <p className="text-xs text-neutral-500 mt-1">
          Leave empty for unlimited uses
        </p>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between p-4 bg-neutral-900 rounded-lg">
        <div>
          <label className="text-sm font-medium text-white">Active Status</label>
          <p className="text-xs text-neutral-400 mt-1">
            Inactive codes cannot be redeemed
          </p>
        </div>
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

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-neutral-700">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2 bg-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-600 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {code ? 'Update Code' : 'Create Code'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
