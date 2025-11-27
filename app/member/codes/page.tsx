'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Sparkles, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CodesPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  
  const [memberId, setMemberId] = useState<string | null>(null)
  const [loadingMember, setLoadingMember] = useState(true)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<any>(null)
  const [codeDetails, setCodeDetails] = useState<any>(null)

  // Get authenticated member
  useEffect(() => {
    async function getMember() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/member/auth')
        return
      }

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!member) {
        router.push('/member/auth')
        return
      }

      setMemberId(member.id)
      setLoadingMember(false)
    }

    getMember()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberId) return
    
    setLoading(true)
    setError('')
    setSuccess(null)
    setCodeDetails(null)

    try {
      // First, validate the code
      const validateResponse = await fetch(`/api/codes/validate?code=${code}`)
      const validateData = await validateResponse.json()

      if (!validateResponse.ok) {
        throw new Error(validateData.error || 'Invalid code')
      }

      setCodeDetails(validateData.code)

      // Then redeem it
      const redeemResponse = await fetch('/api/codes/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          member_id: memberId,
        }),
      })

      const redeemData = await redeemResponse.json()

      if (!redeemResponse.ok) {
        throw new Error(redeemData.error || 'Failed to redeem code')
      }

      setSuccess(redeemData)
      setCode('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loadingMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-brand-500 rounded-full mb-4">
            <Tag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Redeem Code</h1>
          <p className="text-neutral-400">
            Enter a code to unlock special benefits
          </p>
        </motion.div>
      </div>

      {/* Code Form */}
      <div className="px-6 space-y-6">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-green-900/50 to-green-800/50 border border-green-600 rounded-2xl p-6 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                🎉 Code Redeemed!
              </h2>
              <p className="text-green-200 mb-4">{success.message}</p>
              
              {codeDetails && (
                <div className="bg-green-950/50 rounded-xl p-4 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-green-300 text-sm">Code:</span>
                    <span className="text-white font-bold text-lg font-mono">
                      {codeDetails.code}
                    </span>
                  </div>
                  <p className="text-sm text-green-200 mt-2">
                    {codeDetails.description}
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setSuccess(null)
                  setCodeDetails(null)
                }}
                className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition"
              >
                Redeem Another
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Code
                </label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full pl-12 pr-4 py-4 bg-neutral-800 text-white border-2 border-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-lg uppercase placeholder-neutral-500"
                    placeholder="AERO"
                    disabled={loading}
                    maxLength={20}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Enter the code exactly as shown (e.g., AERO, VIP2024)
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/50 border border-red-600 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-200 font-medium">Error</p>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full bg-gradient-to-r from-orange-500 to-brand-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Redeem Code
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Info Section */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            About Codes
          </h3>
          <p className="text-sm text-neutral-300">
            Codes give you access to special benefits and exclusive offers. Once you redeem a code, 
            you'll automatically see new benefits available in your Benefits page.
          </p>
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-700">
            <p className="text-xs text-neutral-400">
              💡 <span className="font-medium text-neutral-300">Tip:</span> Look for codes in our emails, 
              at branch locations, or during special events.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
