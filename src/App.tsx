import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Doniraj } from './screens/Doniraj';
import { Clanarina } from './screens/Clanarina';
import { Aktivnost } from './screens/Aktivnost';
import { Primi } from './screens/Primi';
import { Projekti } from './screens/Projekti';
import { Nagrade } from './screens/Nagrade';
import { Glasovanje } from './screens/Glasovanje';
import { Poduzetnici } from './screens/Poduzetnici';
import { Primanja } from './screens/Primanja';
import { PushReminder } from './components/PushReminder';
import { navigate as goTo } from './lib/router';
import { FeedbackWidget } from './components/FeedbackWidget';
import { ThemeToggle } from './components/ui';
import { FileText } from './components/icons';
import { SCREEN_LABELS } from './lib/screens';

const DocsPage = lazy(() => import('./docs/DocsPage'));
const FeedbackList = lazy(() => import('./feedback/FeedbackList'));
// Bista (3D) lazy — three.js + R3F učitavaju se tek pri otvaranju ekrana.
const Bista = lazy(() => import('./screens/Bista'));

export type Screen =
  | 'home'
  | 'doniraj'
  | 'clanarina'
  | 'projekti'
  | 'nagrade'
  | 'glasovanje'
  | 'poduzetnici'
  | 'primanja'
  | 'aktivnost'
  | 'primi'
  | 'bista';

const SCREENS: Screen[] = ['home', 'doniraj', 'clanarina', 'projekti', 'nagrade', 'glasovanje', 'poduzetnici', 'primanja', 'aktivnost', 'primi', 'bista'];

/** Deep-link: `?screen=home` uđe izravno na taj ekran (demo + screenshoti). */
function deepLinkScreen(): Screen | null {
  const s = new URLSearchParams(window.location.search).get('screen');
  return s && (SCREENS as string[]).includes(s) ? (s as Screen) : null;
}

const TABS: { key: Screen; label: string; icon: string }[] = [
  { key: 'home', label: 'Početna', icon: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
  { key: 'doniraj', label: 'Doniraj', icon: 'M20.8 5.6a5.5 5.5 0 00-7.8 0L12 6.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 000-7.8z' },
  { key: 'projekti', label: 'Fondovi', icon: 'M12 2 2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5' },
  { key: 'aktivnost', label: 'Aktivnost', icon: 'M4 18V9M9 18V4M14 18v-6M19 18v-9' },
];

// Ekrani dostupni kroz "Više" sheet (sve izvan 4 glavna taba).
const MORE_ITEMS: { s: Screen; label: string; desc: string; icon: string }[] = [
  { s: 'clanarina', label: 'Članarina', desc: 'Donatorska pretplata · prepaid', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  { s: 'nagrade', label: 'Priznanja · zmajEUR', desc: 'Volonterski rad · loyalty priznanja', icon: 'M12 15a7 7 0 100-14 7 7 0 000 14zM8.5 13.5L7 22l5-3 5 3-1.5-8.5' },
  { s: 'glasovanje', label: 'Glasovanje', desc: 'Odluke Družbe · 1 glas po članu', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
  { s: 'bista', label: 'Bista · 3D', desc: 'Kralj Tomislav · crowdfunding odljeva', icon: 'M3 21h18M5 21V9l7-5 7 5v12M9 21v-7h6v7' },
  { s: 'poduzetnici', label: 'Baština', desc: 'Objekti i projekti · javni registar', icon: 'M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5' },
  { s: 'primanja', label: 'Moj doprinos', desc: 'Naknade i priznanja od Družbe', icon: 'M12 3v12M8 11l4 4 4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2' },
  { s: 'primi', label: 'Primi', desc: 'QR adresa · SEPA nadoplata', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM16 16h4v4h-4z' },
];

export function App() {
  const deep = deepLinkScreen();
  const [entered, setEntered] = useState(deep !== null);
  const [screen, setScreen] = useState<Screen>(deep ?? 'home');
  const [push, setPush] = useState(false);
  const [more, setMore] = useState(false);
  const [path, setPath] = useState(() => window.location.pathname);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Klijentska ruta: /dokumenti/... renderira DocsPage (izvan phone framea).
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Mock push: članarina ističe → re-up. Pojavi se kratko nakon ulaska.
  useEffect(() => {
    if (!entered) return;
    const t = setTimeout(() => setPush(true), 2500);
    return () => clearTimeout(t);
  }, [entered]);

  // Scroll na vrh pri svakoj izmjeni ekrana (tab/nav).
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [screen, entered]);

  // Ruta dokumentacije — renderira se preko cijelog ekrana (ne u phone frameu).
  if (path.startsWith('/dokumenti')) {
    return (
      <Suspense fallback={<div className="grid h-[100dvh] place-items-center text-muted">Učitavanje…</div>}>
        <DocsPage path={path} />
      </Suspense>
    );
  }

  // Pregled feedbacka Meštarskog zbora.
  if (path.startsWith('/feedback')) {
    return (
      <Suspense fallback={<div className="grid h-[100dvh] place-items-center text-muted">Učitavanje…</div>}>
        <FeedbackList />
      </Suspense>
    );
  }

  // Otvori app na zadanom ekranu (koristi desktop surround za navigaciju).
  const navigate = (s: Screen) => {
    setEntered(true);
    setScreen(s);
  };

  const body = !entered ? (
    <Onboarding onEnter={() => setEntered(true)} />
  ) : (
    <>
      {push && (
        <PushReminder
          onOpen={() => {
            setPush(false);
            setScreen('clanarina');
          }}
          onDismiss={() => setPush(false)}
        />
      )}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {screen === 'home' && <Home go={setScreen} />}
        {screen === 'doniraj' && <Doniraj />}
        {screen === 'clanarina' && <Clanarina />}
        {screen === 'projekti' && <Projekti />}
        {screen === 'nagrade' && <Nagrade />}
        {screen === 'glasovanje' && <Glasovanje />}
        {screen === 'poduzetnici' && <Poduzetnici />}
        {screen === 'primanja' && <Primanja go={setScreen} />}
        {screen === 'aktivnost' && <Aktivnost />}
        {screen === 'primi' && <Primi />}
        {screen === 'bista' && (
          <Suspense fallback={<div className="grid h-full place-items-center text-muted">Učitavanje 3D…</div>}>
            <Bista />
          </Suspense>
        )}
      </div>
      <TabBar screen={screen} go={setScreen} onMore={() => setMore(true)} />
      {more && (
        <MoreSheet
          screen={screen}
          go={(s) => {
            setScreen(s);
            setMore(false);
          }}
          onClose={() => setMore(false)}
        />
      )}
      <FeedbackWidget screen={screen} screenLabel={SCREEN_LABELS[screen] ?? screen} />
      <ThemeToggle floating />
    </>
  );

  // Mobile: full-bleed (bez okvira). Desktop: phone frame + poveznice (xl) i tehnički opis (xl).
  return (
    <div className="min-h-[100dvh] md:min-h-[125dvh] md:[zoom:0.8] md:flex md:items-center md:justify-center md:gap-8 md:px-8 md:py-8 xl:gap-10">
      <DesktopSurround navigate={navigate} />
      <div
        className="relative mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden bg-page md:mx-0 md:h-[844px] md:w-[390px] md:flex-none md:rounded-[2.75rem] md:border-[12px] md:border-navy md:shadow-card md:ring-1 md:ring-black/5"
      >
        {body}
      </div>
      <DesktopDocs screen={entered ? screen : 'onboarding'} />
    </div>
  );
}

/** Desktop okvir: logo, slogan i poveznice oko phone framea. Skriveno na mobitelu. */
function DesktopSurround({ navigate }: { navigate: (s: Screen) => void }) {
  const navLinks: { label: string; s: Screen }[] = [
    { label: 'Početna', s: 'home' },
    { label: 'Doniraj', s: 'doniraj' },
    { label: 'Članarina', s: 'clanarina' },
    { label: 'Fondovi za baštinu', s: 'projekti' },
    { label: 'Priznanja · zmajEUR', s: 'nagrade' },
    { label: 'Glasovanje', s: 'glasovanje' },
    { label: 'Bista · 3D', s: 'bista' },
    { label: 'Baština', s: 'poduzetnici' },
    { label: 'Moj doprinos', s: 'primanja' },
    { label: 'Aktivnost', s: 'aktivnost' },
  ];
  return (
    <aside className="hidden w-full max-w-sm xl:block">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-navy p-1.5"><img src="/emblem.png" alt="Grb Družbe Braća Hrvatskoga Zmaja" className="h-full w-full object-contain" /></div>
          <span className="text-base font-bold tracking-tight text-navy">DBHZ</span>
        </div>
        <ThemeToggle />
      </div>
      <h2 className="mt-6 text-[2.1rem] font-semibold leading-[1.02] tracking-display text-navy">
        Družba „Braća
        <br />
        Hrvatskoga Zmaja"
      </h2>
      <p className="mt-3 text-sm font-semibold text-navy-mid">Pro aris et focis, Deo propitio!</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Novčanik Družbe — self-custody EURe za donacije, članarinu, fondove za očuvanje kulturne i povijesne
        baštine te zmajEUR priznanje volonterskog rada. Svaki euro javan i auditabilan. Ovo je interaktivni prototip.
      </p>

      <p className="mt-8 eyebrow">Otvori ekran</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {navLinks.map((l) => (
          <button
            key={l.s}
            onClick={() => navigate(l.s)}
            className="rounded-pill border border-chipline bg-surface px-3 py-1.5 text-sm font-semibold text-navy transition hover:border-orange hover:text-orange"
          >
            {l.label}
          </button>
        ))}
      </div>

      <p className="mt-8 eyebrow">Poveznice</p>
      <div className="mt-2 flex flex-col gap-1.5 text-sm">
        <a href="https://dbhz.hr" target="_blank" rel="noreferrer" className="text-navy-mid transition hover:text-orange">
          dbhz.hr ↗
        </a>
        <a href="https://dbhz.hr/povijest-starog-grada-ozlja/" target="_blank" rel="noreferrer" className="text-navy-mid transition hover:text-orange">
          Stari grad Ozalj ↗
        </a>
      </div>

      <button
        onClick={() => goTo('/dokumenti')}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-mid transition hover:text-orange"
      >
        <FileText className="h-4 w-4" aria-hidden /> Kako radi · dokumenti i dijagrami →
      </button>

      <p className="mt-8 text-xs leading-relaxed text-muted">
        Družba „Braća Hrvatskoga Zmaja" · osnovana 1905. · dbhz.hr
        <br />
        Logo i ime Družbe koriste se isključivo za demo prototip; produkcija traži suglasnost Družbe.
      </p>
    </aside>
  );
}

/** Tehnički opis trenutnog ekrana + arhitektonske/compliance odluke (desktop, xl+). */
type DocKey = Screen | 'onboarding';
const SCREEN_DOCS: Record<DocKey, { title: string; points: string[] }> = {
  onboarding: {
    title: 'Onboarding · self-custody',
    points: [
      'Safe (pametni ugovor) na Gnosisu u vlasništvu passkeya; Družba nema pristup sredstvima.',
      'Bez seed-a i lozinki — WebAuthn passkey (Face ID/Touch ID), ključ u Apple/Google Keychainu.',
      'Adresa je counterfactual (CREATE2); Safe se deploya pri prvoj transakciji (MultiSend).',
    ],
  },
  home: {
    title: 'Početna · EURe + pregled',
    points: [
      'EURe = Monerium token e-novca (1:1 EUR) na Gnosisu — regulirano sredstvo.',
      'Stanje i sve transakcije čitaju se onchain; transparentnost je temeljna vrijednost.',
      'Svaka akcija traži potvrdu otiskom — ništa se ne tereti bez korisnika.',
    ],
  },
  doniraj: {
    title: 'Doniraj · namjenski transfer',
    points: [
      'Donacija = EURe transfer na namjenski Safe fonda za baštinu; bez provizija i posrednika.',
      'Anonimno po defaultu (GDPR); javno ime samo uz izričitu opt-in privolu.',
      'Redovita donacija = prepaid (jedna passkey potvrda za N tjedana, set & forget).',
    ],
  },
  clanarina: {
    title: 'Članarina · prepaid model',
    points: [
      'Recurring u self-custodyju nema auto-debita → prepaid: jedna passkey potvrda za N tjedana.',
      'Podupiratelj 1 €/tjedno; Meštarski zbor viši doprinos; podmiruje se jednom MultiSend transakcijom.',
      'Push podsjetnik za re-up kad pretplata ističe. Čuva punu self-custody kontrolu.',
    ],
  },
  projekti: {
    title: 'Fondovi za baštinu · namjenski računi',
    points: [
      'Svaki fond = zaseban namjenski Safe (Opći, Stari grad Ozalj, Digitalizacija, Izdavaštvo).',
      'Donator sam usmjerava donaciju na fond — transparentno i auditabilno.',
      'Iznosi fondova javni onchain; Družba sredstva troši na obnovu i očuvanje baštine.',
    ],
  },
  nagrade: {
    title: 'Priznanja · zmajEUR loyalty',
    points: [
      'zmajEUR = neprenosivi (soulbound) ERC-20; mintsa samo Družba kao potvrdu volonterskog rada na baštini, burn pri otkupu.',
      'Bez P2P → izvan MiCA EMT / EMI okvira (loyalty / limited-network exemption).',
      'Otkup zmajEUR→EURe iz fonda za isplate je diskrecijski — granica koja ga drži izvan EMT-a.',
      'Faza 2 (P2P): samo Safe Meštarskog zbora multisig (M-od-N) može otključati, tek uz EMI licencu.',
    ],
  },
  glasovanje: {
    title: 'Glasovanje · 1 zmaj = 1 glas',
    points: [
      'Anti-sybil: passkey identitet + članstvo (membersOnly) — jedan glas po članu, ne po walletu.',
      'Glas se bilježi onchain; tally je javan i provjerljiv u stvarnom vremenu.',
      'Nagrada za sudjelovanje je soulbound zmajEUR (priznanje/status), nikad prenosivi novac — sprječava farmanje glasova.',
      'Savjetodavni signal članstva — formalne odluke donose skupština i Meštarski zbor (Pravila Družbe).',
    ],
  },
  poduzetnici: {
    title: 'Baština · javni registar objekata',
    points: [
      'Svako ulaganje u baštinu je onchain EURe transfer — javno vidljivo i nepromjenjivo.',
      'Objekti i projekti su stvarni (Ozalj, Kamenita vrata, Arhiv Frankopana); iznosi ilustrativni.',
      'Družba šalje batch isplate kao jednu MultiSend transakciju — jedna potvrda, N namjena.',
    ],
  },
  primanja: {
    title: 'Moj doprinos · naknade Družbe',
    points: [
      'Naknade troškova i priznanja Družba→volonter stižu u isti self-custody novčanik.',
      'EURe naknade i zmajEUR priznanja vidljivi na jednom mjestu, bez šaltera.',
      'Iznosi EURe naknada su u EUR vrijednosti; zmajEUR je soulbound loyalty token.',
    ],
  },
  aktivnost: {
    title: 'Aktivnost · javni registar financiranja',
    points: [
      'Zapis transfera čita se onchain (getLogs) na Gnosisu — nepromjenjivo i auditabilno.',
      'Donatori su anonimni (pseudonim) dok ne daju GDPR privolu za javno ime.',
      'Načelo: „svaka donacija i svako ulaganje u baštinu javno vidljivo".',
    ],
  },
  primi: {
    title: 'Primi · QR + SEPA',
    points: [
      'Primanje EURe preko QR/adrese Safea (EIP-681 format).',
      'SEPA nadoplata: payment intent → dijeljeni backend → Monerium most banka→EURe.',
      'Adresa je counterfactual do prvog deploya Safea.',
    ],
  },
  bista: {
    title: 'Bista · 3D crowdfunding',
    points: [
      '3D model (glTF/GLB ~1,4 MB, decimiran s 300k na 80k trokuta) renderiran u three.js / React Three Fiber — lazy chunk.',
      'Prihodovni model: doprinosi u EURe za odljev (bronca/kamen) i postavljanje bisti po gradovima.',
      'Donator u 3D-u vidi što će se stvarno izraditi — emocija prije odljeva. Iznosi i atribucija ilustrativni za demo.',
    ],
  },
};

function DesktopDocs({ screen }: { screen: DocKey }) {
  const doc = SCREEN_DOCS[screen];
  return (
    <aside className="hidden w-full max-w-xs xl:block xl:max-h-[75vh] xl:overflow-y-auto">
      <p className="eyebrow">Tehnički detalji</p>
      <h3 className="mt-1 text-2xl font-semibold tracking-display text-navy">{doc.title}</h3>
      <ul className="mt-4 space-y-3">
        {doc.points.map((p, i) => (
          <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-navy-ink">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-pill bg-orange" aria-hidden />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => goTo('/dokumenti')}
        className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-pill border border-chipline bg-surface px-4 py-2.5 text-sm font-semibold text-navy transition hover:border-orange hover:text-orange"
      >
        <FileText className="h-4 w-4" aria-hidden /> Otvori dokumente + dijagrame →
      </button>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Uvjeti korištenja + zmajEUR pravno-tehnička bilješka, s renderiranim mermaid dijagramima.
      </p>
    </aside>
  );
}

const MORE_SCREENS = MORE_ITEMS.map((m) => m.s);

function TabBar({ screen, go, onMore }: { screen: Screen; go: (s: Screen) => void; onMore: () => void }) {
  const moreActive = MORE_SCREENS.includes(screen);
  return (
    <nav className="flex items-stretch justify-around border-t border-hairline bg-surface/95 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      {TABS.map((t) => {
        const active = screen === t.key;
        return (
          <button
            key={t.key}
            onClick={() => go(t.key)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[0.62rem] font-semibold transition ${
              active ? 'text-orange' : 'text-muted hover:text-navy'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={t.icon} />
            </svg>
            {t.label}
          </button>
        );
      })}
      <button
        onClick={onMore}
        className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[0.62rem] font-semibold transition ${
          moreActive ? 'text-orange' : 'text-muted hover:text-navy'
        }`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
        Više
      </button>
    </nav>
  );
}

/** "Više" — bottom sheet sa sekundarnim ekranima. Anchor: phone frame (relative). */
function MoreSheet({ screen, go, onClose }: { screen: Screen; go: (s: Screen) => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40">
      <button aria-label="Zatvori" onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
      <div className="absolute inset-x-0 bottom-0 rounded-t-card border-t border-hairline bg-surface pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-card animate-riseIn">
        <div className="mx-auto mb-2 h-1 w-10 rounded-pill bg-chipline" />
        <p className="px-5 pb-1 eyebrow">Više</p>
        <div className="px-2 pb-1">
          {MORE_ITEMS.map((m) => {
            const active = screen === m.s;
            return (
              <button
                key={m.s}
                onClick={() => go(m.s)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-navy/[0.04]"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-pill ${
                    active ? 'bg-orange/10 text-orange' : 'bg-chip text-navy'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={m.icon} />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${active ? 'text-orange' : 'text-navy-ink'}`}>{m.label}</span>
                  <span className="block truncate text-xs text-muted">{m.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => goTo('/dokumenti')}
          className="mx-4 mt-1 inline-flex w-[calc(100%-2rem)] items-center justify-center gap-1.5 rounded-pill border border-chipline bg-chip py-2.5 text-center text-sm font-semibold text-navy transition hover:border-orange hover:text-orange"
        >
          <FileText className="h-4 w-4" aria-hidden /> Dokumenti i dijagrami →
        </button>
      </div>
    </div>
  );
}
