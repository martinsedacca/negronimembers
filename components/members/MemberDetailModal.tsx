'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Save, Mail, Phone, Award, Calendar, CreditCard, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Member = Database['public']['Tables']['members']['Row']
type MembershipType = Database['public']['Tables']['membership_types']['Row']

interface MemberDetailModalProps {
  member: Member
  membershipTypes: MembershipType[]
  onClose: () => void
  onUpdate: () => void
}

export default function MemberDetailModal({ member, membershipTypes, onClose, onUpdate }: MemberDetailModalProps) {
  const supabase = createClient()
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: member.full_name,
    email: member.email,
    phone: member.phone || '',
    membership_type: member.membership_type,
    status: member.status,
    points: member.points,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('members')
        .update(formData)
        .eq('id', member.id)

      if (error) throw error

      // Notify wallet to update if relevant fields changed
      if (
        formData.membership_type !== member.membership_type ||
        formData.full_name !== member.full_name ||
        formData.points !== member.points ||
        formData.status !== member.status
      ) {
        // Fire and forget - don't wait for wallet update
        fetch('/api/wallet/update-member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ member_id: member.id }),
        }).catch(console.error)
      }

      onUpdate()
      onClose()
    } catch (error: any) {
      alert('Error al guardar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const EditableField = ({ 
    label, 
    field, 
    icon: Icon, 
    type = 'text',
    options = null 
  }: { 
    label: string
    field: keyof typeof formData
    icon: any
    type?: string
    options?: { value: string; label: string }[] | null
  }) => {
    const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null)
    const isActive = isEditing === field

    useEffect(() => {
      if (isActive && inputRef.current) {
        inputRef.current.focus()
      }
    }, [isActive])

    return (
      <div className="group relative">
        <div className="flex items-center gap-3 mb-2">
          <Icon className="w-4 h-4 text-brand-400" />
          <span className="text-xs text-neutral-500 uppercase tracking-wide">{label}</span>
        </div>
        
        {isActive ? (
          options ? (
            <select
              ref={inputRef as any}
              value={formData[field] as string}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              onBlur={() => setIsEditing(null)}
              className="w-full bg-neutral-700 text-white text-lg px-3 py-2 rounded-lg border border-brand-500 focus:outline-none"
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              ref={inputRef as any}
              type={type}
              value={formData[field]}
              onChange={(e) => setFormData({ 
                ...formData, 
                [field]: type === 'number' ? parseInt(e.target.value) : e.target.value 
              })}
              onBlur={() => setIsEditing(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditing(null)
                if (e.key === 'Escape') {
                  setFormData({ ...formData, [field]: member[field] })
                  setIsEditing(null)
                }
              }}
              className="w-full bg-neutral-700 text-white text-lg px-3 py-2 rounded-lg border border-brand-500 focus:outline-none"
            />
          )
        ) : (
          <div
            onClick={() => setIsEditing(field)}
            className="text-lg text-white cursor-pointer hover:text-brand-400 transition px-3 py-2 rounded-lg hover:bg-neutral-800/50"
          >
            {formData[field] || 'Sin especificar'}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Member Details</h2>
            <p className="text-sm text-neutral-400 mt-1">#{member.member_number}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <EditableField label="Full Name" field="full_name" icon={Award} />
          <EditableField label="Email" field="email" icon={Mail} type="email" />
          <EditableField label="Phone" field="phone" icon={Phone} type="tel" />
          
          <EditableField 
            label="Membership Type" 
            field="membership_type" 
            icon={CreditCard}
            options={membershipTypes.map(t => ({ value: t.name, label: t.name }))}
          />
          
          {/* Status Toggle */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <span className="text-xs text-neutral-500 uppercase tracking-wide">Status</span>
            </div>
            <button
              onClick={() => setFormData({ 
                ...formData, 
                status: formData.status === 'active' ? 'inactive' : 'active' 
              })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                formData.status === 'active' ? 'bg-green-500' : 'bg-neutral-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  formData.status === 'active' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 text-lg font-medium ${
              formData.status === 'active' ? 'text-green-400' : 'text-neutral-400'
            }`}>
              {formData.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <EditableField label="Points" field="points" icon={Award} type="number" />

          {/* Read-only info */}
          <div className="pt-4 border-t border-neutral-700 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span className="text-xs text-neutral-500 uppercase tracking-wide">Registration Date</span>
              </div>
              <div className="text-lg text-neutral-300 px-3">
                {new Date(member.joined_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {member.expiry_date && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  <span className="text-xs text-neutral-500 uppercase tracking-wide">Expiry Date</span>
                </div>
                <div className="text-lg text-neutral-300 px-3">
                  {new Date(member.expiry_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-800 border-t border-neutral-700 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-neutral-400">Click any field to edit</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
