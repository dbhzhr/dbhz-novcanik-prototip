import { useState } from 'react';
import type { PropsWithChildren, ReactNode, ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { applyTheme, getTheme, type Theme } from '../lib/theme';

// ── Brand atoms ───────────────────────────────────────────────────────────

/** Light/Dark toggle (sunce/mjesec). `floating` = lebdeći gumb unutar phone framea. */
export function ThemeToggle({ floating = false }: { floating?: boolean }) {
  const [theme, setTheme] = useState<Theme>(() => getTheme());
  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };
  const box = floating
    ? 'absolute bottom-20 left-3 z-30 h-10 w-10 border border-hairline bg-surface/90 shadow-card backdrop-blur'
    : 'h-9 w-9 border border-chipline bg-surface';
  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Svijetla tema' : 'Tamna tema'}
      title={theme === 'dark' ? 'Svijetla tema' : 'Tamna tema'}
      className={`grid place-items-center rounded-pill text-navy transition hover:text-orange ${box}`}
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

/** Otisak prsta = brand potpis. Savršeno za passkey/biometrijski identitet. */
export function Fingerprint({ size = 28, mono = false }: { size?: number; mono?: boolean }) {
  return (
    <img
      src={mono ? '/brand/fingerprint-mono.svg' : '/brand/fingerprint.svg'}
      alt=""
      aria-hidden
      width={size}
      height={size}
      style={{ display: 'block' }}
    />
  );
}

/** Logotip Družbe „Braća Hrvatskoga Zmaja" — zmajski grb (`/emblem.png`) + wordmark. */
export function Logo({ variant = 'color', className = '' }: { variant?: 'color' | 'white'; className?: string }) {
  const isWhite = variant === 'white';
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-xl p-1"
        style={{ background: isWhite ? 'rgba(255,255,255,0.15)' : '#0C5430' }}
      >
        <img src="/emblem.png" alt="Grb Družbe Braća Hrvatskoga Zmaja" className="h-full w-full object-contain" />
      </span>
      <span
        className="text-sm font-bold tracking-tight"
        style={{ color: isWhite ? '#fff' : '#0C5430' }}
      >
        DBHZ
      </span>
    </span>
  );
}

export function Eyebrow({ children }: PropsWithChildren) {
  return <p className="eyebrow">{children}</p>;
}

/** Pulsirajuća orange točka — "live / aktivno" (živi site potpis). */
export function StatusDot() {
  return <span className="inline-block h-2.5 w-2.5 rounded-pill bg-orange animate-pulseDot" aria-hidden />;
}

// ── Layout primitives ───────────────────────────────────────────────────────

export function Card({
  children,
  dark = false,
  className = '',
  ...rest
}: PropsWithChildren<HTMLAttributes<HTMLDivElement> & { dark?: boolean }>) {
  // `dark` bira navy varijantu BEZ sukoba s bg-surface (bug bijelih kartica).
  const tone = dark ? 'bg-navy text-white' : 'bg-surface border border-navy/10';
  return (
    <div className={`rounded-card shadow-card ${tone} ${className}`} {...rest}>
      {children}
    </div>
  );
}

/** Mali redak značajke: orange točka + tekst (opisni onboarding/benefiti). */
export function FeatureRow({ children }: PropsWithChildren) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-pill bg-orange" aria-hidden />
      <span className="text-[0.95rem] leading-snug text-navy-ink">{children}</span>
    </li>
  );
}

export function Chip({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'live' }>) {
  return (
    <span className="inline-flex items-center gap-2 rounded-pill border border-chipline bg-chip px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy">
      {tone === 'live' && <StatusDot />}
      {children}
    </span>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'navy' | 'ghost';
  full?: boolean;
};

/** Pill gumb. Primary = orange (jedina hero akcija), navy = sekundarno. */
export function Button({ variant = 'primary', full, className = '', children, ...rest }: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-pill px-5 py-3.5 text-[0.95rem] font-semibold transition active:scale-[0.98] disabled:opacity-50';
  const tones = {
    primary: 'bg-orange text-white hover:brightness-95 shadow-soft',
    navy: 'bg-navy text-white hover:bg-navy-deep',
    ghost: 'bg-transparent text-navy hover:bg-navy/5',
  } as const;
  return (
    <button className={`${base} ${tones[variant]} ${full ? 'w-full' : ''} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/** Veliki prikaz iznosa — SemiBold, tight tracking. */
export function Amount({ value, size = 'lg' }: { value: string; size?: 'lg' | 'xl' }) {
  return (
    <span
      className={`font-semibold tracking-display tabular-nums text-navy ${
        size === 'xl' ? 'text-5xl' : 'text-3xl'
      }`}
    >
      {value}
    </span>
  );
}

export function ScreenTitle({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: ReactNode }) {
  return (
    <header className="px-5 pb-3 pt-2">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className="mt-1 text-[1.7rem] leading-[1.05]">{title}</h1>
      {sub && <p className="mt-2 text-sm leading-relaxed text-muted">{sub}</p>}
    </header>
  );
}