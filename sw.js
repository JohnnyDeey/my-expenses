// My Finance Ledger — Service Worker
const CACHE_NAME = 'finance-ledger-v1';
const ASSETS = [
  '/my-expenses/',
  '/my-expenses/index.html'
];

// Install: cache the app shell
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key){ return key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fall back to cache
self.addEventListener('fetch', function(event) {
  // Skip Firebase and non-GET requests
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis') ||
      event.request.url.includes('firestore')) return;

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Cache fresh copy of our app pages
        if (response.ok && event.request.url.includes('/my-expenses/')) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(function() {
        // Offline: serve from cache
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match('/my-expenses/index.html');
        });
      })
  );
});
