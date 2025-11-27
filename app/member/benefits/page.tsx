'use client'

import { useMemo, useEffect, useState } from 'react'
import { useRequireAuth, useMember } from '../context/MemberContext'
import BenefitsClient from './BenefitsClient'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function BenefitsPage() {
  const { member, loading } = useRequireAuth()
  const { promotions, memberCodes, membershipTypes, transactions } = useMember()
  const [branches, setBranches] = useState<{id: string, name: string}[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchBranches() {
      const { data } = await supabase
        .from('branches')
        .select('id, name')
        .eq('is_active', true)
      if (data) setBranches(data)
    }
    fetchBranches()
  }, [])

  // Filter promotions - only check date validity, BenefitsClient will filter by level
  const activeBenefits = useMemo(() => {
    const now = new Date().toISOString()
    
    return promotions.filter((promo: any) => {
      // Check date validity: far future date (2099) means no expiration
      const isDateValid = !promo.end_date || promo.end_date >= now
      return isDateValid && promo.is_active
    })
  }, [promotions])

  if (loading || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <BenefitsClient 
      member={member}
      benefits={activeBenefits}
      hasCodes={memberCodes.length > 0}
      membershipTypes={membershipTypes}
      transactionCount={transactions.length}
      branches={branches}
    />
  )
}
