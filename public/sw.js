// ⚠️ IMPORTANTE: Cambia CACHE_VERSION en cada deploy para forzar actualizaciones
const CACHE_VERSION = 'v1.3.0';
const CACHE_NAME = `gym-challenge-${CACHE_VERSION}`;

// Archivos esenciales a cachear
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando nueva versión:', CACHE_VERSION);
  
  // Fuerza que el nuevo SW se active inmediatamente
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando archivos esenciales');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando nueva versión:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Elimina caches de versiones antiguas
          if (cacheName !== CACHE_NAME && cacheName.startsWith('gym-challenge-')) {
            console.log('[SW] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Toma control de todas las páginas inmediatamente
      console.log('[SW] Tomando control de clientes');
      return self.clients.claim();
    })
  );
});

// Estrategia de fetch: Network First para HTML/API, Cache First para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar peticiones GET
  if (request.method !== 'GET') {
    return;
  }
  
  // No cachear API requests - siempre ir a la red
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  // Para navegación y HTML: Network First
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Actualiza el cache con la respuesta fresca
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Si falla la red, intenta el cache
          return caches.match(request);
        })
    );
    return;
  }
  
  // Para assets estáticos: Cache First con Network Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Actualiza el cache en segundo plano (stale-while-revalidate)
        fetch(request).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response);
            });
          }
        }).catch(() => {});
        
        return cachedResponse;
      }
      
      // Si no está en cache, fetch y cachear
      return fetch(request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      });
    })
  );
});

// Escucha mensajes del cliente para forzar actualización
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Recibido SKIP_WAITING, activando inmediatamente');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// Manejar notificaciones push (para futuro)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || '¡Es hora de ir al gym!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'open', title: 'Abrir app' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Gym Challenge', options)
  );
});

// Manejar click en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
