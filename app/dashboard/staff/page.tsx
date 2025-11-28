'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Users, Plus, Search, MapPin, Shield, User,
  Loader2, MoreVertical, Edit, Trash2, CheckCircle, XCircle
} from 'lucide-react'

interface Staff {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  role: 'manager' | 'server'
  is_active: boolean
  last_login_at: string | null
  assigned_branches: { id: string; name: string }[]
  current_branch: { id: string; name: string } | null
}

export default function StaffPage() {
  const supabase = createClient()
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'manager' | 'server'>('all')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/admin/staff')
      const data = await response.json()
      setStaff(data.staff || [])
    } catch (err) {
      console.error('Failed to fetch staff:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this staff member?')) return

    try {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchStaff()
      }
    } catch (err) {
      console.error('Failed to delete staff:', err)
    }
  }

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.phone?.includes(searchQuery)
    const matchesRole = roleFilter === 'all' || s.role === roleFilter
    return matchesSearch && matchesRole
  })

  const managers = staff.filter(s => s.role === 'manager' && s.is_active)
  const servers = staff.filter(s => s.role === 'server' && s.is_active)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Management</h1>
          <p className="text-neutral-400">Manage managers and servers for the scanner app</p>
        </div>
        <Link
          href="/dashboard/staff/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <Plus className="w-5 h-5" />
          Add Staff
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{staff.filter(s => s.is_active).length}</div>
              <div className="text-sm text-neutral-400">Total Staff</div>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{managers.length}</div>
              <div className="text-sm text-neutral-400">Managers</div>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <User className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{servers.length}</div>
              <div className="text-sm text-neutral-400">Servers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'manager', 'server'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                roleFilter === role
                  ? 'bg-orange-500 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {role === 'all' ? 'All' : role === 'manager' ? 'Managers' : 'Servers'}
            </button>
          ))}
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
        {filteredStaff.length > 0 ? (
          <div className="divide-y divide-neutral-700">
            {filteredStaff.map((member) => (
              <div
                key={member.id}
                className={`p-4 hover:bg-neutral-750 transition ${!member.is_active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      member.role === 'manager' ? 'bg-purple-500/20' : 'bg-green-500/20'
                    }`}>
                      {member.role === 'manager' ? (
                        <Shield className="w-6 h-6 text-purple-400" />
                      ) : (
                        <User className="w-6 h-6 text-green-400" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{member.full_name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          member.role === 'manager'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {member.role}
                        </span>
                        {!member.is_active && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-neutral-400 mt-1">
                        {member.email || member.phone || 'No contact info'}
                      </div>
                      
                      {member.assigned_branches.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-neutral-500">
                          <MapPin className="w-3 h-3" />
                          {member.assigned_branches.map(b => b.name).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.last_login_at && (
                      <div className="text-xs text-neutral-500 hidden sm:block">
                        Last login: {new Date(member.last_login_at).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === member.id ? null : member.id)}
                        className="p-2 hover:bg-neutral-700 rounded-lg transition"
                      >
                        <MoreVertical className="w-5 h-5 text-neutral-400" />
                      </button>
                      
                      {menuOpen === member.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-10">
                          <Link
                            href={`/dashboard/staff/${member.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-neutral-300 hover:bg-neutral-800 transition"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              setMenuOpen(null)
                              handleDelete(member.id)
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-neutral-800 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                            Deactivate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No staff found</h3>
            <p className="text-neutral-400 mb-4">
              {searchQuery || roleFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first staff member to get started'}
            </p>
            {!searchQuery && roleFilter === 'all' && (
              <Link
                href="/dashboard/staff/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                <Plus className="w-5 h-5" />
                Add Staff
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
