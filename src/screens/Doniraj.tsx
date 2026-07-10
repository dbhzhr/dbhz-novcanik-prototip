import { useState } from 'react';
import { donationPresets, eur } from '../lib/mock';
import { Button, Card, ScreenTitle } from '../components/ui';
import { FileText, Search } from '../components/icons';
import { navigate } from '../lib/router';

export function Doniraj() {
  const [amount, setAmount] = useState(30);
  const [recurring, setRecurring] = useState(true);
  const [anon, setAnon] = useState(true);

  return (
    <div className="pb-6 animate-riseIn">
      <ScreenTitle
        eyebrow="Doprinos"
        title="Doniraj Družbi"
        sub="Svaki doprinos, jednokratni ili redoviti, izravno se ulaže u fondove za očuvanje kulturne i povijesne baštine. Iznos je na Vašu procjenu."
      />

      <div className="space-y-4 px-4">
        <Card className="p-5">
          <p className="text-center text-xs uppercase tracking-eyebrow text-muted">Iznos donacije</p>
          <p className="mt-1 text-center text-5xl font-semibold tracking-display tabular-nums text-navy">
            {eur(amount)}
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {donationPresets.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                className={`rounded-pill border py-2.5 text-sm font-semibold transition ${
                  amount === p
                    ? 'border-orange bg-orange text-white'
                    : 'border-chipline bg-chip text-navy hover:border-navy/30'
                }`}
              >
                {eur(p)}
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-muted">Preporučeno: {eur(30)} mjesečno</p>
          <p className="mt-2 text-center text-xs leading-relaxed text-muted">
            Cijeli iznos ide izravno u fond za baštinu — bez provizija i posrednika.
          </p>
        </Card>

        <Card className="divide-y divide-hairline">
          <Toggle
            label="Redovita mjesečna donacija"
            hint="Automatski svaki mjesec, otkažeš kad želiš"
            on={recurring}
            onChange={() => setRecurring((v) => !v)}
          />
          <Toggle
            label="Anonimna donacija"
            hint={anon ? 'Tvoje ime neće biti javno vidljivo' : 'Tvoje ime bit će javno uz zapis (GDPR opt-in)'}
            on={anon}
            onChange={() => setAnon((v) => !v)}
          />
        </Card>

        <div className="flex items-start gap-2 rounded-card bg-navy/5 px-4 py-3">
          <Search className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden />
          <p className="text-xs leading-relaxed text-muted">
            <span className="font-semibold text-navy">Potpuna transparentnost.</span> Svaka donacija i svako
            ulaganje u baštinu javno su vidljivi javnosti kroz auditiranu blockchain platformu.
          </p>
        </div>

        <button
          onClick={() => navigate('/dokumenti/isplativost')}
          className="inline-flex w-full items-center justify-center gap-1.5 text-[0.72rem] font-semibold text-navy-mid transition hover:text-orange"
        >
          <FileText size={13} strokeWidth={2} aria-hidden /> Zašto je ovo isplativije · projekcije kroz godine →
        </button>

        <Button full>Doniraj {eur(amount)}{recurring ? ' / mjesečno' : ''}</Button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: () => void;
}) {
  return (
    <button onClick={onChange} className="flex w-full items-center justify-between px-4 py-4 text-left">
      <div className="pr-4">
        <p className="text-sm font-semibold text-navy-ink">{label}</p>
        <p className="mt-0.5 text-xs text-muted">{hint}</p>
      </div>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-pill transition ${on ? 'bg-orange' : 'bg-chipline'}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-pill bg-white shadow transition-transform ${
            on ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}
