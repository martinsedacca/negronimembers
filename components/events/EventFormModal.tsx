'use client'

import { useState } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import type { Database } from '@/lib/types/database'

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

      if (!response.ok) throw new Error('Error al crear evento')

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
          <h2 className="text-xl font-bold text-white">Nuevo Evento</h2>
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
            placeholder="Nombre del evento"
            className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
          />
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción"
            rows={3}
            className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg resize-none"
          />
          <input
            type="datetime-local"
            required
            value={formData.event_date}
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
          />
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Ubicación"
            className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
          />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Creando...</> : <><Save className="w-4 h-4" />Crear</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
