// Minimalni service worker — čini prototip instalabilnim (PWA) i daje
// offline app-shell. Network-first za navigaciju (offline → keširani shell),
// cache-first za statične resurse s vlastitog origina. API se NIKAD ne kešira.
//
// Ažuriranje (UpdateBanner): prva instalacija se aktivira odmah; NOVA verzija
// (kad već postoji aktivni worker) ČEKA u stanju `waiting` dok korisnik u banneru
// ne tapne „Ažuriraj” → stranica pošalje {type:'SKIP_WAITING'} → skipWaiting() →
// controllerchange → reload. Tako se usred rada ne mijenja shell ispod korisnika.
const CACHE = 'dbhz-novcanik-v8';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/emblem.png'];

self.addEventListener('install', (e) => {
  // Prva instalacija (nema aktivnog workera) → odmah aktiviraj; inače čekaj korisnika.
  const firstInstall = !self.registration.active;
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => (firstInstall ? self.skipWaiting() : undefined)),
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
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
          // i nikad HTML za ne-navigacijski zahtjev: CF Pages za nepostojeći asset vraća
          // index.html (200, text/html) — takav odgovor u kešu bi trajno slomio app.
          const isHtml = (res.headers.get('content-type') || '').includes('text/html');
          if (res.ok && res.status === 200 && res.type === 'basic' && !isHtml) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        }),
    ),
  );
});
