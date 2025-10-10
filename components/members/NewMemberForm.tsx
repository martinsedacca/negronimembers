'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'
import { Loader2 } from 'lucide-react'

type MembershipType = Database['public']['Tables']['membership_types']['Row']

interface NewMemberFormProps {
  membershipTypes: MembershipType[]
}

export default function NewMemberForm({ membershipTypes }: NewMemberFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    membership_type: membershipTypes[0]?.name || 'basic',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  })

  const generateMemberNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `MEM${timestamp}${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const memberNumber = generateMemberNumber()
      
      // Calculate expiry date based on membership type
      const membershipType = membershipTypes.find(t => t.name === formData.membership_type)
      const expiryDate = new Date()
      if (membershipType?.duration_months) {
        expiryDate.setMonth(expiryDate.getMonth() + membershipType.duration_months)
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1)
      }

      const { data: newMember, error: insertError } = await supabase
        .from('members')
        .insert({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          membership_type: formData.membership_type,
          status: formData.status,
          member_number: memberNumber,
          expiry_date: expiryDate.toISOString(),
          points: 0,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Sync to GHL automatically
      if (newMember) {
        console.log('🔵 [Auto-Sync] Starting automatic GHL sync for new member:', newMember.id)
        
        try {
          const syncResponse = await fetch('/api/ghl/sync-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              member_id: newMember.id,
            }),
          })
          
          const syncData = await syncResponse.json()
          
          if (syncResponse.ok && syncData.success) {
            console.log('✅ [Auto-Sync] New member synced successfully to GHL')
          } else {
            console.warn('⚠️ [Auto-Sync] GHL sync completed with issues:', syncData)
          }
        } catch (err) {
          console.error('🔴 [Auto-Sync] GHL sync failed:', err)
          // Don't block member creation if GHL sync fails
        }
      }

      router.push('/dashboard/members')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-md">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="full_name" className="block text-sm font-medium text-neutral-300">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="full_name"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
            Email *
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-neutral-300">
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
          />
        </div>

        <div>
          <label htmlFor="membership_type" className="block text-sm font-medium text-neutral-300">
            Tipo de Membresía *
          </label>
          <select
            id="membership_type"
            required
            value={formData.membership_type}
            onChange={(e) => setFormData({ ...formData, membership_type: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
          >
            {membershipTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name} - ${type.price}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-neutral-300">
            Estado *
          </label>
          <select
            id="status"
            required
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="mt-1 block w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="bg-neutral-900/50 p-4 rounded-md border border-neutral-700">
        <h4 className="text-sm font-medium text-white mb-2">Información de la Membresía</h4>
        {membershipTypes.find(t => t.name === formData.membership_type) && (
          <div className="text-sm text-neutral-400 space-y-1">
            <p>
              <span className="font-medium">Duración:</span>{' '}
              {membershipTypes.find(t => t.name === formData.membership_type)?.duration_months} meses
            </p>
            <p>
              <span className="font-medium">Precio:</span> $
              {membershipTypes.find(t => t.name === formData.membership_type)?.price}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-neutral-300 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? 'Creando...' : 'Crear Miembro'}
        </button>
      </div>
    </form>
  )
}
