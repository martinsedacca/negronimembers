'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Branch {
  id: string
  name: string
  address?: string
  city?: string
}

interface Staff {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  role: 'manager' | 'server'
}

interface StaffSession {
  staff: Staff
  current_branch: Branch | null
  assigned_branches: Branch[]
  session: {
    id: string
    started_at: string
  }
}

export function useStaffSession() {
  const router = useRouter()
  const [session, setSession] = useState<StaffSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getToken = () => localStorage.getItem('staff_session_token')

  const fetchSession = useCallback(async () => {
    const token = getToken()
    
    if (!token) {
      router.replace('/scanner/login')
      return
    }

    try {
      const response = await fetch('/api/staff/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        localStorage.removeItem('staff_session_token')
        router.replace('/scanner/login')
        return
      }

      const data = await response.json()
      setSession(data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load session')
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const logout = useCallback(async () => {
    const token = getToken()
    
    if (token) {
      try {
        await fetch('/api/staff/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      } catch (err) {
        // Ignore logout errors
      }
    }

    localStorage.removeItem('staff_session_token')
    router.replace('/scanner/login')
  }, [router])

  const switchBranch = useCallback(async (branchId: string) => {
    const token = getToken()
    
    if (!token) return false

    try {
      const response = await fetch('/api/staff/switch-branch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ branch_id: branchId }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update session locally without re-fetching
        setSession(prev => prev ? {
          ...prev,
          current_branch: data.current_branch,
        } : null)
        return true
      }
      return false
    } catch (err) {
      return false
    }
  }, [])

  const getAuthHeaders = useCallback(() => {
    const token = getToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  }, [])

  return {
    session,
    loading,
    error,
    logout,
    switchBranch,
    getAuthHeaders,
    isManager: session?.staff?.role === 'manager',
    currentBranch: session?.current_branch,
  }
}
