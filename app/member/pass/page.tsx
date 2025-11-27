'use client'

import { useRequireAuth } from '../context/MemberContext'
import PassClient from './PassClient'
import { Loader2 } from 'lucide-react'

export default function PassPage() {
  const { member, loading } = useRequireAuth()

  if (loading || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return <PassClient member={member} />
}
