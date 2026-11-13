/* JAR My Expense Ledger — Service Worker */
var CACHE = 'mel-v2.12.7';
var APP_URL = '/';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.add(APP_URL); }).catch(function() {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);

  // Other sites (Firebase, Google sign-in, CDNs): never touch them. The browser handles them directly.
  if (url.origin !== self.location.origin) return;

  // Update checks and any URL with a query string: always straight from the network.
  if (url.search) return;

  // The app page: show the cached copy instantly, refresh it in the background.
  if (url.pathname === '/' || url.pathname.endsWith('index.html')) {
    e.respondWith(
      caches.open(CACHE).then(function(cache) {
        return cache.match(APP_URL).then(function(cached) {
          var fresh = fetch(e.request).then(function(resp) {
            if (resp && resp.status === 200) cache.put(APP_URL, resp.clone());
            return resp;
          });
          if (cached) { fresh.catch(function() {}); return cached; }
          return fresh;
        });
      })
    );
    return;
  }

  // Other files from the app's own site (icons, manifest, sw itself): network first, cache if offline.
  e.respondWith(
    fetch(e.request).catch(function() { return caches.match(e.request); })
  );
});

self.addEventListener('message', function(e) {
  if (e.data === 'CHECK_UPDATE') {
    fetch('/?_bust=' + Date.now(), { cache: 'no-store' })
      .then(function(resp) { return resp.text(); })
      .then(function(html) {
        var m = html.match(/var APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
        e.source.postMessage({ type: 'UPDATE_STATUS', version: m ? m[1] : null });
      })
      .catch(function() {});
  }
});