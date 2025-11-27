'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import PhoneInput from './components/PhoneInput'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState({ countryCode: '+1', number: '' })
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(false)

  // Check if user is already logged in - only run once
  useEffect(() => {
    let isMounted = true
    
    async function checkSession() {
      console.log('🔑 [AuthPage] Checking existing session...')
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        console.log('🔑 [AuthPage] Session check result:', {
          hasUser: !!user,
          userId: user?.id,
          userEmail: user?.email,
          userPhone: user?.phone,
          authError: authError?.message
        })
        
        if (!isMounted) return
        
        if (user) {
          // Check if member exists
          const { data: member, error: memberError } = await supabase
            .from('members')
            .select('id, onboarding_completed')
            .eq('user_id', user.id)
            .maybeSingle()

          console.log('🔑 [AuthPage] Member check:', {
            hasMember: !!member,
            memberId: member?.id,
            onboardingCompleted: member?.onboarding_completed,
            memberError: memberError?.message
          })

          if (!isMounted) return

          if (member) {
            if (member.onboarding_completed === true) {
              console.log('🔑 [AuthPage] → Redirecting to /member/pass')
              router.replace('/member/pass')
            } else {
              console.log('🔑 [AuthPage] → Redirecting to /member/onboarding')
              router.replace('/member/onboarding')
            }
            return
          } else {
            console.log('🔑 [AuthPage] User exists but no member record, showing auth form')
          }
        } else {
          console.log('🔑 [AuthPage] No user session, showing auth form')
        }
        
        if (isMounted) {
          setCheckingSession(false)
        }
      } catch (error) {
        console.error('🔑 [AuthPage] Session check error:', error)
        if (isMounted) {
          setCheckingSession(false)
        }
      }
    }
    
    checkSession()
    
    return () => {
      isMounted = false
    }
  }, [router, supabase])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (step === 'code' && countdown === 0) {
      setCanResend(true)
    }
  }, [countdown, step])

  const getFullPhone = () => phone.countryCode + phone.number

  const startCountdown = () => {
    setCountdown(60) // 60 seconds to match Supabase config
    setCanResend(false)
  }

  const handleResendCode = async () => {
    if (!canResend) return
    
    setError('')
    setLoading(true)
    
    try {
      const fullPhone = getFullPhone()
      
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      })

      if (otpError) {
        throw otpError
      }

      startCountdown()
      setCode('')
    } catch (err: any) {
      console.error('Error resending OTP:', err)
      setError(err.message || 'Failed to resend verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleSendCode = async () => {
    // Validate phone number
    if (!phone.number || phone.number.length < 9) {
      setError('Please enter a valid phone number')
      return
    }

    setError('')
    setLoading(true)
    
    try {
      const fullPhone = getFullPhone()
      
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      })

      if (otpError) {
        throw otpError
      }

      setStep('code')
      startCountdown()
    } catch (err: any) {
      console.error('Error sending OTP:', err)
      setError(err.message || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setError('')
    setLoading(true)
    
    try {
      const fullPhone = getFullPhone()
      
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: code,
        type: 'sms',
      })

      if (verifyError) {
        throw verifyError
      }

      if (!data.user) {
        throw new Error('Verification failed')
      }

      // Check if member exists
      const { data: member } = await supabase
        .from('members')
        .select('id, onboarding_completed')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (member) {
        // Existing member
        if (member.onboarding_completed) {
          router.push('/member/pass')
        } else {
          router.push('/member/onboarding')
        }
      } else {
        // New user - create member record and go to onboarding
        const { error: insertError } = await supabase
          .from('members')
          .insert({
            user_id: data.user.id,
            phone: fullPhone,
            membership_type: 'Member',
            onboarding_completed: false,
          })

        if (insertError) {
          console.error('Error creating member:', insertError)
          setError('Failed to create your profile. Please try again.')
          return
        }

        router.push('/member/onboarding')
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err)
      setError(err.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-neutral-300 border-t-orange-500 rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center">
            <span className="text-4xl">🍸</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Negroni</h1>
          <p className="text-neutral-400">Your loyalty membership</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Phone number
                </label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  error={error}
                  disabled={loading}
                />
                <p className="text-xs text-neutral-500 mt-2">
                  We'll send you a verification code via SMS
                </p>
                
                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSendCode}
                disabled={loading || !phone.number}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Verification code
                </label>
                <input
                  id="otp-input"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  autoFocus
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    setError('')
                  }}
                  placeholder="123456"
                  className={`w-full px-4 py-4 bg-neutral-800 text-white border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-mono ${
                    error ? 'border-red-500' : 'border-neutral-700'
                  }`}
                  maxLength={6}
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Sent to {phone.countryCode} {phone.number}
                </p>
                
                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Countdown and resend */}
                <div className="mt-4 text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-neutral-400">
                      Code expires in <span className="text-orange-500 font-mono">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendCode}
                      disabled={loading || !canResend}
                      className="text-sm text-orange-500 hover:text-orange-400 transition flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      Resend code
                    </button>
                  )}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleVerifyCode}
                disabled={loading || code.length !== 6}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              <button
                onClick={() => setStep('phone')}
                className="w-full text-sm text-neutral-400 hover:text-white transition"
              >
                ← Change number
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
