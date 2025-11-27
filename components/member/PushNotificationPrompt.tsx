'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'

interface PushNotificationPromptProps {
  memberId?: string
}

export function PushNotificationPrompt({ memberId }: PushNotificationPromptProps) {
  const { isSupported, permission, isSubscribed, isLoading, subscribe } = usePushNotifications()
  const [dismissed, setDismissed] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    console.log('🔔 [PushPrompt] Checking conditions:', {
      isSupported,
      permission,
      isSubscribed,
    })

    // Check if user has already dismissed the prompt
    const dismissedUntil = localStorage.getItem('push_prompt_dismissed')
    if (dismissedUntil) {
      const dismissedDate = new Date(dismissedUntil)
      if (dismissedDate > new Date()) {
        console.log('🔔 [PushPrompt] Dismissed until:', dismissedDate)
        setDismissed(true)
        return
      }
    }

    // Show prompt after a short delay if:
    // - Browser supports push
    // - Permission not yet granted
    // - Not already subscribed
    const timer = setTimeout(() => {
      console.log('🔔 [PushPrompt] Timer fired, checking:', {
        isSupported,
        permission,
        isSubscribed,
        shouldShow: isSupported && permission === 'default' && !isSubscribed
      })
      // Show if supported AND not subscribed AND (permission is default OR granted but not registered)
      if (isSupported && !isSubscribed && permission !== 'denied') {
        console.log('🔔 [PushPrompt] ✅ Showing prompt!')
        setShowPrompt(true)
      } else {
        console.log('🔔 [PushPrompt] ❌ Not showing prompt because:', {
          notSupported: !isSupported,
          permissionDenied: permission === 'denied',
          alreadySubscribed: isSubscribed
        })
      }
    }, 3000) // Show after 3 seconds

    return () => clearTimeout(timer)
  }, [isSupported, permission, isSubscribed])

  const handleSubscribe = async () => {
    console.log('🔔 [PushPrompt] Subscribing with memberId:', memberId)
    const result = await subscribe(memberId)
    console.log('🔔 [PushPrompt] Subscribe result:', result)
    if (result.success) {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    // Dismiss for 7 days
    const dismissUntil = new Date()
    dismissUntil.setDate(dismissUntil.getDate() + 7)
    localStorage.setItem('push_prompt_dismissed', dismissUntil.toISOString())
    setDismissed(true)
    setShowPrompt(false)
  }

  if (!showPrompt || dismissed || isSubscribed || permission === 'denied') {
    return null
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[60] animate-slide-up">
      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-4 shadow-2xl">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-brand-500/20 rounded-xl">
            <Bell className="w-6 h-6 text-brand-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm">
              Activar Notificaciones
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Recibe alertas de promociones exclusivas, puntos y beneficios directamente en tu dispositivo.
            </p>
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Activando...' : 'Activar'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 text-sm rounded-lg transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
