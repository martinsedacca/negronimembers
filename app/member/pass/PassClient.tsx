'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Download, Sparkles, Award, Loader2, CheckCircle, AlertCircle, UtensilsCrossed, MapPin, ExternalLink, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

interface Branch {
  id: string
  name: string
  address: string | null
  city: string | null
  menu_url: string | null
  is_active: boolean
}

interface PassClientProps {
  member: any
}

export default function PassClient({ member }: PassClientProps) {
  const isGold = member.membership_type === 'Gold'
  const [downloading, setDownloading] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop')
  const [isPassInstalled, setIsPassInstalled] = useState(false)
  const [checkingPass, setCheckingPass] = useState(true)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isAndroid = /android/.test(userAgent)
    
    if (isIOS) {
      setDeviceType('ios')
    } else if (isAndroid) {
      setDeviceType('android')
    } else {
      setDeviceType('desktop')
    }
  }, [])

  // Check if pass is already installed (has active push tokens)
  useEffect(() => {
    async function checkPassInstalled() {
      try {
        const supabase = createClient()
        
        // Check if there's an active wallet pass with registered devices
        const { data: tokens } = await supabase
          .from('wallet_push_tokens')
          .select('id')
          .eq('member_id', member.id)
          .eq('is_active', true)
          .limit(1)
        
        setIsPassInstalled(!!(tokens && tokens.length > 0))
      } catch (error) {
        console.error('Error checking pass status:', error)
      } finally {
        setCheckingPass(false)
      }
    }
    
    checkPassInstalled()
  }, [member.id])

  // Fetch branches for menu modal
  useEffect(() => {
    async function fetchBranches() {
      const supabase = createClient()
      const { data } = await supabase
        .from('branches')
        .select('id, name, address, city, menu_url, is_active')
        .eq('is_active', true)
        .order('name')
      
      if (data) setBranches(data)
    }
    fetchBranches()
  }, [])

  const handleDownload = async () => {
    setDownloading(true)
    setDownloadStatus('idle')
    
    try {
      const response = await fetch(`/api/wallet/apple/${member.id}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Error generating pass')
      }

      // Get the pass file as blob
      const blob = await response.blob()
      
      // Create download URL
      const url = window.URL.createObjectURL(blob)
      
      if (deviceType === 'ios') {
        // On iOS, open the pass directly - iOS will prompt to add to Wallet
        window.location.href = url
      } else {
        // On other devices, download the file
        const a = document.createElement('a')
        a.href = url
        a.download = `membership-${member.member_number}.pkpass`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
      
      window.URL.revokeObjectURL(url)
      setDownloadStatus('success')
      
      // Reset status after 3 seconds
      setTimeout(() => setDownloadStatus('idle'), 3000)
    } catch (error) {
      console.error('Error downloading pass:', error)
      setDownloadStatus('error')
      setTimeout(() => setDownloadStatus('idle'), 3000)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen pb-6 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/brand/lounge-red.jpg" 
          alt="" 
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/30 via-neutral-950/70 to-neutral-950" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Logo */}
        <div className="px-6 pt-8 pb-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            <Image 
              src="/NEGRONI-Logo-hueso_png.png" 
              alt="Negroni" 
              width={140} 
              height={35}
              className="mb-6"
            />
            <p className="text-neutral-400 text-sm tracking-wide">
              Welcome back, <span className="text-white font-medium">{member.first_name || member.full_name?.split(' ')[0] || 'Member'}</span>
            </p>
          </motion.div>
        </div>

        {/* QR Card */}
        <div className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`relative overflow-hidden rounded-3xl p-8 shadow-2xl ${
            isGold 
              ? 'bg-gradient-to-br from-yellow-900/90 to-neutral-900 border border-yellow-500/30'
              : 'bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700'
          }`}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px' 
            }} />
          </div>

          <div className="relative">
            {/* Member Info */}
            <div className="mb-6">
              <p className="text-sm text-neutral-400 mb-1">Member</p>
              <h2 className="text-2xl font-bold text-white mb-1">
                {member.first_name} {member.last_name}
              </h2>
              <p className="text-sm text-neutral-400 font-mono">#{member.member_number}</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-6 rounded-2xl">
                <QRCodeSVG
                  value={member.id}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* Membership Badge */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                isGold 
                  ? 'bg-yellow-500/20 border border-yellow-500'
                  : 'bg-orange-500/20 border border-orange-500'
              }`}>
                {isGold && <Sparkles className="w-4 h-4 text-yellow-500" />}
                <span className={`text-sm font-semibold ${
                  isGold ? 'text-yellow-500' : 'text-orange-500'
                }`}>
                  {member.membership_type}
                </span>
              </div>
              <div className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-full flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-white">
                  {member.points} pts
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-neutral-400">
              <p>Present this code at any Negroni location</p>
              <p>to earn points and redeem benefits</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* View Menu Button */}
      <div className="px-6 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <button
            onClick={() => setShowMenuModal(true)}
            className="w-full py-4 rounded-2xl font-semibold transition flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
          >
            <UtensilsCrossed className="w-5 h-5" />
            View Menu
          </button>
          <p className="text-xs text-neutral-500 text-center mt-2">
            Browse our menus at all locations
          </p>
        </motion.div>
      </div>

      {/* Download Wallet Button */}
      <div className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Installed indicator */}
          {isPassInstalled && !checkingPass && (
            <div className="w-full mb-3 py-2 px-4 rounded-xl bg-green-600/10 border border-green-500/30 text-green-400 flex items-center justify-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4" />
              Pass installed on a device
            </div>
          )}
          
          <button
            onClick={handleDownload}
            disabled={downloading || (deviceType === 'android')}
            className={`w-full py-4 rounded-2xl font-semibold transition flex items-center justify-center gap-3 ${
              downloadStatus === 'success' 
                ? 'bg-green-600 border-2 border-green-500 text-white'
                : downloadStatus === 'error'
                ? 'bg-red-600 border-2 border-red-500 text-white'
                : deviceType === 'android'
                ? 'bg-neutral-800 border-2 border-neutral-700 text-neutral-500 cursor-not-allowed'
                : 'bg-neutral-800 border-2 border-neutral-700 text-white hover:border-orange-500 hover:bg-neutral-700'
            } ${downloading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Pass...
              </>
            ) : downloadStatus === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Pass Ready!
              </>
            ) : downloadStatus === 'error' ? (
              <>
                <AlertCircle className="w-5 h-5" />
                Error - Try Again
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {deviceType === 'ios' 
                  ? (isPassInstalled ? 'Reinstall in Apple Wallet' : 'Add to Apple Wallet')
                  : deviceType === 'android'
                  ? 'Google Wallet (Coming Soon)'
                  : 'Download Wallet Pass'}
              </>
            )}
          </button>
          <p className="text-xs text-neutral-500 text-center mt-3">
            {deviceType === 'ios' 
              ? 'Your pass will open in Apple Wallet automatically'
              : deviceType === 'android'
              ? 'Google Wallet support coming soon'
              : 'Download and open on a mobile device to add to Wallet'
            }
          </p>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-neutral-800 border border-neutral-700 rounded-2xl p-6"
        >
          <h3 className="font-bold text-white mb-4">How it works</h3>
          <div className="space-y-3 text-sm text-neutral-300">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <p>Show your QR code at checkout</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <p>Staff will scan your code</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              <p>Earn points and redeem benefits automatically</p>
            </div>
          </div>
        </motion.div>
      </div>
      </div>

      {/* Menu Modal */}
      <AnimatePresence>
        {showMenuModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-end sm:items-center sm:justify-center"
            onClick={() => setShowMenuModal(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.8 }}
              onDragEnd={(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setShowMenuModal(false)
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-neutral-900 rounded-t-3xl sm:rounded-2xl p-6 pb-10 sm:pb-6 max-h-[85vh] overflow-y-auto touch-none"
              style={{ touchAction: 'none' }}
            >
              {/* Drag Handle (mobile) */}
              <div className="w-12 h-1.5 bg-neutral-600 rounded-full mx-auto mb-6 sm:hidden cursor-grab active:cursor-grabbing" />
              
              {/* Close Button */}
              <button
                onClick={() => setShowMenuModal(false)}
                className="absolute top-4 right-4 p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition hidden sm:flex"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 border-2 border-orange-500/50 flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Our Menus</h2>
                  <p className="text-sm text-neutral-400">Select a location to view the menu</p>
                </div>
              </div>

              {/* Branches List */}
              <div className="space-y-3">
                {branches.length > 0 ? (
                  branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="p-4 bg-neutral-800/50 border border-neutral-700 rounded-xl"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white">{branch.name}</h3>
                          {(branch.address || branch.city) && (
                            <p className="text-sm text-neutral-400 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{branch.city || branch.address}</span>
                            </p>
                          )}
                        </div>
                        {branch.menu_url ? (
                          <a
                            href={branch.menu_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition text-sm flex-shrink-0"
                          >
                            View Menu
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-sm text-neutral-500 italic">Coming soon</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <UtensilsCrossed className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                    <p className="text-neutral-400">No locations available</p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowMenuModal(false)}
                className="w-full mt-6 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl font-semibold hover:bg-neutral-700 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
