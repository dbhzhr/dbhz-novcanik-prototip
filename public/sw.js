// Minimalni service worker — čini prototip instalabilnim (PWA) i daje
// offline app-shell. Network-first za navigaciju (offline → keširani shell),
// cache-first za statične resurse s vlastitog origina. API se NIKAD ne kešira.
const CACHE = 'dbhz-novcanik-v7';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/emblem.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Tuđi origini (Google Fonts…) i API idu mimo SW-a — HTTP keš preglednika je dovoljan,
  // a komentari moraju uvijek biti svježi.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  // SPA navigacije → offline fallback na app-shell
  if (request.mode === 'navigate') {
    e.respondWith(fetch(request).catch(() => caches.match('/index.html')));
    return;
  }
  e.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((res) => {
          // Keširaj samo uspješne, potpune odgovore (ne 404/500 ni djelomične 206)
          if (res.ok && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        }),
    ),
  );
});
