'use client'

import { motion } from 'framer-motion'
import { Clock, MapPin, DollarSign, Award, Calendar, User } from 'lucide-react'
import { useState } from 'react'

interface Transaction {
  id: string
  amount_spent: number | null
  points_earned: number | null
  created_at: string
  branch_location: string | null
  branches?: { name: string } | null
  staff_members?: { first_name: string; last_name: string } | null
}

interface HistoryClientProps {
  transactions: Transaction[]
}

export default function HistoryClient({ transactions }: HistoryClientProps) {
  const [filter, setFilter] = useState<'all' | 'this-month' | 'last-month'>('all')

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true
    
    const txDate = new Date(tx.created_at)
    const now = new Date()
    
    if (filter === 'this-month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
    }
    
    if (filter === 'last-month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear()
    }
    
    return true
  })

  const totalSpent = filteredTransactions.reduce((sum, tx) => sum + (tx.amount_spent || 0), 0)
  const totalPoints = filteredTransactions.reduce((sum, tx) => sum + (tx.points_earned || 0), 0)

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white mb-2">Transaction History</h1>
          <p className="text-neutral-400">Track your visits and spending</p>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="px-6 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setFilter('this-month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'this-month'
                ? 'bg-orange-500 text-white'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setFilter('last-month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'last-month'
                ? 'bg-orange-500 text-white'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Last Month
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 rounded-xl p-4"
          >
            <DollarSign className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-white">${totalSpent.toFixed(2)}</p>
            <p className="text-xs text-neutral-400">Total Spent</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border border-orange-500/30 rounded-xl p-4"
          >
            <Award className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-2xl font-bold text-white">{totalPoints}</p>
            <p className="text-xs text-neutral-400">Points Earned</p>
          </motion.div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="px-6">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-neutral-800 border border-neutral-700 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">
                      ${tx.amount_spent?.toFixed(2) || '0.00'}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(tx.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full">
                      <span className="text-xs font-semibold text-orange-400">
                        +{tx.points_earned || 0} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location and Staff Info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 pt-2 border-t border-neutral-700">
                  {(tx.branches?.name || tx.branch_location) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-500/70" />
                      <span>{tx.branches?.name || tx.branch_location}</span>
                    </div>
                  )}
                  {tx.staff_members && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-blue-500/70" />
                      <span>Served by {tx.staff_members.first_name}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-neutral-800 border border-neutral-700 rounded-xl"
          >
            <Calendar className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No transactions</h3>
            <p className="text-neutral-400 text-sm">
              {filter === 'all' 
                ? 'Start visiting to see your history here'
                : 'No transactions in this period'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
