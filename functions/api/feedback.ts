// Feedback prototipa — komentari članova Meštarskog zbora na pojedini ekran.
// POST /api/feedback  { name, screen, where?, comment }  -> sprema u KV
// GET  /api/feedback                                     -> lista svih komentara (desc)
//
// KV `list()` je eventualno konzistentan (novi ključ ne vidi se odmah, do ~60s),
// pa čitanje ide preko jednog INDEX ključa (get = pouzdan read-after-write).
// Durable per-komentar ključevi (`fb:*`) su backup; GET ih rekoncilira u index
// (self-healing — ništa se ne izgubi ni u rijetkoj race situaciji pri pisanju indexa).
//
// Zaštita (javni endpoint bez prijave):
// - POST samo s application/json i s vlastitog origina → forma s tuđe stranice (CSRF) ne prolazi
// - ograničena veličina tijela, duljine polja i ukupan broj komentara
// - rate limit po IP-u (KV brojač po prozoru; grub, ali dovoljan protiv spama)
// - GET čita samo durable ključeve kojih NEMA u indexu (id je u imenu ključa) → nema N čitanja po zahtjevu

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
const MAX_BODY_BYTES = 16 * 1024;
const MAX_COMMENTS = 2000;
const RATE_WINDOW_S = 600; // 10 min
const RATE_MAX = 10; // komentara po IP-u u prozoru

// Dopušteni origini za POST (uz vlastiti host zahtjeva, koji je uvijek dopušten).
const ALLOWED_HOSTS = [/^dbhz-prototip\.domovina\.ai$/, /^dbhzw-prototip\.domovina\.ai$/, /^([a-z0-9-]+\.)?dbhz-prototip\.pages\.dev$/, /^localhost(:\d+)?$/, /^127\.0\.0\.1(:\d+)?$/];

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'x-robots-tag': 'noindex',
    },
  });

async function readIndex(env: Env): Promise<Comment[]> {
  const raw = await env.FEEDBACK_KV.get(INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Comment[]) : [];
  } catch {
    return [];
  }
}

/** Ukloni kontrolne znakove (osim novog reda/taba), normaliziraj i skrati. */
function clean(v: unknown, max: number, multiline = false): string {
  const s = (v ?? '').toString().normalize('NFC');
  const stripped = multiline ? s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') : s.replace(/[\u0000-\u001F\u007F]/g, ' ');
  return stripped.trim().slice(0, max);
}

function originAllowed(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false; // preglednici šalju Origin na svaki cross-site i same-origin POST
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  return host === new URL(request.url).host || ALLOWED_HOSTS.some((re) => re.test(host));
}

async function rateLimited(env: Env, request: Request): Promise<boolean> {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const bucket = Math.floor(Date.now() / 1000 / RATE_WINDOW_S);
  const key = `rl:${bucket}:${ip}`;
  const n = parseInt((await env.FEEDBACK_KV.get(key)) ?? '0', 10) || 0;
  if (n >= RATE_MAX) return true;
  await env.FEEDBACK_KV.put(key, String(n + 1), { expirationTtl: RATE_WINDOW_S * 2 });
  return false;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!originAllowed(request)) return json({ ok: false, error: 'forbidden' }, 403);
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return json({ ok: false, error: 'content-type mora biti application/json' }, 415);
  }
  const len = parseInt(request.headers.get('content-length') ?? '0', 10);
  if (len > MAX_BODY_BYTES) return json({ ok: false, error: 'prevelik zahtjev' }, 413);

  let body: Partial<Comment>;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json({ ok: false, error: 'prevelik zahtjev' }, 413);
    body = JSON.parse(text);
    if (!body || typeof body !== 'object') throw new Error('not an object');
  } catch {
    return json({ ok: false, error: 'invalid json' }, 400);
  }

  const name = clean(body.name, 60);
  const screen = clean(body.screen, 40);
  const where = clean(body.where, 120);
  const comment = clean(body.comment, 4000, true);
  if (!name || !comment) return json({ ok: false, error: 'name i comment su obavezni' }, 400);

  if (await rateLimited(env, request)) return json({ ok: false, error: 'previše komentara — pokušaj za nekoliko minuta' }, 429);

  const index = await readIndex(env);
  if (index.length >= MAX_COMMENTS) return json({ ok: false, error: 'dosegnut je najveći broj komentara' }, 507);

  const ts = Date.now();
  const id = `${ts}-${crypto.randomUUID().slice(0, 8)}`;
  const rec: Comment = { id, name, screen, where, comment, ts };

  // 1) durable per-komentar ključ (nikad se ne gubi)
  await env.FEEDBACK_KV.put(`fb:${ts}:${id}`, JSON.stringify(rec));
  // 2) brzi index za read-after-write
  index.push(rec);
  await env.FEEDBACK_KV.put(INDEX_KEY, JSON.stringify(index));

  return json({ ok: true, id });
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const index = await readIndex(env);
  const seen = new Set(index.map((c) => c.id));

  // Reconcile: pokupi durable ključeve koji (zbog race-a pri pisanju indexa) nisu u indexu.
  // Ključ je `fb:<ts>:<id>` → id se čita iz imena, pa se get radi SAMO za ključeve koji nedostaju.
  const list = await env.FEEDBACK_KV.list({ prefix: 'fb:', limit: 1000 });
  const missing = list.keys.filter((k) => !seen.has(k.name.split(':').slice(2).join(':'))).slice(0, 20);
  let added = false;
  for (const key of missing) {
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
