'use client'

import { useState } from 'react'
import { X, Save, Loader2, MapPin } from 'lucide-react'
import type { Database } from '@/lib/types/database'
import DatePicker from '@/components/ui/DatePicker'

type Branch = Database['public']['Tables']['branches']['Row']

interface EventFormModalProps {
  branches: Branch[]
  onClose: () => void
  onSuccess: () => void
}

export default function EventFormModal({ branches, onClose, onSuccess }: EventFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_date: '',
    location: '',
    branch_id: '',
    max_attendees: '',
    points_reward: '20',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
          points_reward: parseInt(formData.points_reward),
        }),
      })

      if (!response.ok) throw new Error('Error creating event')

      onSuccess()
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">New Event</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-700 rounded-lg">
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Event name"
            className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
          />
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description"
            rows={3}
            className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg resize-none"
          />
          <DatePicker
            label="Event Date & Time"
            value={formData.event_date}
            onChange={(value) => setFormData({ ...formData, event_date: value })}
            required
            type="datetime"
          />
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Location (Branch)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <select
                value={formData.branch_id}
                onChange={(e) => {
                  const branch = branches.find(b => b.id === e.target.value)
                  setFormData({ 
                    ...formData, 
                    branch_id: e.target.value,
                    location: branch ? branch.name : ''
                  })
                }}
                className="w-full pl-10 pr-4 py-3 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} - {branch.address}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : <><Save className="w-4 h-4" />Create</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
