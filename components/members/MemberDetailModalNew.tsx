'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Save, Mail, Phone, Award, Calendar, CreditCard, TrendingUp, BarChart3, Smartphone, Send, QrCode, Download, RefreshCw, Clock, Gift, ShoppingCart, MapPin } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'history'>('info')
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: member.full_name,
    email: member.email,
    phone: member.phone || '',
    membership_type_id: member.membership_type_id || membershipTypes.find(t => t.name === member.membership_type)?.id || '',
    status: member.status,
    points: member.points,
  })
  const [saving, setSaving] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [sendingCard, setSendingCard] = useState(false)
  const [syncingGHL, setSyncingGHL] = useState(false)
  const [historyData, setHistoryData] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [calculatedStats, setCalculatedStats] = useState({
    total_visits: member.total_visits || 0,
    lifetime_spent: member.lifetime_spent || 0,
    visits_last_30_days: member.visits_last_30_days || 0,
    average_purchase: member.average_purchase || 0,
    points: member.points || 0,
  })

  // Calculate stats from card_usage on mount
  useEffect(() => {
    const calculateStats = async () => {
      const { data: usage } = await supabase
        .from('card_usage')
        .select('amount_spent, points_earned, created_at')
        .eq('member_id', member.id)

      if (usage && usage.length > 0) {
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        
        let totalSpent = 0
        let totalPoints = 0
        let visitsLast30 = 0
        
        usage.forEach(tx => {
          const amount = parseFloat(String(tx.amount_spent)) || 0
          totalSpent += amount
          totalPoints += tx.points_earned || 0
          
          if (new Date(tx.created_at) >= thirtyDaysAgo) {
            visitsLast30++
          }
        })

        setCalculatedStats({
          total_visits: usage.length,
          lifetime_spent: totalSpent,
          visits_last_30_days: visitsLast30,
          average_purchase: usage.length > 0 ? totalSpent / usage.length : 0,
          points: totalPoints,
        })
      }
    }
    calculateStats()
  }, [member.id, supabase])

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

  // Load history when tab changes to history
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      // Fetch card usage with branch and staff info
      const { data, error } = await supabase
        .from('card_usage')
        .select(`
          *,
          branches (name),
          staff_members (first_name, last_name)
        `)
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Also fetch applied promotions for each card_usage
      const usageIds = (data || []).map(d => d.id).filter(Boolean)
      let appliedPromos: any[] = []
      
      if (usageIds.length > 0) {
        const { data: promos } = await supabase
          .from('applied_promotions')
          .select(`
            card_usage_id,
            discount_amount,
            promotions (title, description, discount_type, discount_value)
          `)
          .in('card_usage_id', usageIds)
        appliedPromos = promos || []
      }

      // Merge promotions into history data
      const historyWithPromos = (data || []).map(tx => ({
        ...tx,
        applied_promotions: appliedPromos
          .filter(p => p.card_usage_id === tx.id)
          .map(p => ({
            title: (p.promotions as any)?.title || 'Promotion',
            discount_amount: p.discount_amount
          }))
      }))
      
      setHistoryData(historyWithPromos)
    } catch (error) {
      console.error('Error loading history:', error)
      setHistoryData([])
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSave = async () => {
    console.log('🟢 [DEBUG] handleSave called - Starting save process')
    setSaving(true)
    try {
      // Get the tier name for backwards compatibility
      const selectedType = membershipTypes.find(t => t.id === formData.membership_type_id)
      const updateData = {
        ...formData,
        membership_type: selectedType?.name || member.membership_type, // Keep name in sync
      }
      
      console.log('🟢 [DEBUG] Updating member in database:', member.id)
      const { error } = await supabase
        .from('members')
        .update(updateData)
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

      alert('✅ Card sent successfully')
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
        const errorMessage = data.details || data.error || 'Unknown error'
        console.error('🔴 [Frontend] Error details:', JSON.stringify(data, null, 2))
        console.error('🔴 [Frontend] Full stack:', data.stack)
        throw new Error(errorMessage)
      }

      console.log('✅ [Frontend] Sync successful!')
      alert(`✅ ${data.message}\n\nContact ID: ${data.contact_id}`)
    } catch (error: any) {
      console.error('🔴 [Frontend] Sync error:', error)
      alert(`❌ Sync error:\n\n${error.message}`)
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
            {formData[field] || 'Not specified'}
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
                <span>Information</span>
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
                <span>Stats & Card</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'history'
                  ? 'bg-neutral-800 text-white border-b-2 border-orange-500'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                <span>History</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'info' ? (
            <div className="p-6 space-y-6">
              <EditableField label="Full Name" field="full_name" icon={Award} />
              <EditableField label="Email" field="email" icon={Mail} type="email" />
              <EditableField label="Phone" field="phone" icon={Phone} type="tel" />
              
              <EditableField 
                label="Membership Type" 
                field="membership_type_id" 
                icon={CreditCard}
                options={membershipTypes.map(t => ({ value: t.id, label: t.name }))}
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
                    <span className="text-xs text-neutral-500 uppercase tracking-wide">Join Date</span>
                  </div>
                  <div className="text-lg text-neutral-300 px-3">
                    {new Date(member.joined_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'stats' ? (
            <div className="p-6 space-y-6">
              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700">
                  <div className="text-2xl font-bold text-white">{calculatedStats.total_visits}</div>
                  <div className="text-xs text-neutral-400 mt-1">Total Visits</div>
                </div>
                <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700">
                  <div className="text-2xl font-bold text-green-400">${calculatedStats.lifetime_spent.toFixed(0)}</div>
                  <div className="text-xs text-neutral-400 mt-1">Total Spent</div>
                </div>
                <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700">
                  <div className="text-2xl font-bold text-blue-400">{calculatedStats.visits_last_30_days}</div>
                  <div className="text-xs text-neutral-400 mt-1">Last 30 Days</div>
                </div>
                <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700">
                  <div className="text-2xl font-bold text-orange-400">${calculatedStats.average_purchase.toFixed(0)}</div>
                  <div className="text-xs text-neutral-400 mt-1">Avg Purchase</div>
                </div>
              </div>

              {/* Wallet Status */}
              <div className="bg-neutral-900/50 border border-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-neutral-400" />
                    <span className="text-sm font-medium text-white">Digital Card Status</span>
                  </div>
                  {member.has_wallet ? (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Installed</span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-neutral-700 text-neutral-400 rounded">Not Installed</span>
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
                        <span className="text-neutral-500">Generating QR...</span>
                      </div>
                    )}
                    <p className="text-xs text-neutral-400 text-center mt-2">
                      Scan to download the card
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
                      {sendingCard ? 'Sending...' : 'Send Card to Customer'}
                    </button>
                    <p className="text-xs text-neutral-400 text-center">
                      {member.email ? `Will be sent to: ${member.email}` : 'Email not available'}
                    </p>
                    <button
                      onClick={() => window.open(`/cards/${member.id}`, '_blank')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition"
                    >
                      <Download className="w-4 h-4" />
                      View Card in New Tab
                    </button>
                    <button
                      onClick={handleSyncToGHL}
                      disabled={syncingGHL}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncingGHL ? 'animate-spin' : ''}`} />
                      {syncingGHL ? 'Syncing...' : 'Sync with GoHighLevel'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Last Visit */}
              {member.last_visit && (
                <div className="text-sm text-neutral-400 text-center">
                  Last visit: {new Date(member.last_visit).toLocaleDateString('en-US')}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              {/* Timeline de Historial */}
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Activity History
              </h3>

              {loadingHistory ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-neutral-600 border-t-orange-500 rounded-full animate-spin"></div>
                  <p className="text-neutral-400 mt-4">Loading history...</p>
                </div>
              ) : historyData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-400">No activity recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyData.map((item, index) => {
                    // Determine actual type based on amount_spent (more accurate than event_type)
                    const actualType = parseFloat(item.amount_spent) > 0 ? 'purchase' : 
                                       item.event_type === 'event' ? 'event' : 'visit'

                    const getIcon = () => {
                      if (actualType === 'visit') return <MapPin className="w-5 h-5 text-blue-500" />
                      if (actualType === 'purchase') return <ShoppingCart className="w-5 h-5 text-green-500" />
                      if (actualType === 'event') return <Gift className="w-5 h-5 text-purple-500" />
                      return <Clock className="w-5 h-5 text-neutral-500" />
                    }

                    const getTitle = () => {
                      if (actualType === 'visit') return 'Visit'
                      if (actualType === 'purchase') return 'Purchase'
                      if (actualType === 'event') return 'Event'
                      return item.event_type
                    }

                    const getBgColor = () => {
                      if (actualType === 'visit') return 'bg-blue-500/10 border-blue-500/30'
                      if (actualType === 'purchase') return 'bg-green-500/10 border-green-500/30'
                      if (actualType === 'event') return 'bg-purple-500/10 border-purple-500/30'
                      return 'bg-neutral-700/50 border-neutral-600'
                    }

                    return (
                      <div
                        key={item.id}
                        className={`relative border ${getBgColor()} rounded-lg p-4 transition hover:shadow-lg`}
                      >
                        {/* Timeline line */}
                        {index !== historyData.length - 1 && (
                          <div className="absolute left-[30px] top-[60px] bottom-[-16px] w-0.5 bg-neutral-700"></div>
                        )}

                        <div className="flex gap-4">
                          {/* Icon */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center z-10">
                            {getIcon()}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-white font-semibold">{getTitle()}</h4>
                                <p className="text-sm text-neutral-400 mt-1">
                                  {new Date(item.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              {item.points_earned > 0 && (
                                <span className="text-sm font-semibold text-orange-400">
                                  +{item.points_earned} pts
                                </span>
                              )}
                            </div>

                            {/* Details */}
                            {item.amount_spent > 0 && (
                              <div className="mt-2 text-sm text-green-400 font-semibold">
                                ${item.amount_spent.toFixed(2)}
                              </div>
                            )}

                            {/* Branch and Staff Info */}
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-400">
                              {(item.branches?.name || item.branch_location) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {item.branches?.name || item.branch_location}
                                </span>
                              )}
                              {item.staff_members && (
                                <span className="flex items-center gap-1">
                                  👤 {item.staff_members.first_name} {item.staff_members.last_name}
                                </span>
                              )}
                            </div>

                            {item.notes && (
                              <p className="mt-2 text-sm text-neutral-300">{item.notes}</p>
                            )}

                            {/* Applied Promotions */}
                            {item.applied_promotions && item.applied_promotions.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {item.applied_promotions.map((promo: any, pIdx: number) => (
                                  <div key={pIdx} className="flex items-center gap-2 text-sm text-purple-400">
                                    <Gift className="w-4 h-4" />
                                    <span>{promo.title}</span>
                                    {parseFloat(promo.discount_amount) > 0 && (
                                      <span className="text-green-400">-${parseFloat(promo.discount_amount).toFixed(2)}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Only show save when in info tab */}
        {activeTab === 'info' && (
          <div className="bg-neutral-800 border-t border-neutral-700 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-neutral-400">Click on any field to edit</p>
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
        )}
      </div>
    </div>
  )
}
