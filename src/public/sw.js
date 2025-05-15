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
  '/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets');
      // Gunakan Promise.all untuk menangani kegagalan cache individual
      return Promise.allSettled(
        STATIC_ASSETS.map(url => 
          cache.add(url).catch(error => {
            console.warn(`Failed to cache ${url}: ${error.message}`);
            return null; // Lanjutkan meskipun ada error
          })
        )
      );
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

  // Tidak perlu handle fetch untuk requests dari CDN atau pihak ketiga
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handler fetch untuk semua asset
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      
      return fetch(event.request)
        .then((response) => {
          // Hanya cache response yang valid
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone response untuk disimpan ke cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch(error => {
              console.warn('Failed to cache response:', error);
            });

          return response;
        })
        .catch((error) => {
          console.error('Fetch failed:', error);
          
          // Jika request adalah untuk dokumen HTML, kembalikan index.html
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          
          // Jika request untuk gambar, kembalikan fallback gambar jika ada
          if (event.request.destination === 'image') {
            return caches.match('/favicon.png');
          }
          
          // Jika tidak ada handler khusus, lempar error kembali
          throw error;
        });
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