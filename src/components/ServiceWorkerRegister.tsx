'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, X } from 'lucide-react';

export default function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const applyUpdate = useCallback(() => {
    if (registration?.waiting) {
      // Envía mensaje al SW en espera para que se active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    // Recarga la página para obtener la nueva versión
    window.location.reload();
  }, [registration]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Worker no soportado');
      return;
    }

    let refreshing = false;

    // Registra el Service Worker
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registrado:', reg.scope);
        setRegistration(reg);

        // Verifica actualizaciones cada 60 segundos
        const intervalId = setInterval(() => {
          reg.update().catch((err) => {
            console.log('[PWA] Error verificando actualizaciones:', err);
          });
        }, 60000);

        // Si ya hay un SW esperando, hay actualización disponible
        if (reg.waiting) {
          console.log('[PWA] Actualización encontrada (waiting)');
          setUpdateAvailable(true);
        }

        // Detecta cuando hay un nuevo service worker instalándose
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          console.log('[PWA] Nueva versión encontrada (installing)');

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Hay una actualización lista
                  console.log('[PWA] Actualización lista para instalar');
                  setUpdateAvailable(true);
                } else {
                  // Primera instalación
                  console.log('[PWA] Primera instalación completada');
                }
              }
            });
          }
        });

        return () => clearInterval(intervalId);
      })
      .catch((error) => {
        console.error('[PWA] Error registrando Service Worker:', error);
      });

    // Recarga automática cuando el nuevo SW tome control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('[PWA] Nuevo Service Worker activo, recargando...');
        window.location.reload();
      }
    });
  }, []);

  // No renderizar nada si no hay actualización
  if (!updateAvailable) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999]
                 bg-gradient-to-r from-violet-600 to-purple-600
                 text-white px-5 py-4 rounded-2xl shadow-2xl
                 flex items-center gap-3 max-w-[90%] w-auto
                 animate-slide-up"
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">🎉 Nueva versión disponible</p>
        <p className="text-white/70 text-xs">Actualiza para ver los últimos cambios</p>
      </div>
      
      <button
        onClick={applyUpdate}
        className="flex items-center gap-2 bg-white text-purple-600 
                   px-4 py-2 rounded-xl font-bold text-sm
                   hover:scale-105 active:scale-95 transition-transform
                   shadow-lg flex-shrink-0"
      >
        <RefreshCw className="w-4 h-4" />
        Actualizar
      </button>
      
      <button
        onClick={() => setUpdateAvailable(false)}
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                   hover:bg-white/20 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
