'use client'

import { useState } from 'react'
import { Building2, MapPin, Users, DollarSign, Edit, Trash2, Plus, TrendingUp } from 'lucide-react'
import type { Database } from '@/lib/types/database'
import BranchFormModal from './BranchFormModal'
import GlowCard from '@/components/ui/GlowCard'

type BranchStats = Database['public']['Views']['branch_stats']['Row']
type Branch = Database['public']['Tables']['branches']['Row']

interface BranchesListProps {
  branches: BranchStats[]
}

export default function BranchesList({ branches }: BranchesListProps) {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la sucursal "${name}"?`)) return

    try {
      const response = await fetch(`/api/branches/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      window.location.reload()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* New Branch Button */}
      <button
        onClick={() => setShowNewForm(true)}
        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
      >
        <Plus className="w-5 h-5 mr-2" />
        Nueva Sucursal
      </button>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <GlowCard key={branch.id} glowColor="#F0DBC0" glowSize={250}>
            <div className="bg-neutral-800/90 rounded-xl p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{branch.name}</h3>
                    {branch.city && (
                      <p className="text-sm text-neutral-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {branch.city}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  branch.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {branch.is_active ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-900/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                    <Users className="w-3 h-3" />
                    Clientes
                  </div>
                  <div className="text-xl font-bold text-white">{branch.unique_customers}</div>
                </div>
                <div className="bg-neutral-900/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                    <TrendingUp className="w-3 h-3" />
                    Transacciones
                  </div>
                  <div className="text-xl font-bold text-white">{branch.total_transactions}</div>
                </div>
                <div className="bg-neutral-900/50 p-3 rounded-lg col-span-2">
                  <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                    <DollarSign className="w-3 h-3" />
                    Revenue Total
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    ${branch.total_revenue.toFixed(2)}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Último mes: ${branch.revenue_last_30_days.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-neutral-700">
                <button
                  onClick={() => setSelectedBranch(branch as any)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(branch.id, branch.name)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>

      {branches.length === 0 && (
        <div className="text-center py-12 bg-neutral-800 border border-neutral-700 rounded-lg">
          <Building2 className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No hay sucursales</h3>
          <p className="text-neutral-400 mb-4">Crea tu primera sucursal para comenzar</p>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Sucursal
          </button>
        </div>
      )}

      {/* Modals */}
      {showNewForm && (
        <BranchFormModal
          onClose={() => setShowNewForm(false)}
          onSuccess={() => {
            setShowNewForm(false)
            window.location.reload()
          }}
        />
      )}

      {selectedBranch && (
        <BranchFormModal
          branch={selectedBranch}
          onClose={() => setSelectedBranch(null)}
          onSuccess={() => {
            setSelectedBranch(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
