'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MemberPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/member/auth')
        return
      }

      // Check if member exists and onboarding status
      const { data: member } = await supabase
        .from('members')
        .select('id, onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!member) {
        router.push('/member/auth')
        return
      }

      if (member.onboarding_completed) {
        router.push('/member/pass')
      } else {
        router.push('/member/onboarding')
      }
    }

    checkSession()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-neutral-300 border-t-orange-500 rounded-full" />
    </div>
  )
}
