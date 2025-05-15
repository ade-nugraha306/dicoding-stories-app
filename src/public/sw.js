importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js'
);

if (typeof workbox !== 'undefined') {
  console.log('Workbox berhasil dimuat!');
  
  const { registerRoute } = workbox.routing;
  const { StaleWhileRevalidate } = workbox.strategies;

  registerRoute(
    ({ request, url }) => {
      const baseUrl = new URL('https://story-api.dicoding.dev/v1');
      return baseUrl.origin === url.origin && request.destination === 'image';
    },
    new StaleWhileRevalidate({
      cacheName: 'story-api-images'
    })
  );
} else {
  console.log('Workbox gagal dimuat!');
}

const CACHE_NAME = 'stories-app-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/scripts/index.js',
  '/styles/styles.css',
  '/fallback-image.png',
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet/dist/leaflet.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Handler khusus untuk gambar
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            // Cache SEMUA gambar, baik dari origin sendiri maupun eksternal
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        }).catch(() => {
          // Fallback image jika offline dan gambar belum pernah di-cache
          return caches.match('/fallback-image.png');
        });
      })
    );
    return;
  }

  // Handler fetch lain (HTML, JS, CSS, dsb)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          if (event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        }).catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        })
      );
    })
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'Default title', options: { body: 'Default body' } };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Push event data error:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, data.options)
  );
});