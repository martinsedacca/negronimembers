'use client'

import { Bell, BellOff, Loader2 } from 'lucide-react'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'

export default function PushNotificationButton() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications()

  if (!isSupported) {
    return null // Don't show button if not supported
  }

  const handleClick = async () => {
    if (isSubscribed) {
      const result = await unsubscribe()
      if (result.success) {
        alert('✅ Notificaciones desactivadas')
      }
    } else {
      const result = await subscribe()
      if (result.success) {
        alert('✅ Notificaciones activadas\n\nRecibirás alertas de promociones y actualizaciones.')
      } else {
        alert('❌ Error al activar notificaciones\n\n' + result.error)
      }
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || permission === 'denied'}
      className="relative p-2 text-neutral-400 hover:text-white transition disabled:opacity-50"
      title={isSubscribed ? 'Desactivar notificaciones' : 'Activar notificaciones'}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isSubscribed ? (
        <>
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
        </>
      ) : (
        <BellOff className="w-5 h-5" />
      )}
    </button>
  )
}
