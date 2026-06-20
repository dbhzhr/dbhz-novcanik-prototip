import { account, community, edeur, eur, kindLabel, ledger, loyalty } from '../lib/mock';
import { Amount, Button, Card, Chip, Fingerprint } from '../components/ui';
import type { Screen } from '../App';

export function Home({ go }: { go: (s: Screen) => void }) {
  const pct = Math.round((community.totalRaised / community.goal) * 100);
  return (
    <div className="space-y-4 px-4 pb-6 pt-4 animate-riseIn">
      {/* Balance kartica — navy, hero */}
      <Card dark className="overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-pill bg-white/12">
              <Fingerprint size={20} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{account.name}</p>
              <p className="text-xs text-white/55">{account.address}</p>
            </div>
          </div>
          <Chip tone="live">{account.level}</Chip>
        </div>
        <div className="px-5 pb-5 pt-6">
          <p className="text-xs uppercase tracking-eyebrow text-white/55">Stanje</p>
          <p className="mt-1 text-5xl font-semibold tracking-display tabular-nums">{eur(account.balance)}</p>
          <p className="mt-1 text-sm text-white/60">EURe na Gnosisu</p>
        </div>
        <div className="grid grid-cols-3 gap-px bg-white/10">
          {[
            { label: 'Doniraj', s: 'doniraj' as Screen },
            { label: 'Fondovi', s: 'projekti' as Screen },
            { label: 'Primi', s: 'primi' as Screen },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => go(a.s)}
              className="bg-navy py-3.5 text-sm font-semibold text-white transition hover:bg-navy-deep"
            >
              {a.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Aktivan doprinos */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Aktivan doprinos</p>
            <p className="mt-1 text-lg font-semibold text-navy">
              {eur(account.weeklyDues)} <span className="text-muted">/ tjedno</span>
            </p>
            <p className="mt-0.5 text-sm text-muted">donatorska pretplata · razina {account.level}</p>
          </div>
          <Button variant="navy" onClick={() => go('clanarina')}>
            Detalji
          </Button>
        </div>
        <p className="mt-3 border-t border-hairline pt-3 text-xs leading-relaxed text-muted">
          Kao {account.level} imaš uvid u kretanje sredstava fondova i pravo glasovanja o raspodjeli sredstava za baštinu.
        </p>
      </Card>

      {/* zmajEUR loyalty */}
      <button onClick={() => go('nagrade')} className="w-full text-left">
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="eyebrow">Priznanje volonterskog rada · zmajEUR</p>
            <p className="mt-1 text-lg font-semibold text-navy">{edeur(loyalty.balance)}</p>
            <p className="mt-0.5 text-sm text-muted">zasluženo radom na baštini · zamijeni za EURe →</p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-pill bg-orange/10 text-sm font-bold text-orange">
            zE
          </span>
        </Card>
      </button>

      {/* Baština — quick link */}
      <button onClick={() => go('poduzetnici')} className="w-full text-left">
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="eyebrow">Baština Družbe</p>
            <p className="mt-1 text-lg font-semibold text-navy">6 projekata baštine</p>
            <p className="mt-0.5 text-sm text-muted">objekti i projekti · javni registar →</p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-pill bg-navy/10 text-lg" aria-hidden>🐉</span>
        </Card>
      </button>

      {/* Javni cilj Družbe — transparentnost */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Družba · javno</p>
          <span className="text-xs text-muted">{community.activeMembers} članova (zmajeva)</span>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <Amount value={eur(community.totalRaised)} />
          <span className="pb-1 text-sm text-muted">od {eur(community.goal)}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-pill bg-chipline">
          <div
            className="h-full rounded-pill"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#D99E12,#F0C860)' }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">{community.goalLabel}</p>
        <button onClick={() => go('doniraj')} className="mt-3 text-xs font-semibold text-navy-mid transition hover:text-orange">
          Doniraj Družbi →
        </button>
      </Card>

      {/* Zadnja aktivnost (peek) */}
      <div>
        <div className="flex items-center justify-between px-1 pb-2">
          <p className="eyebrow">Zadnja aktivnost</p>
          <button onClick={() => go('aktivnost')} className="text-xs font-semibold text-navy-mid">
            Sve →
          </button>
        </div>
        <Card className="divide-y divide-hairline">
          {ledger.slice(0, 3).map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy-ink">{t.who}</p>
                <p className="text-xs text-muted">
                  {kindLabel[t.kind]}
                  {t.recurring ? ' · redovito' : ''}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums text-navy">{eur(t.amount)}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
