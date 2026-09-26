import { edeur, eur, bastina, type Bastina } from '../lib/mock';
import { Card, ScreenTitle } from '../components/ui';
import { Check, Search, Shield, sectorIcon } from '../components/icons';
import { communityStats } from '../lib/mock';

const statusMeta: Record<Bastina['status'], { label: string; cls: string; done?: boolean }> = {
  primljeno: { label: 'Uloženo', cls: 'bg-orange/10 text-orange', done: true },
  'u obradi': { label: 'U pripremi', cls: 'bg-chip text-muted' },
};

export function Poduzetnici() {
  return (
    <div className="pb-6 animate-riseIn">
      <ScreenTitle
        eyebrow="Baština Družbe"
        title="Baština"
        sub="Javni registar: svaki objekt i projekt baštine koji Družba podupire vidljiv je onchain — transparentno i auditabilno. Objekti su stvarni; iznosi su ilustrativni za demo."
      />

      <div className="space-y-4 px-4">
        {/* Hero */}
        <Card dark className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-eyebrow text-white/75">Uloženo u baštinu</p>
            <span className="rounded-pill bg-white/12 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide">
              onchain · javno
            </span>
          </div>
          <p className="mt-2 text-4xl font-semibold tracking-display tabular-nums">{eur(communityStats.investedInHeritage)}</p>
          <p className="mt-1 text-sm text-white/75">
            {communityStats.investedProjects} od {communityStats.heritageProjects} projekata uloženo · prosječno {eur(communityStats.avgInvestment)}
          </p>
        </Card>

        {/* Lista objekata baštine */}
        <div>
          <p className="px-1 pb-2 eyebrow">Objekti i projekti baštine</p>
          <Card className="divide-y divide-hairline">
            {bastina.map((p) => {
              const sm = statusMeta[p.status];
              const Icon = sectorIcon[p.sector] ?? Shield;
              return (
                <div key={p.id} className="flex items-start gap-3 px-4 py-4">
                  <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-chip text-navy">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug text-navy-ink">{p.name}</p>
                        <p className="mt-0.5 text-xs text-muted">{p.project}</p>
                        <p className="mt-0.5 text-[0.7rem] text-muted">
                          {p.location} · {p.sector}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold tabular-nums text-navy">{eur(p.amount)}</p>
                        <p className="mt-0.5 text-[0.65rem] text-muted">{p.date}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[0.62rem] font-semibold ${sm.cls}`}>
                        {sm.label}
                        {sm.done && <Check className="h-3 w-3" aria-hidden />}
                      </span>
                      <span className="font-mono text-[0.62rem] text-muted">{p.address}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

        {/* Kako radi */}
        <div className="flex items-start gap-2 rounded-card bg-navy/5 px-4 py-3.5">
          <Search className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden />
          <p className="text-xs leading-relaxed text-muted">
            <span className="font-semibold text-navy">Svako ulaganje je onchain.</span> Družba ulaže sredstva u obnovu
            i očuvanje baštine kao EURe transfer na namjenski Safe — javno vidljivo, nepromjenjivo, auditabilno.
            Objekti i projekti su stvarni (izvor: dbhz.hr); iznosi u demo prototipu su ilustrativni.
          </p>
        </div>

        {/* Statistike */}
        <Card className="p-5">
          <p className="eyebrow mb-3">Statistike Družbe</p>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Projekata baštine" value={String(communityStats.heritageProjects)} />
            <Stat label="Volonterskih sati" value={String(communityStats.volunteerHours)} />
            <Stat label="zmajEUR u opticaju" value={edeur(communityStats.edeurInCirculation)} />
            <Stat label="Zmajskih stolova" value={String(communityStats.zmajskiStolovi)} />
          </div>
          <p className="mt-3 text-[0.7rem] leading-relaxed text-muted">
            Zmajskih stolova (24: 19 u Hrvatskoj + 5 inozemnih) je činjenica; ostali iznosi su ilustrativni demo.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-chip p-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold tabular-nums tracking-tight text-navy">{value}</p>
    </div>
  );
}
