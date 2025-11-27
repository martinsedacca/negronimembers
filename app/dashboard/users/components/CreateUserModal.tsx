'use client'

// =====================================================================
// COMPONENT: CreateUserModal
// =====================================================================
// Modal para crear nuevos usuarios del sistema
// =====================================================================

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { getCreatableRoles, ROLE_LABELS, ROLES, type UserRole } from '@/lib/auth/roles'

interface Branch {
  id: string
  name: string
}

interface CreateUserModalProps {
  currentUserRole: UserRole
  onClose: () => void
  onSuccess: () => void
}

export default function CreateUserModal({
  currentUserRole,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: ROLES.MANAGER as UserRole,
    branch_ids: [] as string[],
  })

  const creatableRoles = getCreatableRoles(currentUserRole)
  const needsBranches = formData.role === ROLES.MANAGER || formData.role === ROLES.BASE

  // Cargar sucursales
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
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validaciones
    if (!formData.email || !formData.password || !formData.full_name || !formData.role) {
      alert('Please fill all required fields')
      return
    }

    if (needsBranches && formData.branch_ids.length === 0) {
      alert('Please assign at least one branch for this user')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create user')
      }

      onSuccess()
    } catch (error: any) {
      alert(error.message)
      setLoading(false)
    }
  }

  function handleBranchToggle(branchId: string) {
    setFormData(prev => ({
      ...prev,
      branch_ids: prev.branch_ids.includes(branchId)
        ? prev.branch_ids.filter(id => id !== branchId)
        : [...prev.branch_ids, branchId]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <h2 className="text-xl font-bold text-white">Create New User</h2>
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
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              minLength={8}
              required
              disabled={loading}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Minimum 8 characters
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole, branch_ids: [] })}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              {creatableRoles.map(role => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>

          {/* Branches (solo para manager y base) */}
          {needsBranches && (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Assigned Branches <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                {branches.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-4">
                    No branches available
                  </p>
                ) : (
                  branches.map(branch => (
                    <label
                      key={branch.id}
                      className="flex items-center gap-2 p-2 hover:bg-neutral-800 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.branch_ids.includes(branch.id)}
                        onChange={() => handleBranchToggle(branch.id)}
                        className="w-4 h-4 rounded border-neutral-600 text-blue-600 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <span className="text-sm text-white">{branch.name}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Select at least one branch
              </p>
            </div>
          )}

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
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
