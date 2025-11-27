'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Phone, LogOut, ChevronRight, 
  Loader2, Check, X, Shield, ArrowLeft,
  Bell, FileText, Trash2, ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMember, useRequireAuth } from '../context/MemberContext'
import { createClient } from '@/lib/supabase/client'

type EditingField = 'name' | 'email' | 'phone' | null
type VerificationStep = 'edit' | 'verify'

export default function ProfilePage() {
  const router = useRouter()
  const { member, loading: authLoading, logout, updateMember } = useMember()
  useRequireAuth()
  
  const supabase = createClient()
  
  const [editingField, setEditingField] = useState<EditingField>(null)
  const [verificationStep, setVerificationStep] = useState<VerificationStep>('edit')
  const [newValue, setNewValue] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  
  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  if (authLoading || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const startEditing = (field: EditingField) => {
    setEditingField(field)
    setVerificationStep('edit')
    setNewValue(
      field === 'name' ? (member.full_name || '') :
      field === 'email' ? (member.email || '') :
      field === 'phone' ? (member.phone || '') : ''
    )
    setOtp('')
    setError('')
    setSuccess('')
  }

  const cancelEditing = () => {
    setEditingField(null)
    setVerificationStep('edit')
    setNewValue('')
    setOtp('')
    setError('')
  }

  const handleSaveName = async () => {
    if (!newValue.trim()) {
      setError('Please enter a valid name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('members')
        .update({ full_name: newValue.trim() })
        .eq('id', member.id)

      if (updateError) throw updateError

      updateMember({ full_name: newValue.trim() })
      setSuccess('Name updated successfully!')
      setTimeout(() => {
        cancelEditing()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to update name')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (!newValue.trim()) {
      setError(`Please enter a valid ${editingField}`)
      return
    }

    // Validate email format
    if (editingField === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
      setError('Please enter a valid email address')
      return
    }

    // Validate phone format
    if (editingField === 'phone' && !/^\+?[1-9]\d{6,14}$/.test(newValue.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number with country code')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (editingField === 'email') {
        // Send OTP via custom API
        const response = await fetch('/api/member/send-email-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: member.id, email: newValue }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to send code')
      } else if (editingField === 'phone') {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: newValue,
        })
        if (otpError) throw otpError
      }

      setVerificationStep('verify')
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Verify OTP
      if (editingField === 'email') {
        // Use custom API for email verification
        const response = await fetch('/api/member/verify-email-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: member.id, email: newValue, code: otp }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Invalid code')
        
        updateMember({ email: newValue })
      } else if (editingField === 'phone') {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone: newValue,
          token: otp,
          type: 'sms',
        })
        if (verifyError) throw verifyError

        // Update member record
        const { error: updateError } = await supabase
          .from('members')
          .update({ phone: newValue })
          .eq('id', member.id)

        if (updateError) throw updateError
        
        updateMember({ phone: newValue })
      }

      setSuccess(`${editingField === 'email' ? 'Email' : 'Phone'} updated successfully!`)
      setTimeout(() => {
        cancelEditing()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/member/auth')
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      // Call API to delete account
      const response = await fetch('/api/member/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }
      
      // Sign out and redirect
      await logout()
      router.replace('/member/auth')
    } catch (err: any) {
      setError(err.message || 'Failed to delete account')
      setDeleteLoading(false)
    }
  }

  const ProfileField = ({ 
    icon: Icon, 
    label, 
    value, 
    field,
    requiresVerification = false 
  }: { 
    icon: any
    label: string
    value: string | null
    field: EditingField
    requiresVerification?: boolean
  }) => (
    <button
      onClick={() => startEditing(field)}
      className="w-full flex items-center justify-between p-4 bg-neutral-800 border border-neutral-700 rounded-xl hover:border-orange-500/50 transition"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
          <Icon className="w-5 h-5 text-orange-500" />
        </div>
        <div className="text-left">
          <p className="text-xs text-neutral-500 uppercase">{label}</p>
          <p className="text-white font-medium">
            {value || <span className="text-neutral-500">Not set</span>}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {requiresVerification && (
          <Shield className="w-4 h-4 text-neutral-500" />
        )}
        <ChevronRight className="w-5 h-5 text-neutral-500" />
      </div>
    </button>
  )

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-neutral-400 text-sm mt-1">Manage your account</p>
      </div>

      {/* Profile Fields */}
      <div className="px-6 space-y-3">
        <ProfileField
          icon={User}
          label="Full Name"
          value={member.full_name}
          field="name"
        />
        <ProfileField
          icon={Mail}
          label="Email"
          value={member.email}
          field="email"
          requiresVerification
        />
        <ProfileField
          icon={Phone}
          label="Phone"
          value={member.phone}
          field="phone"
          requiresVerification
        />
      </div>

      {/* Member Info */}
      <div className="px-6 mt-8">
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-2">MEMBER NUMBER</p>
          <p className="text-white font-mono">{member.member_number}</p>
          <p className="text-xs text-neutral-500 mt-4 mb-2">MEMBERSHIP TYPE</p>
          <p className="text-orange-500 font-semibold">{member.membership_type}</p>
        </div>
      </div>

      {/* Notifications */}
      <div className="px-6 mt-8">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase mb-4">Notifications</h3>
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-neutral-700">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-neutral-400" />
              <span className="text-white">Email notifications</span>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                emailNotifications ? 'bg-orange-500' : 'bg-neutral-600'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  emailNotifications ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-neutral-400" />
              <span className="text-white">Push notifications</span>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                pushNotifications ? 'bg-orange-500' : 'bg-neutral-600'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  pushNotifications ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Legal */}
      <div className="px-6 mt-8">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase mb-4">Legal</h3>
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
          <Link
            href="/privacy"
            className="flex items-center justify-between p-4 border-b border-neutral-700 hover:bg-neutral-700/50 transition"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-neutral-400" />
              <span className="text-white">Privacy Policy</span>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-500" />
          </Link>
          <Link
            href="/terms"
            className="flex items-center justify-between p-4 hover:bg-neutral-700/50 transition"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-neutral-400" />
              <span className="text-white">Terms & Conditions</span>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-500" />
          </Link>
        </div>
      </div>

      {/* Account Actions */}
      <div className="px-6 mt-8 pb-8 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 bg-neutral-800 border border-neutral-700 rounded-xl text-white hover:bg-neutral-700 transition"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
        
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 hover:bg-red-500/20 transition"
        >
          <Trash2 className="w-5 h-5" />
          Delete Account
        </button>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => !deleteLoading && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Delete Account?</h2>
                <p className="text-neutral-400 text-sm">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete My Account'
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  className="w-full py-3 bg-neutral-800 text-white rounded-xl font-semibold hover:bg-neutral-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center"
            onClick={cancelEditing}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-neutral-900 border-t border-neutral-700 rounded-t-3xl p-6 pb-24"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {verificationStep === 'edit' 
                    ? `Edit ${editingField === 'name' ? 'Name' : editingField === 'email' ? 'Email' : 'Phone'}`
                    : 'Verify Code'
                  }
                </h2>
                <button
                  onClick={cancelEditing}
                  className="p-2 rounded-full hover:bg-neutral-800 transition"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-xl mb-4"
                >
                  <Check className="w-5 h-5 text-green-500" />
                  <p className="text-green-400">{success}</p>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-4"
                >
                  <X className="w-5 h-5 text-red-500" />
                  <p className="text-red-400">{error}</p>
                </motion.div>
              )}

              {verificationStep === 'edit' ? (
                <>
                  {/* Input Field */}
                  <div className="mb-4">
                    <label className="block text-sm text-neutral-400 mb-2">
                      {editingField === 'name' ? 'Full Name' : 
                       editingField === 'email' ? 'Email Address' : 'Phone Number'}
                    </label>
                    <input
                      type={editingField === 'email' ? 'email' : editingField === 'phone' ? 'tel' : 'text'}
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder={
                        editingField === 'name' ? 'John Doe' :
                        editingField === 'email' ? 'john@example.com' :
                        '+1234567890'
                      }
                      className="w-full px-4 py-4 bg-neutral-800 text-white border border-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                      autoFocus
                    />
                    {(editingField === 'email' || editingField === 'phone') && (
                      <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        A 6-digit verification code will be sent to confirm this change
                      </p>
                    )}
                  </div>

                  {/* Save/Send Button */}
                  <button
                    onClick={editingField === 'name' ? handleSaveName : handleSendOTP}
                    disabled={loading || !newValue.trim()}
                    className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {editingField === 'name' ? 'Saving...' : 'Sending code...'}
                      </>
                    ) : (
                      editingField === 'name' ? 'Save Changes' : 'Send Verification Code'
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* OTP Verification */}
                  <div className="mb-4">
                    <p className="text-neutral-400 mb-4">
                      Enter the 6-digit code sent to{' '}
                      <span className="text-white font-medium">{newValue}</span>
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      className="w-full px-4 py-4 bg-neutral-800 text-white border border-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                      autoFocus
                    />
                  </div>

                  {/* Verify Button */}
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Save'
                    )}
                  </button>

                  {/* Back Button */}
                  <button
                    onClick={() => setVerificationStep('edit')}
                    className="w-full mt-3 py-3 text-neutral-400 hover:text-white transition"
                  >
                    ← Change {editingField === 'email' ? 'email' : 'phone'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
