'use client'

import { useEffect, useState } from 'react'
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react'

export default function DailyStats() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/scanner/stats')
      if (!response.ok) {
        console.error('API error:', response.status)
        // Set default stats on error
        setStats({
          total_sales: 0,
          total_transactions: 0,
          unique_customers: 0,
          average_purchase: 0
        })
        return
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set default stats on error
      setStats({
        total_sales: 0,
        total_transactions: 0,
        unique_customers: 0,
        average_purchase: 0
      })
    }
  }

  if (!stats) return null

  const statsData = [
    {
      label: 'Ventas del Día',
      value: `$${(stats.total_sales || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'Transacciones',
      value: stats.total_transactions || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      label: 'Clientes Únicos',
      value: stats.unique_customers || 0,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      label: 'Ticket Promedio',
      value: `$${(stats.average_purchase || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => (
        <div
          key={stat.label}
          className="bg-neutral-800 border border-neutral-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
