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

  // Filter promotions based on applicability and date validity
  const applicableBenefits = useMemo(() => {
    if (!member) return []
    
    const now = new Date().toISOString()
    
    return promotions.filter((promo: any) => {
      // Check date validity: end_date null means no expiration
      const isDateValid = !promo.end_date || promo.end_date >= now
      if (!isDateValid) return false
      
      // Check applicability
      const applicable_to = promo.applicable_to || ['all']
      
      if (applicable_to.includes('all')) return true
      if (applicable_to.includes(`tier:${member.membership_type}`)) return true
      
      for (const code of memberCodes) {
        if (applicable_to.includes(`code:${code}`)) return true
      }
      
      return false
    })
  }, [promotions, member, memberCodes])

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
      benefits={applicableBenefits}
      hasCodes={memberCodes.length > 0}
      membershipTypes={membershipTypes}
      transactionCount={transactions.length}
      branches={branches}
    />
  )
}
