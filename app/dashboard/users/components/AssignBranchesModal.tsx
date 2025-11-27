'use client'

// =====================================================================
// COMPONENT: AssignBranchesModal
// =====================================================================
// Modal para asignar sucursales a managers y staff
// =====================================================================

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { ROLE_LABELS, type UserRole } from '@/lib/auth/roles'

interface Branch {
  id: string
  name: string
  address?: string
}

interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  branches?: { id: string; name: string }[] | null
}

interface AssignBranchesModalProps {
  user: User
  onClose: () => void
  onSuccess: () => void
}

export default function AssignBranchesModal({
  user,
  onClose,
  onSuccess,
}: AssignBranchesModalProps) {
  const [loading, setLoading] = useState(false)
  const [loadingBranches, setLoadingBranches] = useState(true)
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    user.branches?.map(b => b.id) || []
  )

  // Cargar sucursales disponibles
  useEffect(() => {
    loadBranches()
  }, [])

  async function loadBranches() {
    try {
      const response = await fetch('/api/branches?is_active=true')
      if (response.ok) {
        const data = await response.json()
        setBranches(data.branches || [])
      }
    } catch (error) {
      console.error('Error loading branches:', error)
    } finally {
      setLoadingBranches(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (selectedBranches.length === 0) {
      alert('Please select at least one branch')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${user.id}/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_ids: selectedBranches,
          role: user.role,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to assign branches')
      }

      onSuccess()
    } catch (error: any) {
      alert(error.message)
      setLoading(false)
    }
  }

  function handleBranchToggle(branchId: string) {
    setSelectedBranches(prev =>
      prev.includes(branchId)
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div>
            <h2 className="text-xl font-bold text-white">Assign Branches</h2>
            <p className="text-sm text-neutral-400 mt-1">
              {user.full_name} • {ROLE_LABELS[user.role]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Branches List */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Select Branches <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2 max-h-96 overflow-y-auto p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
              {loadingBranches ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-neutral-400" />
                  <p className="text-sm text-neutral-500 mt-2">Loading branches...</p>
                </div>
              ) : branches.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">
                  No branches available
                </p>
              ) : (
                branches.map(branch => (
                  <label
                    key={branch.id}
                    className="flex items-start gap-3 p-3 hover:bg-neutral-800 rounded cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBranches.includes(branch.id)}
                      onChange={() => handleBranchToggle(branch.id)}
                      className="w-4 h-4 mt-0.5 rounded border-neutral-600 text-blue-600 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-white block">
                        {branch.name}
                      </span>
                      {branch.address && (
                        <span className="text-xs text-neutral-500">
                          {branch.address}
                        </span>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Selected: {selectedBranches.length} of {branches.length}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              disabled={loading || selectedBranches.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Branches'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
