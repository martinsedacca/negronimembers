'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStaffSession } from '../hooks/useStaffSession'
import { 
  ArrowLeft, Check, Loader2, User, Award, MapPin,
  Gift, Percent, Tag, DollarSign, CheckCircle2, Ban
} from 'lucide-react'

interface Promotion {
  promotion_id: string
  title: string
  description: string
  discount_type: 'percentage' | 'fixed' | 'free_item'
  discount_value: number
  is_blocked?: boolean
  block_reason?: 'sold_out' | 'already_used' | 'not_today' | null
  icon?: string
  valid_days?: number[]
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatValidDays(days: number[]): string {
  if (!days || days.length === 0) return ''
  const names = days.map(d => dayNames[d])
  if (names.length === 1) return `Available ${names[0]}`
  if (names.length === 2) return `Available ${names[0]} & ${names[1]}`
  return `Available ${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}

interface Member {
  id: string
  full_name: string
  email: string
  phone: string
  membership_type: string // Tier name
  membership_type_id?: string // FK to membership_types
  member_number: string
  points: number
  total_spent: number
  total_visits: number
}

interface MemberData {
  member: Member
  stats: any
  available_promotions: Promotion[]
  branch: { id: string; name: string }
}

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const memberId = searchParams.get('member_id')
  const { session, loading: sessionLoading, getAuthHeaders, currentBranch } = useStaffSession()

  const [memberData, setMemberData] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [amount, setAmount] = useState('')
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)

  // Fetch member data
  useEffect(() => {
    if (!memberId || sessionLoading) return

    const fetchMember = async () => {
      try {
        const response = await fetch('/api/staff/scanner/verify', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ member_id: memberId }),
        })

        if (!response.ok) {
          setError('Member not found')
          setLoading(false)
          return
        }

        const data = await response.json()
        setMemberData(data)
        setLoading(false)
      } catch (err) {
        setError('Failed to load member')
        setLoading(false)
      }
    }

    fetchMember()
  }, [memberId, sessionLoading, getAuthHeaders])

  // Toggle promotion selection
  const togglePromotion = (promoId: string) => {
    setSelectedPromotions(prev => 
      prev.includes(promoId)
        ? prev.filter(id => id !== promoId)
        : [...prev, promoId]
    )
  }

  // Submit transaction
  const handleSubmit = async () => {
    if (!memberData) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/staff/scanner/record', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          member_id: memberData.member.id,
          event_type: 'purchase',
          amount_spent: parseFloat(amount) || 0,
          applied_promotions: selectedPromotions,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to record visit')
        setSubmitting(false)
        return
      }

      const data = await response.json()
      setResult(data)
      setSuccess(true)
    } catch (err) {
      setError('Connection error')
      setSubmitting(false)
    }
  }

  // Get discount display text
  const getDiscountText = (promo: Promotion) => {
    switch (promo.discount_type) {
      case 'percentage':
        return `${promo.discount_value}% OFF`
      case 'fixed':
        return `$${promo.discount_value} OFF`
      case 'free_item':
        return 'FREE'
      default:
        return ''
    }
  }

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (error && !memberData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 p-4">
        <div className="text-red-400 text-lg mb-4">{error}</div>
        <button
          onClick={() => router.push('/scanner/main')}
          className="px-6 py-3 bg-neutral-700 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    )
  }

  // Success screen
  if (success && result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-white">Visit Recorded!</h1>
          
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 space-y-4">
            <div className="text-lg text-white font-medium">
              {result.member_name}
            </div>
            
            <div className="flex justify-between text-neutral-400">
              <span>Points Earned</span>
              <span className="text-orange-400 font-semibold">+{result.points_earned}</span>
            </div>
            
            <div className="flex justify-between text-neutral-400">
              <span>New Balance</span>
              <span className="text-white font-semibold">{result.new_total_points} pts</span>
            </div>
            
            {result.total_discount > 0 && (
              <div className="flex justify-between text-neutral-400">
                <span>Discount Applied</span>
                <span className="text-green-400 font-semibold">-${result.total_discount.toFixed(2)}</span>
              </div>
            )}
            
            {result.applied_promotions?.length > 0 && (
              <div className="border-t border-neutral-700 pt-4">
                <div className="text-sm text-neutral-500 mb-2">Benefits Used:</div>
                {result.applied_promotions.map((promo: any, i: number) => (
                  <div key={i} className="text-sm text-neutral-300">
                    • {promo.title}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={() => router.push('/scanner/main')}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl transition"
          >
            Scan Another Customer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col">
      {/* Header */}
      <header className="bg-neutral-800 border-b border-neutral-700 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/scanner/main')}
            className="p-2 hover:bg-neutral-700 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-white">Register Visit</h1>
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              <MapPin className="w-3 h-3" />
              {currentBranch?.name}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 space-y-4 overflow-auto">
        {/* Member Info */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">
                {memberData?.member.full_name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded">
                  {memberData?.member.membership_type}
                </span>
                <span className="text-xs text-neutral-500">
                  #{memberData?.member.member_number}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-500">
                {memberData?.member.points}
              </div>
              <div className="text-xs text-neutral-500">points</div>
            </div>
          </div>
          
          {/* Member Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-700">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                ${memberData?.member.total_spent?.toFixed(0) || 0}
              </div>
              <div className="text-xs text-neutral-500">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {memberData?.member.total_visits || 0}
              </div>
              <div className="text-xs text-neutral-500">Total Visits</div>
            </div>
          </div>
        </div>

        {/* Available Benefits */}
        {memberData && memberData.available_promotions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Available Benefits at {currentBranch?.name}
            </h3>
            
            <div className="space-y-2">
              {memberData.available_promotions.map((promo) => {
                const isBlocked = promo.is_blocked
                const blockLabels: Record<string, string> = {
                  'sold_out': 'Sold Out',
                  'already_used': 'Already Used',
                  'not_today': 'Not Available Today',
                }
                
                return (
                <div
                  key={promo.promotion_id}
                  onClick={() => !isBlocked && togglePromotion(promo.promotion_id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isBlocked
                      ? 'bg-neutral-800/50 border-neutral-700 opacity-60 cursor-not-allowed'
                      : selectedPromotions.includes(promo.promotion_id)
                        ? 'bg-orange-500/20 border-orange-500 cursor-pointer'
                        : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isBlocked
                        ? 'bg-red-500/20 text-red-400'
                        : selectedPromotions.includes(promo.promotion_id)
                          ? 'bg-orange-500 text-white'
                          : 'bg-neutral-700 text-neutral-400'
                    }`}>
                      {isBlocked ? (
                        <Ban className="w-4 h-4" />
                      ) : selectedPromotions.includes(promo.promotion_id) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        promo.discount_type === 'percentage' ? (
                          <Percent className="w-4 h-4" />
                        ) : (
                          <Tag className="w-4 h-4" />
                        )
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isBlocked ? 'text-neutral-400' : 'text-white'}`}>{promo.title}</span>
                        <span className={`text-sm font-bold ${
                          isBlocked
                            ? 'text-neutral-500'
                            : selectedPromotions.includes(promo.promotion_id)
                              ? 'text-orange-400'
                              : 'text-green-400'
                        }`}>
                          {getDiscountText(promo)}
                        </span>
                      </div>
                      {promo.description && (
                        <p className="text-sm text-neutral-400 mt-1">{promo.description}</p>
                      )}
                      {/* Block reason badge */}
                      {isBlocked && promo.block_reason && (
                        <div className="mt-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            promo.block_reason === 'sold_out' ? 'bg-red-500/20 text-red-400 uppercase' :
                            promo.block_reason === 'already_used' ? 'bg-yellow-500/20 text-yellow-400 uppercase' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {promo.block_reason === 'not_today' && promo.valid_days 
                              ? formatValidDays(promo.valid_days)
                              : blockLabels[promo.block_reason] || promo.block_reason}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {memberData && memberData.available_promotions.length === 0 && (
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6 text-center">
            <Gift className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
            <p className="text-neutral-400">No benefits available at this location</p>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Bill Amount
          </h3>
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-neutral-400">$</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-5 bg-neutral-800 border border-neutral-700 
                         text-white text-3xl font-bold rounded-xl
                         focus:ring-2 focus:ring-orange-500 focus:border-transparent
                         placeholder-neutral-600"
            />
          </div>
          
          <p className="text-xs text-neutral-500">
            Enter the total bill amount. Points: 1 per $1 spent
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-900/30 border border-red-700 rounded-xl text-red-400">
            {error}
          </div>
        )}
      </main>

      {/* Submit Button */}
      <div className="p-4 bg-neutral-800 border-t border-neutral-700">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50
                     text-white font-bold text-xl rounded-xl transition
                     flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Recording...
            </>
          ) : (
            <>
              <Check className="w-6 h-6" />
              Register Visit
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
