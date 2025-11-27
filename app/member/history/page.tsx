'use client'

import { useRequireAuth, useMember } from '../context/MemberContext'
import HistoryClient from './HistoryClient'
import { Loader2 } from 'lucide-react'

export default function HistoryPage() {
  const { member, loading } = useRequireAuth()
  const { transactions } = useMember()

  if (loading || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return <HistoryClient transactions={transactions} />
}
