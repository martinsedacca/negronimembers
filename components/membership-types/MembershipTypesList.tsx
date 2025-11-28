'use client'

import { useState } from 'react'
import { Users, Award, Gift, Edit, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'
import MembershipTypeBenefitsModal from './MembershipTypeBenefitsModal'

type MembershipType = Database['public']['Tables']['membership_types']['Row']

interface MembershipTypesListProps {
  membershipTypes: MembershipType[]
}

export default function MembershipTypesList({ membershipTypes }: MembershipTypesListProps) {
  const [selectedTypeForBenefits, setSelectedTypeForBenefits] = useState<MembershipType | null>(null)

  // Sort by requirements (base level first, then by points/visits needed)
  const sortedTypes = [...membershipTypes].sort((a, b) => {
    const aReq = Math.max((a as any).points_required || 0, (a as any).visits_required || 0)
    const bReq = Math.max((b as any).points_required || 0, (b as any).visits_required || 0)
    return aReq - bReq
  })

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
      <div className="p-6">
        {sortedTypes.length > 0 ? (
          <div className="space-y-4">
            {sortedTypes.map((type, index) => (
              <div
                key={type.id}
                className={`bg-neutral-900 border rounded-xl p-6 space-y-4 ${
                  type.is_active
                    ? 'border-orange-500/30'
                    : 'border-neutral-700 opacity-60'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {type.name}
                    </h3>
                    {type.description && (
                      <p className="text-sm text-neutral-400">
                        {type.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      type.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-neutral-700 text-neutral-400'
                    }`}
                  >
                    {type.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Points Required */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-2xl font-bold text-orange-500">
                    <Award className="w-6 h-6" />
                    {(type as any).points_required || 0}
                    <span className="text-sm text-neutral-400 font-normal">points required</span>
                  </div>
                </div>
                
                {/* Visits Required */}
                {(type as any).visits_required > 0 && (
                  <div className="flex items-center gap-2 text-lg font-semibold text-green-500">
                    <TrendingUp className="w-5 h-5" />
                    {(type as any).visits_required}
                    <span className="text-sm text-neutral-400 font-normal">visits required</span>
                  </div>
                )}
                
                {/* Base level indicator */}
                {(type as any).points_required === 0 && (type as any).visits_required === 0 && (
                  <div className="text-xs text-neutral-500 italic">
                    Base level - No requirements (registration only)
                  </div>
                )}


                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-neutral-700">
                  <button
                    onClick={() => setSelectedTypeForBenefits(type)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm"
                    title="View Benefits"
                  >
                    <Gift className="w-4 h-4" />
                    Benefits
                  </button>
                  <Link
                    href={`/dashboard/membership-types/${type.id}`}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition text-sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No membership types</h3>
            <p className="text-neutral-400 mb-4">
              Create your first membership type to get started
            </p>
            <Link
              href="/dashboard/membership-types/new"
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              + New Membership Type
            </Link>
          </div>
        )}
      </div>

      {/* Benefits Modal */}
      {selectedTypeForBenefits && (
        <MembershipTypeBenefitsModal
          membershipType={selectedTypeForBenefits}
          onClose={() => setSelectedTypeForBenefits(null)}
        />
      )}
    </div>
  )
}
