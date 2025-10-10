'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Save, Mail, Phone, Award, Calendar, CreditCard, TrendingUp, BarChart3, Smartphone, Send, QrCode, Download, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'
import QRCode from 'qrcode'

type Member = Database['public']['Tables']['members']['Row'] & {
  total_visits?: number
  total_purchases?: number
  total_events?: number
  lifetime_spent?: number
  visits_last_30_days?: number
  spent_last_30_days?: number
  last_visit?: string | null
  average_purchase?: number
  has_wallet?: boolean
  wallet_types?: string[] | null
}
type MembershipType = Database['public']['Tables']['membership_types']['Row']

interface MemberDetailModalProps {
  member: Member
  membershipTypes: MembershipType[]
  onClose: () => void
  onUpdate: () => void
}

export default function MemberDetailModal({ member, membershipTypes, onClose, onUpdate }: MemberDetailModalProps) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'info' | 'stats'>('info')
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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [sendingCard, setSendingCard] = useState(false)
  const [syncingGHL, setSyncingGHL] = useState(false)

  // Generate QR code for member card download
  useEffect(() => {
    if (activeTab === 'stats') {
      // URL correcta para instalar la tarjeta en Wallet (sin necesidad de login)
      const cardUrl = `${window.location.origin}/api/wallet/apple/${member.id}`
      QRCode.toDataURL(cardUrl, { width: 300, margin: 2 })
        .then(setQrCodeUrl)
        .catch(console.error)
    }
  }, [activeTab, member.id])

  const handleSave = async () => {
    console.log('🟢 [DEBUG] handleSave called - Starting save process')
    setSaving(true)
    try {
      console.log('🟢 [DEBUG] Updating member in database:', member.id)
      const { error } = await supabase
        .from('members')
        .update(formData)
        .eq('id', member.id)

      if (error) {
        console.error('🔴 [DEBUG] Database update error:', error)
        throw error
      }

      console.log('✅ [DEBUG] Member updated in database successfully')

      // Sync to GHL automatically (WAIT for it to complete)
      console.log('🔵 [Auto-Sync] Starting automatic GHL sync for member:', member.id)
      
      try {
        const syncResponse = await fetch('/api/ghl/sync-member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            member_id: member.id,
          }),
        })
        
        const syncData = await syncResponse.json()
        
        if (syncResponse.ok && syncData.success) {
          console.log('✅ [Auto-Sync] Member synced successfully to GHL')
        } else {
          console.warn('⚠️ [Auto-Sync] GHL sync completed with issues:', syncData)
        }
      } catch (err) {
        console.error('🔴 [Auto-Sync] GHL sync failed:', err)
        // Don't block the UI if GHL sync fails
      }

      console.log('🟢 [DEBUG] Calling onUpdate and onClose')
      onUpdate()
      onClose()
    } catch (error: any) {
      alert('Error al guardar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSendCard = async () => {
    setSendingCard(true)
    try {
      const response = await fetch('/api/members/send-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: member.id,
          email: member.email,
          phone: member.phone,
          full_name: member.full_name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar tarjeta')
      }

      alert('✅ Tarjeta enviada exitosamente')
    } catch (error: any) {
      alert('❌ Error: ' + error.message)
    } finally {
      setSendingCard(false)
    }
  }

  const handleSyncToGHL = async () => {
    setSyncingGHL(true)
    try {
      console.log('🔵 [Frontend] Starting GHL sync for member:', member.id)
      console.log('🔵 [Frontend] Member data:', {
        id: member.id,
        email: member.email,
        name: member.full_name,
      })
      
      const response = await fetch('/api/ghl/sync-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: member.id,
        }),
      })

      console.log('🔵 [Frontend] Response status:', response.status)
      
      const data = await response.json()
      console.log('🔵 [Frontend] Response data:', JSON.stringify(data, null, 2))

      // Display server logs in browser console
      if (data.logs && Array.isArray(data.logs)) {
        console.log('📋 [Server Logs] ============================')
        data.logs.forEach((log: string) => console.log(log))
        console.log('📋 [Server Logs] ============================')
      }

      if (!response.ok) {
        const errorMessage = data.details || data.error || 'Error desconocido'
        console.error('🔴 [Frontend] Error details:', JSON.stringify(data, null, 2))
        console.error('🔴 [Frontend] Full stack:', data.stack)
        throw new Error(errorMessage)
      }

      console.log('✅ [Frontend] Sync successful!')
      alert(`✅ ${data.message}\n\nContact ID: ${data.contact_id}`)
    } catch (error: any) {
      console.error('🔴 [Frontend] Sync error:', error)
      alert(`❌ Error al sincronizar:\n\n${error.message}\n\n⚠️ IMPORTANTE: Abre la consola del navegador (F12) y copia TODOS los logs que veas.`)
    } finally {
      setSyncingGHL(false)
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
        className="bg-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{member.full_name}</h2>
            <p className="text-sm text-neutral-400 mt-1">#{member.member_number}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-neutral-900 border-b border-neutral-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'info'
                  ? 'bg-neutral-800 text-white border-b-2 border-orange-500'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Información</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'stats'
                  ? 'bg-neutral-800 text-white border-b-2 border-orange-500'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Estadísticas y Tarjeta</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'info' ? (
            <div className="p-6 space-y-6">
              <EditableField label="Nombre Completo" field="full_name" icon={Award} />
              <EditableField label="Email" field="email" icon={Mail} type="email" />
              <EditableField label="Teléfono" field="phone" icon={Phone} type="tel" />
              
              <EditableField 
                label="Tipo de Membresía" 
                field="membership_type" 
                icon={CreditCard}
                options={membershipTypes.map(t => ({ value: t.name, label: t.name }))}
              />
              
              {/* Status Toggle */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-4 h-4 text-brand-400" />
                  <span className="text-xs text-neutral-500 uppercase tracking-wide">Estado</span>
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
                  {formData.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <EditableField label="Puntos" field="points" icon={Award} type="number" />

              {/* Read-only info */}
              <div className="pt-4 border-t border-neutral-700 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-4 h-4 text-brand-400" />
                    <span className="text-xs text-neutral-500 uppercase tracking-wide">Fecha de Registro</span>
                  </div>
                  <div className="text-lg text-neutral-300 px-3">
                    {new Date(member.joined_date).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700">
                  <div className="text-2xl font-bold text-white">{member.total_visits || 0}</div>
                  <div className="text-xs text-neutral-400 mt-1">Visitas Totales</div>
                </div>
                <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700">
                  <div className="text-2xl font-bold text-green-400">${(member.lifetime_spent || 0).toFixed(0)}</div>
                  <div className="text-xs text-neutral-400 mt-1">Gasto Total</div>
                </div>
                <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700">
                  <div className="text-2xl font-bold text-blue-400">{member.visits_last_30_days || 0}</div>
                  <div className="text-xs text-neutral-400 mt-1">Últimos 30 días</div>
                </div>
                <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700">
                  <div className="text-2xl font-bold text-orange-400">${(member.average_purchase || 0).toFixed(0)}</div>
                  <div className="text-xs text-neutral-400 mt-1">Promedio Compra</div>
                </div>
              </div>

              {/* Wallet Status */}
              <div className="bg-neutral-900/50 border border-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-neutral-400" />
                    <span className="text-sm font-medium text-white">Estado de Tarjeta Digital</span>
                  </div>
                  {member.has_wallet ? (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Instalada</span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-neutral-700 text-neutral-400 rounded">No instalada</span>
                  )}
                </div>
                {member.has_wallet && member.wallet_types && (
                  <div className="flex gap-2">
                    {member.wallet_types.map((type, idx) => (
                      <span key={idx} className="text-sm text-neutral-300">
                        {type === 'apple' ? '🍎 Apple Wallet' : '📱 Google Wallet'}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* QR Code and Actions */}
              <div className="bg-neutral-900/50 border border-neutral-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Tarjeta Digital
                </h3>
                
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* QR Code */}
                  <div className="flex-shrink-0">
                    {qrCodeUrl ? (
                      <div className="bg-white p-4 rounded-lg">
                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                      </div>
                    ) : (
                      <div className="w-48 h-48 bg-neutral-800 rounded-lg flex items-center justify-center">
                        <span className="text-neutral-500">Generando QR...</span>
                      </div>
                    )}
                    <p className="text-xs text-neutral-400 text-center mt-2">
                      Escanea para descargar la tarjeta
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-3 w-full">
                    <button
                      onClick={handleSendCard}
                      disabled={sendingCard || !member.email}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                    >
                      <Send className="w-4 h-4" />
                      {sendingCard ? 'Enviando...' : 'Enviar Tarjeta al Cliente'}
                    </button>
                    <p className="text-xs text-neutral-400 text-center">
                      {member.email ? `Se enviará a: ${member.email}` : 'Email no disponible'}
                    </p>
                    <button
                      onClick={() => window.open(`/cards/${member.id}`, '_blank')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition"
                    >
                      <Download className="w-4 h-4" />
                      Ver Tarjeta en Nueva Pestaña
                    </button>
                    <button
                      onClick={handleSyncToGHL}
                      disabled={syncingGHL}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncingGHL ? 'animate-spin' : ''}`} />
                      {syncingGHL ? 'Sincronizando...' : 'Sincronizar con GoHighLevel'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Last Visit */}
              {member.last_visit && (
                <div className="text-sm text-neutral-400 text-center">
                  Última visita: {new Date(member.last_visit).toLocaleDateString('es-ES')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Only show save when in info tab */}
        {activeTab === 'info' && (
          <div className="bg-neutral-800 border-t border-neutral-700 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-neutral-400">Click en cualquier campo para editar</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
