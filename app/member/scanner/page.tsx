'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera, X, ExternalLink, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '../context/MemberContext'

export default function ScannerPage() {
  const router = useRouter()
  const { loading: authLoading } = useRequireAuth()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Start camera
  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setHasPermission(true)
        setScanning(true)
      }
    } catch (err: any) {
      console.error('Camera error:', err)
      setHasPermission(false)
      setError('No se pudo acceder a la cámara. Por favor, permite el acceso.')
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }

  // Scan for QR codes using BarcodeDetector API (native browser API)
  useEffect(() => {
    if (!scanning || !videoRef.current) return

    let animationId: number
    
    const detectQR = async () => {
      if (!videoRef.current || !canvasRef.current) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationId = requestAnimationFrame(detectQR)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      // Try using BarcodeDetector API if available
      if ('BarcodeDetector' in window) {
        try {
          // @ts-ignore - BarcodeDetector is not in TS types yet
          const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] })
          const barcodes = await barcodeDetector.detect(canvas)
          
          if (barcodes.length > 0) {
            setResult(barcodes[0].rawValue)
            stopCamera()
            return
          }
        } catch (err) {
          // Fallback - keep scanning
        }
      }

      animationId = requestAnimationFrame(detectQR)
    }

    // Start detection loop
    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(detectQR)
    }, 500)

    return () => {
      clearTimeout(timeoutId)
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [scanning])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera()
  }, [])

  // Handle result
  const handleResult = () => {
    if (!result) return
    
    // If it's a URL, open it
    if (result.startsWith('http://') || result.startsWith('https://')) {
      window.open(result, '_blank')
    }
    
    setResult(null)
    startCamera()
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <button
          onClick={() => {
            stopCamera()
            router.back()
          }}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Camera View */}
      <div className="relative w-full h-screen flex items-center justify-center">
        {!scanning && !result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center">
              <Camera className="w-12 h-12 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Scanner QR</h1>
            <p className="text-neutral-400 mb-6">
              Escanea códigos QR para ver menús, promociones y más
            </p>
            
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            
            <button
              onClick={startCamera}
              className="px-8 py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition flex items-center gap-2 mx-auto"
            >
              <Camera className="w-5 h-5" />
              Iniciar Cámara
            </button>
          </motion.div>
        )}

        {scanning && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Dark overlay with hole */}
              <div className="absolute inset-0 bg-black/60" />
              
              {/* Scan frame */}
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 border-2 border-white/30 rounded-2xl" />
                
                {/* Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-xl" />
                
                {/* Scanning line animation */}
                <motion.div
                  className="absolute left-2 right-2 h-0.5 bg-orange-500"
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>
            
            {/* Instructions */}
            <div className="absolute bottom-32 left-0 right-0 text-center">
              <p className="text-white text-lg font-medium">
                Apunta al código QR
              </p>
              <p className="text-neutral-400 text-sm mt-1">
                El escaneo es automático
              </p>
            </div>
            
            {/* Cancel button */}
            <button
              onClick={() => {
                stopCamera()
              }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur text-white rounded-xl font-semibold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
          </>
        )}

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
              <span className="text-5xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡QR Detectado!</h2>
            
            <div className="bg-neutral-800 rounded-xl p-4 mb-6 max-w-sm mx-auto">
              <p className="text-neutral-400 text-xs mb-1">Contenido:</p>
              <p className="text-white text-sm break-all">{result}</p>
            </div>
            
            <div className="flex gap-3 justify-center">
              {(result.startsWith('http://') || result.startsWith('https://')) && (
                <button
                  onClick={handleResult}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition flex items-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Abrir Link
                </button>
              )}
              <button
                onClick={() => {
                  setResult(null)
                  startCamera()
                }}
                className="px-6 py-3 bg-neutral-800 text-white rounded-xl font-semibold hover:bg-neutral-700 transition"
              >
                Escanear Otro
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
