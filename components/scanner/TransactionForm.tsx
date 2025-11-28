'use client'

import { useState, useEffect, useRef } from 'react'
import { DollarSign, MapPin, Save, Loader2, PartyPopper } from 'lucide-react'

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatValidDays(days: number[]): string {
  if (!days || days.length === 0) return ''
  const names = days.map(d => dayNames[d])
  if (names.length === 1) return `Available ${names[0]}`
  if (names.length === 2) return `Available ${names[0]} & ${names[1]}`
  return `Available ${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}

interface TransactionFormProps {
  memberData: any
  onComplete: () => void
  onCancel: () => void
}

export default function TransactionForm({ memberData, onComplete, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    event_type: 'purchase' as 'purchase' | 'event' | 'visit',
    amount_spent: '',
    branch_id: '',
    branch_location: '', // Backward compatibility
    notes: '',
  })
  const [branches, setBranches] = useState<any[]>([])
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<any>(null)
  const submittingRef = useRef(false) // Prevent double submit
  const transactionIdRef = useRef<string | null>(null)

  useEffect(() => {
    fetch('/api/branches')
      .then(res => res.json())
      .then(data => {
        // API returns { branches: [...] }
        const branchList = data.branches || data || []
        setBranches(branchList.filter((b: any) => b.is_active))
      })
      .catch(console.error)
  }, [])

  // Clear selected promotions that are not available for the selected branch
  useEffect(() => {
    if (!formData.branch_id) return
    
    const availablePromoIds = memberData.available_promotions
      .filter((promo: any) => {
        if (!promo.applicable_branches || promo.applicable_branches.length === 0) return true
        return promo.applicable_branches.includes(formData.branch_id)
      })
      .map((promo: any) => promo.promotion_id)
    
    setSelectedPromotions(prev => prev.filter(id => availablePromoIds.includes(id)))
  }, [formData.branch_id, memberData.available_promotions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    //防止双重提交 - Prevent double submit
    if (submittingRef.current) {
      console.warn('⚠️ Transaction already in progress, ignoring duplicate submit')
      return
    }
    
    submittingRef.current = true
    setLoading(true)

    try {
      // Generate unique transaction ID for deduplication
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      transactionIdRef.current = transactionId
      
      console.log('🔵 [TransactionForm] Submitting transaction:', {
        transactionId,
        member_id: memberData.member.id,
        event_type: formData.event_type,
        timestamp: new Date().toISOString()
      })
      
      // Get branch name for backward compatibility
      const selectedBranch = branches.find(b => b.id === formData.branch_id)
      
      const response = await fetch('/api/scanner/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: transactionId,
          member_id: memberData.member.id,
          event_type: formData.event_type,
          amount_spent: parseFloat(formData.amount_spent) || 0,
          branch_id: formData.branch_id,
          branch_location: selectedBranch?.name || formData.branch_location,
          applied_promotions: selectedPromotions,
          notes: formData.notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('🔴 [TransactionForm] API Error Response:', data)
        const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error
        alert(`Error: ${errorMsg}`)
        throw new Error(errorMsg || 'Error al registrar transacción')
      }

      console.log('✅ [TransactionForm] Transaction successful:', {
        transactionId: transactionIdRef.current,
        card_usage_id: data.card_usage_id,
        points_earned: data.points_earned
      })
      
      setSuccess(data)
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onComplete()
      }, 3000)
    } catch (err: any) {
      console.error('🔴 [TransactionForm] Error:', err)
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }

  const togglePromotion = (promoId: string) => {
    setSelectedPromotions(prev =>
      prev.includes(promoId)
        ? prev.filter(id => id !== promoId)
        : [...prev, promoId]
    )
  }

  if (success) {
    return (
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-8 text-center">
        <PartyPopper className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">
          {success.new_tier ? '🎉 Tier Upgraded!' : '✅ Recorded!'}
        </h3>
        <p className="text-neutral-300 mb-4">{success.message}</p>
        <div className="bg-neutral-900/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Points earned:</span>
            <span className="text-white font-semibold">+{success.points_earned}</span>
          </div>
          {success.total_discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Total discount:</span>
              <span className="text-green-400 font-semibold">${success.total_discount}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-neutral-700">
        <h2 className="text-lg font-semibold text-white">Register Transaction</h2>
      </div>

      <div className="p-6 space-y-4">
        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'purchase', label: 'Purchase' },
              { value: 'event', label: 'Event' },
              { value: 'visit', label: 'Visit' },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, event_type: type.value as any })}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition ${
                  formData.event_type === type.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        {formData.event_type === 'purchase' && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Amount Spent *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="number"
                step="0.01"
                value={formData.amount_spent}
                onChange={(e) => setFormData({ ...formData, amount_spent: e.target.value })}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required={formData.event_type === 'purchase'}
              />
            </div>
          </div>
        )}

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none z-10" />
            <select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
            >
              <option value="">Select a location...</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message when no branch selected */}
        {memberData.available_promotions.length > 0 && !formData.branch_id && (
          <div className="text-sm text-neutral-500 bg-neutral-900/50 rounded-lg p-3 text-center">
            Select a location to see available benefits
          </div>
        )}

        {/* Promotions - only show after branch is selected */}
        {memberData.available_promotions.length > 0 && formData.branch_id && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Available Benefits
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {memberData.available_promotions
                .filter((promo: any) => {
                  // If no applicable_branches or empty array, it's available everywhere
                  if (!promo.applicable_branches || promo.applicable_branches.length === 0) return true
                  // Check if selected branch is in applicable_branches
                  return promo.applicable_branches.includes(formData.branch_id)
                })
                .map((promo: any) => {
                const icon = promo.icon || '🎁'
                const isSelected = selectedPromotions.includes(promo.promotion_id)
                const isBlocked = promo.is_blocked
                const blockReason = promo.block_reason
                
                // Block reason labels
                const blockLabels: Record<string, string> = {
                  'sold_out': 'Sold Out',
                  'already_used': 'Already Used',
                  'not_today': 'Not Available Today',
                }
                
                return (
                  <div
                    key={promo.promotion_id}
                    onClick={() => !isBlocked && togglePromotion(promo.promotion_id)}
                    className={`flex items-start gap-3 p-3 rounded-lg transition relative ${
                      isBlocked
                        ? 'bg-neutral-800/50 border-2 border-neutral-700 cursor-not-allowed opacity-60'
                        : isSelected 
                          ? 'bg-orange-500/20 border-2 border-orange-500 cursor-pointer' 
                          : 'bg-neutral-700 border-2 border-transparent hover:bg-neutral-600 cursor-pointer'
                    }`}
                  >
                    {!isBlocked && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePromotion(promo.promotion_id)}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <div className={`text-2xl leading-none ${isBlocked ? 'grayscale' : ''}`}>{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${isBlocked ? 'text-neutral-400' : 'text-white'}`}>
                        {promo.title}
                      </div>
                      {promo.discount_value && promo.discount_type && (
                        <div className={`text-xs font-medium mt-0.5 ${isBlocked ? 'text-neutral-500' : 'text-orange-400'}`}>
                          {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `$${promo.discount_value} OFF`}
                          {promo.usage_type && promo.usage_type !== 'general' && (
                            <span className="ml-2 px-2 py-0.5 bg-neutral-800 rounded text-[10px] uppercase text-neutral-300">
                              {promo.usage_type}
                            </span>
                          )}
                        </div>
                      )}
                      {promo.description && (
                        <div className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{promo.description}</div>
                      )}
                      {/* Block reason badge */}
                      {isBlocked && blockReason && (
                        <div className="mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            blockReason === 'sold_out' ? 'bg-red-500/20 text-red-400 uppercase' :
                            blockReason === 'already_used' ? 'bg-yellow-500/20 text-yellow-400 uppercase' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {blockReason === 'not_today' && promo.valid_days 
                              ? formatValidDays(promo.valid_days)
                              : blockLabels[blockReason] || blockReason}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Optional notes..."
            rows={2}
            className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-neutral-400 resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-neutral-700 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-neutral-700 text-neutral-300 rounded-lg font-medium hover:bg-neutral-600 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Record
            </>
          )}
        </button>
      </div>
    </form>
  )
}
