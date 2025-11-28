'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import PinPad from '../components/PinPad'
import BranchSelector from '../components/BranchSelector'
import { Loader2 } from 'lucide-react'

interface Branch {
  id: string
  name: string
  address?: string
  city?: string
}

interface StaffData {
  id: string
  full_name: string
  role: string
  current_branch_id: string | null
}

export default function ScannerLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'lastname' | 'pin' | 'branch'>('lastname')
  const [lastName, setLastName] = useState('')
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [staff, setStaff] = useState<StaffData | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])

  const handleLastNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (lastName.trim().length > 0) {
      setError(null)
      setStep('pin')
    }
  }

  const handlePinSubmit = useCallback(async (pin: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_name: lastName, pin }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid credentials')
        setLoading(false)
        return
      }

      // Store session token
      localStorage.setItem('staff_session_token', data.session_token)
      setSessionToken(data.session_token)
      setStaff(data.staff)
      setBranches(data.assigned_branches)

      // If needs branch selection, show branch selector
      if (data.needs_branch_selection) {
        setStep('branch')
        setLoading(false)
      } else {
        // Go directly to scanner
        router.push('/scanner/main')
      }
    } catch (err: any) {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }, [router, lastName])

  const handleBranchSelect = async (branchId: string) => {
    if (!sessionToken) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/staff/switch-branch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ branch_id: branchId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to select branch')
        setLoading(false)
        return
      }

      // Go to scanner
      router.push('/scanner/main')
    } catch (err: any) {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  const getTitle = () => {
    switch (step) {
      case 'lastname': return 'Staff Login'
      case 'pin': return `Hello, ${lastName}`
      case 'branch': return `Welcome, ${staff?.full_name}`
    }
  }

  const getSubtitle = () => {
    switch (step) {
      case 'lastname': return 'Enter your last name to continue'
      case 'pin': return 'Enter your 6-digit PIN'
      case 'branch': return 'Select your location for today'
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-neutral-900 to-neutral-950">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/NEGRONI-Logo-hueso_png.png"
          alt="Negroni"
          width={120}
          height={120}
          className="opacity-90"
          priority
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-white mb-2">{getTitle()}</h1>
      <p className="text-neutral-400 mb-8">{getSubtitle()}</p>

      {/* Content */}
      {step === 'lastname' && (
        <form onSubmit={handleLastNameSubmit} className="w-full max-w-sm space-y-4">
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="w-full px-4 py-4 bg-neutral-800 border border-neutral-700 rounded-xl 
                       text-white text-xl text-center
                       focus:ring-2 focus:ring-orange-500 focus:border-transparent
                       placeholder-neutral-500"
            autoFocus
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={lastName.trim().length === 0}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50
                       text-white font-bold text-lg rounded-xl transition"
          >
            Continue
          </button>
        </form>
      )}

      {step === 'pin' && (
        <div className="space-y-4">
          <PinPad
            onSubmit={handlePinSubmit}
            loading={loading}
            error={error}
            pinLength={6}
          />
          <button
            onClick={() => {
              setStep('lastname')
              setLastName('')
              setError(null)
            }}
            className="w-full text-neutral-500 hover:text-white text-sm transition"
          >
            ← Back
          </button>
        </div>
      )}

      {step === 'branch' && (
        <BranchSelector
          branches={branches}
          onSelect={handleBranchSelect}
        />
      )}

      {/* Error for branch selection */}
      {step === 'branch' && error && (
        <div className="mt-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-xs text-neutral-600">
          Negroni Members
        </p>
      </div>
    </div>
  )
}
