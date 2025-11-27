'use client'

import { useState } from 'react'
import { Search, Calendar, Percent, DollarSign, Award, TrendingUp, Edit } from 'lucide-react'
import type { Database } from '@/lib/types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import GlowCard from '@/components/ui/GlowCard'
import EditPromotionModal from './EditPromotionModal'

type Promotion = Database['public']['Tables']['promotions']['Row']
type MembershipType = Database['public']['Tables']['membership_types']['Row']

interface PromotionsListProps {
  promotions: Promotion[]
  membershipTypes: MembershipType[]
}

export default function PromotionsList({ promotions, membershipTypes }: PromotionsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)

  const now = new Date()

  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (promo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const isActive = promo.is_active && new Date(promo.start_date) <= now && (!promo.end_date || new Date(promo.end_date) >= now)
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'inactive' && !isActive)

    return matchesSearch && matchesStatus
  })

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return Percent
      case 'fixed':
        return DollarSign
      case 'points':
        return Award
      default:
        return TrendingUp
    }
  }

  const getDiscountDisplay = (promo: Promotion) => {
    switch (promo.discount_type) {
      case 'percentage':
        return `${promo.discount_value}%`
      case 'fixed':
        return `$${promo.discount_value}`
      case 'points':
        return `${promo.discount_value} pts`
      case 'perk':
        return 'Special Perk'
      default:
        return promo.discount_value
    }
  }

  const isPromotionActive = (promo: Promotion) => {
    return promo.is_active && new Date(promo.start_date) <= now && (!promo.end_date || new Date(promo.end_date) >= now)
  }

  return (
    <div className="bg-neutral-800 border border-neutral-700 shadow rounded-lg">
      {/* Filters */}
      <div className="p-6 border-b border-neutral-700">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search promotions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-white rounded-md focus:ring-orange-500 focus:border-brand-500 placeholder-neutral-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-700 border border-neutral-600 text-white rounded-md focus:ring-orange-500 focus:border-brand-500"
          >
            <option value="all">All promotions</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="p-6">
        {filteredPromotions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPromotions.map((promo) => {
              const Icon = getDiscountIcon(promo.discount_type)
              const active = isPromotionActive(promo)

              return (
                <GlowCard
                  key={promo.id}
                  glowColor={active ? '#10b981' : '#E85A23'}
                  glowSize={280}
                  className="hover:scale-[1.02] transition-transform duration-300 shadow-lg"
                >
                <div
                  className={`p-6 rounded-xl border ${
                    active 
                      ? 'bg-green-900/30 border-green-600/30' 
                      : 'bg-neutral-900/40 border-neutral-700/50'
                  } shadow-xl`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${active ? 'bg-green-900/50' : 'bg-neutral-700'}`}>
                      <Icon className={`w-6 h-6 ${active ? 'text-green-400' : 'text-neutral-400'}`} />
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      {active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{promo.title}</h3>
                  
                  {promo.description && (
                    <p className="text-sm text-neutral-300 mb-4 line-clamp-2">{promo.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">Descuento:</span>
                      <span className="font-semibold text-brand-400 text-lg">
                        {getDiscountDisplay(promo)}
                      </span>
                    </div>

                    <div className="flex items-center text-xs text-neutral-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(promo.start_date), 'dd MMM', { locale: es })} -{' '}
                      {promo.end_date 
                        ? format(new Date(promo.end_date), 'dd MMM yyyy', { locale: es })
                        : 'Sin límite'}
                    </div>

                    {promo.min_usage_count > 0 && (
                      <div className="text-xs text-neutral-400">
                        Uso mínimo: {promo.min_usage_count} veces
                      </div>
                    )}

                    {promo.max_usage_count && (
                      <div className="text-xs text-neutral-400">
                        Uso máximo: {promo.max_usage_count} veces
                      </div>
                    )}
                  </div>

                  {promo.applicable_to && promo.applicable_to.length > 0 && !promo.applicable_to.includes('all') && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-neutral-400 mb-2">Aplica a:</p>
                      <div className="flex flex-wrap gap-1">
                        {promo.applicable_to.map((type: string) => (
                          <span
                            key={type}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-indigo-800"
                          >
                            {type.replace('tier:', '').replace('code:', '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Edit Button */}
                  <button
                    onClick={() => setSelectedPromotion(promo)}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Benefit
                  </button>
                </div>
                </GlowCard>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-400">No benefits found</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="px-6 py-4 bg-neutral-900/50 border-t border-neutral-700">
        <p className="text-sm text-neutral-300">
          Showing <span className="font-medium">{filteredPromotions.length}</span> of{' '}
          <span className="font-medium">{promotions.length}</span> benefits
        </p>
      </div>

      {/* Edit Modal */}
      {selectedPromotion && (
        <EditPromotionModal
          promotion={selectedPromotion}
          membershipTypes={membershipTypes}
          onClose={() => setSelectedPromotion(null)}
          onUpdate={() => {
            setSelectedPromotion(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
