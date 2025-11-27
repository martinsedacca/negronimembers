'use client'

import { TrendingUp, Users, Clock, Award, DollarSign, Activity } from 'lucide-react'
import { useState } from 'react'

interface Analytics {
  branch: any
  period: {
    days: number
    start_date: string
    end_date: string
  }
  overview: {
    total_transactions: number
    total_revenue: number
    average_transaction: number
    active_members: number
  }
  members: {
    by_tier: { [key: string]: number }
    top_spenders: Array<{
      member_id: string
      full_name: string
      email: string
      membership_type: string
      total_spent: number
      visit_count: number
    }>
  }
  trends: {
    daily_revenue: Array<{ date: string; revenue: number }>
    daily_visits: Array<{ date: string; visits: number }>
    peak_hours: Array<{ hour: number; visits: number }>
  }
  recent_transactions: Array<{
    id: string
    amount: number
    points_earned: number
    created_at: string
    member: {
      full_name: string
      membership_type: string
    }
  }>
}

interface BranchAnalyticsProps {
  analytics: Analytics
}

export default function BranchAnalytics({ analytics }: BranchAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'trends' | 'members' | 'transactions'>('trends')

  const { members, trends, recent_transactions } = analytics

  // Calculate max values for chart scaling
  const maxRevenue = Math.max(...trends.daily_revenue.map(d => d.revenue), 1)
  const maxVisits = Math.max(...trends.daily_visits.map(d => d.visits), 1)
  const maxHourlyVisits = Math.max(...trends.peak_hours.map(h => h.visits), 1)

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'trends'
                ? 'bg-orange-500 text-white'
                : 'text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Trends
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'members'
                ? 'bg-orange-500 text-white'
                : 'text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Members
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'transactions'
                ? 'bg-orange-500 text-white'
                : 'text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Recent Activity
          </button>
        </div>
      </div>

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Daily Revenue Chart */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Daily Revenue
            </h3>
            <div className="space-y-2">
              {trends.daily_revenue.slice(-14).map((day, idx) => {
                const height = (day.revenue / maxRevenue) * 100
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400 w-20">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 bg-neutral-900 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all"
                        style={{ width: `${height}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-end pr-3 text-xs font-medium text-white">
                        ${day.revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Daily Visits Chart */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Daily Visits
            </h3>
            <div className="space-y-2">
              {trends.daily_visits.slice(-14).map((day, idx) => {
                const height = (day.visits / maxVisits) * 100
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400 w-20">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 bg-neutral-900 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                        style={{ width: `${height}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-end pr-3 text-xs font-medium text-white">
                        {day.visits} visits
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Peak Hours
            </h3>
            <div className="grid grid-cols-12 gap-2">
              {Array.from({ length: 24 }, (_, hour) => {
                const data = trends.peak_hours.find(h => h.hour === hour)
                const visits = data?.visits || 0
                const height = maxHourlyVisits > 0 ? (visits / maxHourlyVisits) * 100 : 0
                const isPeak = visits > 0 && visits === Math.max(...trends.peak_hours.map(h => h.visits))

                return (
                  <div key={hour} className="flex flex-col items-center gap-1">
                    <div className="w-full h-24 bg-neutral-900 rounded-lg relative overflow-hidden">
                      <div
                        className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all ${
                          isPeak
                            ? 'bg-gradient-to-t from-orange-500 to-orange-600'
                            : 'bg-gradient-to-t from-purple-500 to-purple-600'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      {visits > 0 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                          {visits}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {hour.toString().padStart(2, '0')}h
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Members by Tier */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-400" />
              Members by Tier
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(members.by_tier).map(([tier, count]) => (
                <div
                  key={tier}
                  className={`p-4 rounded-xl border-2 ${
                    tier === 'Gold'
                      ? 'bg-yellow-900/20 border-yellow-500/50'
                      : 'bg-orange-900/20 border-orange-500/50'
                  }`}
                >
                  <div className="text-2xl font-bold text-white mb-1">{count}</div>
                  <div className="text-sm text-neutral-300">{tier} Members</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Spenders */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Top Spenders
            </h3>
            <div className="space-y-3">
              {members.top_spenders.slice(0, 10).map((member, idx) => (
                <div
                  key={member.member_id}
                  className="flex items-center gap-4 p-3 bg-neutral-900 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{member.full_name}</div>
                    <div className="text-xs text-neutral-400">{member.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">${member.total_spent.toFixed(2)}</div>
                    <div className="text-xs text-neutral-400">{member.visit_count} visits</div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      member.membership_type === 'Gold'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-orange-500/20 text-orange-300'
                    }`}
                  >
                    {member.membership_type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Recent Transactions
          </h3>
          <div className="space-y-2">
            {recent_transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-neutral-900 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="text-white font-medium">{transaction.member.full_name}</div>
                    <div className="text-xs text-neutral-400">
                      {new Date(transaction.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">${transaction.amount.toFixed(2)}</div>
                  <div className="text-xs text-brand-400">+{transaction.points_earned} pts</div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    transaction.member.membership_type === 'Gold'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-orange-500/20 text-orange-300'
                  }`}
                >
                  {transaction.member.membership_type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
