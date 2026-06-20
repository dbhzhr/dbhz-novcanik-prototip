import { lazy, Suspense, useState } from 'react';
import { bistaCampaign, eur } from '../lib/mock';
import { Button, Card, Chip, ScreenTitle } from '../components/ui';
import { PaymentConfirm } from '../components/PaymentConfirm';

const BistaViewer = lazy(() => import('./BistaViewer'));

const statusMeta: Record<string, { label: string; cls: string }> = {
  postavljeno: { label: 'Postavljeno ✓', cls: 'bg-orange/10 text-orange' },
  'u tijeku': { label: 'U tijeku', cls: 'bg-navy/10 text-navy' },
  predloženo: { label: 'Predloženo', cls: 'bg-chip text-muted' },
};

export function Bista() {
  const c = bistaCampaign;
  const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
  const [tierId, setTierId] = useState(c.tiers[1].id);
  const [confirming, setConfirming] = useState(false);
  const tier = c.tiers.find((t) => t.id === tierId) ?? c.tiers[0];

  return (
    <div className="pb-6 animate-riseIn">
      <ScreenTitle
        eyebrow="Spomenička baština · 3D"
        title="Bista kralja Tomislava"
        sub="Doprinesi odljevu i postavljanju biste prvoga hrvatskog kralja po gradovima u Hrvatskoj i inozemstvu. Zavrti model i vidi što ćeš pomoći stvoriti."
      />

      <div className="space-y-4 px-4">
        {/* 3D viewer */}
        <Card dark className="overflow-hidden p-0">
          <div className="relative h-72 w-full">
            <Suspense
              fallback={
                <div className="grid h-full w-full place-items-center text-sm text-white/60">
                  Učitavanje 3D modela…
                </div>
              }
            >
              <BistaViewer />
            </Suspense>
            <span className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[0.65rem] text-white/55">
              Povuci za rotaciju · približi prstima
            </span>
          </div>
        </Card>

        {/* Napomena o atribuciji / činjenicama */}
        <div className="flex items-start gap-2 rounded-card bg-navy/5 px-4 py-3">
          <span className="mt-0.5 text-base" aria-hidden>🏛️</span>
          <p className="text-xs leading-relaxed text-muted">
            <span className="font-semibold text-navy">Kralj Tomislav</span> — prvi hrvatski kralj. Družba je glavni
            inicijator obilježavanja <span className="font-semibold text-navy">1100. obljetnice Hrvatskoga Kraljevstva
            (2025.)</span>. {c.note}
          </p>
        </div>

        {/* Crowdfunding napredak */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Prikupljeno za prvi odljev</p>
            <span className="text-xs text-muted">{c.backers} donatora</span>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <span className="text-3xl font-semibold tracking-display tabular-nums text-navy">{eur(c.raised)}</span>
            <span className="pb-1 text-sm text-muted">od {eur(c.goal)}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-pill bg-chipline">
            <div
              className="h-full rounded-pill"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#D99E12,#F0C860)' }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">{pct}% cilja · procjena odljeva i postolja {eur(c.castCost)}</p>
        </Card>

        {/* Predložene lokacije */}
        <div>
          <p className="px-1 pb-2 eyebrow">Gradovi — predložene lokacije</p>
          <Card className="divide-y divide-hairline">
            {c.cities.map((loc) => {
              const sm = statusMeta[loc.status];
              return (
                <div key={loc.city} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-semibold text-navy-ink">{loc.city}</span>
                  <span className={`rounded-pill px-2.5 py-0.5 text-[0.62rem] font-semibold ${sm.cls}`}>
                    {sm.label}
                  </span>
                </div>
              );
            })}
          </Card>
          <p className="mt-2 px-1 text-[0.7rem] text-muted">Lokacije i statusi su ilustrativni demo.</p>
        </div>

        {/* Razine doprinosa */}
        <Card className="p-5">
          <p className="eyebrow">Odaberi razinu doprinosa</p>
          <div className="mt-3 space-y-2">
            {c.tiers.map((t) => {
              const active = t.id === tierId;
              return (
                <button
                  key={t.id}
                  onClick={() => setTierId(t.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    active ? 'border-orange bg-orange/5' : 'border-hairline hover:border-navy/30'
                  }`}
                >
                  <span className="min-w-0 pr-3">
                    <span className={`block text-sm font-semibold ${active ? 'text-orange' : 'text-navy-ink'}`}>
                      {t.label}
                    </span>
                    <span className="block truncate text-xs text-muted">{t.perk}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-navy">{eur(t.amount)}</span>
                </button>
              );
            })}
          </div>
          <Button full className="mt-4" onClick={() => setConfirming(true)}>
            Doprinesi {eur(tier.amount)} · potvrdi otiskom
          </Button>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Chip>EURe na Gnosisu</Chip>
            <Chip>javno · auditabilno</Chip>
          </div>
        </Card>
      </div>

      <PaymentConfirm
        open={confirming}
        amount={eur(tier.amount)}
        caption={`Doprinos · ${tier.label}`}
        doneTitle="Hvala na doprinosu!"
        linesTitle="Detalji doprinosa"
        lines={[
          { label: 'Kampanja', value: 'Bista kralja Tomislava' },
          { label: 'Razina', value: tier.label },
          { label: 'Iznos', value: `${eur(tier.amount)} EURe` },
        ]}
        footnote="Doprinos vidljiv onchain"
        onDone={() => setConfirming(false)}
      />
    </div>
  );
}

export default Bista;
