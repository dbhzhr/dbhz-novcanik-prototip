import { useState } from 'react';
import { polls, type Poll } from '../lib/mock';
import { Card, FeatureRow, ScreenTitle } from '../components/ui';

// Glasovanje — 1 zmaj = 1 glas. Anti-sybil kroz passkey identitet + članstvo Družbe.
// Nagrada za sudjelovanje je SOULBOUND (zmajEUR priznanje), NIKAD prenosivi novac —
// inače se gradi sybil-farma i kvari se signal. Teme apolitične: baština i organizacija.
export function Glasovanje() {
  return (
    <div className="pb-6 animate-riseIn">
      <ScreenTitle
        eyebrow="Glas Družbe"
        title="Glasovanje"
        sub="Interne odluke Družbe — jedan glas po članu (anti-sybil kroz passkey identitet i članstvo). Sudjelovanje nosi zmajEUR priznanje; rezultati su transparentni. Pitanja i glasovi su ilustrativni demo."
      />
      <div className="space-y-4 px-4">
        {polls.map((p) => (
          <PollCard key={p.id} poll={p} />
        ))}

        <Card className="p-5">
          <p className="eyebrow">Kako glasovanje radi</p>
          <ul className="mt-3 space-y-2.5">
            <FeatureRow>Jedan glas po članu — passkey identitet (+ članstvo za zatvorene odluke), bez botova i lažnih računa</FeatureRow>
            <FeatureRow>Glas se bilježi onchain — rezultati su javni i provjerljivi u stvarnom vremenu</FeatureRow>
            <FeatureRow>Sudjelovanje nosi zmajEUR (soulbound) — nagrada je priznanje i status, ne prenosivi novac</FeatureRow>
            <FeatureRow>Formalne odluke i dalje donose skupština i Meštarski zbor — glasovanje je savjetodavni signal članstva</FeatureRow>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function PollCard({ poll }: { poll: Poll }) {
  const [voted, setVoted] = useState<string | undefined>(poll.myVote);
  const extra = voted && !poll.myVote ? 1 : 0;
  const total = poll.totalVotes + extra;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow">{poll.category}</p>
        <span className="flex items-center gap-2">
          {poll.membersOnly && (
            <span className="rounded-pill bg-navy/[0.06] px-2 py-0.5 text-[0.65rem] font-semibold text-navy-mid">samo članovi</span>
          )}
          <span className="text-xs text-muted">{poll.closesIn}</span>
        </span>
      </div>
      <h2 className="mt-1 text-lg font-semibold text-navy">{poll.question}</h2>

      <div className="mt-3 space-y-2">
        {poll.options.map((o) => {
          const votes = o.votes + (voted === o.id && !poll.myVote ? 1 : 0);
          const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
          const mine = voted === o.id;
          return (
            <button
              key={o.id}
              disabled={!!voted}
              onClick={() => setVoted(o.id)}
              className={`relative w-full overflow-hidden rounded-2xl border px-4 py-3 text-left transition ${
                mine ? 'border-orange' : 'border-chipline'
              } ${voted ? 'cursor-default' : 'hover:border-navy/30'}`}
            >
              {voted && (
                <span
                  className="absolute inset-y-0 left-0 rounded-2xl bg-orange/10"
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
              )}
              <span className="relative flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-navy-ink">
                  {mine && <span className="text-orange">✓</span>}
                  {o.label}
                </span>
                {voted && <span className="text-sm font-semibold tabular-nums text-navy">{pct}%</span>}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted">
        {voted ? (
          <>Glasao/la si · {total.toLocaleString('hr-HR')} glasova ukupno · rezultati uživo</>
        ) : (
          <>{total.toLocaleString('hr-HR')} glasova · odaberi opciju za glasanje (potvrda otiskom)</>
        )}
      </p>
    </Card>
  );
}
