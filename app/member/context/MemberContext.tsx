'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Types
interface Member {
  id: string
  user_id: string
  email: string | null
  full_name: string | null
  phone: string | null
  membership_type: string
  status: string
  member_number: string
  joined_date: string
  expiry_date: string | null
  points: number
  onboarding_completed: boolean
  date_of_birth: string | null
  created_at: string
  updated_at: string
}

interface Transaction {
  id: string
  member_id: string
  usage_type: string
  location: string | null
  amount_spent: number | null
  points_earned: number | null
  created_at: string
  usage_date: string
  branch_location: string | null
}

interface Promotion {
  id: string
  name: string
  description: string
  discount_type: string
  discount_value: number
  applicable_to: string[]
  start_date: string
  end_date: string
  is_active: boolean
}

interface MembershipType {
  id: string
  name: string
  description: string
  points_required: number
  visits_required: number
  benefits: Record<string, any>
  is_active: boolean
}

interface MemberContextType {
  member: Member | null
  transactions: Transaction[]
  promotions: Promotion[]
  memberCodes: string[]
  membershipTypes: MembershipType[]
  loading: boolean
  syncing: boolean
  lastSync: Date | null
  error: string | null
  isAuthenticated: boolean
  refreshData: () => Promise<void>
  logout: () => Promise<void>
  updateMember: (data: Partial<Member>) => void
}

const MemberContext = createContext<MemberContextType | undefined>(undefined)

const STORAGE_KEY = 'negroni_member_data'
const SYNC_INTERVAL = 30000 // 30 seconds

// Helper to get data from localStorage
function getStoredData(): { member: Member | null; transactions: Transaction[]; promotions: Promotion[]; memberCodes: string[]; membershipTypes: MembershipType[]; lastSync: string | null } | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// Helper to store data in localStorage
function storeData(data: { member: Member | null; transactions: Transaction[]; promotions: Promotion[]; memberCodes: string[]; membershipTypes: MembershipType[]; lastSync: string }) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to store data:', e)
  }
}

// Helper to clear stored data
function clearStoredData() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear data:', e)
  }
}

export function MemberProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  
  const [member, setMember] = useState<Member | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [memberCodes, setMemberCodes] = useState<string[]>([])
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Load cached data immediately
  useEffect(() => {
    const cached = getStoredData()
    if (cached?.member) {
      setMember(cached.member)
      setTransactions(cached.transactions || [])
      setPromotions(cached.promotions || [])
      setMemberCodes(cached.memberCodes || [])
      setMembershipTypes(cached.membershipTypes || [])
      setLastSync(cached.lastSync ? new Date(cached.lastSync) : null)
      setIsAuthenticated(true)
      setLoading(false)
    }
  }, [])

  // Fetch all member data from Supabase
  const fetchAllData = useCallback(async (userId: string, memberId: string) => {
    const [memberRes, transactionsRes, promotionsRes, codesRes, membershipTypesRes] = await Promise.all([
      // Member data
      supabase
        .from('members')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
      
      // Card usage (transactions)
      supabase
        .from('card_usage')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(50),
      
      // Active promotions (end_date null = no expiration, or end_date >= now)
      supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString()),
      
      // Member codes
      supabase
        .from('member_codes')
        .select('codes(code)')
        .eq('member_id', memberId),
      
      // Membership types
      supabase
        .from('membership_types')
        .select('*')
        .eq('is_active', true)
    ])

    return {
      member: memberRes.data as Member | null,
      transactions: (transactionsRes.data || []) as Transaction[],
      promotions: (promotionsRes.data || []) as Promotion[],
      memberCodes: (codesRes.data || []).map((mc: any) => mc.codes?.code).filter(Boolean) as string[],
      membershipTypes: (membershipTypesRes.data || []) as MembershipType[]
    }
  }, [supabase])

  // Full sync with database
  const refreshData = useCallback(async () => {
    console.log('🔄 [refreshData] Starting sync...')
    setSyncing(true)
    setError(null)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      console.log('🔄 [refreshData] Auth check:', { 
        hasUser: !!user, 
        userId: user?.id,
        userEmail: user?.email,
        authError: authError?.message 
      })
      
      if (!user) {
        console.log('🔄 [refreshData] No user found, clearing auth state')
        setIsAuthenticated(false)
        setMember(null)
        clearStoredData()
        setLoading(false)
        setSyncing(false)
        return
      }

      // Get member ID first
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id, onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle()

      console.log('🔄 [refreshData] Member lookup:', { 
        hasMember: !!memberData, 
        memberId: memberData?.id,
        onboardingCompleted: memberData?.onboarding_completed,
        memberError: memberError?.message 
      })

      if (!memberData) {
        console.log('🔄 [refreshData] No member found for user, clearing auth state')
        setIsAuthenticated(false)
        setMember(null)
        clearStoredData()
        setLoading(false)
        setSyncing(false)
        return
      }

      // Fetch all data
      const allData = await fetchAllData(user.id, memberData.id)

      if (allData.member) {
        setMember(allData.member)
        setTransactions(allData.transactions)
        setPromotions(allData.promotions)
        setMemberCodes(allData.memberCodes)
        setMembershipTypes(allData.membershipTypes)
        setIsAuthenticated(true)
        setLastSync(new Date())

        // Store in localStorage
        storeData({
          member: allData.member,
          transactions: allData.transactions,
          promotions: allData.promotions,
          memberCodes: allData.memberCodes,
          membershipTypes: allData.membershipTypes,
          lastSync: new Date().toISOString()
        })
      }
    } catch (err: any) {
      console.error('Sync error:', err)
      setError(err.message || 'Failed to sync data')
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [supabase, fetchAllData])

  // Listen for auth state changes from Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 [MemberContext] Auth state changed:', event, !!session)
      
      if (event === 'SIGNED_IN' && session) {
        // User just signed in, refresh data
        refreshData()
      } else if (event === 'SIGNED_OUT') {
        // User signed out, clear state
        setIsAuthenticated(false)
        setMember(null)
        setTransactions([])
        setPromotions([])
        setMemberCodes([])
        setMembershipTypes([])
        clearStoredData()
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, refreshData])

  // Use refs to avoid re-running effects when these change
  const isAuthenticatedRef = useRef(isAuthenticated)
  const syncingRef = useRef(syncing)
  
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated
    syncingRef.current = syncing
  }, [isAuthenticated, syncing])

  // Initial load - only run once
  useEffect(() => {
    refreshData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Periodic sync - separate effect to avoid loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticatedRef.current && !syncingRef.current) {
        refreshData()
      }
    }, SYNC_INTERVAL)

    return () => clearInterval(interval)
  }, [refreshData])

  // Sync on visibility/online - separate effect
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isAuthenticatedRef.current && !syncingRef.current) {
        refreshData()
      }
    }
    
    const handleOnline = () => {
      if (isAuthenticatedRef.current && !syncingRef.current) {
        refreshData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('online', handleOnline)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('online', handleOnline)
    }
  }, [refreshData])

  // Logout
  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setMember(null)
    setTransactions([])
    setPromotions([])
    setMemberCodes([])
    setIsAuthenticated(false)
    clearStoredData()
    router.replace('/member/auth')
  }, [supabase, router])

  // Optimistic update for member
  const updateMember = useCallback((data: Partial<Member>) => {
    setMember(prev => prev ? { ...prev, ...data } : null)
  }, [])

  const value = useMemo(() => ({
    member,
    transactions,
    promotions,
    memberCodes,
    membershipTypes,
    loading,
    syncing,
    lastSync,
    error,
    isAuthenticated,
    refreshData,
    logout,
    updateMember
  }), [member, transactions, promotions, memberCodes, membershipTypes, loading, syncing, lastSync, error, isAuthenticated, refreshData, logout, updateMember])

  return (
    <MemberContext.Provider value={value}>
      {children}
    </MemberContext.Provider>
  )
}

export function useMember() {
  const context = useContext(MemberContext)
  if (context === undefined) {
    throw new Error('useMember must be used within a MemberProvider')
  }
  return context
}

// Hook for checking auth and redirecting
export function useRequireAuth(requireOnboarding = true) {
  const { member, loading, isAuthenticated } = useMember()
  const router = useRouter()

  useEffect(() => {
    console.log('🔐 [useRequireAuth] State:', {
      loading,
      isAuthenticated,
      hasMember: !!member,
      memberId: member?.id,
      memberEmail: member?.email,
      onboardingCompleted: member?.onboarding_completed,
      requireOnboarding
    })

    if (!loading) {
      if (!isAuthenticated || !member) {
        console.log('🔐 [useRequireAuth] → Redirecting to /member/auth (not authenticated or no member)')
        router.replace('/member/auth')
      } else if (requireOnboarding && member.onboarding_completed !== true) {
        console.log('🔐 [useRequireAuth] → Redirecting to /member/onboarding (onboarding not completed)')
        router.replace('/member/onboarding')
      } else {
        console.log('🔐 [useRequireAuth] ✅ User authorized, staying on page')
      }
    }
  }, [loading, isAuthenticated, member, requireOnboarding, router])

  return { member, loading, isAuthenticated }
}
