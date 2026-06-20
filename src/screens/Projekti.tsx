import { associationBudget, communityStats, eur, projects } from '../lib/mock';
import { Card, ScreenTitle } from '../components/ui';

export function Projekti() {
  return (
    <div className="pb-6 animate-riseIn">
      <ScreenTitle
        eyebrow="Fondovi za baštinu · namjenski računi"
        title="Fondovi za baštinu"
        sub="Svaki fond je zaseban namjenski račun vezan uz stvarni projekt baštine. Donatori sami usmjeravaju doprinos u fondove koje žele podržati — sve javno i auditabilno onchain."
      />
      <div className="space-y-3 px-4">
        {projects.map((p) => {
          const pct = Math.min(100, Math.round((p.raised / p.goal) * 100));
          return (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-navy">{p.name}</p>
                    {p.central && (
                      <span className="rounded-pill bg-navy/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-navy">
                        osnovni
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm leading-snug text-muted">{p.desc}</p>
                </div>
                <span className="shrink-0 rounded-pill bg-chip px-2 py-1 text-[0.7rem] tabular-nums text-muted">
                  {p.address}
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <span className="text-xl font-semibold tracking-display tabular-nums text-navy">
                  {eur(p.raised)}
                </span>
                <span className="pb-0.5 text-sm text-muted">od {eur(p.goal)}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-pill bg-chipline">
                <div
                  className="h-full rounded-pill"
                  style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#D99E12,#F0C860)' }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>{p.contributors} donatora doprinijelo</span>
                <span className="font-semibold text-navy-mid">{pct}%</span>
              </div>
            </Card>
          );
        })}

        {/* Statistike ulaganja */}
        <div className="pt-3">
          <p className="px-1 pb-1 eyebrow">Ulaganja u baštinu</p>
          <p className="px-1 pb-2 text-xs leading-relaxed text-muted">
            Družba sredstva iz fondova ulaže u obnovu i očuvanje baštine — onchain, javno, auditabilno.
            Svako ulaganje vidljivo na Gnosis lancu. Iznosi su ilustrativni demo.
          </p>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-hairline p-3">
              <p className="text-[0.7rem] text-muted">Uloženo ukupno</p>
              <p className="text-lg font-semibold tabular-nums text-navy">{eur(communityStats.investedInHeritage)}</p>
            </div>
            <div className="rounded-2xl border border-hairline p-3">
              <p className="text-[0.7rem] text-muted">Projekata baštine</p>
              <p className="text-lg font-semibold tabular-nums text-navy">{communityStats.heritageProjects}</p>
            </div>
            <div className="rounded-2xl border border-hairline p-3">
              <p className="text-[0.7rem] text-muted">Prosječno ulaganje</p>
              <p className="text-lg font-semibold tabular-nums text-navy">{eur(communityStats.avgInvestment)}</p>
            </div>
            <div className="rounded-2xl border border-hairline p-3">
              <p className="text-[0.7rem] text-muted">Rezerve fonda</p>
              <p className="text-lg font-semibold tabular-nums text-navy">{eur(associationBudget.reserves)}</p>
            </div>
          </div>
        </Card>

        {/* Kontekst */}
        <div className="flex items-start gap-2 rounded-card bg-navy/5 px-4 py-3">
          <span className="mt-0.5 text-base" aria-hidden>💡</span>
          <p className="text-xs leading-relaxed text-muted">
            <span className="font-semibold text-navy">Transparentnost na lancu.</span> Družba (osnovana{' '}
            {associationBudget.founded}, obnovljena {associationBudget.restored}) u demo prikazu prikupila{' '}
            {eur(associationBudget.totalRaised)} i uložila {eur(associationBudget.totalInvested)} u baštinu.
            IBAN: {associationBudget.iban}. Self-custody novčanik dodaje{' '}
            <span className="font-semibold text-navy">real-time i projektno-sljedivi</span> sloj uz klasičnu
            bankovnu transparentnost. Iznosi u fondu su ilustrativni demo podaci.
          </p>
        </div>
      </div>
    </div>
  );
}
