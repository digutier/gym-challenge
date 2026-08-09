'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { serviceWorkerRegister as styles } from './ServiceWorkerRegister.styles';

export default function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const applyUpdate = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }, [registration]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Worker no soportado');
      return;
    }

    let refreshing = false;

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registrado:', reg.scope);
        setRegistration(reg);

        const intervalId = setInterval(() => {
          reg.update().catch((err) => {
            console.log('[PWA] Error verificando actualizaciones:', err);
          });
        }, 60000);

        if (reg.waiting) {
          console.log('[PWA] Actualización encontrada (waiting)');
          setUpdateAvailable(true);
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          console.log('[PWA] Nueva versión encontrada (installing)');

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[PWA] Actualización lista para instalar');
                  setUpdateAvailable(true);
                } else {
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

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('[PWA] Nuevo Service Worker activo, recargando...');
        window.location.reload();
      }
    });
  }, []);

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className={styles.toast}>
      <div className={styles.textWrap}>
        <p className={styles.title}>🎉 Nueva versión disponible</p>
        <p className={styles.subtitle}>Actualiza para ver los últimos cambios</p>
      </div>

      <Button
        onClick={applyUpdate}
        className={styles.updateButton}
      >
        <RefreshCw className="w-4 h-4" />
        Actualizar
      </Button>

      <Button
        onClick={() => setUpdateAvailable(false)}
        className={styles.dismissButton}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
