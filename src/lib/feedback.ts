// Feedback komentari + boja po osobi. Bez fiksne liste imena — boja se
// deterministički izvodi iz imena (stabilan hash → paleta), pa svaki komentator
// dobije svoju dosljednu boju bez ikakvog predefiniranog popisa.
export type Comment = { id: string; name: string; screen: string; where?: string; comment: string; ts: number };

export type FbColor = { accent: string; tint: string };

// Paleta čitljiva na svijetloj pozadini (dovoljno raznolika da se imena razlikuju).
const PALETTE = [
  '#0C5430', // zmajska zelena (brand)
  '#2563eb', // plava
  '#16a34a', // zelena
  '#7c3aed', // ljubičasta
  '#db2777', // magenta
  '#0891b2', // cijan
  '#ea580c', // narančasta
  '#0d9488', // teal
  '#9333ea', // purpurna
  '#b8860b', // zlatna
  '#475569', // siva
  '#be123c', // ružičasto-crvena
];

/** Stabilan FNV-1a hash imena → indeks u paleti (neovisan o velikim/malim slovima). */
function hashName(name: string): number {
  const s = name.trim().toLowerCase();
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function colorFor(name: string): FbColor {
  const accent = PALETTE[hashName(name) % PALETTE.length];
  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);
  return { accent, tint: `rgba(${r},${g},${b},0.10)` };
}

export async function fetchComments(): Promise<Comment[]> {
  const r = await fetch('/api/feedback');
  const d = (await r.json()) as { items?: Comment[] };
  return d.items ?? [];
}
