'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, Users, DollarSign, TrendingUp, Building2, Tag, Bell, Smartphone, Wallet, CheckCircle, XCircle, Send, Calendar } from 'lucide-react'
import Link from 'next/link'

type DateFilter = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'

export default function AnalyticsDashboard() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('month')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const supabase = createClient()

  const getDateRange = (filter: DateFilter) => {
    const now = new Date()
    switch (filter) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        return new Date(now.getFullYear(), quarter * 3, 1).toISOString()
      case 'year':
        return new Date(now.getFullYear(), 0, 1).toISOString()
      case 'all':
        return new Date(2020, 0, 1).toISOString()
    }
  }

  const fetchData = async () => {
    setLoading(true)
    const startDate = getDateRange(dateFilter)

    // Fetch all data
    const [
      { data: members },
      { data: transactions },
      { data: branches },
      { data: promotions },
      { data: codes },
      { data: pushNotifications },
      { data: pushSubscriptions },
      { data: allPushNotifications },
    ] = await Promise.all([
      supabase.from('members').select('id, membership_type, points, status, has_wallet_push, created_at'),
      supabase.from('transactions').select('amount, created_at'),
      supabase.from('branches').select('id, name'),
      supabase.from('promotions').select('id, is_active'),
      supabase.from('codes').select('id, is_active, is_used'),
      supabase.from('push_notifications').select('id, title, total_sent, total_failed, total_members, total_devices, created_at, sent_by').order('created_at', { ascending: false }).limit(10),
      supabase.from('push_subscriptions').select('id, endpoint, is_active, created_at').eq('is_active', true),
      supabase.from('push_notifications').select('total_sent, total_failed, created_at'),
    ])

    // Filter by date range
    const filteredMembers = members?.filter((m: any) => new Date(m.created_at) >= new Date(startDate)) || []
    const filteredTransactions = transactions?.filter((t: any) => new Date(t.created_at) >= new Date(startDate)) || []
    const filteredNotifications = allPushNotifications?.filter((n: any) => new Date(n.created_at) >= new Date(startDate)) || []

    // Calculate stats
    const totalMembers = members?.length || 0
    const newMembers = filteredMembers.length
    const activeMembers = members?.filter((m: any) => m.status === 'active').length || 0
    const goldMembers = members?.filter((m: any) => m.membership_type === 'Gold').length || 0
    const memberMembers = members?.filter((m: any) => m.membership_type === 'Member').length || 0

    const totalRevenue = filteredTransactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
    const avgTransaction = filteredTransactions.length ? totalRevenue / filteredTransactions.length : 0

    const totalBranches = branches?.length || 0
    const activePromotions = promotions?.filter((p: any) => p.is_active).length || 0
    const activeCodes = codes?.filter((c: any) => c.is_active).length || 0
    const usedCodes = codes?.filter((c: any) => c.is_used).length || 0

    // Engagement
    const membersWithWallet = members?.filter((m: any) => m.has_wallet_push).length || 0
    const walletPercentage = totalMembers ? Math.round((membersWithWallet / totalMembers) * 100) : 0

    // Push stats
    const totalPushSubscriptions = pushSubscriptions?.length || 0
    const safariSubscriptions = pushSubscriptions?.filter((s: any) => s.endpoint?.includes('push.apple.com')).length || 0
    const chromeSubscriptions = pushSubscriptions?.filter((s: any) => s.endpoint?.includes('fcm.googleapis.com')).length || 0

    const totalNotificationsSent = filteredNotifications.reduce((sum: number, n: any) => sum + (n.total_sent || 0), 0)
    const totalNotificationsFailed = filteredNotifications.reduce((sum: number, n: any) => sum + (n.total_failed || 0), 0)
    const pushSuccessRate = (totalNotificationsSent + totalNotificationsFailed) > 0
      ? Math.round((totalNotificationsSent / (totalNotificationsSent + totalNotificationsFailed)) * 100)
      : 0

    setData({
      totalMembers,
      newMembers,
      activeMembers,
      goldMembers,
      memberMembers,
      totalRevenue,
      avgTransaction,
      totalBranches,
      activePromotions,
      activeCodes,
      usedCodes,
      membersWithWallet,
      walletPercentage,
      totalPushSubscriptions,
      safariSubscriptions,
      chromeSubscriptions,
      totalNotificationsSent,
      totalNotificationsFailed,
      pushSuccessRate,
      pushNotifications: pushNotifications || [],
      notificationCampaigns: filteredNotifications.length,
    })
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [dateFilter])

  const filterLabels: Record<DateFilter, string> = {
    today: 'Hoy',
    week: 'Esta Semana',
    month: 'Este Mes',
    quarter: 'Este Trimestre',
    year: 'Este Año',
    all: 'Todo el Tiempo',
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  const overallStats = [
    {
      name: 'Total Members',
      value: data.totalMembers,
      subtitle: `${data.activeMembers} active`,
      icon: Users,
      color: 'bg-blue-500',
      href: '/dashboard/members',
    },
    {
      name: 'Revenue (Period)',
      value: `$${data.totalRevenue.toFixed(2)}`,
      subtitle: `Avg: $${data.avgTransaction.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      href: null,
    },
    {
      name: 'Branches',
      value: data.totalBranches,
      subtitle: 'View analytics per branch',
      icon: Building2,
      color: 'bg-orange-500',
      href: '/dashboard/branches',
    },
    {
      name: 'Active Promotions',
      value: data.activePromotions,
      subtitle: 'Currently running',
      icon: Tag,
      color: 'bg-purple-500',
      href: '/dashboard/promotions',
    },
  ]

  const memberStats = [
    {
      name: 'Member Tier',
      value: data.memberMembers,
      percentage: data.totalMembers ? Math.round((data.memberMembers / data.totalMembers) * 100) : 0,
      color: 'bg-orange-500',
    },
    {
      name: 'Gold Tier',
      value: data.goldMembers,
      percentage: data.totalMembers ? Math.round((data.goldMembers / data.totalMembers) * 100) : 0,
      color: 'bg-yellow-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-orange-500" />
            Analytics Overview
          </h1>
          <p className="mt-2 text-neutral-400">
            Comprehensive view of your membership program performance
          </p>
        </div>
        
        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-lg p-1">
          {(Object.keys(filterLabels) as DateFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                dateFilter === filter
                  ? 'bg-orange-500 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
              }`}
            >
              {filterLabels[filter]}
            </button>
          ))}
        </div>
      </div>

      {/* Period Stats */}
      <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">Período: {filterLabels[dateFilter]}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold text-white">+{data.newMembers}</p>
            <p className="text-xs text-neutral-400">Nuevos Miembros</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">${data.totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-neutral-400">Revenue</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{data.notificationCampaigns}</p>
            <p className="text-xs text-neutral-400">Campañas Push</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">{data.totalNotificationsSent}</p>
            <p className="text-xs text-neutral-400">Notificaciones Enviadas</p>
          </div>
        </div>
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

      {/* Engagement & Push Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Metrics */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-400" />
            Engagement
          </h2>
          <div className="space-y-4">
            {/* Wallet Pass */}
            <div className="bg-neutral-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-neutral-300">Wallet Pass Installed</span>
                </div>
                <span className="text-2xl font-bold text-white">{data.membersWithWallet}</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${data.walletPercentage}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2">{data.walletPercentage}% of members</p>
            </div>

            {/* Push Subscriptions */}
            <div className="bg-neutral-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-neutral-300">Push Notifications Enabled</span>
                </div>
                <span className="text-2xl font-bold text-white">{data.totalPushSubscriptions}</span>
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-neutral-400">Safari: {data.safariSubscriptions}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-neutral-400">Chrome: {data.chromeSubscriptions}</span>
                </div>
              </div>
            </div>

            {/* Codes Usage */}
            <div className="bg-neutral-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-neutral-300">Codes Redeemed</span>
                </div>
                <span className="text-2xl font-bold text-white">{data.usedCodes}</span>
              </div>
              <p className="text-xs text-neutral-500">{data.activeCodes} active codes available</p>
            </div>
          </div>
        </div>

        {/* Push Notifications Stats */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-400" />
              Push Notifications
            </h2>
            <Link
              href="/dashboard/segments"
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              Send New →
            </Link>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-neutral-900 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{data.notificationCampaigns}</p>
              <p className="text-xs text-neutral-400">Campaigns</p>
            </div>
            <div className="bg-neutral-900 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{data.totalNotificationsSent}</p>
              <p className="text-xs text-neutral-400">Sent</p>
            </div>
            <div className="bg-neutral-900 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{data.pushSuccessRate}%</p>
              <p className="text-xs text-neutral-400">Success Rate</p>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-400">Recent Campaigns</p>
            {data.pushNotifications.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {data.pushNotifications.slice(0, 5).map((notification: any) => (
                  <div key={notification.id} className="bg-neutral-900 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[200px]">{notification.title}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(notification.created_at).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{notification.total_members || 0}</p>
                        <p className="text-xs text-neutral-500">members</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-400">{notification.total_sent || 0}</span>
                        {notification.total_failed > 0 && (
                          <>
                            <XCircle className="w-4 h-4 text-red-500 ml-1" />
                            <span className="text-xs text-red-400">{notification.total_failed}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 text-center py-4">No notifications sent yet</p>
            )}
          </div>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
          <Link
            href="/dashboard/segments"
            className="flex items-center gap-3 p-4 bg-neutral-900 rounded-lg hover:bg-neutral-700 transition"
          >
            <Bell className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-white">Send Notification</p>
              <p className="text-xs text-neutral-400">Push to members</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
