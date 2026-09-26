import { Fingerprint } from './ui';
import { X } from './icons';

/**
 * Mock push notifikacija (iOS stil) — edge case: doprinos ističe → re-up.
 * U pravoj app: server šalje push kad se primiče istek; tap otvara Doprinos
 * gdje korisnik produži jednim potvrđivanjem otiskom.
 */
export function PushReminder({ onOpen, onDismiss }: { onOpen: () => void; onDismiss: () => void }) {
  return (
    <div className="absolute inset-x-0 top-0 z-40 px-3 pt-[max(0.6rem,env(safe-area-inset-top))]">
      <div className="flex items-start gap-1 rounded-3xl bg-surface/90 p-3 shadow-card ring-1 ring-navy/10 backdrop-blur-xl animate-riseIn">
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 text-left">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-orange/15">
            <Fingerprint size={24} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-navy">DBHZ novčanik</span>
              <span className="text-[0.65rem] text-muted">sada</span>
            </span>
            <span className="mt-0.5 block text-sm font-semibold text-navy-ink">Doprinos ističe za 3 dana</span>
            <span className="block text-xs leading-snug text-muted">Produži jednim tapom — jedna potvrda otiskom i gotovo.</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Odbaci obavijest"
          className="-mr-1 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-pill text-muted hover:bg-navy/5"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
