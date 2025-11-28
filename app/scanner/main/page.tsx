'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useStaffSession } from '../hooks/useStaffSession'
import { 
  QrCode, Search, LogOut, MapPin, ChevronDown, 
  DollarSign, Users, ShoppingCart, TrendingUp,
  Loader2, X, Camera
} from 'lucide-react'
import Image from 'next/image'
import { Html5Qrcode } from 'html5-qrcode'

interface Member {
  id: string
  full_name: string
  email: string
  phone: string
  membership_type: string // Tier name from DB
  membership_type_id?: string // FK to membership_types
  member_number: string
  points: number
}

interface Stats {
  branch: {
    name: string
    today: {
      total_sales: number
      total_transactions: number
      unique_customers: number
      average_ticket: number
    }
  }
}

export default function ScannerMainPage() {
  const router = useRouter()
  const { session, loading: sessionLoading, logout, switchBranch, isManager, currentBranch, getAuthHeaders } = useStaffSession()
  
  const [mode, setMode] = useState<'idle' | 'scan' | 'search'>('idle')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [searching, setSearching] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [showBranchMenu, setShowBranchMenu] = useState(false)
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus search input when entering search mode
  useEffect(() => {
    if (mode === 'search' && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [mode])

  // Fetch stats - only when branch changes
  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem('staff_session_token')
    if (!token) return
    
    try {
      const response = await fetch('/api/staff/scanner/stats', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  useEffect(() => {
    if (!currentBranch?.id) return
    
    fetchStats()
    const interval = setInterval(fetchStats, 60000) // Refresh every 60s (was 30s)
    return () => clearInterval(interval)
  }, [currentBranch?.id, fetchStats])

  // Start QR scanner
  const startScanner = async () => {
    setMode('scan')
    setScanning(true)

    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      const config = { fps: 10, qrbox: { width: 250, height: 250 } }
      const onSuccess = async (decodedText: string) => {
        await scanner.stop()
        scannerRef.current = null
        setScanning(false)
        router.push(`/scanner/register?member_id=${decodedText}`)
      }

      // Try back camera first, then front camera
      try {
        await scanner.start({ facingMode: 'environment' }, config, onSuccess, () => {})
      } catch {
        // Back camera failed, try front camera
        await scanner.start({ facingMode: 'user' }, config, onSuccess, () => {})
      }
    } catch (err) {
      console.error('Scanner error:', err)
      alert('Camera not available. Make sure you are accessing from localhost or HTTPS, and have granted camera permissions.')
      setScanning(false)
      setMode('idle')
    }
  }

  // Stop scanner
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch (err) {
        // Ignore
      }
      scannerRef.current = null
    }
    setScanning(false)
    setMode('idle')
  }

  // Search members
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    
    try {
      const response = await fetch('/api/staff/scanner/verify', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ search_query: query }),
      })

      const data = await response.json()

      if (data.multiple_results) {
        // Multiple results - show list
        setSearchResults(data.results)
      } else if (data.member) {
        // Single result - still show in list so user can confirm
        setSearchResults([{
          id: data.member.id,
          full_name: data.member.full_name,
          email: data.member.email,
          phone: data.member.phone,
          member_number: data.member.member_number,
          membership_type: data.member.membership_type,
          membership_type_id: data.member.membership_type_id,
          points: data.member.points,
        }])
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  // Select member from search
  const selectMember = (memberId: string) => {
    router.push(`/scanner/register?member_id=${memberId}`)
  }

  // Handle branch switch
  const [switchingBranch, setSwitchingBranch] = useState(false)
  
  const handleSwitchBranch = async (branchId: string) => {
    setShowBranchMenu(false)
    setSwitchingBranch(true)
    setStats(null) // Reset stats to show skeleton
    const success = await switchBranch(branchId)
    setSwitchingBranch(false)
    if (success) {
      // Fetch new stats for the new branch
      fetchStats()
    }
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col relative">
      {/* Loading overlay for branch switch */}
      {switchingBranch && (
        <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <span className="text-white font-medium">Switching location...</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-neutral-800 border-b border-neutral-700 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Branch */}
          <div className="flex items-center gap-3">
            <Image
              src="/NEGRONI-Logo-hueso_png.png"
              alt="Negroni"
              width={40}
              height={40}
              className="opacity-90"
            />
            
            {/* Branch Selector (only for managers with multiple branches) */}
            {isManager && session?.assigned_branches && session.assigned_branches.length > 1 ? (
              <div className="relative">
                <button
                  onClick={() => setShowBranchMenu(!showBranchMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-neutral-700 rounded-lg text-white hover:bg-neutral-600 transition"
                >
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">{currentBranch?.name || 'Select Branch'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showBranchMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-50">
                    {session.assigned_branches.map((branch: any) => (
                      <button
                        key={branch.id}
                        onClick={() => handleSwitchBranch(branch.id)}
                        className={`w-full px-4 py-3 text-left hover:bg-neutral-700 transition first:rounded-t-lg last:rounded-b-lg ${
                          branch.id === currentBranch?.id ? 'bg-orange-500/20 text-orange-400' : 'text-white'
                        }`}
                      >
                        <div className="font-medium">{branch.name}</div>
                        {branch.city && (
                          <div className="text-xs text-neutral-400">{branch.city}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-neutral-700/50 rounded-lg">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-white">{currentBranch?.name}</span>
              </div>
            )}
          </div>

          {/* Staff Info & Logout */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-400 hidden sm:block">
              {session?.staff?.full_name}
            </span>
            <button
              onClick={logout}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6">
        {/* Scanner Area */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl overflow-hidden">
          {/* Idle Mode - Scan & Search buttons */}
          <div className={`transition-all duration-300 ease-out ${
            mode === 'idle' 
              ? 'opacity-100 max-h-[500px] p-6' 
              : 'opacity-0 max-h-0 p-0 overflow-hidden'
          }`}>
            <div className="space-y-4">
              {/* Scan Button */}
              <button
                onClick={startScanner}
                className="w-full py-12 bg-gradient-to-br from-orange-500 to-orange-600 
                           hover:from-orange-600 hover:to-orange-700
                           rounded-xl text-white font-bold text-xl
                           flex flex-col items-center gap-3 transition-all duration-200
                           active:scale-[0.98] transform"
              >
                <Camera className="w-12 h-12" />
                Scan QR Code
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-neutral-700" />
                <span className="text-neutral-500 text-sm">or</span>
                <div className="flex-1 h-px bg-neutral-700" />
              </div>

              {/* Search Trigger */}
              <button
                onClick={() => setMode('search')}
                className="w-full relative"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <div className="w-full pl-12 pr-4 py-4 bg-neutral-700 border border-neutral-600 
                             text-neutral-400 rounded-xl text-lg text-left">
                  Search by name, phone, email...
                </div>
              </button>
            </div>
          </div>

          {/* Scan Mode */}
          <div className={`transition-all duration-300 ease-out ${
            mode === 'scan' 
              ? 'opacity-100 max-h-[600px]' 
              : 'opacity-0 max-h-0 overflow-hidden'
          }`}>
            <div className="relative">
              <div id="qr-reader" className="w-full" />
              <button
                onClick={stopScanner}
                className="absolute top-4 right-4 p-2 bg-neutral-900/80 rounded-full text-white 
                           hover:bg-neutral-800 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              {scanning && (
                <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm animate-pulse">
                  Point camera at member's QR code
                </div>
              )}
            </div>
          </div>

          {/* Search Mode */}
          <div className={`transition-all duration-300 ease-out ${
            mode === 'search' 
              ? 'opacity-100 max-h-[800px] p-6' 
              : 'opacity-0 max-h-0 p-0 overflow-hidden'
          }`}>
            <div className="space-y-4">
              {/* Search Input with Cancel */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name, phone, email..."
                    className="w-full pl-12 pr-4 py-4 bg-neutral-700 border border-neutral-600 
                               text-white rounded-xl text-lg
                               focus:ring-2 focus:ring-orange-500 focus:border-transparent
                               placeholder-neutral-400 transition-all"
                  />
                  {searching && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 animate-spin" />
                  )}
                </div>
                <button
                  onClick={() => {
                    setMode('idle')
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="px-4 py-4 text-orange-400 hover:text-orange-300 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((member, index) => (
                    <button
                      key={member.id}
                      onClick={() => selectMember(member.id)}
                      className="w-full p-4 bg-neutral-700 hover:bg-neutral-600 rounded-xl text-left 
                                 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                                 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white text-lg">
                            {member.full_name}
                          </div>
                          <div className="text-sm text-neutral-400">
                            {member.phone || member.email}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-orange-400 font-medium">
                            {member.membership_type}
                          </div>
                          <div className="text-xs text-neutral-500">
                            #{member.member_number}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <div className="text-center py-8 text-neutral-500 animate-fade-in">
                  No members found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={`transition-all duration-300 ease-out ${
          mode === 'idle' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none absolute'
        }`}>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">
              Today at {currentBranch?.name || 'Loading...'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Sales</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats ? `$${stats.branch.today.total_sales.toFixed(0)}` : (
                    <div className="h-8 w-16 bg-neutral-700 rounded animate-pulse" />
                  )}
                </div>
              </div>
              
              <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-xs">Visits</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats ? stats.branch.today.total_transactions : (
                    <div className="h-8 w-10 bg-neutral-700 rounded animate-pulse" />
                  )}
                </div>
              </div>
              
              <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Customers</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats ? stats.branch.today.unique_customers : (
                    <div className="h-8 w-10 bg-neutral-700 rounded animate-pulse" />
                  )}
                </div>
              </div>
              
              <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Avg Ticket</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats ? `$${stats.branch.today.average_ticket.toFixed(0)}` : (
                    <div className="h-8 w-12 bg-neutral-700 rounded animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
