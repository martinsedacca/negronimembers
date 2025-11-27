'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import { Download, Sparkles, Award, Loader2, CheckCircle, AlertCircle, ScanLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white mb-2">Your Digital Card</h1>
          <p className="text-neutral-400">Scan this QR code at checkout</p>
        </motion.div>
      </div>

      {/* QR Card */}
      <div className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`relative overflow-hidden rounded-3xl p-8 ${
            isGold 
              ? 'bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border-2 border-yellow-500/50'
              : 'bg-gradient-to-br from-orange-900/30 to-orange-800/30 border-2 border-orange-500/50'
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

      {/* Scanner Button */}
      <div className="px-6 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Link
            href="/member/scanner"
            className="w-full py-4 rounded-2xl font-semibold transition flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
          >
            <ScanLine className="w-5 h-5" />
            Escanear QR
          </Link>
          <p className="text-xs text-neutral-500 text-center mt-2">
            Escanea códigos QR de menús y promociones
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
  )
}
