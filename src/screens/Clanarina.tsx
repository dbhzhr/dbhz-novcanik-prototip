import { useEffect, useState } from 'react';
import { dmy, eur, plural, projects, tiers, type TierKey } from '../lib/mock';
import { Button, Card, Chip, FeatureRow, ScreenTitle } from '../components/ui';
import { PaymentConfirm, type ConfirmLine } from '../components/PaymentConfirm';

export function Clanarina() {
  const [tierKey, setTierKey] = useState<TierKey>('redovni');
  const tier = tiers[tierKey];
  const [prepay, setPrepay] = useState(tier.presets[1]); // broj razdoblja (jedinica)
  const [settle, setSettle] = useState(true);
  const [alloc, setAlloc] = useState<Record<string, number>>({ opci: tier.presets[1] }); // jedinice po projektu
  const [confirming, setConfirming] = useState(false);

  // Reset raspodjele kad se promijeni broj razdoblja ili kategorija.
  useEffect(() => {
    setAlloc({ opci: prepay });
  }, [prepay, tierKey]);

  const backward = settle ? tier.owed * tier.rate : 0;
  const forward = prepay * tier.rate;
  const total = backward + forward;
  const paidThrough = new Date(Date.now() + prepay * tier.periodDays * 86_400_000);

  const allocatedUnits = Object.values(alloc).reduce((a, b) => a + b, 0);
  const remaining = prepay - allocatedUnits;

  const addUnit = (id: string) => {
    if (remaining <= 0) return;
    setAlloc((a) => ({ ...a, [id]: (a[id] ?? 0) + 1 }));
  };
  const removeUnit = (id: string) => {
    setAlloc((a) => ({ ...a, [id]: Math.max(0, (a[id] ?? 0) - 1) }));
  };
  const ravnomjerno = () => {
    const next: Record<string, number> = {};
    for (let i = 0; i < prepay; i++) {
      const id = projects[i % projects.length].id;
      next[id] = (next[id] ?? 0) + 1;
    }
    setAlloc(next);
  };

  const setTier = (k: TierKey) => {
    setTierKey(k);
    setPrepay(tiers[k].presets[1]);
    setSettle(true);
  };

  const confirmLines: ConfirmLine[] = projects
    .filter((p) => (alloc[p.id] ?? 0) > 0)
    .map((p) => ({ label: p.name, value: eur((alloc[p.id] ?? 0) * tier.rate) }));
  if (backward > 0) confirmLines.push({ label: 'Opći fond Družbe (zaostatak unatrag)', value: eur(backward) });

  return (
    <div className="pb-6 animate-riseIn">
      <ScreenTitle
        eyebrow="Donatorska pretplata"
        title="Tvoja članarina"
        sub="Plati unaprijed za više razdoblja (set & forget) i sam usmjeri doprinos na fondove za baštinu koje želiš podržati — sve u jednoj potvrdi otiskom."
      />

      <div className="space-y-4 px-4">
        {/* Kategorija */}
        <div className="grid grid-cols-2 gap-2 rounded-pill bg-chip p-1">
          {(Object.keys(tiers) as TierKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setTier(k)}
              className={`rounded-pill px-3 py-2.5 text-center transition ${
                tierKey === k ? 'bg-surface shadow-soft' : 'text-muted hover:text-navy'
              }`}
            >
              <span className={`block text-sm font-semibold ${tierKey === k ? 'text-navy' : ''}`}>
                {tiers[k].label}
              </span>
              <span className="block text-xs text-muted">
                {eur(tiers[k].rate)} {tiers[k].adverb}
              </span>
            </button>
          ))}
        </div>

        {/* Status */}
        <Card dark className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-eyebrow text-white/55">Status · plaćeno do</p>
            <Chip tone="live">Aktivno</Chip>
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-display">{dmy(paidThrough)}</p>
          <p className="mt-1 text-sm text-white/65">
            {prepay} {plural(prepay, tier.unit)} unaprijed · {eur(tier.rate)} {tier.adverb}
          </p>
        </Card>

        {/* Prepaid */}
        <Card className="p-5">
          <p className="eyebrow">Plati unaprijed</p>
          <div className="mt-3 flex items-center justify-between">
            <Stepper value={prepay} onChange={(n) => setPrepay(Math.max(1, n))} />
            <div className="text-right">
              <p className="text-2xl font-semibold tracking-display tabular-nums text-navy">{eur(forward)}</p>
              <p className="text-xs text-muted">
                {prepay} {plural(prepay, tier.unit)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {tier.presets.map((p) => (
              <button
                key={p}
                onClick={() => setPrepay(p)}
                className={`rounded-pill border px-3 py-1.5 text-sm font-semibold transition ${
                  prepay === p
                    ? 'border-orange bg-orange text-white'
                    : 'border-chipline bg-chip text-navy hover:border-navy/30'
                }`}
              >
                {p} {plural(p, tier.unit)}
              </button>
            ))}
          </div>
        </Card>

        {/* Podmiri unatrag */}
        {tier.owed > 0 && (
          <button
            onClick={() => setSettle((v) => !v)}
            className="flex w-full items-center justify-between rounded-card border border-chipline bg-surface px-4 py-4 text-left"
          >
            <div className="pr-4">
              <p className="text-sm font-semibold text-navy-ink">Podmiri unatrag</p>
              <p className="mt-0.5 text-xs text-muted">
                {tier.owed} {plural(tier.owed, tier.unit)} neplaćeno · {eur(tier.owed * tier.rate)}
              </p>
            </div>
            <span className={`relative h-7 w-12 shrink-0 rounded-pill transition ${settle ? 'bg-orange' : 'bg-chipline'}`}>
              <span
                className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-pill bg-white shadow transition-transform ${
                  settle ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </span>
          </button>
        )}

        {/* Raspodjela na namjenske račune — interni crowdfunding */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Usmjeri na projekte</p>
            <button onClick={ravnomjerno} className="text-xs font-semibold text-navy-mid">
              Ravnomjerno
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Rasporedi {eur(forward)} doprinosa na namjenske račune po izboru.
          </p>

          <div className="mt-3 space-y-3">
            {projects.map((p) => {
              const units = alloc[p.id] ?? 0;
              const pct = Math.min(100, Math.round((p.raised / p.goal) * 100));
              return (
                <div key={p.id} className="rounded-2xl border border-hairline p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug text-navy-ink">{p.name}</p>
                      <p className="text-[0.7rem] text-muted">{pct}% prikupljeno · {p.contributors} donatora</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MiniStep onMinus={() => removeUnit(p.id)} onPlus={() => addUnit(p.id)} canPlus={remaining > 0} canMinus={units > 0} />
                      <span className="w-14 text-right text-sm font-semibold tabular-nums text-navy">
                        {eur(units * tier.rate)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className={`mt-3 rounded-pill px-3 py-2 text-center text-xs font-semibold ${
              remaining === 0 ? 'bg-navy/5 text-navy' : 'bg-orange/10 text-orange'
            }`}
          >
            {remaining === 0
              ? 'Sve raspoređeno ✓'
              : `Preostalo rasporediti: ${eur(remaining * tier.rate)}`}
          </div>
        </Card>

        {/* Ukupno + CTA */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Ukupno za platiti</span>
            <span className="text-2xl font-semibold tracking-display tabular-nums text-navy">{eur(total)}</span>
          </div>
          {backward > 0 && (
            <p className="mt-1 text-right text-xs text-muted">
              {eur(backward)} unatrag + {eur(forward)} unaprijed
            </p>
          )}
          <Button full className="mt-4" disabled={remaining !== 0} onClick={() => setConfirming(true)}>
            {remaining === 0 ? `Plati ${eur(total)} · potvrdi otiskom` : 'Rasporedi cijeli iznos'}
          </Button>
        </Card>

        {/* Kako radi */}
        <Card className="p-5">
          <p className="eyebrow">Kako naplata radi</p>
          <ul className="mt-3 space-y-2.5">
            <FeatureRow>Sve uplate (na N namjenskih računa) idu u jednoj transakciji — jedna potvrda otiskom</FeatureRow>
            <FeatureRow>Ništa se ne tereti bez tvog odobrenja; prepaid pokriva sva plaćena razdoblja</FeatureRow>
            <FeatureRow>Kad doprinos ističe, stiže podsjetnik — produžiš jednim tapom</FeatureRow>
          </ul>
        </Card>
      </div>

      <PaymentConfirm
        open={confirming}
        amount={eur(total)}
        caption={`Doprinos · ${confirmLines.length} ${plural(confirmLines.length, ['račun', 'računa', 'računa'])}`}
        lines={confirmLines}
        footnote={`Plaćeno do ${dmy(paidThrough)}`}
        onDone={() => setConfirming(false)}
      />
    </div>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const btn =
    'grid h-10 w-10 place-items-center rounded-pill bg-chip text-xl font-semibold text-navy transition hover:bg-chipline disabled:opacity-40';
  return (
    <div className="flex items-center gap-3">
      <button className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Manje">
        −
      </button>
      <span className="w-8 text-center text-xl font-semibold tabular-nums text-navy">{value}</span>
      <button className={btn} onClick={() => onChange(value + 1)} aria-label="Više">
        +
      </button>
    </div>
  );
}

function MiniStep({
  onMinus,
  onPlus,
  canPlus,
  canMinus,
}: {
  onMinus: () => void;
  onPlus: () => void;
  canPlus: boolean;
  canMinus: boolean;
}) {
  const b = 'grid h-7 w-7 place-items-center rounded-pill bg-chip text-base font-semibold text-navy transition hover:bg-chipline disabled:opacity-30';
  return (
    <div className="flex items-center gap-1.5">
      <button className={b} onClick={onMinus} disabled={!canMinus} aria-label="Manje">
        −
      </button>
      <button className={b} onClick={onPlus} disabled={!canPlus} aria-label="Više">
        +
      </button>
    </div>
  );
}
