import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, TrendingUp, DollarSign, Users, Activity, Clock, Award } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BranchAnalytics from '@/components/analytics/BranchAnalytics'

export default async function BranchAnalyticsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ days?: string }>
}) {
  // Await params and searchParams (Next.js 15 requirement)
  const { id } = await params
  const { days: daysParam } = await searchParams
  
  const supabase = await createClient()
  const days = parseInt(daysParam || '30')

  // Fetch branch info
  const { data: branch, error } = await supabase
    .from('branches')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !branch) {
    notFound()
  }

  // Fetch analytics data via API
  const analyticsUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/branches/${id}/analytics?days=${days}`
  
  let analytics = null
  try {
    const response = await fetch(analyticsUrl, {
      cache: 'no-store',
      headers: {
        'Cookie': '', // Server-side fetch needs cookies if auth required
      }
    })
    if (response.ok) {
      analytics = await response.json()
    }
  } catch (err) {
    console.error('Error fetching analytics:', err)
  }

  const stats = analytics?.overview || {
    total_transactions: 0,
    total_revenue: 0,
    average_transaction: 0,
    active_members: 0
  }

  const statCards = [
    {
      name: 'Total Revenue',
      value: `$${stats.total_revenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Transactions',
      value: stats.total_transactions,
      icon: Activity,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Members',
      value: stats.active_members,
      icon: Users,
      color: 'bg-orange-500',
    },
    {
      name: 'Avg Transaction',
      value: `$${stats.average_transaction.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/branches"
          className="inline-flex items-center text-sm text-neutral-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Branches
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              {branch.name} Analytics
            </h1>
            <p className="mt-2 text-neutral-400">
              Performance metrics and insights for the last {days} days
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/branches/${id}/analytics?days=7`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                days === 7
                  ? 'bg-orange-500 text-white'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              7 Days
            </Link>
            <Link
              href={`/dashboard/branches/${id}/analytics?days=30`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                days === 30
                  ? 'bg-orange-500 text-white'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              30 Days
            </Link>
            <Link
              href={`/dashboard/branches/${id}/analytics?days=90`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                days === 90
                  ? 'bg-orange-500 text-white'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              90 Days
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden"
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
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Component */}
      {analytics && <BranchAnalytics analytics={analytics} />}

      {!analytics && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-12 text-center">
          <Activity className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No data available</h3>
          <p className="text-neutral-400">
            There are no transactions for this branch in the selected period.
          </p>
        </div>
      )}
    </div>
  )
}
