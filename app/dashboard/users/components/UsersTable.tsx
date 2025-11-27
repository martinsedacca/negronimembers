'use client'

// =====================================================================
// COMPONENT: UsersTable
// =====================================================================
// Tabla principal de usuarios con filtros y acciones
// =====================================================================

import { useState, useEffect } from 'react'
import { Search, Plus, Filter, UserCog } from 'lucide-react'
import { ROLES, ROLE_LABELS, type UserRole } from '@/lib/auth/roles'
import RoleBadge from './RoleBadge'
import CreateUserModal from './CreateUserModal'
import EditUserModal from './EditUserModal'
import AssignBranchesModal from './AssignBranchesModal'

interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  created_at: string
  branches?: { id: string; name: string }[] | null
}

interface UsersTableProps {
  currentUserRole: UserRole
}

export default function UsersTable({ currentUserRole }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [assigningBranches, setAssigningBranches] = useState<User | null>(null)

  // Cargar usuarios
  useEffect(() => {
    loadUsers()
  }, [roleFilter, search])

  async function loadUsers() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (roleFilter !== 'all') params.set('role', roleFilter)
      if (search) params.set('search', search)

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('Failed to load users')

      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(userId: string, userName: string) {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }

      // Recargar usuarios
      loadUsers()
    } catch (error: any) {
      alert(error.message)
    }
  }

  async function handleToggleActive(userId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (!response.ok) throw new Error('Failed to update user')

      // Recargar usuarios
      loadUsers()
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = search === '' || 
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    
    return matchesSearch
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {currentUserRole === ROLES.SUPERADMIN && (
                <option value="superadmin">SuperAdmin</option>
              )}
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="base">Staff</option>
            </select>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-400">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-neutral-400">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Branches
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {user.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-400">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      {user.branches && user.branches.length > 0 ? (
                        <div className="text-sm text-neutral-400">
                          {user.branches.map(b => b.name).join(', ')}
                        </div>
                      ) : (
                        <div className="text-sm text-neutral-500 italic">
                          {user.role === ROLES.SUPERADMIN || user.role === ROLES.ADMIN
                            ? 'All branches'
                            : 'No branches'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-500 hover:text-blue-400"
                          title="Edit user"
                        >
                          Edit
                        </button>
                        {(user.role === ROLES.MANAGER || user.role === ROLES.BASE) && (
                          <button
                            onClick={() => setAssigningBranches(user)}
                            className="text-yellow-500 hover:text-yellow-400"
                            title="Assign branches"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id, user.full_name)}
                          className="text-red-500 hover:text-red-400"
                          title="Delete user"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          currentUserRole={currentUserRole}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadUsers()
          }}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          currentUserRole={currentUserRole}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null)
            loadUsers()
          }}
        />
      )}

      {assigningBranches && (
        <AssignBranchesModal
          user={assigningBranches}
          onClose={() => setAssigningBranches(null)}
          onSuccess={() => {
            setAssigningBranches(null)
            loadUsers()
          }}
        />
      )}
    </div>
  )
}
