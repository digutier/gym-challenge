# Guía de Implementación: Sistema de Auto-Actualización para PWA

## Problema
Cuando hago deploy de la PWA, los usuarios deben limpiar el cache de Safari manualmente para ver los cambios. Necesito un sistema que fuerce actualizaciones automáticamente sin intervención manual.

## Solución Recomendada
Implementar un sistema de versiones con Service Worker + detección automática de actualizaciones + UI amigable (banner de notificación).

---

## Paso 1: Service Worker con Sistema de Versiones

Crea o actualiza tu archivo `service-worker.js` en la raíz del proyecto:

```javascript
// service-worker.js
const CACHE_VERSION = 'v1.0.0'; // ⚠️ CAMBIA ESTO EN CADA DEPLOY
const CACHE_NAME = `gym-app-${CACHE_VERSION}`;

// Lista de archivos a cachear (ajusta según tu proyecto)
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  // Agrega aquí todos tus assets principales
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando nueva versión:', CACHE_VERSION);
  
  // Fuerza que el nuevo SW se active inmediatamente
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando archivos');
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
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Toma control de todas las páginas inmediatamente
      return self.clients.claim();
    })
  );
});

// Estrategia de fetch: Network First, luego Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la petición es exitosa, actualiza el cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si falla, intenta obtener del cache
        return caches.match(event.request);
      })
  );
});

// Escucha mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

---

## Paso 2: Sistema de Detección de Actualizaciones

Agrega este código en tu archivo JavaScript principal (por ejemplo `app.js` o `main.js`):

```javascript
// ====================
// SISTEMA DE ACTUALIZACIONES PWA
// ====================

let updateAvailable = false;

// Función para mostrar el banner de actualización
function showUpdateBanner() {
  // Previene mostrar múltiples banners
  if (document.getElementById('update-banner')) return;
  
  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.innerHTML = `
    <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 16px 24px; border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3); z-index: 9999;
                display: flex; align-items: center; gap: 12px; max-width: 90%;
                animation: slideUp 0.3s ease-out;">
      <span style="flex: 1; font-weight: 500;">🎉 Nueva versión disponible</span>
      <button id="update-btn" 
              style="background: white; color: #667eea; border: none;
                     padding: 10px 20px; border-radius: 10px; font-weight: bold;
                     cursor: pointer; font-size: 14px; transition: transform 0.2s;
                     box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
        Actualizar ahora
      </button>
    </div>
  `;
  
  // Agrega animación CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from {
        transform: translateX(-50%) translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
    #update-btn:hover {
      transform: scale(1.05);
    }
    #update-btn:active {
      transform: scale(0.95);
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(banner);
  
  // Event listener para el botón
  document.getElementById('update-btn').addEventListener('click', () => {
    window.location.reload();
  });
}

// Registra el Service Worker y configura detección de actualizaciones
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registrado:', registration);
        
        // Verifica actualizaciones cada 60 segundos
        setInterval(() => {
          registration.update();
        }, 60000);
        
        // Detecta cuando hay un nuevo service worker esperando
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[PWA] Nueva versión encontrada');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Hay una actualización disponible
                console.log('[PWA] Actualización lista para instalar');
                updateAvailable = true;
                showUpdateBanner();
              } else {
                // Primera instalación
                console.log('[PWA] Primera instalación completada');
              }
            }
          });
        });
        
        // Si ya hay una actualización esperando, muestra el banner
        if (registration.waiting) {
          updateAvailable = true;
          showUpdateBanner();
        }
      })
      .catch((error) => {
        console.error('[PWA] Error registrando Service Worker:', error);
      });
    
    // Recarga automática cuando el nuevo SW tome control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('[PWA] Nuevo Service Worker activado, recargando...');
        window.location.reload();
      }
    });
  });
}
```

---

## Paso 3: Botón Manual de Actualización (Opcional pero Recomendado)

Agrega un botón en tu configuración o menú para que los usuarios puedan forzar actualizaciones manualmente:

```javascript
// Función para forzar actualización manual
function forceAppUpdate() {
  console.log('[PWA] Forzando actualización manual...');
  
  if ('serviceWorker' in navigator) {
    // Desregistra todos los service workers
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      const unregisterPromises = registrations.map((registration) => {
        return registration.unregister();
      });
      
      return Promise.all(unregisterPromises);
    }).then(() => {
      // Limpia todos los caches
      return caches.keys();
    }).then((cacheNames) => {
      const deletePromises = cacheNames.map((cacheName) => {
        return caches.delete(cacheName);
      });
      
      return Promise.all(deletePromises);
    }).then(() => {
      console.log('[PWA] Limpieza completada, recargando...');
      // Espera un poco y recarga con hard refresh
      setTimeout(() => {
        window.location.reload(true);
      }, 100);
    }).catch((error) => {
      console.error('[PWA] Error durante actualización forzada:', error);
      // Intenta recargar de todas formas
      window.location.reload(true);
    });
  } else {
    // Si no hay service worker, solo recarga
    window.location.reload(true);
  }
}

// Ejemplo de implementación en HTML:
// <button onclick="forceAppUpdate()">🔄 Forzar Actualización</button>
```

---

## Paso 4: Actualizar manifest.json

Asegúrate de que tu `manifest.json` esté correctamente configurado:

```json
{
  "name": "Gym Tracker",
  "short_name": "Gym",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#5B21B6",
  "theme_color": "#5B21B6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## Paso 5: Cache Busting en HTML

Actualiza tu `index.html` para incluir meta tags que previenen cache excesivo:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Meta tags para controlar cache -->
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  
  <!-- PWA Meta Tags -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#5B21B6">
  
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/icon-192.png">
  
  <title>Gym Tracker</title>
  
  <!-- Tus estilos y scripts -->
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <!-- Tu contenido aquí -->
  
  <!-- Scripts al final del body -->
  <script src="/app.js"></script>
</body>
</html>
```

---

## Workflow de Deploy

### Cada vez que hagas un deploy:

1. **Incrementa la versión** en `service-worker.js`:
   ```javascript
   const CACHE_VERSION = 'v1.0.1'; // Era v1.0.0, ahora v1.0.1
   ```

2. **Haz deploy** de todos los archivos a tu servidor

3. **Prueba** en tu dispositivo iOS:
   - Abre la PWA
   - Espera 5-10 segundos
   - Debería aparecer el banner "Nueva versión disponible"
   - Click en "Actualizar ahora"
   - La app se recarga con los nuevos cambios ✅

---

## Debugging y Troubleshooting

### Para verificar que funciona correctamente:

1. **Abre Safari en iOS** → PWA
2. **Conecta el iPhone a tu Mac**
3. **Safari en Mac** → Develop → [Tu iPhone] → [Tu PWA]
4. **Abre Console** y busca logs como:
   ```
   [SW] Instalando nueva versión: v1.0.1
   [PWA] Nueva versión encontrada
   [PWA] Actualización lista para instalar
   ```

### Si no funciona:

```javascript
// Agrega esto temporalmente para debug
console.log('[DEBUG] Service Worker soportado:', 'serviceWorker' in navigator);
console.log('[DEBUG] Service Worker activo:', navigator.serviceWorker?.controller);
```

### Reseteo manual completo (solo para desarrollo):

1. Safari → Configuración → Avanzado → Datos de sitios web
2. Busca tu PWA y elimínala
3. Vuelve a agregar la PWA a la pantalla de inicio

---

## Notas Importantes

- ⚠️ **SIEMPRE cambia `CACHE_VERSION`** en cada deploy, sino los usuarios no verán cambios
- 📱 iOS puede tardar hasta 60 segundos en detectar la actualización
- 🔄 El banner solo aparece cuando hay una versión nueva instalada y lista
- 💾 Los datos del usuario (localStorage, indexedDB) NO se borran con las actualizaciones
- 🚀 Primera vez que implementes esto, algunos usuarios necesitarán limpiar cache manualmente UNA ÚLTIMA VEZ

---

## Versión Simplificada (Si tienes problemas)

Si la implementación completa da problemas, usa esta versión más simple:

```javascript
// En tu app.js
if ('serviceWorker' in navigator) {
  // Desregistra y limpia todo al cargar
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
  
  // Registra de nuevo
  navigator.serviceWorker.register('/service-worker.js');
}
```

Pero esto fuerza recarga en CADA visita, no es ideal para UX.

---

## Resultado Final

✅ Los usuarios reciben notificaciones automáticas de nuevas versiones  
✅ Un click actualiza la app sin limpiar cache manualmente  
✅ Los datos del usuario se mantienen intactos  
✅ Funciona en iOS Safari como PWA  
✅ Tienes control total sobre cuándo hacer updates (cambias la versión)

---

**¿Tienes dudas sobre algún paso? ¡Pregúntame!**