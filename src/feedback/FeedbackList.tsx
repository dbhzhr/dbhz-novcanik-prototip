import { useEffect, useState } from 'react';
import { navigate } from '../lib/router';
import { screenLabel } from '../lib/screens';
import { colorFor, fetchComments, type Comment } from '../lib/feedback';

function timeAgo(ts: number, now: number) {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 60) return 'upravo sad';
  const m = Math.floor(s / 60);
  if (m < 60) return `prije ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `prije ${h} h`;
  return `prije ${Math.floor(h / 24)} d`;
}

export default function FeedbackList() {
  const [items, setItems] = useState<Comment[] | null>(null);
  const [err, setErr] = useState(false);
  const now = Date.now();

  useEffect(() => {
    fetchComments().then(setItems).catch(() => setErr(true));
  }, []);

  const groups: Record<string, Comment[]> = {};
  (items ?? []).forEach((c) => {
    (groups[c.screen] ||= []).push(c);
  });
  Object.values(groups).forEach((l) => l.sort((a, b) => a.ts - b.ts));

  // brojač po osobi — legenda se izvodi iz stvarnih komentatora (bez fiksne liste)
  const perPerson: Record<string, number> = {};
  (items ?? []).forEach((c) => (perPerson[c.name] = (perPerson[c.name] ?? 0) + 1));
  const commenters = Object.keys(perPerson).sort((a, b) => perPerson[b] - perPerson[a]);

  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-10 border-b border-hairline bg-page/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <span className="inline-flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-navy p-1"><img src="/emblem.png" alt="Grb Družbe Braća Hrvatskoga Zmaja" className="h-full w-full object-contain" /></span>
            <span className="text-sm font-bold tracking-tight text-navy">DBHZ</span>
          </span>
          <button onClick={() => navigate('/')} className="rounded-pill bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-deep">
            ← Natrag na novčanik
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-8">
        <p className="eyebrow">Feedback Meštarskog zbora</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-display text-navy">Komentari na prototip</h1>
        <p className="mt-3 leading-relaxed text-muted">
          Svaki ekran je zaseban thread, svi vide sve. Komentari su obojani po osobi.
          {items && <span className="font-semibold text-navy"> Ukupno: {items.length}.</span>}
        </p>

        {/* Legenda boja — izvedena iz stvarnih komentatora */}
        {commenters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {commenters.map((m) => {
              const col = colorFor(m);
              return (
                <span key={m} className="inline-flex items-center gap-1.5 rounded-pill border border-chipline bg-surface px-2.5 py-1 text-xs font-semibold" style={{ color: col.accent }}>
                  <span className="h-2.5 w-2.5 rounded-pill" style={{ background: col.accent }} />
                  {m}
                  <span className="text-muted">· {perPerson[m]}</span>
                </span>
              );
            })}
          </div>
        )}

        {err && <p className="mt-6 text-sm font-semibold text-red-600">Greška pri dohvatu komentara.</p>}
        {!items && !err && <p className="mt-6 text-muted">Učitavanje…</p>}
        {items && items.length === 0 && (
          <div className="mt-6 rounded-card border border-chipline bg-surface p-6 text-center text-muted">
            Još nema komentara. Otvori prototip, klikni <span className="font-semibold text-navy">💬 Komentari</span> na bilo kojem ekranu.
          </div>
        )}

        <div className="mt-6 space-y-6">
          {Object.entries(groups).map(([scr, list]) => (
            <section key={scr}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange">
                {screenLabel(scr)} <span className="text-muted">· {list.length}</span>
              </h2>
              <div className="space-y-2">
                {list.map((c) => {
                  const col = colorFor(c.name);
                  return (
                    <div key={c.id} className="rounded-card p-4 shadow-soft" style={{ background: col.tint, borderLeft: `3px solid ${col.accent}` }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold" style={{ color: col.accent }}>{c.name}</span>
                        <span className="text-xs text-muted">{timeAgo(c.ts, now)}</span>
                      </div>
                      {c.where && <p className="mt-0.5 text-xs text-muted">na: {c.where}</p>}
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-navy-ink">{c.comment}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
