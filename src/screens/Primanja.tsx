import { grantPayouts, edeur, eur, type GrantPayout } from '../lib/mock';
import { Card, ScreenTitle } from '../components/ui';
import { Banknote, Check } from '../components/icons';
import type { Screen } from '../App';

const statusMeta: Record<GrantPayout['status'], { label: string; cls: string; done?: boolean }> = {
  primljeno: { label: 'Primljeno', cls: 'bg-orange/10 text-orange', done: true },
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
          <p className="text-xs uppercase tracking-eyebrow text-white/75">Primljeno od Družbe</p>
          <p className="mt-1 text-4xl font-semibold tracking-display tabular-nums">{eur(totalThisYear)}</p>
          <p className="mt-1 text-sm text-white/75">EURe naknade · bez provizija i posrednika</p>
        </Card>

        {/* Lista naknada i priznanja */}
        <Card className="divide-y divide-hairline">
          {grantPayouts.map((p) => {
            const sm = statusMeta[p.status];
            const value = p.currency === 'edeur' ? edeur(p.amount) : eur(p.amount);
            const clickable = Boolean(p.screen);
            const content = (
              <>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold leading-snug text-navy-ink">{p.title}</p>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-pill px-2 py-0.5 text-[0.6rem] font-semibold ${sm.cls}`}>
                      {sm.label}
                      {sm.done && <Check className="h-3 w-3" aria-hidden />}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted">{p.detail}</p>
                  <p className="mt-0.5 truncate text-[0.7rem] text-muted">
                    {p.source} · {p.cadence}
                    {clickable && <span className="font-semibold text-navy-mid"> · otvori →</span>}
                  </p>
                </div>
                <span className="shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-navy">+{value}</span>
              </>
            );
            const row = 'flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left';
            // Samo redak s odredištem je gumb; ostali su običan sadržaj (ne onemogućeni gumbi).
            return clickable ? (
              <button key={p.id} onClick={() => go(p.screen as Screen)} className={`${row} transition hover:bg-navy/[0.03]`}>
                {content}
              </button>
            ) : (
              <div key={p.id} className={row}>
                {content}
              </div>
            );
          })}
        </Card>

        {/* Zašto kroz novčanik */}
        <div className="flex items-start gap-2 rounded-card bg-navy/5 px-4 py-3">
          <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden />
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
