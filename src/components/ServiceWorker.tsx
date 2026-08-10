'use client';

import { useEffect } from 'react';

/** Registra el service worker: sin él iOS/Android no ofrecen instalar la PWA. */
export function ServiceWorker() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* sin SW la app sigue funcionando online */
    });
  }, []);

  return null;
}
