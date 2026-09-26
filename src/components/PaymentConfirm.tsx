import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Button, Fingerprint } from './ui';
import { Check, Search } from './icons';

export type ConfirmLine = { label: string; value: string };

/**
 * Potvrdni overlay za uplatu. Dvije faze:
 *  1) 'sign'  — simulacija potvrde otiskom (Face ID / passkey)
 *  2) 'done'  — uspjeh + razdioba po namjenskim računima + javni zapis
 * U pravoj app fazi 'sign' = WebAuthn ceremonija, sve uplate u jednoj
 * MultiSend transakciji (jedna potvrda za N računa).
 * Pristupačnost: role=dialog, Escape (potpis → odustani, gotovo → zatvori),
 * fokus ostaje unutar dijaloga.
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
  onCancel,
}: {
  open: boolean;
  amount: string;
  caption?: string;
  lines: ConfirmLine[];
  footnote?: string;
  doneTitle?: string;
  linesTitle?: string;
  onDone: () => void;
  /** Odustajanje u fazi potpisa (ništa se ne tereti). Bez njega se koristi onDone. */
  onCancel?: () => void;
}) {
  const [phase, setPhase] = useState<'sign' | 'done'>('sign');
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancel = onCancel ?? onDone;

  useEffect(() => {
    if (!open) return;
    setPhase('sign');
    const t = setTimeout(() => setPhase('done'), 1400);
    return () => clearTimeout(t);
  }, [open]);

  // Fokus na naslov trenutne faze (čitač ekrana najavi promjenu).
  useEffect(() => {
    if (open) dialogRef.current?.querySelector<HTMLElement>('h2')?.focus();
  }, [open, phase]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      if (phase === 'sign') cancel();
      else onDone();
      return;
    }
    if (e.key !== 'Tab' || !dialogRef.current) return;
    // Jednostavna zamka fokusa: Tab kruži unutar dijaloga.
    const f = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])'));
    if (f.length === 0) return e.preventDefault();
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex justify-center bg-navy/25 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-confirm-title"
        onKeyDown={onKeyDown}
        className="relative flex h-full w-full max-w-[480px] flex-col overflow-y-auto bg-page animate-riseIn"
      >
        {phase === 'sign' ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="relative grid h-32 w-32 place-items-center">
            <span className="absolute inset-0 rounded-pill bg-orange/15 animate-pulseDot" />
            <Fingerprint size={84} />
          </div>
          <h2 id="payment-confirm-title" tabIndex={-1} className="mt-8 text-2xl outline-none">
            Potvrdite otiskom
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {caption ?? 'Potvrdite uplatu'} · {amount}
            <br />
            Identitet provjerava Face ID — ništa se ne tereti bez vaše potvrde.
          </p>
          <Button variant="ghost" className="mt-6" onClick={cancel}>
            Odustani
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col px-6 pb-8 pt-12">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-20 w-20 place-items-center rounded-pill bg-orange text-on-gold">
              <Check className="h-10 w-10" strokeWidth={2.5} aria-hidden />
            </div>
            <h2 id="payment-confirm-title" tabIndex={-1} className="mt-5 text-2xl outline-none">
              {doneTitle}
            </h2>
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
            <Search className="h-4 w-4 shrink-0 text-navy" aria-hidden />
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
