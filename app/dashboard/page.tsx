import { createClient } from '@/lib/supabase/server'
import { Users, CreditCard, Tag, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import GlowCard from '@/components/ui/GlowCard'

// Revalidar cada 30 segundos (dashboard más frecuente)
export const revalidate = 30

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch statistics
  const [
    { count: totalMembers },
    { count: activeMembers },
    { count: totalPromotions },
    { count: activePromotions },
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('promotions').select('*', { count: 'exact', head: true }),
    supabase.from('promotions').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  // Fetch recent members
  const { data: recentMembers } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent card usage
  const { data: recentUsage } = await supabase
    .from('card_usage')
    .select('*, members(full_name, member_number)')
    .order('usage_date', { ascending: false })
    .limit(5)

  const stats = [
    {
      name: 'Total Members',
      value: totalMembers || 0,
      icon: Users,
      color: 'bg-brand-500',
      href: '/dashboard/members',
    },
    {
      name: 'Active Members',
      value: activeMembers || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      href: '/dashboard/members',
    },
    {
      name: 'Active Promotions',
      value: activePromotions || 0,
      icon: Tag,
      color: 'bg-brand-500',
      href: '/dashboard/promotions',
    },
    {
      name: 'Total Promotions',
      value: totalPromotions || 0,
      icon: CreditCard,
      color: 'bg-orange-500',
      href: '/dashboard/promotions',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-neutral-400">
          Resumen general del sistema de membresías
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <GlowCard key={stat.name} glowColor="#E85A23" glowSize={250}>
            <Link
              href={stat.href}
              className="block bg-neutral-800/90 overflow-hidden rounded-xl hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-neutral-400 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-3xl font-semibold text-white">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
            </GlowCard>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Members */}
        <div className="bg-neutral-800 border border-neutral-700 shadow rounded-lg">
          <div className="px-6 py-5 border-b border-neutral-700">
            <h3 className="text-lg font-medium text-white">Recent Members</h3>
          </div>
          <div className="divide-y divide-neutral-700">
            {recentMembers && recentMembers.length > 0 ? (
              recentMembers.map((member) => (
                <div key={member.id} className="px-6 py-4 hover:bg-neutral-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member.full_name}
                      </p>
                      <p className="text-sm text-neutral-400">{member.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        #{member.member_number}
                      </p>
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
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-neutral-400">
                No hay miembros registrados aún
              </div>
            )}
          </div>
          <div className="px-6 py-4 bg-neutral-900/50">
            <Link
              href="/dashboard/members"
              className="text-sm font-medium text-brand-400 hover:text-brand-400"
            >
              Ver todos los miembros →
            </Link>
          </div>
        </div>

        {/* Recent Card Usage */}
        <div className="bg-neutral-800 border border-neutral-700 shadow rounded-lg">
          <div className="px-6 py-5 border-b border-neutral-700">
            <h3 className="text-lg font-medium text-white">Recent Card Usage</h3>
          </div>
          <div className="divide-y divide-neutral-700">
            {recentUsage && recentUsage.length > 0 ? (
              recentUsage.map((usage) => (
                <div key={usage.id} className="px-6 py-4 hover:bg-neutral-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {usage.members?.full_name}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {usage.location || 'Sin ubicación'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        +{usage.points_earned} pts
                      </p>
                      <p className="text-xs text-neutral-400">
                        {new Date(usage.usage_date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-neutral-400">
                No hay uso de tarjetas registrado aún
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
