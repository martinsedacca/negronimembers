import { createClient } from '@/lib/supabase/server'
import { BarChart3, Users, DollarSign, TrendingUp, Building2, Tag, Ticket } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Overall stats
  const { data: members } = await supabase.from('members').select('id, membership_type, points, status')
  const { data: transactions } = await supabase.from('transactions').select('amount, created_at')
  const { data: branches } = await supabase.from('branches').select('id, name')
  const { data: promotions } = await supabase.from('promotions').select('id, is_active')
  const { data: codes } = await supabase.from('codes').select('id, is_active')

  // Calculate stats
  const totalMembers = members?.length || 0
  const activeMembers = members?.filter((m: any) => m.status === 'active').length || 0
  const goldMembers = members?.filter((m: any) => m.membership_type === 'Gold').length || 0
  const memberMembers = members?.filter((m: any) => m.membership_type === 'Member').length || 0
  
  const totalRevenue = transactions?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0
  const avgTransaction = transactions?.length ? totalRevenue / transactions.length : 0
  
  const totalBranches = branches?.length || 0
  const activePromotions = promotions?.filter((p: any) => p.is_active).length || 0
  const activeCodes = codes?.filter((c: any) => c.is_active).length || 0

  const overallStats = [
    {
      name: 'Total Members',
      value: totalMembers,
      subtitle: `${activeMembers} active`,
      icon: Users,
      color: 'bg-blue-500',
      href: '/dashboard/members',
    },
    {
      name: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      subtitle: `Avg: $${avgTransaction.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      href: null,
    },
    {
      name: 'Branches',
      value: totalBranches,
      subtitle: 'View analytics per branch',
      icon: Building2,
      color: 'bg-orange-500',
      href: '/dashboard/branches',
    },
    {
      name: 'Active Promotions',
      value: activePromotions,
      subtitle: `${promotions?.length || 0} total`,
      icon: Tag,
      color: 'bg-purple-500',
      href: '/dashboard/promotions',
    },
  ]

  const memberStats = [
    {
      name: 'Member Tier',
      value: memberMembers,
      percentage: totalMembers ? Math.round((memberMembers / totalMembers) * 100) : 0,
      color: 'bg-orange-500',
    },
    {
      name: 'Gold Tier',
      value: goldMembers,
      percentage: totalMembers ? Math.round((goldMembers / totalMembers) * 100) : 0,
      color: 'bg-yellow-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-orange-500" />
          Analytics Overview
        </h1>
        <p className="mt-2 text-neutral-400">
          Comprehensive view of your membership program performance
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {overallStats.map((stat) => (
          <div
            key={stat.name}
            className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden hover:border-neutral-600 transition"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-3xl font-semibold text-white">
                      {stat.value}
                    </dd>
                    <dd className="text-xs text-neutral-500 mt-1">
                      {stat.subtitle}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            {stat.href && (
              <Link
                href={stat.href}
                className="block bg-neutral-900 px-5 py-3 text-sm text-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
              >
                View Details →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Member Distribution */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-400" />
          Member Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memberStats.map((stat) => (
            <div key={stat.name} className="bg-neutral-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-300">{stat.name}</span>
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div
                  className={`${stat.color} h-2 rounded-full transition-all`}
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2">{stat.percentage}% of total members</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/dashboard/branches"
            className="flex items-center gap-3 p-4 bg-neutral-900 rounded-lg hover:bg-neutral-700 transition"
          >
            <Building2 className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-white">Branch Analytics</p>
              <p className="text-xs text-neutral-400">View per-location stats</p>
            </div>
          </Link>
          <Link
            href="/dashboard/members"
            className="flex items-center gap-3 p-4 bg-neutral-900 rounded-lg hover:bg-neutral-700 transition"
          >
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-white">Member Details</p>
              <p className="text-xs text-neutral-400">View all members</p>
            </div>
          </Link>
          <Link
            href="/dashboard/segments"
            className="flex items-center gap-3 p-4 bg-neutral-900 rounded-lg hover:bg-neutral-700 transition"
          >
            <TrendingUp className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-white">Member Segments</p>
              <p className="text-xs text-neutral-400">Filter and analyze</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
