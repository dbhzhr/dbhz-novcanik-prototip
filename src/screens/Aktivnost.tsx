import { associationBudget, communityStats, community, eur, ledger } from '../lib/mock';
import { Card, ScreenTitle } from '../components/ui';
import { FileText } from '../components/icons';
import { navigate } from '../lib/router';

const kindMeta: Record<string, { label: string; sign: string; color: string }> = {
  donacija: { label: 'Donacija', sign: '+', color: 'text-navy' },
  clanarina: { label: 'Članarina', sign: '+', color: 'text-navy' },
  primljeno: { label: 'Primljeno (SEPA)', sign: '+', color: 'text-navy' },
};

export function Aktivnost() {
  return (
    <div className="pb-6 animate-riseIn">
      <ScreenTitle
        eyebrow="Javni registar financiranja"
        title="Aktivnost"
        sub="Svaka donacija i svako ulaganje u baštinu javno je vidljivo. Donatori su anonimni dok se sami ne odluče otkriti ime."
      />

      <div className="px-4">
        <Card className="mb-4 flex items-center justify-between p-4">
          <div>
            <p className="eyebrow">Ukupno prikupljeno</p>
            <p className="mt-1 text-2xl font-semibold tracking-display tabular-nums text-navy">
              {eur(community.totalRaised)}
            </p>
          </div>
          <div className="text-right">
            <p className="eyebrow">Članova (najviše)</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">{community.membersMax}</p>
          </div>
        </Card>

        {/* Statistike Družbe */}
        <Card className="mb-4 p-5">
          <p className="eyebrow">Statistike Družbe · transparentnost</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <StatBox label="Uloženo u baštinu" value={eur(communityStats.investedInHeritage)} />
            <StatBox label="Projekata baštine" value={String(communityStats.heritageProjects)} />
            <StatBox label="Volonterskih sati" value={String(communityStats.volunteerHours)} />
            <StatBox label="Prosječno ulaganje" value={eur(communityStats.avgInvestment)} />
          </div>
          <div className="mt-3 rounded-pill bg-navy/5 px-3 py-2 text-center text-xs font-semibold text-navy">
            {communityStats.edeurInCirculation} zmajEUR u opticaju · {communityStats.zmajskiStolovi} zmajskih stolova
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Družba osnovana {associationBudget.founded}, obnovljena {associationBudget.restored} ·{' '}
            do {community.membersMax} redovitih članova (numerus clausus, Pravila 2024.). Prikupljeni iznosi su ilustrativni demo.{' '}
            {associationBudget.transparencyNote}
          </p>
          <p className="mt-2 rounded-2xl bg-navy/5 px-3 py-2 text-[0.7rem] leading-relaxed text-muted">
            Sve transakcije onchain: svaka uplata donatora i svako ulaganje u baštinu{' '}
            <span className="font-semibold text-navy">javno vidljivo i auditabilno</span> na Gnosisu. IBAN:{' '}
            {associationBudget.iban} ({associationBudget.bank}). OIB: {associationBudget.oib} · reg. br.{' '}
            {associationBudget.regNumber}. Demo prototip.
          </p>
        </Card>

        <Card className="divide-y divide-hairline">
          {ledger.map((t) => {
            const m = kindMeta[t.kind];
            return (
              <div key={t.id} className="flex items-center justify-between px-4 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug text-navy-ink">{t.who}</p>
                  <p className="text-xs text-muted">
                    {m.label} · {t.when}
                    {t.recurring ? ' · redovito' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 pl-3">
                  <span className="rounded-pill bg-chip px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
                    javno
                  </span>
                  <span className={`text-sm font-semibold tabular-nums ${m.color}`}>
                    {m.sign}
                    {eur(t.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </Card>
        <p className="mt-3 px-1 text-center text-xs text-muted">
          Zapis na Gnosis lancu · auditabilno i nepromjenjivo
        </p>
        <button
          onClick={() => navigate('/dokumenti/porezi')}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-pill border border-chipline bg-chip py-2.5 text-sm font-semibold text-navy transition hover:border-orange hover:text-orange"
        >
          <FileText className="h-4 w-4" aria-hidden /> Kako se vide porezi onchain →
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-hairline p-3">
      <p className="text-[0.7rem] text-muted">{label}</p>
      <p className="text-base font-semibold tabular-nums tracking-tight text-navy">{value}</p>
    </div>
  );
}
