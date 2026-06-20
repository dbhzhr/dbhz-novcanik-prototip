import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const DISMISS_KEY = 'edw_install_dismissed';

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}
function isIOS() {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function isIOSSafari() {
  const ua = navigator.userAgent;
  return isIOS() && /safari/i.test(ua) && !/crios|fxios|edgios|opios/i.test(ua);
}

type BIP = Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> };

/** Banner za instalaciju PWA. Android/Chrome = native prompt; iOS = upute (Apple nema API). */
export function InstallPrompt() {
  const [bip, setBip] = useState<BIP | null>(() => (window as unknown as { __bip?: BIP }).__bip ?? null);
  const [show, setShow] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return;
    const onBip = () => setBip((window as unknown as { __bip?: BIP }).__bip ?? null);
    window.addEventListener('bip-ready', onBip);
    const t = setTimeout(() => setShow(true), 1500);
    return () => {
      window.removeEventListener('bip-ready', onBip);
      clearTimeout(t);
    };
  }, []);

  if (!show || isStandalone()) return null;

  const ios = isIOS();
  const canPrompt = !!bip;

  // Na ne-instalabilnim okruženjima bez iOS-a (npr. desktop Firefox) nema smisla.
  if (!canPrompt && !ios) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setShow(false);
  }

  async function install() {
    if (bip) {
      bip.prompt();
      try {
        await bip.userChoice;
      } catch {
        /* ignore */
      }
      (window as unknown as { __bip?: BIP }).__bip = undefined;
      setBip(null);
      setShow(false);
    } else if (ios) {
      setIosHelp((v) => !v);
    }
  }

  return createPortal(
    <div className="fixed inset-x-0 top-0 z-[80] px-3 pt-[max(0.6rem,env(safe-area-inset-top))]">
      <div className="mx-auto max-w-[460px] rounded-2xl bg-navy p-3 text-white shadow-card ring-1 ring-black/10 animate-riseIn">
        <div className="flex items-center gap-3">
          <img src="/icons/icon-192.png" alt="" className="h-10 w-10 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">Instaliraj kao aplikaciju</p>
            <p className="text-xs leading-snug text-white/70">Otvara se preko cijelog ekrana, bez adresne trake — kao prava app.</p>
          </div>
          <button onClick={install} className="shrink-0 rounded-pill bg-orange px-3.5 py-2 text-sm font-semibold text-white">
            {canPrompt ? 'Instaliraj' : 'Kako?'}
          </button>
          <button onClick={dismiss} aria-label="Odbaci" className="grid h-7 w-7 shrink-0 place-items-center rounded-pill text-white/60 hover:bg-white/10">✕</button>
        </div>

        {iosHelp && (
          <div className="mt-3 rounded-xl bg-white/10 p-3 text-xs leading-relaxed text-white/90">
            {isIOSSafari() ? (
              <p>
                U <b>Safariju</b>: tapni <span className="inline-flex items-center gap-1">Podijeli
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline"><path d="M12 16V4M8 8l4-4 4 4M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7" /></svg>
                </span> → <b>Dodaj na početni zaslon</b> → <b>Dodaj</b>.
              </p>
            ) : (
              <p>Na iPhoneu instalacija ide samo iz <b>Safarija</b>: otvori ovu stranicu u Safariju, pa Podijeli → <b>Dodaj na početni zaslon</b>.</p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
