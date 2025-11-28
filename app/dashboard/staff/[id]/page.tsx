'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, User, Shield, MapPin, Key, RefreshCw, Trash2 } from 'lucide-react'

interface Branch {
  id: string
  name: string
}

export default function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [branches, setBranches] = useState<Branch[]>([])
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'server' as 'manager' | 'server',
    pin: '',
    branch_ids: [] as string[],
    is_active: true,
  })

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      // Fetch branches
      const { data: branchData } = await supabase
        .from('branches')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
      
      if (branchData) setBranches(branchData)

      // Fetch staff
      const response = await fetch(`/api/admin/staff/${id}`)
      const data = await response.json()

      if (data.staff) {
        setFormData({
          first_name: data.staff.first_name || '',
          last_name: data.staff.last_name || '',
          email: data.staff.email || '',
          phone: data.staff.phone || '',
          role: data.staff.role || 'server',
          pin: data.staff.pin || '',
          branch_ids: data.staff.branch_ids || [],
          is_active: data.staff.is_active ?? true,
        })
      }
    } catch (err) {
      console.error('Failed to fetch:', err)
      setError('Failed to load staff data')
    } finally {
      setLoading(false)
    }
  }

  const generatePin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString()
    setFormData({ ...formData, pin })
  }

  const toggleBranch = (branchId: string) => {
    setFormData(prev => ({
      ...prev,
      branch_ids: prev.branch_ids.includes(branchId)
        ? prev.branch_ids.filter(id => id !== branchId)
        : prev.role === 'server'
          ? [branchId]
          : [...prev.branch_ids, branchId]
    }))
  }

  const handleRoleChange = (role: 'manager' | 'server') => {
    setFormData(prev => ({
      ...prev,
      role,
      branch_ids: role === 'server' && prev.branch_ids.length > 1 
        ? [prev.branch_ids[0]] 
        : prev.branch_ids
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('First name and last name are required')
      setSaving(false)
      return
    }

    if (formData.branch_ids.length === 0) {
      setError('At least one branch must be selected')
      setSaving(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update staff')
        setSaving(false)
        return
      }

      router.push('/dashboard/staff')
    } catch (err: any) {
      setError('Connection error')
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to deactivate this staff member?')) return

    setDeleting(true)

    try {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard/staff')
      }
    } catch (err) {
      setError('Failed to deactivate')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/staff"
            className="p-2 hover:bg-neutral-800 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Staff Member</h1>
            <p className="text-neutral-400">Update staff information</p>
          </div>
        </div>
        
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
        >
          {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Status */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Status</h2>
              <p className="text-sm text-neutral-400">Control if this staff can login</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                formData.is_active
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {formData.is_active ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>

        {/* Role Selection */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Role</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleRoleChange('manager')}
              className={`p-4 rounded-xl border-2 transition text-left ${
                formData.role === 'manager'
                  ? 'bg-purple-500/20 border-purple-500'
                  : 'bg-neutral-900 border-neutral-700 hover:border-neutral-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  formData.role === 'manager' ? 'bg-purple-500' : 'bg-neutral-700'
                }`}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">Manager</div>
                  <div className="text-xs text-neutral-400">Multiple locations</div>
                </div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => handleRoleChange('server')}
              className={`p-4 rounded-xl border-2 transition text-left ${
                formData.role === 'server'
                  ? 'bg-green-500/20 border-green-500'
                  : 'bg-neutral-900 border-neutral-700 hover:border-neutral-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  formData.role === 'server' ? 'bg-green-500' : 'bg-neutral-700'
                }`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">Server</div>
                  <div className="text-xs text-neutral-400">One location</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Personal Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* PIN */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-orange-500" />
              Login PIN
            </h2>
            <button
              type="button"
              onClick={generatePin}
              className="flex items-center gap-2 px-3 py-1 text-sm text-orange-400 hover:bg-orange-500/10 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              Generate New
            </button>
          </div>
          
          <div>
            <input
              type="text"
              value={formData.pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                setFormData({ ...formData, pin: value })
              }}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-2xl tracking-[0.3em] text-center focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              maxLength={6}
            />
            <p className="text-xs text-neutral-500 mt-2">
              Leave empty to keep the current PIN. PIN + Last Name is used to login.
            </p>
          </div>
        </div>

        {/* Branches */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            Assigned Branches
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {branches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => toggleBranch(branch.id)}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  formData.branch_ids.includes(branch.id)
                    ? 'bg-orange-500/20 border-orange-500'
                    : 'bg-neutral-900 border-neutral-700 hover:border-neutral-600'
                }`}
              >
                <div className="font-medium text-white">{branch.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Link
            href="/dashboard/staff"
            className="flex-1 py-3 px-4 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition text-center font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
