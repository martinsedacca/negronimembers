'use client'

// =====================================================================
// COMPONENT: EditUserModal
// =====================================================================
// Modal para editar usuarios existentes
// =====================================================================

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { ROLE_LABELS, type UserRole } from '@/lib/auth/roles'

interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
}

interface EditUserModalProps {
  user: User
  currentUserRole: UserRole
  onClose: () => void
  onSuccess: () => void
}

export default function EditUserModal({
  user,
  currentUserRole,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    email: user.email,
    password: '', // opcional
    is_active: user.is_active,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.full_name || !formData.email) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)

    try {
      const updates: any = {
        full_name: formData.full_name,
        email: formData.email,
        is_active: formData.is_active,
      }

      // Solo incluir password si se proporcionó
      if (formData.password) {
        updates.password = formData.password
      }

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }

      onSuccess()
    } catch (error: any) {
      alert(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div>
            <h2 className="text-xl font-bold text-white">Edit User</h2>
            <p className="text-sm text-neutral-400 mt-1">
              {ROLE_LABELS[user.role]}
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

          {/* Password (opcional) */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              New Password <span className="text-neutral-500">(optional)</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              minLength={8}
              disabled={loading}
              placeholder="Leave empty to keep current password"
            />
            {formData.password && (
              <p className="text-xs text-neutral-500 mt-1">
                Minimum 8 characters
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-600 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-sm text-neutral-300">
                User is active
              </span>
            </label>
            <p className="text-xs text-neutral-500 mt-1 ml-6">
              Inactive users cannot log in
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
