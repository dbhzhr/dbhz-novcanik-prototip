import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import { InstallPrompt } from './components/InstallPrompt';
import { UpdateBanner, announceUpdate, isUpdateRequested } from './components/UpdateBanner';

// Rano uhvati beforeinstallprompt (Android/Chrome) — može pући prije nego React montira.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as unknown as { __bip?: Event }).__bip = e;
  window.dispatchEvent(new Event('bip-ready'));
});
window.addEventListener('appinstalled', () => {
  (window as unknown as { __bip?: Event }).__bip = undefined;
  window.dispatchEvent(new Event('bip-ready'));
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <InstallPrompt />
    <UpdateBanner />
  </React.StrictMode>,
);

// Ukloni inline splash (standalone PWA) nakon prvog paint-a React appa.
requestAnimationFrame(() => {
  requestAnimationFrame(() => document.getElementById('ios-splash')?.remove());
});

// Registriraj service worker (PWA instalabilnost + offline app-shell) i prati nove verzije.
// Nova verzija SW-a čeka (`waiting`) dok korisnik u UpdateBanneru ne tapne „Ažuriraj”.
const UPDATE_CHECK_MS = 30 * 60 * 1000; // periodička provjera; u standalone PWA navigacija je rijetka

function watchForUpdates(reg: ServiceWorkerRegistration) {
  // Već čeka (npr. deploy dok je tab bio otvoren pa reload) — ali samo ako postoji controller,
  // inače je to prva instalacija, a ona se ionako aktivira sama.
  if (reg.waiting && navigator.serviceWorker.controller) announceUpdate(reg.waiting);

  reg.addEventListener('updatefound', () => {
    const next = reg.installing;
    if (!next) return;
    next.addEventListener('statechange', () => {
      if (next.state === 'installed' && navigator.serviceWorker.controller) announceUpdate(next);
    });
  });

  const check = () => {
    if (reg.installing || !navigator.onLine) return;
    reg.update().catch(() => {});
  };
  setInterval(check, UPDATE_CHECK_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check();
  });
}

if ('serviceWorker' in navigator) {
  // Reload tek kad je korisnik tražio ažuriranje — prva instalacija (clients.claim) također
  // okida controllerchange, a on NE smije reloadati. `reloading` štiti od dvostrukog reloada.
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading || !isUpdateRequested()) return;
    reloading = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(watchForUpdates)
      .catch(() => {});
  });
}
