// Feedback prototipa — komentari članova UO na pojedini ekran.
// POST /api/feedback  { name, screen, where?, comment }  -> sprema u KV
// GET  /api/feedback                                     -> lista svih komentara (desc)
//
// KV `list()` je eventualno konzistentan (novi ključ ne vidi se odmah, do ~60s),
// pa čitanje ide preko jednog INDEX ključa (get = pouzdan read-after-write).
// Durable per-komentar ključevi (`fb:*`) su backup; GET ih rekoncilira u index
// (self-healing — ništa se ne izgubi ni u rijetkoj race situaciji pri pisanju indexa).

interface Env {
  FEEDBACK_KV: KVNamespace;
}

type Comment = {
  id: string;
  name: string;
  screen: string;
  where?: string;
  comment: string;
  ts: number;
};

const INDEX_KEY = 'index:v1';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

async function readIndex(env: Env): Promise<Comment[]> {
  const raw = await env.FEEDBACK_KV.get(INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Comment[];
  } catch {
    return [];
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Partial<Comment>;
  try {
    body = (await request.json()) as Partial<Comment>;
  } catch {
    return json({ ok: false, error: 'invalid json' }, 400);
  }

  const name = (body.name ?? '').toString().trim().slice(0, 60);
  const screen = (body.screen ?? '').toString().trim().slice(0, 40);
  const where = (body.where ?? '').toString().trim().slice(0, 120);
  const comment = (body.comment ?? '').toString().trim().slice(0, 4000);
  if (!name || !comment) return json({ ok: false, error: 'name i comment su obavezni' }, 400);

  const ts = Date.now();
  const id = `${ts}-${Math.random().toString(36).slice(2, 8)}`;
  const rec: Comment = { id, name, screen, where, comment, ts };

  // 1) durable per-komentar ključ (nikad se ne gubi)
  await env.FEEDBACK_KV.put(`fb:${ts}:${id}`, JSON.stringify(rec));
  // 2) brzi index za read-after-write
  const index = await readIndex(env);
  index.push(rec);
  await env.FEEDBACK_KV.put(INDEX_KEY, JSON.stringify(index));

  return json({ ok: true, id });
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const index = await readIndex(env);
  const seen = new Set(index.map((c) => c.id));

  // Reconcile: pokupi durable ključeve koji (zbog race-a pri pisanju indexa) nisu u indexu.
  // `list` može kasniti, ali s vremenom pokupi sve — pa se ništa trajno ne izgubi.
  const list = await env.FEEDBACK_KV.list({ prefix: 'fb:', limit: 1000 });
  let added = false;
  for (const key of list.keys) {
    const v = await env.FEEDBACK_KV.get(key.name);
    if (!v) continue;
    try {
      const rec = JSON.parse(v) as Comment;
      if (!seen.has(rec.id)) {
        index.push(rec);
        seen.add(rec.id);
        added = true;
      }
    } catch {
      /* ignore */
    }
  }
  if (added) await env.FEEDBACK_KV.put(INDEX_KEY, JSON.stringify(index));

  index.sort((a, b) => b.ts - a.ts);
  return json({ ok: true, count: index.length, items: index });
};
