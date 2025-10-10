// Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push received:', event)
  
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    console.error('[Service Worker] Error parsing push data:', e)
    data = { title: 'Nueva notificación', body: 'Tienes una nueva notificación' }
  }

  const title = data.title || 'Membership System'
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    data: {
      url: data.url || '/',
      ...data.data
    },
    vibrate: [200, 100, 200],
    actions: data.url ? [
      { action: 'open', title: 'Ver' },
      { action: 'close', title: 'Cerrar' }
    ] : []
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification clicked:', event)
  
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

self.addEventListener('notificationclose', function(event) {
  console.log('[Service Worker] Notification closed:', event)
})
