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
  membership_type: string // @deprecated - use membership_type_id
  membership_type_id: string | null // FK to membership_types.id
  status: string
  member_number: string
  joined_date: string
  expiry_date: string | null
  points: number
  total_spent: number
  total_visits: number
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
  branch_id: string | null
  staff_id: string | null
  branches?: { name: string } | null
  staff_members?: { first_name: string; last_name: string } | null
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
    const [memberRes, transactionsRes, promotionsRes, codesRes, membershipTypesRes, memberPromosRes] = await Promise.all([
      // Member data with current tier name from membership_types
      supabase
        .from('members')
        .select('*, membership_types(id, name)')
        .eq('user_id', userId)
        .maybeSingle(),
      
      // Card usage (transactions) with branch and staff info
      supabase
        .from('card_usage')
        .select(`
          *,
          branches (name),
          staff_members (first_name, last_name)
        `)
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(50),
      
      // Active promotions (general)
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
        .eq('is_active', true),
      
      // Assigned promotions to this member (from segments)
      supabase
        .from('member_promotions')
        .select('promotion_id, promotions(*)')
        .eq('member_id', memberId)
        .is('redeemed_at', null)
    ])

    // Combine general promotions with individually assigned ones
    const generalPromotions = (promotionsRes.data || []) as Promotion[]
    const membershipTypes = (membershipTypesRes.data || []) as MembershipType[]
    
    // Get assigned promotion details from member_promotions
    const assignedPromos = (memberPromosRes.data || [])
      .map((mp: any) => mp.promotions)
      .filter((p: any) => p && p.is_active)
    
    // Merge and deduplicate promotions
    const allPromotions = [...generalPromotions]
    for (const promo of assignedPromos) {
      if (promo && !allPromotions.find(p => p.id === promo.id)) {
        allPromotions.push(promo)
      }
    }

    // Process member data - use tier name from JOIN if available
    let memberData = memberRes.data as (Member & { membership_types?: { id: string; name: string } }) | null
    if (memberData && memberData.membership_types) {
      // Override membership_type with current name from membership_types table
      memberData = {
        ...memberData,
        membership_type: memberData.membership_types.name,
        membership_type_id: memberData.membership_types.id,
      }
    }

    return {
      member: memberData as Member | null,
      transactions: (transactionsRes.data || []) as Transaction[],
      promotions: allPromotions,
      memberCodes: (codesRes.data || []).map((mc: any) => mc.codes?.code).filter(Boolean) as string[],
      membershipTypes: membershipTypes
    }
  }, [supabase])

  // Track if sync is already in progress
  const isSyncingRef = useRef(false)

  // Full sync with database
  const refreshData = useCallback(async () => {
    // Prevent concurrent syncs
    if (isSyncingRef.current) return
    
    isSyncingRef.current = true
    setSyncing(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsAuthenticated(false)
        setMember(null)
        clearStoredData()
        setLoading(false)
        setSyncing(false)
        isSyncingRef.current = false
        return
      }

      // Get member ID first
      const { data: memberData } = await supabase
        .from('members')
        .select('id, onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!memberData) {
        setIsAuthenticated(false)
        setMember(null)
        clearStoredData()
        setLoading(false)
        setSyncing(false)
        isSyncingRef.current = false
        return
      }

      // Fetch all data
      const allData = await fetchAllData(user.id, memberData.id)

      if (allData.member) {
        // Recalculate totals from transactions to ensure consistency
        const calculatedTotalSpent = allData.transactions.reduce(
          (sum, tx) => sum + (parseFloat(String(tx.amount_spent)) || 0), 0
        )
        const calculatedTotalVisits = allData.transactions.length
        const calculatedPoints = allData.transactions.reduce(
          (sum, tx) => sum + (tx.points_earned || 0), 0
        )

        // Update member with calculated values (always use fresh calculation)
        const updatedMember = {
          ...allData.member,
          total_spent: calculatedTotalSpent,
          total_visits: calculatedTotalVisits,
          points: calculatedPoints,
        }

        // Update DB in background if values differ (fire and forget)
        const dbTotalSpent = parseFloat(String(allData.member.total_spent)) || 0
        const dbTotalVisits = allData.member.total_visits || 0
        const dbPoints = allData.member.points || 0
        
        if (Math.abs(dbTotalSpent - calculatedTotalSpent) > 0.01 || 
            dbTotalVisits !== calculatedTotalVisits ||
            dbPoints !== calculatedPoints) {
          supabase
            .from('members')
            .update({ 
              total_spent: calculatedTotalSpent,
              total_visits: calculatedTotalVisits,
              points: calculatedPoints,
            })
            .eq('id', allData.member.id)
            .then(() => console.log('✅ Member totals synced'))
        }

        // Check if member should be promoted to a higher tier (backup check)
        const bestTier = allData.membershipTypes
          .filter(t => 
            (t.points_required > 0 && calculatedPoints >= t.points_required) ||
            (t.visits_required > 0 && calculatedTotalVisits >= t.visits_required) ||
            (t.points_required === 0 && t.visits_required === 0)
          )
          .sort((a, b) => {
            const aLevel = Math.max(a.points_required || 0, a.visits_required || 0)
            const bLevel = Math.max(b.points_required || 0, b.visits_required || 0)
            return bLevel - aLevel
          })[0]

        if (bestTier && bestTier.id !== updatedMember.membership_type_id) {
          const currentLevel = allData.membershipTypes.find(t => t.id === updatedMember.membership_type_id)
          const currentLevelValue = currentLevel 
            ? Math.max(currentLevel.points_required || 0, currentLevel.visits_required || 0) 
            : 0
          const newLevelValue = Math.max(bestTier.points_required || 0, bestTier.visits_required || 0)
          
          // Only promote (not demote)
          if (newLevelValue > currentLevelValue) {
            console.log(`🎉 Promoting member to ${bestTier.name}`)
            updatedMember.membership_type_id = bestTier.id
            updatedMember.membership_type = bestTier.name
            
            // Update in DB
            supabase
              .from('members')
              .update({ 
                membership_type_id: bestTier.id,
                membership_type: bestTier.name 
              })
              .eq('id', allData.member.id)
              .then(() => console.log('✅ Member tier promoted'))
          }
        }

        setMember(updatedMember as Member)
        setTransactions(allData.transactions)
        setPromotions(allData.promotions)
        setMemberCodes(allData.memberCodes)
        setMembershipTypes(allData.membershipTypes)
        setIsAuthenticated(true)
        setLastSync(new Date())

        // Store in localStorage
        storeData({
          member: updatedMember as Member,
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
      isSyncingRef.current = false
    }
  }, [supabase, fetchAllData])

  // Listen for auth state changes from Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
    if (!loading) {
      if (!isAuthenticated || !member) {
        router.replace('/member/auth')
      } else if (requireOnboarding && member.onboarding_completed !== true) {
        router.replace('/member/onboarding')
      }
    }
  }, [loading, isAuthenticated, member, requireOnboarding, router])

  return { member, loading, isAuthenticated }
}
