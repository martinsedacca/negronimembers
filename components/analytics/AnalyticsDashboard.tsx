'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, Users, DollarSign, TrendingUp, Building2, Tag, Bell, Smartphone, Wallet, CheckCircle, XCircle, Send, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import DateRangePicker from '@/components/ui/DateRangePicker'

interface Location {
  id: string
  name: string
}

// Helper to format date for input
const formatDateForInput = (date: Date) => date.toISOString().split('T')[0]

export default function AnalyticsDashboard() {
  // Initialize with this month's range
  const now = new Date()
  const defaultStart = formatDateForInput(new Date(now.getFullYear(), now.getMonth(), 1))
  const defaultEnd = formatDateForInput(now)
  
  // Draft filters (what user is editing)
  const [startDate, setStartDate] = useState<string>(defaultStart)
  const [endDate, setEndDate] = useState<string>(defaultEnd)
  const [locationFilter, setLocationFilter] = useState<string[]>([])
  const [roleFilter, setRoleFilter] = useState<string>('all')
  
  // Applied filters (what is actually used for fetching)
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: defaultStart,
    endDate: defaultEnd,
    locations: [] as string[],
    role: 'all'
  })
  
  const [locations, setLocations] = useState<Location[]>([])
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const supabase = createClient()

  // Check if filters have changed
  const filtersChanged = startDate !== appliedFilters.startDate || 
    endDate !== appliedFilters.endDate || 
    JSON.stringify(locationFilter.sort()) !== JSON.stringify(appliedFilters.locations.sort()) || 
    roleFilter !== appliedFilters.role

  // Apply filters and fetch data
  const applyFilters = () => {
    setAppliedFilters({
      startDate,
      endDate,
      locations: locationFilter,
      role: roleFilter
    })
  }

  // Clear all filters
  const clearFilters = () => {
    const now = new Date()
    const monthStart = formatDateForInput(new Date(now.getFullYear(), now.getMonth(), 1))
    const today = formatDateForInput(now)
    
    setStartDate(monthStart)
    setEndDate(today)
    setLocationFilter([])
    setRoleFilter('all')
    setAppliedFilters({
      startDate: monthStart,
      endDate: today,
      locations: [],
      role: 'all'
    })
  }

  // Check if any filter is active
  const hasActiveFilters = locationFilter.length > 0 || roleFilter !== 'all'

  // Quick date range setters (also apply immediately)
  const setQuickRange = (range: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all') => {
    const today = new Date()
    let start: Date
    
    switch (range) {
      case 'today':
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        break
      case 'week':
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3)
        start = new Date(today.getFullYear(), quarter * 3, 1)
        break
      case 'year':
        start = new Date(today.getFullYear(), 0, 1)
        break
      case 'all':
        start = new Date(2020, 0, 1)
        break
    }
    
    const newStart = formatDateForInput(start)
    const newEnd = formatDateForInput(today)
    setStartDate(newStart)
    setEndDate(newEnd)
    // Apply immediately for quick ranges
    setAppliedFilters(prev => ({ ...prev, startDate: newStart, endDate: newEnd }))
  }

  // Load locations and roles on mount
  useEffect(() => {
    const loadFiltersData = async () => {
      const [locationsRes, rolesRes] = await Promise.all([
        supabase.from('branches').select('id, name').order('name'),
        supabase.from('staff_members').select('role').not('role', 'is', null)
      ])
      setLocations(locationsRes.data || [])
      const uniqueRoles = [...new Set((rolesRes.data || []).map((r: any) => r.role))]
      setRoles(uniqueRoles)
    }
    loadFiltersData()
  }, [])

  const fetchData = async () => {
    if (!appliedFilters.startDate || !appliedFilters.endDate) return
    
    setLoading(true)
    const dateRange = {
      start: new Date(appliedFilters.startDate).toISOString(),
      end: new Date(appliedFilters.endDate + 'T23:59:59').toISOString()
    }

    // Fetch all data
    const [
      { data: members },
      { data: cardUsage },
      { data: branches },
      { data: promotions },
      { data: codes },
      { data: pushNotifications },
      { data: pushSubscriptions },
      { data: allPushNotifications },
      { data: staffMembers },
      { data: allCardUsage },
    ] = await Promise.all([
      supabase.from('members').select('id, membership_type, membership_type_id, points, status, has_wallet_push, created_at'),
      supabase.from('card_usage').select('amount_spent, created_at, branch_id'),
      supabase.from('branches').select('id, name'),
      supabase.from('promotions').select('id, is_active'),
      supabase.from('codes').select('id, is_active, is_used'),
      supabase.from('push_notifications').select('id, title, total_sent, total_failed, total_members, total_devices, created_at, sent_by').order('created_at', { ascending: false }).limit(10),
      supabase.from('push_subscriptions').select('id, endpoint, is_active, created_at').eq('is_active', true),
      supabase.from('push_notifications').select('total_sent, total_failed, created_at'),
      supabase.from('staff_members').select('id, first_name, last_name, role, current_branch_id'),
      supabase.from('card_usage').select('id, staff_id, amount_spent, points_earned, created_at, branch_id'),
    ])

    // Filter by date range and location
    const filteredMembers = members?.filter((m: any) => {
      const date = new Date(m.created_at)
      return date >= new Date(dateRange.start) && date <= new Date(dateRange.end)
    }) || []
    
    const filteredUsage = cardUsage?.filter((t: any) => {
      const date = new Date(t.created_at)
      const inDateRange = date >= new Date(dateRange.start) && date <= new Date(dateRange.end)
      const inLocation = appliedFilters.locations.length === 0 || appliedFilters.locations.includes(t.branch_id)
      return inDateRange && inLocation
    }) || []
    
    const filteredNotifications = allPushNotifications?.filter((n: any) => {
      const date = new Date(n.created_at)
      return date >= new Date(dateRange.start) && date <= new Date(dateRange.end)
    }) || []

    // Calculate stats
    const totalMembers = members?.length || 0
    const newMembers = filteredMembers.length
    const activeMembers = members?.filter((m: any) => m.status === 'active').length || 0
    const goldMembers = members?.filter((m: any) => m.membership_type === 'Gold').length || 0
    const memberMembers = members?.filter((m: any) => m.membership_type === 'Member').length || 0

    const totalRevenue = filteredUsage.reduce((sum: number, t: any) => sum + (parseFloat(t.amount_spent) || 0), 0)
    const avgTransaction = filteredUsage.length ? totalRevenue / filteredUsage.length : 0

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

    // Staff statistics with filters
    const filteredStaffUsage = (allCardUsage || []).filter((u: any) => {
      const date = new Date(u.created_at)
      const inDateRange = date >= new Date(dateRange.start) && date <= new Date(dateRange.end)
      const inBranch = appliedFilters.locations.length === 0 || appliedFilters.locations.includes(u.branch_id)
      return inDateRange && inBranch
    })
    
    // Filter staff by role if needed
    const filteredStaff = (staffMembers || []).filter((staff: any) => {
      if (appliedFilters.role === 'all') return true
      return staff.role === appliedFilters.role
    })
    
    const staffStats = filteredStaff.map((staff: any) => {
      const staffUsage = filteredStaffUsage.filter((u: any) => u.staff_id === staff.id)
      const totalTransactions = staffUsage.length
      const totalRevenue = staffUsage.reduce((sum: number, u: any) => sum + (parseFloat(u.amount_spent) || 0), 0)
      const purchases = staffUsage.filter((u: any) => parseFloat(u.amount_spent) > 0).length
      const visits = staffUsage.filter((u: any) => parseFloat(u.amount_spent) === 0).length
      const avgTransaction = purchases > 0 ? totalRevenue / purchases : 0
      
      return {
        id: staff.id,
        name: `${staff.first_name} ${staff.last_name}`,
        role: staff.role,
        totalTransactions,
        totalRevenue,
        purchases,
        visits,
        avgTransaction,
      }
    }).sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)

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
      staffStats,
    })
    setLoading(false)
  }

  useEffect(() => {
    if (appliedFilters.startDate && appliedFilters.endDate) {
      fetchData()
    }
  }, [appliedFilters])

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

  const quickRanges = [
    { label: 'Today', key: 'today' as const },
    { label: '7 Days', key: 'week' as const },
    { label: 'Month', key: 'month' as const },
    { label: 'Quarter', key: 'quarter' as const },
    { label: 'Year', key: 'year' as const },
    { label: 'All', key: 'all' as const },
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

      {/* Filters Bar */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 space-y-4">
        {/* Date Range Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Range Buttons */}
          {quickRanges.map((range) => (
            <button
              key={range.key}
              onClick={() => setQuickRange(range.key)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white"
            >
              {range.label}
            </button>
          ))}
          
          {/* Date Range Picker */}
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => {
              setStartDate(start)
              setEndDate(end)
            }}
          />
        </div>

        {/* Other Filters + Apply Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-neutral-700">
          <div className="flex flex-wrap gap-4">
            {/* Location Filter - Multi-select */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <div className="flex flex-wrap gap-2">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setLocationFilter(prev => 
                        prev.includes(loc.id) 
                          ? prev.filter(id => id !== loc.id)
                          : [...prev, loc.id]
                      )
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                      locationFilter.includes(loc.id)
                        ? 'bg-orange-500 text-white'
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                    }`}
                  >
                    {loc.name}
                  </button>
                ))}
                {locationFilter.length > 0 && (
                  <button
                    onClick={() => setLocationFilter([])}
                    className="px-2 py-1.5 text-xs text-neutral-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Staff Role Filter */}
            {roles.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-neutral-700 border border-neutral-600 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent capitalize"
                >
                  <option value="all">All Roles</option>
                  {roles.map((role) => (
                    <option key={role} value={role} className="capitalize">{role}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium rounded-lg hover:bg-neutral-700 transition"
              >
                Clear Filters
              </button>
            )}
            {filtersChanged && (
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition"
              >
                Apply Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Period Stats */}
      <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">
            {appliedFilters.startDate && appliedFilters.endDate && `${new Date(appliedFilters.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(appliedFilters.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            {appliedFilters.locations.length > 0 && ` • ${appliedFilters.locations.map(id => locations.find(l => l.id === id)?.name).join(', ')}`}
            {appliedFilters.role !== 'all' && ` • ${appliedFilters.role}`}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold text-white">+{data.newMembers}</p>
            <p className="text-xs text-neutral-400">New Members</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">${data.totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-neutral-400">Revenue</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{data.notificationCampaigns}</p>
            <p className="text-xs text-neutral-400">Push Campaigns</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">{data.totalNotificationsSent}</p>
            <p className="text-xs text-neutral-400">Notifications Sent</p>
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

      {/* Staff Performance */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Staff Performance
        </h2>
        {data.staffStats && data.staffStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 uppercase">Staff Member</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 uppercase">Role</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-neutral-400 uppercase">Transactions</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-neutral-400 uppercase">Purchases</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-neutral-400 uppercase">Visits</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-neutral-400 uppercase">Revenue</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-neutral-400 uppercase">Avg Transaction</th>
                </tr>
              </thead>
              <tbody>
                {data.staffStats.map((staff: any, index: number) => (
                  <tr 
                    key={staff.id} 
                    className={`border-b border-neutral-700/50 hover:bg-neutral-700/30 transition ${index === 0 ? 'bg-green-500/10' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <span className="text-yellow-400">🏆</span>}
                        <span className="text-white font-medium">{staff.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-400 text-sm capitalize">{staff.role}</td>
                    <td className="py-3 px-4 text-center text-white">{staff.totalTransactions}</td>
                    <td className="py-3 px-4 text-center text-green-400">{staff.purchases}</td>
                    <td className="py-3 px-4 text-center text-blue-400">{staff.visits}</td>
                    <td className="py-3 px-4 text-right text-green-400 font-semibold">${staff.totalRevenue.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-neutral-300">${staff.avgTransaction.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-neutral-400 text-center py-8">No staff activity in this period</p>
        )}
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
