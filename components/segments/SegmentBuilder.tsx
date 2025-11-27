'use client'

import { useState, useEffect } from 'react'
import { Users, Save, Play, Download, Tag, Loader2, Bell, CreditCard } from 'lucide-react'
import type { Database } from '@/lib/types/database'

type MemberSegment = Database['public']['Tables']['member_segments']['Row']
type MembershipType = Database['public']['Tables']['membership_types']['Row']
type Promotion = Database['public']['Tables']['promotions']['Row']

interface SegmentFilters {
  // Financieros
  total_spent_min?: number
  total_spent_max?: number
  spent_last_30_days_min?: number
  
  // Frecuencia
  total_visits_min?: number
  visits_last_30_days_min?: number
  last_visit_before?: string
  last_visit_after?: string
  
  // Membresía
  membership_types?: string[]
  status?: string[]
  
  // Promociones
  never_used_promotions?: boolean
  
  // Onboarding Responses
  onboarding_responses?: Record<string, string[]> // question_id -> [response_values]
}

interface OnboardingQuestion {
  id: string
  question_text: string
  question_type: string
  options?: string[]
}

interface SegmentBuilderProps {
  savedSegments: MemberSegment[]
  membershipTypes: MembershipType[]
}

export default function SegmentBuilder({ savedSegments, membershipTypes }: SegmentBuilderProps) {
  const [filters, setFilters] = useState<SegmentFilters>({})
  const [matchingMembers, setMatchingMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [segmentName, setSegmentName] = useState('')
  const [segmentDescription, setSegmentDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAssignPromo, setShowAssignPromo] = useState(false)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [selectedPromo, setSelectedPromo] = useState('')
  const [autoApply, setAutoApply] = useState(false)
  const [assigning, setAssigning] = useState(false)
  
  // Push notification states
  const [showPushModal, setShowPushModal] = useState(false)
  const [pushTitle, setPushTitle] = useState('')
  const [pushMessage, setPushMessage] = useState('')
  const [pushUrl, setPushUrl] = useState('')
  const [sendingPush, setSendingPush] = useState(false)
  
  // Wallet push states
  const [showWalletPushModal, setShowWalletPushModal] = useState(false)
  const [walletPushMessage, setWalletPushMessage] = useState('')
  const [sendingWalletPush, setSendingWalletPush] = useState(false)
  
  // Onboarding questions
  const [onboardingQuestions, setOnboardingQuestions] = useState<OnboardingQuestion[]>([])

  useEffect(() => {
    // Fetch promotions
    fetch('/api/promotions')
      .then(res => res.json())
      .then(data => setPromotions(data.filter((p: Promotion) => p.is_active)))
      .catch(console.error)
    
    // Fetch onboarding questions
    fetch('/api/onboarding/questions')
      .then(res => res.json())
      .then(data => setOnboardingQuestions(data || []))
      .catch(console.error)
  }, [])

  const applyFilters = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/segments/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters }),
      })

      const data = await response.json()
      setMatchingMembers(data.members || [])
    } catch (error) {
      console.error('Error applying filters:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSegment = async () => {
    if (!segmentName.trim()) {
      alert('Ingresa un nombre para el segmento')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: segmentName,
          description: segmentDescription,
          filters,
          member_count: matchingMembers.length,
        }),
      })

      if (!response.ok) throw new Error('Error al guardar')

      alert('Segmento guardado exitosamente')
      window.location.reload()
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const loadSavedSegment = (segment: MemberSegment) => {
    setFilters(segment.filters as SegmentFilters)
    setSegmentName(segment.name)
    setSegmentDescription(segment.description || '')
    applyFilters()
  }

  const exportToCSV = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Membership', 'Visits', 'Total Spent'],
      ...matchingMembers.map(m => [
        m.full_name,
        m.email,
        m.phone || '',
        m.membership_type,
        m.total_visits || 0,
        m.lifetime_spent || 0,
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `segmento_${segmentName || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const assignPromotion = async () => {
    if (!selectedPromo) {
      alert('Selecciona una promoción')
      return
    }

    setAssigning(true)
    try {
      const member_ids = matchingMembers.map(m => m.id)
      
      const response = await fetch('/api/promotions/assign-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_ids,
          promotion_id: selectedPromo,
          auto_apply: autoApply,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      alert(`Promoción asignada a ${data.assigned_count} miembros exitosamente!`)
      setShowAssignPromo(false)
      setSelectedPromo('')
      setAutoApply(false)
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setAssigning(false)
    }
  }

  const sendWalletPushNotification = async () => {
    if (!walletPushMessage.trim()) {
      alert('Ingresa un mensaje para la notificación')
      return
    }

    if (matchingMembers.length === 0) {
      alert('No hay miembros para enviar la notificación')
      return
    }

    setSendingWalletPush(true)
    try {
      console.log('📲 [Frontend] Sending wallet push notification:', {
        message: walletPushMessage,
        memberCount: matchingMembers.length
      })

      const response = await fetch('/api/wallet/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: walletPushMessage,
          target_type: 'segment',
          target_filter: filters,
          member_ids: matchingMembers.map(m => m.id),
        }),
      })

      console.log('📲 [Frontend] Response status:', response.status)

      const data = await response.json()
      
      console.log('📲 [Frontend] Response data:', data)

      if (!response.ok) {
        console.error('🔴 [Frontend] Error details:', data)
        throw new Error(data.details || data.error || 'Error al enviar notificaciones')
      }

      if (data.success) {
        alert(`✅ Notificación enviada a Apple Wallet\n\n` +
              `Total enviadas: ${data.stats.sent}\n` +
              `Fallidas: ${data.stats.failed}`)
        setShowWalletPushModal(false)
        setWalletPushMessage('')
      } else {
        alert(`⚠️ ${data.message || 'No se pudieron enviar notificaciones'}`)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setSendingWalletPush(false)
    }
  }

  const sendPushNotification = async () => {
    if (!pushTitle.trim() || !pushMessage.trim()) {
      alert('Ingresa título y mensaje para la notificación')
      return
    }

    if (matchingMembers.length === 0) {
      alert('No hay miembros para enviar la notificación')
      return
    }

    setSendingPush(true)
    try {
      console.log('🔔 [Frontend] Sending push notification:', {
        title: pushTitle,
        message: pushMessage,
        url: pushUrl,
        memberCount: matchingMembers.length
      })

      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pushTitle,
          body: pushMessage,
          url: pushUrl || undefined,
          target_type: 'segment',
          target_filter: filters,
          member_ids: matchingMembers.map(m => m.id),
        }),
      })

      console.log('🔔 [Frontend] Response status:', response.status)

      const data = await response.json()
      
      console.log('🔔 [Frontend] Response data:', data)

      if (!response.ok) {
        console.error('🔴 [Frontend] Error details:', data)
        throw new Error(data.details || data.error || 'Error al enviar notificaciones')
      }

      if (data.success) {
        alert(`✅ Notificación enviada exitosamente\n\n` +
              `Total enviadas: ${data.stats.sent}\n` +
              `Fallidas: ${data.stats.failed}`)
        setShowPushModal(false)
        setPushTitle('')
        setPushMessage('')
        setPushUrl('')
      } else {
        alert(`⚠️ ${data.message || 'No se pudieron enviar notificaciones'}`)
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setSendingPush(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Saved Segments */}
      {savedSegments.length > 0 && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Segmentos Guardados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {savedSegments.map((segment) => (
              <button
                key={segment.id}
                onClick={() => loadSavedSegment(segment)}
                className="text-left p-4 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition"
              >
                <div className="font-medium text-white">{segment.name}</div>
                <div className="text-sm text-neutral-400 mt-1">
                  {segment.member_count} miembros
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1 bg-neutral-800 border border-neutral-700 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Filters</h3>

          {/* Financial Filters */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Minimum Total Spent
            </label>
            <input
              type="number"
              value={filters.total_spent_min || ''}
              onChange={(e) => setFilters({ ...filters, total_spent_min: parseFloat(e.target.value) || undefined })}
              placeholder="e.g.: 500"
              className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Spent in last 30 days (minimum)
            </label>
            <input
              type="number"
              value={filters.spent_last_30_days_min || ''}
              onChange={(e) => setFilters({ ...filters, spent_last_30_days_min: parseFloat(e.target.value) || undefined })}
              placeholder="e.g.: 100"
              className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
            />
          </div>

          {/* Visit Filters */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Total Visits (minimum)
            </label>
            <input
              type="number"
              value={filters.total_visits_min || ''}
              onChange={(e) => setFilters({ ...filters, total_visits_min: parseInt(e.target.value) || undefined })}
              placeholder="e.g.: 5"
              className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Visits last 30 days (minimum)
            </label>
            <input
              type="number"
              value={filters.visits_last_30_days_min || ''}
              onChange={(e) => setFilters({ ...filters, visits_last_30_days_min: parseInt(e.target.value) || undefined })}
              placeholder="e.g.: 2"
              className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
            />
          </div>

          {/* Membership Types */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Tipos de Membresía
            </label>
            <div className="space-y-2">
              {membershipTypes.map((type) => (
                <label key={type.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.membership_types?.includes(type.name) || false}
                    onChange={(e) => {
                      const current = filters.membership_types || []
                      setFilters({
                        ...filters,
                        membership_types: e.target.checked
                          ? [...current, type.name]
                          : current.filter(t => t !== type.name)
                      })
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-neutral-300">{type.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Estado
            </label>
            <div className="space-y-2">
              {['active', 'inactive'].map((status) => (
                <label key={status} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(status) || false}
                    onChange={(e) => {
                      const current = filters.status || []
                      setFilters({
                        ...filters,
                        status: e.target.checked
                          ? [...current, status]
                          : current.filter(s => s !== status)
                      })
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-neutral-300 capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Onboarding Responses */}
          {onboardingQuestions.length > 0 && (
            <div className="pt-4 border-t border-neutral-700">
              <h4 className="text-sm font-semibold text-white mb-3">Onboarding Responses</h4>
              <div className="space-y-3">
                {onboardingQuestions.map((question) => {
                  // Select, Multi-select, Yes/No - Checkboxes
                  if (question.question_type === 'select' || question.question_type === 'multi_select' || question.question_type === 'yes_no') {
                    return (
                      <div key={question.id}>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          {question.question_text}
                        </label>
                        <div className="space-y-2">
                          {(question.options || []).map((option: string) => (
                            <label key={option} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={
                                  filters.onboarding_responses?.[question.id]?.includes(option) || false
                                }
                                onChange={(e) => {
                                  const currentResponses = filters.onboarding_responses || {}
                                  const currentOptions = currentResponses[question.id] || []
                                  
                                  setFilters({
                                    ...filters,
                                    onboarding_responses: {
                                      ...currentResponses,
                                      [question.id]: e.target.checked
                                        ? [...currentOptions, option]
                                        : currentOptions.filter(o => o !== option)
                                    }
                                  })
                                }}
                                className="rounded"
                              />
                              <span className="text-sm text-neutral-300">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  
                  // Rating - Stars (1-5)
                  if (question.question_type === 'rating') {
                    return (
                      <div key={question.id}>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          {question.question_text}
                        </label>
                        <div className="space-y-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <label key={rating} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={
                                  filters.onboarding_responses?.[question.id]?.includes(rating.toString()) || false
                                }
                                onChange={(e) => {
                                  const currentResponses = filters.onboarding_responses || {}
                                  const currentOptions = currentResponses[question.id] || []
                                  
                                  setFilters({
                                    ...filters,
                                    onboarding_responses: {
                                      ...currentResponses,
                                      [question.id]: e.target.checked
                                        ? [...currentOptions, rating.toString()]
                                        : currentOptions.filter(o => o !== rating.toString())
                                    }
                                  })
                                }}
                                className="rounded"
                              />
                              <span className="text-sm text-neutral-300 flex items-center gap-1">
                                {rating} {'⭐'.repeat(rating)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  
                  return null
                })}
              </div>
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={applyFilters}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {loading ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Results Header */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {matchingMembers.length} Members
                  </h3>
                  <p className="text-sm text-neutral-400">Match the filters</p>
                </div>
              </div>

              {matchingMembers.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setShowWalletPushModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                    title="Notificación a Apple Wallet (iOS)"
                  >
                    <CreditCard className="w-4 h-4" />
                    Enviar a Wallet
                  </button>
                  <button
                    onClick={() => setShowPushModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    title="Notificación web push (todos los dispositivos)"
                  >
                    <Bell className="w-4 h-4" />
                    Enviar Web Push
                  </button>
                  <button
                    onClick={() => setShowAssignPromo(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                  >
                    <Tag className="w-4 h-4" />
                    Asignar Promoción
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition"
                  >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                  </button>
                </div>
              )}
            </div>

            {/* Save Segment Form */}
            {matchingMembers.length > 0 && (
              <div className="border-t border-neutral-700 pt-4 space-y-3">
                <input
                  type="text"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  placeholder="Segment name..."
                  className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
                />
                <input
                  type="text"
                  value={segmentDescription}
                  onChange={(e) => setSegmentDescription(e.target.value)}
                  placeholder="Description (optional)..."
                  className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
                />
                <button
                  onClick={saveSegment}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Segment'}
                </button>
              </div>
            )}
          </div>

          {/* Members List */}
          {matchingMembers.length > 0 && (
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-700">
                  <thead className="bg-neutral-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                        Tier
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                        Visits
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                        Spent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700">
                    {matchingMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-neutral-700">
                        <td className="px-4 py-3 text-sm text-white">{member.full_name}</td>
                        <td className="px-4 py-3 text-sm text-neutral-300">{member.email}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 rounded-full text-xs bg-brand-100 text-brand-800">
                            {member.membership_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">{member.total_visits || 0}</td>
                        <td className="px-4 py-3 text-sm text-green-400">
                          ${(member.lifetime_spent || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {matchingMembers.length === 0 && !loading && (
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-12 text-center">
              <Users className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400">Aplica filtros para ver miembros</p>
            </div>
          )}
        </div>
      </div>

      {/* Assign Promotion Modal */}
      {showAssignPromo && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAssignPromo(false)}
        >
          <div 
            className="bg-neutral-800 border border-neutral-700 rounded-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Asignar Promoción Masiva</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Selecciona Promoción
                </label>
                <select
                  value={selectedPromo}
                  onChange={(e) => setSelectedPromo(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
                >
                  <option value="">Selecciona...</option>
                  {promotions.map((promo) => (
                    <option key={promo.id} value={promo.id}>
                      {promo.title} - {promo.discount_value}{promo.discount_type === 'percentage' ? '%' : '$'} OFF
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-300">
                  Auto-aplicar en próxima visita
                </label>
                <button
                  type="button"
                  onClick={() => setAutoApply(!autoApply)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    autoApply ? 'bg-orange-500' : 'bg-neutral-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      autoApply ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="bg-neutral-900/50 p-3 rounded-lg">
                <p className="text-sm text-neutral-400">
                  Se asignará a <span className="font-bold text-white">{matchingMembers.length}</span> miembros
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAssignPromo(false)}
                  className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={assignPromotion}
                  disabled={assigning || !selectedPromo}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {assigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Asignando...
                    </>
                  ) : (
                    'Asignar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Push Notification Modal */}
      {showPushModal && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPushModal(false)}
        >
          <div 
            className="bg-neutral-800 border border-neutral-700 rounded-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-500" />
              Enviar Notificación Push
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  placeholder="e.g.: New promotion available"
                  className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
                  maxLength={50}
                />
                <p className="text-xs text-neutral-500 mt-1">{pushTitle.length}/50 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Mensaje *
                </label>
                <textarea
                  value={pushMessage}
                  onChange={(e) => setPushMessage(e.target.value)}
                  placeholder="e.g.: Get 20% off on your next visit!"
                  className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
                  rows={3}
                  maxLength={120}
                />
                <p className="text-xs text-neutral-500 mt-1">{pushMessage.length}/120 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  URL (opcional)
                </label>
                <input
                  type="url"
                  value={pushUrl}
                  onChange={(e) => setPushUrl(e.target.value)}
                  placeholder="https://example.com/promotion"
                  className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Se abrirá al hacer click en la notificación
                </p>
              </div>

              <div className="bg-neutral-900/50 p-3 rounded-lg">
                <p className="text-sm text-neutral-400">
                  Se enviará a <span className="font-bold text-white">{matchingMembers.length}</span> miembros
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Solo a los que tengan notificaciones habilitadas
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPushModal(false)}
                  className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={sendPushNotification}
                  disabled={sendingPush || !pushTitle.trim() || !pushMessage.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sendingPush ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      Enviar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Push Notification Modal */}
      {showWalletPushModal && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowWalletPushModal(false)}
        >
          <div 
            className="bg-neutral-800 border border-neutral-700 rounded-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-purple-500" />
              Notificación a Apple Wallet
            </h3>
            
            <div className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <p className="text-sm text-purple-200">
                  📱 Esta notificación llegará a los iPhones que tengan la tarjeta instalada en Apple Wallet
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Mensaje *
                </label>
                <textarea
                  value={walletPushMessage}
                  onChange={(e) => setWalletPushMessage(e.target.value)}
                  placeholder="e.g.: New promotion available! 20% OFF on your next visit"
                  className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
                  rows={3}
                  maxLength={120}
                />
                <p className="text-xs text-neutral-500 mt-1">{walletPushMessage.length}/120 caracteres</p>
              </div>

              <div className="bg-neutral-900/50 p-3 rounded-lg">
                <p className="text-sm text-neutral-400">
                  Se enviará a <span className="font-bold text-white">{matchingMembers.length}</span> miembros
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Solo llegarán a los que tengan la tarjeta en Wallet
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowWalletPushModal(false)}
                  className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={sendWalletPushNotification}
                  disabled={sendingWalletPush || !walletPushMessage.trim()}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sendingWalletPush ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Enviar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
