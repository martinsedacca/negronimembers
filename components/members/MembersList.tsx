'use client'

import { useState } from 'react'
import { Mail, Phone, Calendar, Award, Smartphone, CheckCircle2, XCircle } from 'lucide-react'
import type { Database } from '@/lib/types/database'
import MemberDetailModal from './MemberDetailModalNew'
import SearchBar from '@/components/ui/SearchBar'

type Member = Database['public']['Tables']['members']['Row'] & {
  total_visits?: number
  total_purchases?: number
  total_events?: number
  lifetime_spent?: number
  visits_last_30_days?: number
  spent_last_30_days?: number
  visits_last_90_days?: number
  spent_last_90_days?: number
  last_visit?: string | null
  average_purchase?: number
  promotions_used?: number
  has_wallet?: boolean
  wallet_types?: string[] | null
}
type MembershipType = Database['public']['Tables']['membership_types']['Row']

interface MembersListProps {
  members: Member[]
  membershipTypes: MembershipType[]
}

export default function MembersList({ members, membershipTypes }: MembersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const filteredMembers = members.filter((member) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      (member.full_name || '').toLowerCase().includes(searchLower) ||
      (member.email || '').toLowerCase().includes(searchLower) ||
      (member.phone || '').toLowerCase().includes(searchLower) ||
      (member.member_number || '').toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    const matchesType = typeFilter === 'all' || member.membership_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getMembershipTypeColor = (typeName: string) => {
    const type = membershipTypes.find((t) => t.name === typeName)
    return type?.color || '#6B7280'
  }

  return (
    <div className="bg-neutral-800 border border-neutral-700 shadow rounded-lg">
      {/* Filters */}
      <div className="p-6 border-b border-neutral-700">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search members..."
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {membershipTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="overflow-x-auto">
        {filteredMembers.length > 0 ? (
          <table className="min-w-full divide-y divide-neutral-700">
            <thead className="bg-neutral-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Card
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Join Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-800 divide-y divide-neutral-700">
              {filteredMembers.map((member) => (
                <tr 
                  key={member.id} 
                  onClick={() => setSelectedMember(member)}
                  className="hover:bg-neutral-700 cursor-pointer transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center">
                        <span className="text-brand-500 font-medium text-sm">
                          {(member.full_name || member.phone || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {member.full_name || member.phone || 'No name'}
                        </div>
                        <div className="text-sm text-neutral-400">
                          #{member.member_number || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-neutral-400" />
                      {member.email}
                    </div>
                    {member.phone && (
                      <div className="text-sm text-neutral-400 flex items-center mt-1">
                        <Phone className="w-4 h-4 mr-2 text-neutral-400" />
                        {member.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getMembershipTypeColor(member.membership_type) }}
                    >
                      <Award className="w-3 h-3 mr-1" />
                      {member.membership_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : member.status === 'inactive'
                          ? 'bg-neutral-100 text-neutral-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <span className="font-semibold">{member.points}</span> pts
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <span className="font-semibold">{member.total_visits || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <span className="font-semibold text-green-400">${(member.lifetime_spent || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      {member.has_wallet ? (
                        <>
                          {member.wallet_types?.includes('apple') && (
                            <span title="Apple Wallet" className="text-lg">🍎</span>
                          )}
                          {member.wallet_types?.includes('google') && (
                            <span title="Google Wallet" className="text-lg">📱</span>
                          )}
                        </>
                      ) : (
                        <span title="No card">
                          <XCircle className="w-5 h-5 text-neutral-600" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-neutral-400" />
                      {new Date(member.joined_date).toLocaleDateString('en-US')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-400">No members found</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="px-6 py-4 bg-neutral-900/50 border-t border-neutral-700">
        <p className="text-sm text-neutral-300">
          Showing <span className="font-medium">{filteredMembers.length}</span> of{' '}
          <span className="font-medium">{members.length}</span> members
        </p>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          membershipTypes={membershipTypes}
          onClose={() => setSelectedMember(null)}
          onUpdate={() => {
            setRefreshKey(prev => prev + 1)
            setSelectedMember(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
