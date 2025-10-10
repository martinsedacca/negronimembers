'use client'

import { useState } from 'react'
import { X, UserPlus, Loader2 } from 'lucide-react'
import type { Database } from '@/lib/types/database'

type EventStats = Database['public']['Views']['event_stats']['Row']

interface InviteMembersModalProps {
  event: EventStats
  onClose: () => void
  onSuccess: () => void
}

export default function InviteMembersModal({ event, onClose, onSuccess }: InviteMembersModalProps) {
  const [filters, setFilters] = useState({ membership_types: [] as string[], status: ['active'] })
  const [matchingMembers, setMatchingMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [inviting, setInviting] = useState(false)

  const applyFilters = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/segments/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters }),
      })
      const data = await response.json()
      setMatchingMembers(data.members || [])
    } catch (error) {
      alert('Error al aplicar filtros')
    } finally {
      setLoading(false)
    }
  }

  const inviteMembers = async () => {
    setInviting(true)
    try {
      const response = await fetch(`/api/events/${event.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_ids: matchingMembers.map(m => m.id) }),
      })
      if (!response.ok) throw new Error('Error al invitar')
      alert(`${matchingMembers.length} miembros invitados exitosamente!`)
      onSuccess()
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Invitar Miembros</h2>
            <p className="text-sm text-neutral-400">{event.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-700 rounded-lg">
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Estado de miembros</label>
            <select
              onChange={(e) => setFilters({ ...filters, status: [e.target.value] })}
              className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
            >
              <option value="active">Solo activos</option>
              <option value="">Todos</option>
            </select>
          </div>

          <button onClick={applyFilters} disabled={loading} className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50">
            {loading ? 'Buscando...' : 'Buscar Miembros'}
          </button>

          {matchingMembers.length > 0 && (
            <>
              <div className="bg-neutral-900/50 p-4 rounded-lg">
                <p className="text-white">Se invitará a <span className="font-bold">{matchingMembers.length}</span> miembros</p>
              </div>
              <button onClick={inviteMembers} disabled={inviting} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {inviting ? <><Loader2 className="w-4 h-4 animate-spin" />Invitando...</> : <><UserPlus className="w-4 h-4" />Enviar Invitaciones</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
