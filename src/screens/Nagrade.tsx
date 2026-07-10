import { useState } from 'react';
import { edeur, eur, loyalty } from '../lib/mock';
import { Button, Card, FeatureRow, ScreenTitle } from '../components/ui';
import { FileText } from '../components/icons';
import { PaymentConfirm } from '../components/PaymentConfirm';
import { navigate } from '../lib/router';

export function Nagrade() {
  const max = Math.min(loyalty.balance, loyalty.fundAvailable);
  const [amount, setAmount] = useState(loyalty.balance);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="pb-6 animate-riseIn">
      <ScreenTitle
        eyebrow="Loyalty · zmajEUR"
        title="Priznanje volonterskog rada"
        sub="zmajEUR je interna potvrda tvog volonterskog rada na baštini za Družbu, zapisana na blockchainu. Ne može se slati drugima — iz fonda za isplate zamjenjuje se za EURe."
      />

      <div className="space-y-4 px-4">
        {/* zmajEUR balans */}
        <Card dark className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-eyebrow text-white/55">Zasluženo radom na baštini</p>
            <span className="rounded-pill bg-white/12 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide">
              ne-prenosivo
            </span>
          </div>
          <p className="mt-2 text-4xl font-semibold tracking-display tabular-nums">{edeur(loyalty.balance)}</p>
          <p className="mt-1 text-sm text-white/65">≈ {eur(loyalty.balance)} vrijednosti · fond: {eur(loyalty.fundAvailable)}</p>
        </Card>

        {/* Status volontera */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Status volontera</p>
            <span className="rounded-pill bg-orange/10 px-2.5 py-0.5 text-[0.65rem] font-semibold text-orange">
              Aktivan volonter ✓
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-semibold tabular-nums text-navy">{loyalty.log.length}</p>
              <p className="text-[0.7rem] text-muted">aktivnosti</p>
            </div>
            <div>
              <p className="text-xl font-semibold tabular-nums text-navy">{edeur(loyalty.balance)}</p>
              <p className="text-[0.7rem] text-muted">ukupno</p>
            </div>
            <div>
              <p className="text-xl font-semibold tabular-nums text-navy">{eur(loyalty.fundAvailable)}</p>
              <p className="text-[0.7rem] text-muted">fond dostupan</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Družba dodjeljuje zmajEUR za svaki potvrđeni sat volonterskog rada na obnovi spomenika, vodstvu posjetitelja
            ili digitalizaciji baštine. Token je dokaz doprinosa zajednici — ne investicija.
          </p>
        </Card>

        {/* Izvori i potrošnja zmajEUR */}
        <Card className="p-5">
          <p className="eyebrow">Kako zarađuješ i trošiš zmajEUR</p>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange">Zarađuješ (mint)</p>
              <ul className="mt-1.5 space-y-1 text-navy-ink">
                <li>· Rad na obnovi spomenika</li>
                <li>· Vodstvo posjetitelja</li>
                <li>· Digitalizacija i arhiv</li>
                <li>· Prisustvo sijelu / sjednici</li>
                <li>· Istraživanje baštine</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-navy">Trošiš (sink)</p>
              <ul className="mt-1.5 space-y-1 text-navy-ink">
                <li>· Zamjena za EURe</li>
                <li>· Popusti kod partnera</li>
                <li>· Kotizacija za manifestaciju</li>
                <li>· Donacija fondu</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Indikator faze + governance */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-chipline bg-chip px-3 py-1 text-xs font-semibold text-navy">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 018 0v4" />
              </svg>
              Faza 1 · P2P zaključan
            </span>
            <span className="text-xs text-muted">Faza 2 · zaključano</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="h-1.5 flex-1 rounded-pill bg-orange" />
            <span className="h-1.5 flex-1 rounded-pill bg-chipline" />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Otključavanje P2P (Faza 2) mijenja <span className="font-semibold text-navy">samo Meštarski zbor kroz Safe multisig</span> (M-od-N potpisa) — nikad pojedinac, i tek uz EMI licencu.
          </p>
        </Card>

        {/* Zamjena zmajEUR → EURe */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Zamijeni za EURe</p>
            <span className="text-xs text-muted">Fond: {eur(loyalty.fundAvailable)} dostupno</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Stepper value={amount} min={1} max={max} onChange={setAmount} />
            <div className="text-right">
              <p className="text-2xl font-semibold tracking-display tabular-nums text-navy">{eur(amount)}</p>
              <p className="text-xs text-muted">primaš u EURe</p>
            </div>
          </div>
          <button
            onClick={() => setAmount(max)}
            className="mt-3 w-full rounded-pill border border-chipline bg-chip py-2 text-sm font-semibold text-navy transition hover:border-navy/30"
          >
            Zamijeni sve ({edeur(max)})
          </button>
          <Button full className="mt-3" onClick={() => setConfirming(true)}>
            Zamijeni {edeur(amount)} → {eur(amount)} · potvrdi otiskom
          </Button>
        </Card>

        {/* Povijest zarade */}
        <div>
          <p className="px-1 pb-2 eyebrow">Zarađeno radom na baštini</p>
          <Card className="divide-y divide-hairline">
            {loyalty.log.map((l) => (
              <div key={l.id} className="flex items-center justify-between px-4 py-3.5">
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-semibold leading-snug text-navy-ink">{l.label}</p>
                  <p className="text-xs text-muted">{l.when}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-navy">+{edeur(l.amount)}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Kako zmajEUR radi */}
        <Card className="p-5">
          <p className="eyebrow">Kako zmajEUR radi</p>
          <ul className="mt-3 space-y-2.5">
            <FeatureRow>Izdaje ga isključivo Družba — kao potvrda volonterskog rada na baštini, ne kupuje se</FeatureRow>
            <FeatureRow>Nije prenosiv drugima (nema P2P razmjene) — vezan je uz volontera</FeatureRow>
            <FeatureRow>Iz fonda za isplate zamjenjuje se za EURe, ovisno o dostupnosti</FeatureRow>
          </ul>
          <button
            onClick={() => navigate('/dokumenti/edeur')}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-pill border border-chipline bg-chip py-2.5 text-sm font-semibold text-navy transition hover:border-orange hover:text-orange"
          >
            <FileText className="h-4 w-4" aria-hidden /> Pročitaj pravno-tehničku bilješku →
          </button>
        </Card>
      </div>

      <PaymentConfirm
        open={confirming}
        amount={eur(amount)}
        caption="Zamjena zmajEUR → EURe"
        doneTitle="Zamjena uspješna"
        linesTitle="Detalji zamjene"
        lines={[
          { label: 'Zamijenjeno', value: edeur(amount) },
          { label: 'Primljeno', value: `${eur(amount)} EURe` },
        ]}
        footnote="Stiglo u tvoj novčanik"
        onDone={() => setConfirming(false)}
      />
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const btn =
    'grid h-10 w-10 place-items-center rounded-pill bg-chip text-xl font-semibold text-navy transition hover:bg-chipline disabled:opacity-40';
  return (
    <div className="flex items-center gap-3">
      <button className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Manje">
        −
      </button>
      <span className="w-10 text-center text-xl font-semibold tabular-nums text-navy">{value}</span>
      <button className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Više">
        +
      </button>
    </div>
  );
}
