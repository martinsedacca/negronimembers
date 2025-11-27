'use client'

import { useEffect, useState } from 'react'
import { X, Gift, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { Database } from '@/lib/types/database'

type MembershipType = Database['public']['Tables']['membership_types']['Row']

interface Promotion {
  id: string
  title: string
  description: string | null
  discount_type: 'percentage' | 'fixed' | 'points' | 'perk'
  discount_value: number | null
  start_date: string
  end_date: string
  is_active: boolean
  applicable_to: string[] | null
}

interface MembershipTypeBenefitsModalProps {
  membershipType: MembershipType
  onClose: () => void
}

export default function MembershipTypeBenefitsModal({ membershipType, onClose }: MembershipTypeBenefitsModalProps) {
  const [benefits, setBenefits] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchBenefits()
  }, [membershipType.id])

  const fetchBenefits = async () => {
    try {
      // Fetch benefits specific to this tier
      const { data: tierSpecific, error: error1 } = await supabase
        .from('promotions')
        .select('*')
        .contains('applicable_to', [`tier:${membershipType.name}`])

      // Fetch benefits for all members
      const { data: allMembers, error: error2 } = await supabase
        .from('promotions')
        .select('*')
        .contains('applicable_to', ['all'])

      if (error1 || error2) throw error1 || error2

      // Combine and deduplicate
      const allBenefits = [...(tierSpecific || []), ...(allMembers || [])]
      const uniqueBenefits = Array.from(
        new Map(allBenefits.map(item => [item.id, item])).values()
      ).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())

      setBenefits(uniqueBenefits)
    } catch (error) {
      console.error('Error fetching benefits:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDiscountDisplay = (promo: Promotion) => {
    switch (promo.discount_type) {
      case 'percentage':
        return `${promo.discount_value}% OFF`
      case 'fixed':
        return `$${promo.discount_value} OFF`
      case 'points':
        return `+${promo.discount_value} points`
      case 'perk':
        return 'Special Perk'
      default:
        return ''
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Gift className="w-6 h-6 text-orange-500" />
              Benefits for: <span className="text-orange-500">{membershipType.name}</span>
            </h2>
            <p className="text-sm text-neutral-400 mt-1">{membershipType.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-neutral-400 mt-4">Loading benefits...</p>
            </div>
          ) : benefits.length > 0 ? (
            <div className="space-y-4">
              {benefits.map((benefit) => {
                const isActive = benefit.is_active && 
                  new Date(benefit.start_date) <= new Date() && 
                  new Date(benefit.end_date) >= new Date()
                const isForAll = benefit.applicable_to?.includes('all')

                return (
                  <div
                    key={benefit.id}
                    className={`border rounded-xl p-5 ${
                      isActive
                        ? 'border-orange-500/30 bg-neutral-900'
                        : 'border-neutral-700 bg-neutral-900/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">
                            {benefit.title}
                          </h3>
                          {isForAll && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                              All Members
                            </span>
                          )}
                        </div>
                        {benefit.description && (
                          <p className="text-sm text-neutral-400 mb-3">
                            {benefit.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isActive
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-neutral-700 text-neutral-400'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-orange-500" />
                        <span className="text-white font-medium">
                          {getDiscountDisplay(benefit)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(benefit.start_date), 'MMM d')} - {format(new Date(benefit.end_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No benefits assigned</h3>
              <p className="text-neutral-400">
                This membership type doesn't have any benefits assigned yet.
                <br />
                Create a benefit and assign it to this tier to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
