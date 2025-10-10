'use client'

import { Award, Mail, Phone, TrendingUp, Clock, X } from 'lucide-react'

interface MemberInfoProps {
  memberData: any
  onReset: () => void
}

export default function MemberInfo({ memberData, onReset }: MemberInfoProps) {
  const { member, stats, available_promotions, assigned_promotions } = memberData

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
        <h2 className="text-lg font-semibold text-white">Información del Cliente</h2>
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-900/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-white">${stats.lifetime_spent || 0}</div>
            <div className="text-xs text-neutral-400 mt-1">Gasto Total</div>
          </div>
          <div className="bg-neutral-900/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-white">{stats.total_visits || 0}</div>
            <div className="text-xs text-neutral-400 mt-1">Visitas</div>
          </div>
          <div className="bg-neutral-900/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-white">${stats.spent_last_30_days || 0}</div>
            <div className="text-xs text-neutral-400 mt-1">Último Mes</div>
          </div>
          <div className="bg-neutral-900/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-500">{member.points}</div>
            <div className="text-xs text-neutral-400 mt-1">Puntos</div>
          </div>
        </div>

        {/* Last Visit */}
        {stats.last_visit && (
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Clock className="w-4 h-4" />
            Última visita: {new Date(stats.last_visit).toLocaleDateString('es-ES')}
          </div>
        )}

        {/* Available Promotions */}
        {available_promotions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Promociones Disponibles</h4>
            <div className="space-y-2">
              {available_promotions.slice(0, 3).map((promo: any) => (
                <div key={promo.promotion_id} className="text-xs bg-green-900/20 border border-green-700/50 rounded-lg p-2">
                  <div className="font-medium text-green-400">{promo.title}</div>
                  <div className="text-neutral-400 mt-1">{promo.discount_value}{promo.discount_type === 'percentage' ? '%' : '$'} descuento</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
