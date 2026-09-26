import { useEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Button, Eyebrow, FeatureRow, Fingerprint, ThemeToggle } from '../components/ui';
import {
  ChevronLeft,
  CircleCheck,
  FingerprintIcon,
  KeyRound,
  LogIn,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
  Wallet,
} from '../components/icons';
import { account } from '../lib/mock';
import { navigate } from '../lib/router';

// Onboarding (MOCK) — prati tok funkcionalnog DOMOVINA Walleta (user-flows.md §1,
// passkey-onboarding.md): passkey = identitet, Safe = račun. Nema pravog WebAuthn-a:
// „sustavski prozor” je simulacija s kratkim kašnjenjem.
//   welcome → passkey (create) → created → onEnter()
//   welcome → signin (get, „Već imam novčanik”) → onEnter()

type Step = 'welcome' | 'passkey' | 'created' | 'signin';
type Ceremony = 'create' | 'get';

const MOCK_DELAY_MS = 1600;

export function Onboarding({ onEnter }: { onEnter: () => void }) {
  const [step, setStep] = useState<Step>('welcome');
  const [ceremony, setCeremony] = useState<Ceremony | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Fokus na naslov novog koraka (čitači ekrana najave korak); ne na prvom renderu.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, signedIn]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (s: Step) => {
    setCancelled(false);
    setSignedIn(false);
    setStep(s);
  };

  function startCeremony(kind: Ceremony) {
    setCancelled(false);
    setCeremony(kind);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCeremony(null);
      if (kind === 'create') go('created');
      else setSignedIn(true);
    }, MOCK_DELAY_MS);
  }

  function cancelCeremony() {
    clearTimeout(timer.current);
    setCeremony(null);
    setCancelled(true);
  }

  const flow = step === 'signin' ? { index: 2, total: 2 } : { index: { welcome: 1, passkey: 2, created: 3 }[step], total: 3 };

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint size={26} />
            <div className="flex items-center gap-1.5">
              <div className="grid h-7 w-7 place-items-center rounded-xl bg-hero p-1">
                <img src="/emblem.png" alt="Grb Družbe Braća Hrvatskoga Zmaja" className="h-full w-full object-contain" />
              </div>
              <span className="text-sm font-bold tracking-tight text-navy">DBHZ</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {step !== 'welcome' && (
              <button
                onClick={onEnter}
                className="rounded-pill px-3 py-2 text-xs font-semibold text-muted transition hover:text-orange"
              >
                Preskoči (demo)
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>

        <StepIndicator index={flow.index} total={flow.total} />

        <div key={step} className="flex flex-1 flex-col animate-riseIn">
          {step === 'welcome' && (
            <Welcome headingRef={headingRef} onCreate={() => go('passkey')} onSignIn={() => go('signin')} />
          )}
          {step === 'passkey' && (
            <PasskeyStep
              headingRef={headingRef}
              cancelled={cancelled}
              busy={ceremony !== null}
              onBack={() => go('welcome')}
              onCreate={() => startCeremony('create')}
            />
          )}
          {step === 'created' && <CreatedStep headingRef={headingRef} onEnter={onEnter} />}
          {step === 'signin' && (
            <SignInStep
              headingRef={headingRef}
              cancelled={cancelled}
              busy={ceremony !== null}
              signedIn={signedIn}
              onBack={() => go('welcome')}
              onSignIn={() => startCeremony('get')}
              onEnter={onEnter}
            />
          )}
        </div>
      </div>

      {ceremony && <SystemPrompt kind={ceremony} onCancel={cancelCeremony} />}
    </div>
  );
}

// ── Dijelovi ────────────────────────────────────────────────────────────────

type HeadingRef = RefObject<HTMLHeadingElement>;

function StepIndicator({ index, total }: { index: number; total: number }) {
  return (
    <div className="mt-5 flex items-center gap-3" aria-label={`Korak ${index} od ${total}`} role="group">
      <div className="flex flex-1 gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-pill ${i < index ? 'bg-orange' : 'bg-navy/10'}`} />
        ))}
      </div>
      <span className="text-xs font-semibold text-muted" aria-hidden>
        {index}/{total}
      </span>
    </div>
  );
}

function Heading({ headingRef, children, className = '' }: { headingRef: HeadingRef; children: ReactNode; className?: string }) {
  return (
    <h1 ref={headingRef} tabIndex={-1} className={`outline-none ${className}`}>
      {children}
    </h1>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="-ml-2 mt-4 inline-flex items-center gap-1 self-start rounded-pill px-2 py-2 text-sm font-semibold text-navy-mid transition hover:text-orange"
    >
      <ChevronLeft className="h-4 w-4" aria-hidden /> Natrag
    </button>
  );
}

function InfoRow({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy/10 text-navy" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-navy-ink">{title}</p>
        <p className="mt-0.5 text-[0.85rem] leading-snug text-muted">{children}</p>
      </div>
    </li>
  );
}

function Welcome({ headingRef, onCreate, onSignIn }: { headingRef: HeadingRef; onCreate: () => void; onSignIn: () => void }) {
  return (
    <>
      <div className="flex flex-1 flex-col justify-center py-6">
        <div className="mb-7 flex justify-center">
          <div className="grid h-28 w-28 place-items-center rounded-card bg-orange/10 p-3">
            <img src="/emblem.png" alt="Grb Družbe Braća Hrvatskoga Zmaja" className="h-full w-full object-contain" />
          </div>
        </div>
        <Eyebrow>Kulturna baština · od 1905.</Eyebrow>
        <Heading headingRef={headingRef} className="mt-2 text-[2.1rem] leading-[1.02]">
          Družba „Braća
          <br />
          Hrvatskoga Zmaja”
        </Heading>
        <p className="mt-3 text-sm font-semibold text-navy-mid">Pro aris et focis, Deo propitio!</p>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-muted">
          Novčanik Družbe za <span className="font-semibold text-navy-ink">donacije i očuvanje baštine</span> —
          izravno, transparentno, bez posrednika.
        </p>
        <ul className="mt-6 space-y-3">
          <FeatureRow>Ulaz otiskom prsta — bez lozinki i seed-a</FeatureRow>
          <FeatureRow>Svaka donacija i ulaganje u baštinu javno vidljivi onchain</FeatureRow>
          <FeatureRow>Podrži očuvanje kulturne baštine u par sekundi</FeatureRow>
        </ul>
      </div>

      <div className="space-y-3">
        <Button full onClick={onCreate}>
          Stvori novčanik
        </Button>
        <Button full variant="ghost" onClick={onSignIn} className="border border-chipline">
          Već imam novčanik
        </Button>
        <button
          onClick={() => navigate('/dokumenti')}
          className="w-full py-1 text-center text-sm font-semibold text-navy-mid transition hover:text-orange"
        >
          Kako novčanik radi · dokumenti i dijagrami →
        </button>
        <p className="text-center text-xs leading-relaxed text-muted">
          Družba „Braća Hrvatskoga Zmaja” · interaktivni prototip
        </p>
      </div>
    </>
  );
}

function PasskeyStep({
  headingRef,
  cancelled,
  busy,
  onBack,
  onCreate,
}: {
  headingRef: HeadingRef;
  cancelled: boolean;
  busy: boolean;
  onBack: () => void;
  onCreate: () => void;
}) {
  return (
    <>
      <BackButton onClick={onBack} />
      <div className="flex flex-1 flex-col py-4">
        <Eyebrow>Korak 2 · identitet</Eyebrow>
        <Heading headingRef={headingRef} className="mt-2 text-[1.9rem] leading-[1.05]">
          Stvori passkey
        </Heading>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
          Umjesto lozinke i seed fraze, novčanik otvaraš otiskom prsta ili Face ID-om. Nema korisničkog imena
          ni e-maila.
        </p>
        <ul className="mt-6 space-y-4">
          <InfoRow icon={<KeyRound className="h-5 w-5" />} title="Passkey = tvoj identitet">
            Privatni ključ nastaje i ostaje u Apple Keychainu / Google upravitelju lozinki. Ni Družba ga ne vidi.
          </InfoRow>
          <InfoRow icon={<Wallet className="h-5 w-5" />} title="Safe = tvoj račun">
            Standardni Safe pametni račun na Gnosis Chainu, kojim upravlja samo tvoj passkey. EURe na njemu je tvoj.
          </InfoRow>
          <InfoRow icon={<ShieldCheck className="h-5 w-5" />} title="Bez naknade za mrežu">
            Trošak transakcija (gas) plaća Družba — ti samo potvrdiš otiskom.
          </InfoRow>
        </ul>
        {cancelled && (
          <p role="alert" className="mt-5 rounded-xl bg-orange/10 px-4 py-3 text-sm text-navy-ink">
            Otkazano — ništa nije stvoreno. Pokušaj ponovno kad budeš spreman.
          </p>
        )}
      </div>
      <div className="space-y-3">
        <Button full onClick={onCreate} disabled={busy}>
          <FingerprintIcon className="h-5 w-5" aria-hidden /> Stvori passkey
        </Button>
        <p className="text-center text-xs leading-relaxed text-muted">
          Prototip: sustavski prozor je simulacija, pravi passkey se ne stvara.
        </p>
      </div>
    </>
  );
}

function CreatedStep({ headingRef, onEnter }: { headingRef: HeadingRef; onEnter: () => void }) {
  return (
    <>
      <div className="flex flex-1 flex-col py-6">
        <div className="grid h-14 w-14 place-items-center rounded-card bg-orange/15 text-navy" aria-hidden>
          <CircleCheck className="h-7 w-7" />
        </div>
        <Heading headingRef={headingRef} className="mt-4 text-[1.9rem] leading-[1.05]">
          Novčanik je stvoren
        </Heading>

        <div className="mt-5 rounded-card border border-navy/10 bg-surface p-4">
          <p className="eyebrow">Adresa tvog Safea</p>
          <p className="mt-1 font-mono text-lg font-semibold text-navy">{account.address}</p>
          <p className="mt-2 text-[0.85rem] leading-snug text-muted">
            Adresa je izračunata unaprijed i već može primati uplate. Sam Safe ugovor postavlja se na mrežu tek
            pri tvojoj prvoj transakciji — do tada nema nikakvog troška.
          </p>
        </div>

        <h2 className="mt-6 text-base font-semibold text-navy-ink">Osiguraj pristup</h2>
        <ul className="mt-3 space-y-4">
          <InfoRow icon={<Smartphone className="h-5 w-5" />} title="Dodaj drugi uređaj">
            Passkey s drugog mobitela ili računala postaje suvlasnik ISTOG Safea. Na drugom uređaju biraj
            „Već imam novčanik”, ne „Stvori novčanik” — inače nastaje drugi, odvojeni račun.
          </InfoRow>
          <InfoRow icon={<KeyRound className="h-5 w-5" />} title="Rezervni ključ (neobavezno)">
            Recovery seed kao drugi vlasnik Safea — prikazuje se samo jednom; zapiši ga na papir i čuvaj offline.
          </InfoRow>
        </ul>

        <div role="note" className="mt-5 flex items-start gap-3 rounded-xl bg-orange/10 p-4">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-navy" aria-hidden />
          <p className="text-[0.85rem] leading-snug text-navy-ink">
            <b>Družba ne može vratiti pristup.</b> Nema oporavka preko poslužitelja: ako izgubiš sve passkeyeve
            i rezervni ključ, sredstva na Safeu ostaju nedostupna.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <Button full onClick={onEnter}>
          Uđi u novčanik
        </Button>
        <p className="text-center text-xs leading-relaxed text-muted">
          Prototip: drugi uređaj i rezervni ključ dodaju se kasnije u postavkama.
        </p>
      </div>
    </>
  );
}

function SignInStep({
  headingRef,
  cancelled,
  busy,
  signedIn,
  onBack,
  onSignIn,
  onEnter,
}: {
  headingRef: HeadingRef;
  cancelled: boolean;
  busy: boolean;
  signedIn: boolean;
  onBack: () => void;
  onSignIn: () => void;
  onEnter: () => void;
}) {
  return (
    <>
      {!signedIn && <BackButton onClick={onBack} />}
      <div className="flex flex-1 flex-col py-4">
        {signedIn ? (
          <>
            <div className="mt-2 grid h-14 w-14 place-items-center rounded-card bg-orange/15 text-navy" aria-hidden>
              <CircleCheck className="h-7 w-7" />
            </div>
            <Heading headingRef={headingRef} className="mt-4 text-[1.9rem] leading-[1.05]">
              Novčanik pronađen
            </Heading>
            <div className="mt-5 rounded-card border border-navy/10 bg-surface p-4">
              <p className="eyebrow">Tvoj Safe</p>
              <p className="mt-1 font-mono text-lg font-semibold text-navy">{account.address}</p>
              <p className="mt-2 text-[0.85rem] leading-snug text-muted">
                Passkey je prepoznat i povezan s postojećim Safeom — isti račun, isto stanje.
              </p>
            </div>
          </>
        ) : (
          <>
            <Eyebrow>Prijava</Eyebrow>
            <Heading headingRef={headingRef} className="mt-2 text-[1.9rem] leading-[1.05]">
              Već imam novčanik
            </Heading>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
              Prijavi se passkeyem koji si već stvorio. Sustav će ponuditi spremljene passkeyeve za ovaj novčanik.
            </p>
            <ul className="mt-6 space-y-4">
              <InfoRow icon={<KeyRound className="h-5 w-5" />} title="Passkey je sinkroniziran">
                Ako koristiš iCloud Keychain ili Google upravitelj lozinki, passkey je već na tvojim uređajima.
              </InfoRow>
              <InfoRow icon={<Smartphone className="h-5 w-5" />} title="Passkey je na drugom mobitelu">
                U sustavskom prozoru odaberi „drugi uređaj” i skeniraj QR kod mobitelom na kojem je passkey.
              </InfoRow>
            </ul>
            {cancelled && (
              <p role="alert" className="mt-5 rounded-xl bg-orange/10 px-4 py-3 text-sm text-navy-ink">
                Prijava otkazana. Pokušaj ponovno ili se vrati i stvori novi novčanik.
              </p>
            )}
          </>
        )}
      </div>
      <div className="space-y-3">
        {signedIn ? (
          <Button full onClick={onEnter}>
            Uđi u novčanik
          </Button>
        ) : (
          <Button full onClick={onSignIn} disabled={busy}>
            <LogIn className="h-5 w-5" aria-hidden /> Prijavi se passkeyem
          </Button>
        )}
        <p className="text-center text-xs leading-relaxed text-muted">Prototip: prijava je simulirana.</p>
      </div>
    </>
  );
}

/** Simulacija sustavskog WebAuthn prozora. Naslov prati pravi OS: create = „Spremi passkey”, get = „Koristi spremljeni passkey”. */
function SystemPrompt({ kind, onCancel }: { kind: Ceremony; onCancel: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const title = kind === 'create' ? 'Spremi passkey' : 'Koristi spremljeni passkey';
  return (
    <div className="absolute inset-0 z-40 flex items-end bg-black/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sys-prompt-title"
        className="w-full rounded-t-[1.75rem] bg-surface px-6 pb-8 pt-6 shadow-card animate-riseIn"
      >
        <p className="text-center text-[0.7rem] font-semibold uppercase tracking-eyebrow text-muted">
          Simulacija sustavskog prozora · prototip
        </p>
        <h2 id="sys-prompt-title" className="mt-3 text-center text-lg font-semibold text-navy-ink">
          {title}
        </h2>
        <p className="mt-1 text-center text-sm text-muted">
          {kind === 'create' ? 'za' : 'na'} {window.location.host} · DBHZ novčanik
        </p>
        <div className="mt-5 flex justify-center" aria-hidden>
          <span className="grid h-20 w-20 place-items-center rounded-pill bg-orange/10 animate-pulse">
            <Fingerprint size={44} />
          </span>
        </div>
        <p className="mt-4 text-center text-sm text-navy-ink" aria-live="polite">
          Potvrdi otiskom prsta ili Face ID-om…
        </p>
        <button
          ref={cancelRef}
          onClick={onCancel}
          className="mt-5 w-full rounded-pill border border-chipline py-3 text-sm font-semibold text-navy transition hover:bg-navy/5"
        >
          Odustani
        </button>
      </div>
    </div>
  );
}
