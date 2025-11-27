'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Loader2, Camera, Hash } from 'lucide-react'

interface QRScannerProps {
  mode: 'scan' | 'manual'
  onMemberVerified: (data: any) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
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
  const [manualNumber, setManualNumber] = useState('')

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
    if (mode === 'scan' && !scannerRef.current) {
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
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
        scannerRef.current = null
      }
    }
  }, [mode])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualNumber.trim()) {
      verifyMember(manualNumber.trim())
    }
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
              <Hash className="w-5 h-5 text-orange-500" />
              Ingreso Manual
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
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Member Number
              </label>
              <input
                type="text"
                value={manualNumber}
                onChange={(e) => setManualNumber(e.target.value)}
                placeholder="MEM123456789"
                className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-neutral-400"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !manualNumber.trim()}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Search Member'
              )}
            </button>
          </form>
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
