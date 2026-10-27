/* ==========================================================================
   Service Worker — Sistema de Control de Asistencia PWA
   Autor: Antonio Soto
   ========================================================================== */

const CACHE_NAME = 'control-asistencia-cache-v3';

// Recursos esenciales para la concha de la aplicación (App Shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/logo/sigma-lOGO-192.png',
  '/logo/SIGMA-Logo-512.png',
  '/logo/sigma-lOGO-192.ico',
  '/logo/SIGMA-Logo-512.ico'
];

// Instalación: Precarga de la App Shell y activación inmediata
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpieza de versiones obsoletas de caché y reclamar clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de peticiones (Fetch)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Peticiones a la API REST (locales o remotas): No interceptar en SW para que el navegador las envíe directamente
  if (
    url.pathname.startsWith('/api') ||
    url.hostname.includes('cortedelsanta.com') ||
    url.hostname.includes('127.0.0.1') ||
    url.port === '9000'
  ) {
    return;
  }

  // 2. Navegación HTML (SPA React Router): Network-First con fallback a /index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // 3. Recursos estáticos (JS, CSS, imágenes, fuentes): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic' &&
            request.method === 'GET'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
