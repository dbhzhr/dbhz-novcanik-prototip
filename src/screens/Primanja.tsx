import { grantPayouts, edeur, eur, type GrantPayout } from '../lib/mock';
import { Card, ScreenTitle } from '../components/ui';
import type { Screen } from '../App';

const statusMeta: Record<GrantPayout['status'], { label: string; cls: string }> = {
  primljeno: { label: 'Primljeno ✓', cls: 'bg-orange/10 text-orange' },
  dostupno: { label: 'Dostupno', cls: 'bg-navy/10 text-navy' },
  'u obradi': { label: 'U obradi', cls: 'bg-chip text-muted' },
};

export function Primanja({ go }: { go: (s: Screen) => void }) {
  const totalThisYear = grantPayouts
    .filter((p) => p.status === 'primljeno' && p.currency === 'eur')
    .reduce((a, p) => a + p.amount, 0);

  return (
    <div className="pb-6 animate-riseIn">
      <ScreenTitle
        eyebrow="Družba → volonter"
        title="Moj doprinos"
        sub={'Naknade troškova i priznanja od Družbe „Braća Hrvatskoga Zmaja” — sve na jednom mjestu. Družba isplaćuje jednom potvrdom (MultiSend), a ti ih vidiš trenutno.'}
      />

      <div className="space-y-4 px-4">
        {/* Hero */}
        <Card dark className="p-5">
          <p className="text-xs uppercase tracking-eyebrow text-white/55">Primljeno od Družbe</p>
          <p className="mt-1 text-4xl font-semibold tracking-display tabular-nums">{eur(totalThisYear)}</p>
          <p className="mt-1 text-sm text-white/65">EURe naknade · bez provizija i posrednika</p>
        </Card>

        {/* Lista naknada i priznanja */}
        <Card className="divide-y divide-hairline">
          {grantPayouts.map((p) => {
            const sm = statusMeta[p.status];
            const value = p.currency === 'edeur' ? edeur(p.amount) : eur(p.amount);
            const clickable = Boolean(p.screen);
            return (
              <button
                key={p.id}
                onClick={() => p.screen && go(p.screen as Screen)}
                disabled={!clickable}
                className={`flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left ${
                  clickable ? 'transition hover:bg-navy/[0.03]' : 'cursor-default'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-navy-ink">{p.title}</p>
                    <span className={`shrink-0 rounded-pill px-2 py-0.5 text-[0.6rem] font-semibold ${sm.cls}`}>
                      {sm.label}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted">{p.detail}</p>
                  <p className="mt-0.5 truncate text-[0.7rem] text-muted">
                    {p.source} · {p.cadence}
                    {clickable && <span className="font-semibold text-navy-mid"> · otvori →</span>}
                  </p>
                </div>
                <span className="shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-navy">+{value}</span>
              </button>
            );
          })}
        </Card>

        {/* Zašto kroz novčanik */}
        <div className="flex items-start gap-2 rounded-card bg-navy/5 px-4 py-3">
          <span className="mt-0.5 text-base" aria-hidden>💶</span>
          <p className="text-xs leading-relaxed text-muted">
            <span className="font-semibold text-navy">Direktno, transparentno, bez posrednika.</span> Naknade idu
            onchain — bez šaltera, bez uplatnica, bez čekanja. Družba šalje batch isplatu svim volonterima kao jednu
            MultiSend transakciju; ti to vidiš odmah. Iznosi su ilustrativni demo podaci.
          </p>
        </div>
      </div>
    </div>
  );
}
