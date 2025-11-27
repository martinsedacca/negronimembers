// Service Worker for Push Notifications + Offline QR Cache
const CACHE_VERSION = 'negroni-v1';
const CRITICAL_CACHE = 'negroni-critical';
const QR_CACHE = 'negroni-qr';

// URLs críticas para cachear (solo QR y datos básicos del usuario)
const CACHE_URLS = [
  '/member/pass', // Pantalla del pass
];

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CRITICAL_CACHE)
      .then((cache) => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activar y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CRITICAL_CACHE && name !== QR_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de caché: Network First para datos frescos, Cache para offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cachear QR codes generados
  if (url.pathname.includes('/api/qr') || url.pathname.includes('qrcode')) {
    event.respondWith(
      caches.open(QR_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            cache.put(request, response.clone());
            return response;
          })
          .catch(() => cache.match(request))
      })
    );
    return;
  }

  // Network first para datos del usuario (siempre frescos, fallback a cache)
  if (url.pathname.includes('/api/member') || url.pathname.includes('/member/pass')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Solo cachear respuestas exitosas
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CRITICAL_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Si no hay internet, servir desde cache
          return caches.match(request).then((cached) => {
            return cached || new Response('Offline - No cached data', { status: 503 });
          });
        })
    );
    return;
  }

  // Para todo lo demás, network only (beneficios, historial, etc.)
  event.respondWith(fetch(request));
});

// Push Notifications
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
