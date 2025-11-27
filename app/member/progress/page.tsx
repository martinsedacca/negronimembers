'use client'

import { useRequireAuth, useMember } from '../context/MemberContext'
import ProgressClient from './ProgressClient'
import { Loader2 } from 'lucide-react'

export default function ProgressPage() {
  const { member, loading } = useRequireAuth()
  const { transactions, memberCodes, membershipTypes } = useMember()

  if (loading || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <ProgressClient 
      member={member}
      transactionCount={transactions.length}
      memberCodes={memberCodes.map(code => ({ codes: { code, description: '' } }))}
      membershipTypes={membershipTypes}
    />
  )
}
