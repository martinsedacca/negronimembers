'use client'

import { useState } from 'react'
import QRScanner from '@/components/scanner/QRScanner'
import MemberInfo from '@/components/scanner/MemberInfo'
import TransactionForm from '@/components/scanner/TransactionForm'
import DailyStats from '@/components/scanner/DailyStats'
import { Scan, User } from 'lucide-react'

interface MemberData {
  member: {
    id: string
    full_name: string
    email: string
    phone: string | null
    membership_type: string
    status: string
    member_number: string
    points: number
  }
  stats: {
    total_visits: number
    lifetime_spent: number
    visits_last_30_days: number
    spent_last_30_days: number
    last_visit: string | null
    average_purchase: number
  }
  available_promotions: any[]
  assigned_promotions: any[]
  recent_usage: any[]
}

export default function ScannerPage() {
  const [memberData, setMemberData] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'scan' | 'manual'>('scan')

  const handleMemberVerified = (data: MemberData) => {
    setMemberData(data)
    setError(null)
  }

  const handleTransactionComplete = () => {
    setMemberData(null)
    setError(null)
  }

  const handleReset = () => {
    setMemberData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Scanner de Membresías</h1>
          <p className="mt-2 text-neutral-400">
            Escanea el QR del cliente para registrar compras y aplicar promociones
          </p>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex gap-2 bg-neutral-800 border border-neutral-700 rounded-lg p-1">
          <button
            onClick={() => setMode('scan')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              mode === 'scan'
                ? 'bg-orange-500 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Scan className="w-4 h-4 inline mr-2" />
            Escanear QR
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              mode === 'manual'
                ? 'bg-orange-500 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Ingreso Manual
          </button>
        </div>
      </div>

      {/* Daily Stats */}
      <DailyStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Scanner or Member Info */}
        <div>
          {!memberData ? (
            <QRScanner
              mode={mode}
              onMemberVerified={handleMemberVerified}
              loading={loading}
              setLoading={setLoading}
              error={error}
              setError={setError}
            />
          ) : (
            <MemberInfo
              memberData={memberData}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Right Column: Transaction Form */}
        <div>
          {memberData ? (
            <TransactionForm
              memberData={memberData}
              onComplete={handleTransactionComplete}
              onCancel={handleReset}
            />
          ) : (
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-12 text-center">
              <Scan className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-400 mb-2">
                Esperando escaneo
              </h3>
              <p className="text-sm text-neutral-500">
                Escanea el código QR del cliente para comenzar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
