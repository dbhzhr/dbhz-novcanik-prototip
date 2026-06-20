import { Fingerprint } from './ui';

/**
 * Mock push notifikacija (iOS stil) — edge case: doprinos ističe → re-up.
 * U pravoj app: server šalje push kad se primiče istek; tap otvara Doprinos
 * gdje korisnik produži jednim potvrđivanjem otiskom.
 */
export function PushReminder({ onOpen, onDismiss }: { onOpen: () => void; onDismiss: () => void }) {
  return (
    <div className="absolute inset-x-0 top-0 z-40 px-3 pt-[max(0.6rem,env(safe-area-inset-top))]">
      <div
        className="flex items-start gap-3 rounded-3xl bg-white/85 p-3 shadow-card ring-1 ring-navy/10 backdrop-blur-xl animate-riseIn"
        role="button"
        onClick={onOpen}
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-orange/15">
          <Fingerprint size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy">DBHZ novčanik</p>
            <span className="text-[0.65rem] text-muted">sada</span>
          </div>
          <p className="mt-0.5 text-sm font-semibold text-navy-ink">Doprinos ističe za 3 dana</p>
          <p className="text-xs leading-snug text-muted">Produži jednim tapom — potvrda otiskom, set &amp; forget.</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          aria-label="Odbaci"
          className="grid h-6 w-6 shrink-0 place-items-center rounded-pill text-muted hover:bg-navy/5"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
