'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Loader2, Camera, Search, User, Mail, Phone, CreditCard } from 'lucide-react'

interface QRScannerProps {
  mode: 'scan' | 'manual'
  onMemberVerified: (data: any) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

interface SearchResult {
  id: string
  full_name: string
  email: string
  phone: string | null
  member_number: string
  membership_type: string
  status: string
  points: number
}

export default function QRScanner({
  mode,
  onMemberVerified,
  loading,
  setLoading,
  error,
  setError,
}: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const verifyMember = async (scannedValue: string) => {
    setLoading(true)
    setError(null)

    try {
      // Detect if scanned value is a UUID (member_id) or member_number
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(scannedValue)
      
      const payload = isUUID 
        ? { member_id: scannedValue }
        : { member_number: scannedValue }

      const response = await fetch('/api/scanner/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al verificar miembro')
      }

      onMemberVerified(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Clean up scanner when switching to manual mode
    if (mode === 'manual' && scannerRef.current) {
      scannerRef.current.clear().catch(console.error)
      scannerRef.current = null
    }
    
    // Initialize scanner when in scan mode
    if (mode === 'scan' && !scannerRef.current) {
      // Small delay to ensure DOM is ready
      const timeout = setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        )

        scanner.render(
          (decodedText) => {
            // QR contains member_id (UUID) or member_number (legacy)
            verifyMember(decodedText)
            scanner.clear()
            scannerRef.current = null
          },
          (error) => {
            // Ignore scanning errors (too frequent)
          }
        )

        scannerRef.current = scanner
      }, 100)
      
      return () => clearTimeout(timeout)
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
        scannerRef.current = null
      }
    }
  }, [mode])

  // Search members as user types
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setError(null)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const response = await fetch('/api/scanner/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query.trim() }),
        })

        const data = await response.json()
        
        if (response.ok) {
          setSearchResults(data.members || [])
        } else {
          setSearchResults([])
        }
      } catch (err) {
        console.error('Search error:', err)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
  }

  const handleSelectMember = (memberId: string) => {
    setSearchResults([])
    setSearchQuery('')
    verifyMember(memberId)
  }

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-neutral-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          {mode === 'scan' ? (
            <>
              <Camera className="w-5 h-5 text-orange-500" />
              Escaner QR
            </>
          ) : (
            <>
              <Search className="w-5 h-5 text-orange-500" />
              Buscar Miembro
            </>
          )}
        </h2>
      </div>

      <div className="p-6">
        {mode === 'scan' ? (
          <div>
            <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Buscar por nombre, email, teléfono o número de miembro
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Ej: Ana Laura, ana@email.com, +1234567890"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-neutral-400"
                  disabled={loading}
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-orange-500" />
                )}
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Busca por nombre completo o parcial en cualquier orden, email o teléfono
              </p>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                <p className="text-sm text-neutral-400">{searchResults.length} resultado(s)</p>
                {searchResults.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleSelectMember(member.id)}
                    className="w-full p-4 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-left transition group"
                    disabled={loading}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-400 flex-shrink-0" />
                          <span className="font-medium text-white truncate">{member.full_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            member.membership_type === 'Gold' 
                              ? 'bg-yellow-500/20 text-yellow-400' 
                              : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {member.membership_type}
                          </span>
                        </div>
                        <div className="mt-1 space-y-1">
                          {member.email && (
                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-neutral-500">
                            <CreditCard className="w-3 h-3 flex-shrink-0" />
                            <span>{member.member_number}</span>
                            <span className="ml-2">•</span>
                            <span>{member.points} pts</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition">
                        <span className="text-xs text-orange-400">Seleccionar →</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results message */}
            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No se encontraron miembros</p>
                <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span className="ml-2 text-neutral-400">Cargando información...</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
