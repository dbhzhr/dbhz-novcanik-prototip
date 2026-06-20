import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Fingerprint } from './ui';

export type ConfirmLine = { label: string; value: string };

/**
 * Potvrdni overlay za uplatu. Dvije faze:
 *  1) 'sign'  — simulacija potvrde otiskom (Face ID / passkey)
 *  2) 'done'  — uspjeh + razdioba po namjenskim računima + javni zapis
 * U pravoj app fazi 'sign' = WebAuthn ceremonija, sve uplate u jednoj
 * MultiSend transakciji (jedna potvrda za N računa).
 */
export function PaymentConfirm({
  open,
  amount,
  caption,
  lines,
  footnote,
  doneTitle = 'Uplata uspješna',
  linesTitle = 'Razdioba',
  onDone,
}: {
  open: boolean;
  amount: string;
  caption?: string;
  lines: ConfirmLine[];
  footnote?: string;
  doneTitle?: string;
  linesTitle?: string;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<'sign' | 'done'>('sign');

  useEffect(() => {
    if (!open) return;
    setPhase('sign');
    const t = setTimeout(() => setPhase('done'), 1400);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex justify-center bg-navy/25 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-[480px] flex-col overflow-y-auto bg-page animate-riseIn">
        {phase === 'sign' ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="relative grid h-32 w-32 place-items-center">
            <span className="absolute inset-0 rounded-pill bg-orange/15 animate-pulseDot" />
            <Fingerprint size={84} />
          </div>
          <h2 className="mt-8 text-2xl">Potvrdite otiskom</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {caption ?? 'Potvrdite uplatu'} · {amount}
            <br />
            Identitet provjerava Face ID — ništa se ne tereti bez vaše potvrde.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col px-6 pb-8 pt-12">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-20 w-20 place-items-center rounded-pill bg-orange text-white">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="mt-5 text-2xl">{doneTitle}</h2>
            <p className="mt-1 text-4xl font-semibold tracking-display tabular-nums text-navy">{amount}</p>
            {footnote && <p className="mt-2 text-sm text-muted">{footnote}</p>}
          </div>

          <div className="mt-7 rounded-card border border-navy/10 bg-surface p-5 shadow-soft">
            <p className="eyebrow">{linesTitle}</p>
            <ul className="mt-3 divide-y divide-hairline">
              {lines.map((l) => (
                <li key={l.label} className="flex items-center justify-between py-2.5">
                  <span className="pr-3 text-sm text-navy-ink">{l.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-navy">{l.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-card bg-navy/5 px-4 py-3">
            <span className="text-base">🔎</span>
            <p className="text-xs leading-relaxed text-muted">
              Zapis javno vidljiv · <span className="tabular-nums">0xa33f…1e7d</span> na Gnosis lancu
            </p>
          </div>

          <div className="mt-auto pt-6">
            <Button full onClick={onDone}>
              Gotovo
            </Button>
          </div>
        </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
