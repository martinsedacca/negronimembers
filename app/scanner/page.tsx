'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function ScannerPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if there's a session token
    const token = localStorage.getItem('staff_session_token')
    
    if (!token) {
      router.replace('/scanner/login')
      return
    }

    // Verify token is still valid
    fetch('/api/staff/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => {
        if (res.ok) {
          router.replace('/scanner/main')
        } else {
          // Invalid token, clear and go to login
          localStorage.removeItem('staff_session_token')
          router.replace('/scanner/login')
        }
      })
      .catch(() => {
        router.replace('/scanner/login')
      })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
    </div>
  )
}
