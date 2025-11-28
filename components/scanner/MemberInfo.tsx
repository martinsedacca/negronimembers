'use client'

import { useEffect, useState } from 'react'
import { Award, Mail, Phone, Clock, X, Smartphone, CheckCircle2, XCircle, MapPin } from 'lucide-react'

interface Branch {
  id: string
  name: string
}

interface MemberInfoProps {
  memberData: any
  onReset: () => void
}

export default function MemberInfo({ memberData, onReset }: MemberInfoProps) {
  const { member, stats, available_promotions, assigned_promotions, wallet_status } = memberData
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
    fetch('/api/branches')
      .then(res => res.json())
      .then(data => {
        const branchList = data.branches || data || []
        setBranches(branchList.filter((b: any) => b.is_active))
      })
      .catch(console.error)
  }, [])

  // Get location names for a benefit (same logic as member app)
  const getLocationText = (applicableBranches: string[] | null): string => {
    if (!applicableBranches || applicableBranches.length === 0) {
      return 'All locations'
    }
    const names = applicableBranches
      .map(id => branches.find(b => b.id === id)?.name)
      .filter(Boolean)
    if (names.length === 0) return 'All locations'
    if (names.length === 1) return `Only at ${names[0]}`
    if (names.length === branches.length) return 'All locations'
    return names.join(', ')
  }

  const tierColors: Record<string, string> = {
    Basic: 'bg-neutral-600',
    Silver: 'bg-neutral-400',
    Gold: 'bg-yellow-500',
    Platinum: 'bg-purple-500',
    VIP: 'bg-orange-500',
  }

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-neutral-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Customer Information</h2>
        <button
          onClick={onReset}
          className="p-2 hover:bg-neutral-700 rounded-lg transition"
        >
          <X className="w-5 h-5 text-neutral-400" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Member Info */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white">{member.full_name}</h3>
              <p className="text-sm text-neutral-400 mt-1">#{member.member_number}</p>
            </div>
            <span className={`${tierColors[member.membership_type] || 'bg-neutral-600'} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2`}>
              <Award className="w-4 h-4" />
              {member.membership_type}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            {member.email && (
              <div className="flex items-center gap-2 text-neutral-300">
                <Mail className="w-4 h-4 text-neutral-500" />
                {member.email}
              </div>
            )}
            {member.phone && (
              <div className="flex items-center gap-2 text-neutral-300">
                <Phone className="w-4 h-4 text-neutral-500" />
                {member.phone}
              </div>
            )}
          </div>
        </div>

        {/* Wallet Status */}
        {wallet_status && (
          <div className="bg-neutral-900/50 border border-neutral-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-neutral-400" />
                <span className="text-sm font-medium text-white">Digital Card</span>
              </div>
              {wallet_status.has_wallet ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-neutral-500" />
              )}
            </div>
            {wallet_status.has_wallet ? (
              <div className="mt-2 space-y-1">
                {wallet_status.passes.map((pass: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="capitalize">
                      {pass.pass_type === 'apple' ? '🍎 Apple Wallet' : '📱 Google Wallet'}
                    </span>
                    <span className="text-neutral-600">•</span>
                    <span>Installed {new Date(pass.installed_at).toLocaleDateString('en-US')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-xs text-neutral-500">
                No card installed
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-900/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-white">${stats.lifetime_spent || 0}</div>
            <div className="text-xs text-neutral-400 mt-1">Lifetime Spent</div>
          </div>
          <div className="bg-neutral-900/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-white">{stats.total_visits || 0}</div>
            <div className="text-xs text-neutral-400 mt-1">Visits</div>
          </div>
          <div className="bg-neutral-900/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-white">${stats.spent_last_30_days || 0}</div>
            <div className="text-xs text-neutral-400 mt-1">Last 30 Days</div>
          </div>
          <div className="bg-neutral-900/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-500">{member.points}</div>
            <div className="text-xs text-neutral-400 mt-1">Points</div>
          </div>
        </div>

        {/* Last Visit */}
        {stats.last_visit && (
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Clock className="w-4 h-4" />
            Last visit: {new Date(stats.last_visit).toLocaleDateString('en-US')}
          </div>
        )}

        {/* Available Benefits */}
        {available_promotions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Available Benefits</h4>
            <div className="space-y-2">
              {available_promotions.slice(0, 3).map((promo: any) => (
                <div key={promo.promotion_id} className="text-xs bg-green-900/20 border border-green-700/50 rounded-lg p-2">
                  <div className="font-medium text-green-400">{promo.title}</div>
                  {promo.discount_value && promo.discount_type && (
                    <div className="text-orange-400 mt-1 font-medium">
                      {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `$${promo.discount_value} OFF`}
                    </div>
                  )}
                  {promo.description && (
                    <div className="text-neutral-400 mt-1 line-clamp-2">{promo.description}</div>
                  )}
                  <div className="text-neutral-500 mt-1 text-[10px] flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{getLocationText(promo.applicable_branches)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
