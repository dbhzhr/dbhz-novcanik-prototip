import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import mermaid from 'mermaid';
import { navigate } from '../lib/router';

// Markdown dokumenti (single source — bundlani kao string, lazy chunk).
import isplativostMd from '../../docs/compliance/isplativost-wallet.md?raw';
import uvjetiMd from '../../docs/compliance/uvjeti-koristenja-novcanika.md?raw';
import edeurMd from '../../docs/compliance/edeur-loyalty-token.md?raw';
import poreziMd from '../../docs/compliance/porezi-i-transparentnost.md?raw';
import mogucnostiMd from '../../docs/compliance/razmatrane-mogucnosti.md?raw';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose', // dopušta htmlLabels (<br/> u nodovima)
  flowchart: {
    htmlLabels: true, // HTML labeli u foreignObject → tekst se wrap-a, ne odsiječe
    useMaxWidth: true,
    nodeSpacing: 45,
    rankSpacing: 55,
    padding: 12,
  },
  themeVariables: {
    primaryColor: '#e6efe9',
    primaryBorderColor: '#0C5430',
    primaryTextColor: '#1f2921',
    lineColor: '#146E42',
    secondaryColor: '#fbf3df',
    tertiaryColor: '#ffffff',
    fontFamily: "'Titillium Web', Inter, system-ui, sans-serif",
    fontSize: '14px',
  },
});

/** Mermaid mjeri širinu nodova prema fontu; ako Titillium Web još nije učitan, mjeri s
 *  fallbackom pa se tekst odsiječe kad font stigne. Čekamo da font bude spreman. */
let fontsReady: Promise<unknown> | null = null;
function ensureFonts(): Promise<unknown> {
  if (fontsReady) return fontsReady;
  const d = document as Document & { fonts?: FontFaceSet };
  if (!d.fonts) return (fontsReady = Promise.resolve());
  fontsReady = Promise.all([
    d.fonts.ready,
    d.fonts.load('400 14px "Titillium Web"').catch(() => {}),
    d.fonts.load('600 14px "Titillium Web"').catch(() => {}),
    d.fonts.load('700 14px "Titillium Web"').catch(() => {}),
  ]);
  return fontsReady;
}

const DOCS: Record<string, { slug: string; title: string; blurb: string; md: string }> = {
  isplativost: {
    slug: 'isplativost',
    title: 'Isplativost — novčanik vs. ostali kanali',
    blurb: 'Zašto mikrodonacije i tjedna članarina kroz novčanik financijski nadmašuju karticu, IBAN i SMS — s projekcijama kroz godine i dijagramima.',
    md: isplativostMd,
  },
  'uvjeti-koristenja': {
    slug: 'uvjeti-koristenja',
    title: 'Uvjeti korištenja novčanika',
    blurb: 'Kako novčanik radi, donatorska pretplata, fondovi za baštinu, zmajEUR i upravljanje (multisig).',
    md: uvjetiMd,
  },
  edeur: {
    slug: 'edeur',
    title: 'zmajEUR — pravno-tehnička bilješka',
    blurb: 'Zašto je zmajEUR loyalty (bez EMI licence) i kako kroz multisig postaje regulirani token.',
    md: edeurMd,
  },
  porezi: {
    slug: 'porezi',
    title: 'Porezi i transparentnost',
    blurb: 'Tok novca na javnom lancu i porezne točke — najprijateljskije za Poreznu upravu (uvid onchain).',
    md: poreziMd,
  },
  mogucnosti: {
    slug: 'mogucnosti',
    title: 'Razmatrano — moguće funkcionalnosti',
    blurb: 'Mapa ideja razmatranih, ali još neugrađenih — kamo bi se sustav mogao razviti (s dijagramima).',
    md: mogucnostiMd,
  },
};

function splitDoc(md: string): { type: 'md' | 'mermaid'; content: string }[] {
  const parts: { type: 'md' | 'mermaid'; content: string }[] = [];
  const re = /```mermaid\s*\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) {
    if (m.index > last) parts.push({ type: 'md', content: md.slice(last, m.index) });
    parts.push({ type: 'mermaid', content: m[1].trim() });
    last = re.lastIndex;
  }
  if (last < md.length) parts.push({ type: 'md', content: md.slice(last) });
  return parts;
}

/** Desktop (md+) = horizontalni dijagrami (LR), mobitel = vertikalni (TB). */
function useIsDesktop() {
  const [d, setD] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const on = () => setD(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return d;
}

/** Prepiše SAMO smjer na vrhu dijagrama (flowchart/graph); subgraph `direction` ostaje. */
function withDirection(code: string, dir: 'LR' | 'TB') {
  return code.replace(/\b(flowchart|graph)\s+(TB|TD|BT|RL|LR)/, `$1 ${dir}`);
}

function Diagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const isDesktop = useIsDesktop();
  const dir = isDesktop ? 'LR' : 'TB';
  useEffect(() => {
    let alive = true;
    const id = 'mm-' + Math.random().toString(36).slice(2);
    ensureFonts()
      .then(() => (alive ? mermaid.render(id, withDirection(code, dir)) : null))
      .then((res) => {
        if (alive && res && ref.current) ref.current.innerHTML = res.svg;
      })
      .catch((e) => alive && setErr(String(e)));
    return () => {
      alive = false;
    };
  }, [code, dir]);
  if (err) return <pre className="doc-mermaid-err">{code}</pre>;
  return <div className="doc-diagram" ref={ref} aria-label="dijagram" />;
}

function Article({ md }: { md: string }) {
  const parts = splitDoc(md);
  return (
    <article>
      {parts.map((p, i) =>
        p.type === 'mermaid' ? (
          <Diagram key={i} code={p.content} />
        ) : (
          <div key={i} className="doc-content" dangerouslySetInnerHTML={{ __html: marked.parse(p.content) as string }} />
        ),
      )}
    </article>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] overflow-x-clip">
      <header className="sticky top-0 z-10 border-b border-hairline bg-page/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-navy p-1"><img src="/emblem.png" alt="Grb Družbe Braća Hrvatskoga Zmaja" className="h-full w-full object-contain" /></span>
            <span className="text-sm font-bold tracking-tight text-navy">DBHZ</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-pill bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-deep"
          >
            ← Natrag na novčanik
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8">{children}</main>
      <footer className="border-t border-hairline">
        <p className="mx-auto max-w-3xl px-5 py-6 text-xs leading-relaxed text-muted">
          Družba „Braća Hrvatskoga Zmaja" · dbhz.hr
          <br />
          Nacrt — sve odredbe podložne pravnoj potvrdi prije objave. Interaktivni prototip (demo rješenja).
          Logo i ime Družbe koriste se isključivo za demo; produkcija traži suglasnost Družbe.
        </p>
      </footer>
    </div>
  );
}

export default function DocsPage({ path }: { path: string }) {
  const slug = path.replace(/^\/dokumenti\/?/, '').replace(/\/$/, '');
  const doc = DOCS[slug];

  // Indeks
  if (!doc) {
    return (
      <Shell>
        <p className="eyebrow">Dokumentacija</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-display text-navy">Kako novčanik radi</h1>
        <p className="mt-3 leading-relaxed text-muted">
          Pravno-tehnički dokumenti s dijagramima — za Meštarski zbor i sve donatore koje zanima kako sustav radi
          i koje su odluke iza njega.
        </p>
        <div className="mt-6 grid gap-4">
          {Object.values(DOCS).map((d) => (
            <button
              key={d.slug}
              onClick={() => navigate('/dokumenti/' + d.slug)}
              className="rounded-card border border-navy/10 bg-surface p-5 text-left shadow-soft transition hover:border-orange"
            >
              <p className="font-semibold text-navy">{d.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{d.blurb}</p>
              <span className="mt-2 inline-block text-sm font-semibold text-orange">Otvori →</span>
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <nav className="mb-6 flex flex-wrap gap-2">
        {Object.values(DOCS).map((d) => (
          <button
            key={d.slug}
            onClick={() => navigate('/dokumenti/' + d.slug)}
            className={`rounded-pill border px-3 py-1.5 text-sm font-semibold transition ${
              d.slug === slug ? 'border-orange bg-orange text-white' : 'border-chipline bg-surface text-navy hover:border-navy/30'
            }`}
          >
            {d.title}
          </button>
        ))}
      </nav>
      <Article md={doc.md} />
    </Shell>
  );
}
