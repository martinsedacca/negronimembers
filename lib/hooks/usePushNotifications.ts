import { useState, useEffect } from 'react'

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const subscribe = async (memberId?: string) => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported in this browser')
    }

    setIsLoading(true)

    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Register service worker if not registered
      let registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready
      }

      // Subscribe to push notifications
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!publicKey) {
        throw new Error('VAPID public key not configured')
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          member_id: memberId,
          user_agent: navigator.userAgent,
          device_name: getDeviceName(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to register subscription on server')
      }

      setIsSubscribed(true)
      console.log('✅ Push notification subscription successful')
      
      return { success: true }
    } catch (error: any) {
      console.error('❌ Push notification subscription failed:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from server
        await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: 'DELETE',
        })

        // Unsubscribe from browser
        await subscription.unsubscribe()
      }

      setIsSubscribed(false)
      console.log('✅ Push notification unsubscribed')
      
      return { success: true }
    } catch (error: any) {
      console.error('❌ Push notification unsubscribe failed:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Helper function to get device name
function getDeviceName(): string {
  const ua = navigator.userAgent
  if (/mobile/i.test(ua)) return 'Mobile Device'
  if (/iPad|Android|Touch/i.test(ua)) return 'Tablet'
  return 'Desktop'
}
