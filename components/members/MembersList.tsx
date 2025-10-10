'use client'

import { useState } from 'react'
import { Search, Mail, Phone, Calendar, Award } from 'lucide-react'
import type { Database } from '@/lib/types/database'
import MemberDetailModal from './MemberDetailModal'

type Member = Database['public']['Tables']['members']['Row']
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
    const matchesSearch =
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.member_number.toLowerCase().includes(searchTerm.toLowerCase())

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar miembros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-700 border border-neutral-600 text-white rounded-md focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-700 border border-neutral-600 text-white rounded-md focus:ring-orange-500 focus:border-brand-500"
          >
            <option value="all">Todos los tipos</option>
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
                  Miembro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Puntos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Fecha de Ingreso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-800 divide-y divide-neutral-700">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-neutral-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center">
                        <span className="text-brand-500 font-medium text-sm">
                          {member.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {member.full_name}
                        </div>
                        <div className="text-sm text-neutral-400">
                          #{member.member_number}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-neutral-400" />
                      {new Date(member.joined_date).toLocaleDateString('es-ES')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="text-brand-400 hover:text-brand-300 transition"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-400">No se encontraron miembros</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="px-6 py-4 bg-neutral-900/50 border-t border-neutral-700">
        <p className="text-sm text-neutral-300">
          Mostrando <span className="font-medium">{filteredMembers.length}</span> de{' '}
          <span className="font-medium">{members.length}</span> miembros
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
