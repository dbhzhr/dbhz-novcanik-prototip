import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X } from './icons';

// Banner „Nova verzija je spremna” (port iz DOMOVINA Walleta, prilagođen našem
// ručnom `public/sw.js` bez vite-plugin-pwa). Tok:
//   main.tsx registrira SW → otkrije worker u stanju `waiting` → announceUpdate(worker)
//   → banner → „Ažuriraj” → postMessage({type:'SKIP_WAITING'}) → novi SW preuzme
//   (controllerchange) → main.tsx jednom reloada (samo ako je korisnik tražio ažuriranje).

let waitingWorker: ServiceWorker | null = null;
let updateRequested = false;
const listeners = new Set<(w: ServiceWorker | null) => void>();

/** Poziva main.tsx kad nova verzija čeka (registration.waiting uz postojeći controller). */
export function announceUpdate(worker: ServiceWorker) {
  waitingWorker = worker;
  listeners.forEach((fn) => fn(worker));
}

/** Je li korisnik tapnuo „Ažuriraj” — samo tada controllerchange smije reloadati (nema petlji). */
export function isUpdateRequested() {
  return updateRequested;
}

export function UpdateBanner() {
  const [worker, setWorker] = useState<ServiceWorker | null>(waitingWorker);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fn = (w: ServiceWorker | null) => {
      setWorker(w);
      setDismissed(false); // novija verzija → ponovno ponudi
    };
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  if (!worker || dismissed) return null;

  function applyUpdate() {
    updateRequested = true;
    // Ako je worker u međuvremenu nestao (brzi uzastopni deployevi), nema što preskočiti
    // i controllerchange nikad ne stiže → rezervni reload da korisnik ne zapne na banneru.
    if (worker && worker.state === 'installed') worker.postMessage({ type: 'SKIP_WAITING' });
    setTimeout(() => window.location.reload(), 2500);
  }

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[5.25rem] z-[85] px-3 md:bottom-6"
    >
      <div className="pointer-events-auto mx-auto flex max-w-[460px] items-center gap-3 rounded-2xl bg-hero p-3 text-white shadow-card ring-1 ring-black/10 animate-riseIn">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15" aria-hidden>
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">Nova verzija je spremna</p>
          <p className="text-xs leading-snug text-white/70">Ažuriraj da je primijeniš — traje sekundu.</p>
        </div>
        <button
          onClick={applyUpdate}
          className="shrink-0 rounded-pill bg-orange px-3.5 py-2 text-sm font-semibold text-on-gold"
        >
          Ažuriraj
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Odgodi ažuriranje"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-pill text-white/75 hover:bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>,
    document.body,
  );
}
