// Mock podaci za design prototip (Faza 1). Nema onchain logike — sve je lažno.
// Sadržaj utemeljen na ČINJENIČNOM researchu o Družbi „Braća Hrvatskoga Zmaja"
// (dbhz.hr + Registar udruga + enciklopedijski izvori, provjereno 2026-06).
// Provjerene činjenice označene su komentarom „ČINJENICA"; neobjavljeni iznosi su
// jasno označeni kao ILUSTRATIVNI demo (Družba ne objavljuje financijske brojke).

export const eur = (n: number) =>
  new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' }).format(n);

export const account = {
  name: 'Moj novčanik',
  balance: 96.0,
  // skraćeni Safe address — samo za prikaz
  address: '0x5af2…9C1d',
  membershipActive: true,
  weeklyDues: 1, // 1 € tjedno — donatorska pretplata za baštinu
  level: 'Podupiratelj', // Prijatelj baštine → Podupiratelj → Zmaj
};

export const kindLabel: Record<'donacija' | 'clanarina' | 'primljeno', string> = {
  donacija: 'Donacija fondu',
  clanarina: 'Članarina',
  primljeno: 'Primljeno',
};

export type Tx = {
  id: string;
  kind: 'donacija' | 'clanarina' | 'primljeno';
  // donatori su anonimni po defaultu (pseudonim), javno ime samo uz opt-in
  who: string;
  amount: number;
  when: string;
  recurring?: boolean;
};

// Transparentnost = temeljna vrijednost: javni, auditabilni registar financiranja baštine.
export const ledger: Tx[] = [
  { id: 't1', kind: 'donacija', who: 'Matija S.', amount: 30, when: 'danas, 09:12', recurring: true },
  { id: 't2', kind: 'clanarina', who: 'Moj novčanik', amount: 1, when: 'pon, 08:00', recurring: true },
  { id: 't3', kind: 'donacija', who: 'Anonimni donator', amount: 50, when: 'pet, 17:40' },
  { id: 't4', kind: 'donacija', who: 'Ivana K.', amount: 20, when: 'pet, 11:03' },
  { id: 't5', kind: 'primljeno', who: 'SEPA uplata', amount: 100, when: 'čet, 14:22' },
  { id: 't6', kind: 'donacija', who: 'Tomislav B.', amount: 30, when: 'sri, 20:15', recurring: true },
  { id: 't7', kind: 'clanarina', who: 'Darko P.', amount: 1, when: 'pon, 08:00', recurring: true },
];

// Javni agregat zajednice (za "transparentnost" karticu).
// activeMembers: ČINJENICA — Pravila 2024. propisuju numerus clausus od 385 redovitih
// članova (zmajeva). Prikupljeni/ciljani iznosi su ILUSTRATIVNI demo (nisu objavljeni).
export const community = {
  totalRaised: 24800, // € — ILUSTRATIVNO (demo)
  activeMembers: 385, // ČINJENICA: numerus clausus redovitih članova (Pravila 2024)
  goal: 40000, // € — ILUSTRATIVNO (demo)
  goalLabel: 'Obnova i očuvanje baštine — 2026.',
};

export const donationPresets = [10, 30, 50];

// ── Članarina: dvije kategorije ──────────────────────────────────────────────
// Podupiratelj: 1 €/tjedno (donatorska pretplata).
// Meštarski zbor: tijelo koje upravlja Družbom (Veliki meštar + 8 meštara) — viši doprinos.
export type TierKey = 'redovni' | 'uo';
export const tiers: Record<
  TierKey,
  {
    key: TierKey;
    label: string;
    rate: number;
    adverb: string; // "tjedno" | "dnevno"
    unit: [string, string, string]; // hrvatska množina: 1 / 2-4 / 5+
    periodDays: number;
    presets: number[];
    owed: number; // neplaćena razdoblja unatrag
  }
> = {
  redovni: {
    key: 'redovni',
    label: 'Podupiratelj',
    rate: 1,
    adverb: 'tjedno',
    unit: ['tjedan', 'tjedna', 'tjedana'],
    periodDays: 7,
    presets: [4, 12, 52],
    owed: 0,
  },
  uo: {
    key: 'uo',
    label: 'Meštarski zbor',
    rate: 3,
    adverb: 'dnevno',
    unit: ['dan', 'dana', 'dana'],
    periodDays: 1,
    presets: [7, 30, 90],
    owed: 3,
  },
};

/** Hrvatska množina po zadnjoj znamenki (1 tjedan / 2-4 tjedna / 5+ tjedana). */
export function plural(n: number, forms: [string, string, string]) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) return forms[1];
  return forms[2];
}

// ── Fondovi za baštinu (namjenski računi) ────────────────────────────────────
// Svaki fond = zaseban namjenski Safe (transparentan, auditabilan). Donator usmjerava
// donaciju na fond po izboru. Fondovi su vezani uz STVARNE projekte/objekte baštine
// o kojima Družba skrbi (dbhz.hr); prikupljeni/ciljani iznosi su ILUSTRATIVNI demo.
export type Project = {
  id: string;
  name: string;
  desc: string;
  raised: number;
  goal: number;
  contributors: number;
  address: string;
  central?: boolean;
};
export const projects: Project[] = [
  {
    id: 'opci',
    name: 'Opći fond Družbe',
    desc: 'Skrb o Kuli nad Kamenitim vratima (sjedište), manifestacije i operativni rad Družbe',
    raised: 6120,
    goal: 9000,
    contributors: 214,
    address: '0x0pć…A1c',
    central: true,
  },
  {
    id: 'ozalj',
    name: 'Fond „Stari grad Ozalj"',
    desc: 'Obnova dvorca Ozalj — krovište i pročelja (obnova u tijeku od 2006.)',
    raised: 9840,
    goal: 16000,
    contributors: 168,
    address: '0xOza…7C4',
  },
  {
    id: 'arhiv',
    name: 'Fond digitalizacije i arhiva',
    desc: 'Arhiv Frankopana i digitalna izdanja — zaštita i javna dostupnost građe',
    raised: 4360,
    goal: 7000,
    contributors: 122,
    address: '0xArh…9D2',
  },
  {
    id: 'izdavastvo',
    name: 'Fond izdavaštva',
    desc: 'Glasilo „Zmajske vijesti" i biblioteka „Acta et Studia Draconica"',
    raised: 2980,
    goal: 5000,
    contributors: 96,
    address: '0xIzd…2B7',
  },
];

// ── zmajEUR: loyalty token za volontere na baštini ───────────────────────────
// Ne-prenosiv (soulbound) — izdaje samo Družba kao potvrdu volonterskog rada na
// baštini; iz fonda može se zamijeniti za EURe. Bez P2P → izvan EMT/EMI okvira.
// Interni identifikator/slug `edeur` i datoteka `edeur-loyalty-token.md` ostaju;
// u UI-u se prikazuje kao „zmajEUR".
export const loyalty = {
  balance: 12, // zmajEUR
  fundAvailable: 960, // EURe dostupno u fondu za isplate
  log: [
    { id: 'r1', label: 'Volonterski rad na obnovi — Stari grad Ozalj', amount: 6, when: 'sub, 10:30' },
    { id: 'r2', label: 'Vodstvo posjetitelja — Kula nad Kamenitim vratima', amount: 3, when: 'sri, 17:00' },
    { id: 'r3', label: 'Digitalizacija arhivske građe — Arhiv Frankopana', amount: 3, when: 'pon, 19:00' },
  ],
};
export const edeur = (n: number) => `${n} zmajEUR`;

export const dmy = (d: Date) =>
  new Intl.DateTimeFormat('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);

// ── Baština: javni registar objekata i projekata Družbe ──────────────────────
// SAMO STVARNI, provjerljivi objekti/projekti baštine o kojima Družba skrbi
// (izvor: dbhz.hr — Ostvarenja, Stari grad Ozalj, Arhiv Frankopana, Nakladništvo,
// Aktivnosti). NEMA izmišljenih imena ljudi. ⚠️ Iznosi (amount) NISU javno objavljeni
// → ILUSTRATIVNI su za demo prikaz ulaganja u baštinu; ne predstavljaju službene brojke.
export type Bastina = {
  id: string;
  name: string;
  project: string;
  location: string;
  amount: number;
  date: string;
  status: 'primljeno' | 'u obradi';
  sector: string;
  address: string; // skraćeni Safe namjenskog projekta
};
export const bastina: Bastina[] = [
  {
    id: 'b1',
    name: 'Stari grad Ozalj',
    project: 'Obnova krovišta i pročelja dvorca · obnova u tijeku od 2006.',
    location: 'Ozalj',
    amount: 9840,
    date: 'od 2006.',
    status: 'primljeno',
    sector: 'Obnova spomenika',
    address: '0xOza…7C4',
  },
  {
    id: 'b2',
    name: 'Kula nad Kamenitim vratima',
    project: 'Skrb o sjedištu Družbe i zaštita kulturnog dobra',
    location: 'Zagreb',
    amount: 5200,
    date: 'trajno',
    status: 'primljeno',
    sector: 'Skrb o spomeniku',
    address: '0xKul…3A8',
  },
  {
    id: 'b3',
    name: 'Arhiv Frankopana',
    project: 'Digitalizacija zbirke obitelji Frangipane (2023.) — javna dostupnost',
    location: 'Zagreb',
    amount: 3600,
    date: '2023.',
    status: 'primljeno',
    sector: 'Digitalizacija',
    address: '0xArh…9D2',
  },
  {
    id: 'b4',
    name: 'Spomenik kralju Zvonimiru',
    project: 'Podignut spomenik kralju Dmitru Zvonimiru (2009.)',
    location: 'Knin',
    amount: 4100,
    date: '2009.',
    status: 'primljeno',
    sector: 'Spomen-obilježje',
    address: '0xZvo…6F1',
  },
  {
    id: 'b5',
    name: 'Tečaj glagoljice',
    project: 'Edukacijski tečaj glagoljice u Viteškoj dvorani',
    location: 'Zagreb',
    amount: 1800,
    date: '2026.',
    status: 'u obradi',
    sector: 'Edukacija',
    address: '0xGla…1E5',
  },
  {
    id: 'b6',
    name: 'Glasilo „Zmajske vijesti"',
    project: 'Izdavanje glasila i biblioteke „Acta et Studia Draconica"',
    location: 'Zagreb',
    amount: 2980,
    date: 'redovito',
    status: 'primljeno',
    sector: 'Izdavaštvo',
    address: '0xIzd…2B7',
  },
];

// ── Moj doprinos: osobna strana za volontera-zmaja ────────────────────────────
// Prikazuje se u screen "primanja" („Moj doprinos"). Demo persona: volonter na baštini.
export type GrantPayout = {
  id: string;
  title: string;
  detail: string;
  amount: number;
  currency: 'eur' | 'edeur';
  cadence: 'jednokratno' | 'u ratama';
  status: 'primljeno' | 'dostupno' | 'u obradi';
  source: string;
  screen?: 'poduzetnici';
};
export const grantPayouts: GrantPayout[] = [
  {
    id: 'g-ozalj',
    title: 'Naknada troškova — obnova Ozlja',
    detail: 'Naknada putnih i materijalnih troškova volonterskog rada · isplaćeno u EURe',
    amount: 220,
    currency: 'eur',
    cadence: 'jednokratno',
    status: 'primljeno',
    source: 'Družba „Braća Hrvatskoga Zmaja" · Fond „Stari grad Ozalj"',
    screen: 'poduzetnici',
  },
  {
    id: 'g-zmaj',
    title: 'Priznanje volonterskog rada',
    detail: 'zmajEUR za vodstvo posjetitelja u Kuli nad Kamenitim vratima',
    amount: 9,
    currency: 'edeur',
    cadence: 'jednokratno',
    status: 'primljeno',
    source: 'Družba „Braća Hrvatskoga Zmaja" · zmajEUR program',
  },
];

// ── Statistike zajednice (za Aktivnost / Baština ekrane) ─────────────────────
// ČINJENICE: membersMax (385, numerus clausus, Pravila 2024), stolovi (24: 19 u HR + 5
// inozemnih, dbhz.hr), founded (1905), restored (1990), spomendani (22, zmajski kalendar).
// ⚠️ Financijski/projektni agregati NISU javno objavljeni → ILUSTRATIVNE demo projekcije
// koje pokazuju KAKO bi prikaz izgledao onchain, ne službene brojke Družbe.
export const communityStats = {
  investedInHeritage: 27300, // € — ILUSTRATIVNO (zbroj prikazanih demo ulaganja)
  heritageProjects: 6, // broj prikazanih objekata/projekata baštine u registru (demo)
  membersMax: 385, // ČINJENICA: numerus clausus redovitih članova (Pravila 2024)
  zmajskiStolovi: 24, // ČINJENICA: 19 u Hrvatskoj + 5 inozemnih (dbhz.hr)
  volunteerHours: 1240, // ILUSTRATIVNO (demo projekcija)
  edeurInCirculation: 2840, // ILUSTRATIVNO — zmajEUR je konceptualni prototip token
  avgInvestment: 4550, // ILUSTRATIVNO — usklađeno: 27300 / 6 prikazanih projekata
};

// ── Transparentnost Družbe ───────────────────────────────────────────────────
// ČINJENICE (dbhz.hr/kontakt + Registar udruga + statut „Ordo Draconicus" 2024.):
// OIB, IBAN, banka, godina osnutka i obnove, registarski broj, sjedište.
// Prikupljeni/uloženi/rezervni iznosi su ILUSTRATIVNI demo.
export const associationBudget = {
  year: 2025,
  founded: '16.11.1905.', // ČINJENICA: osnovana u Zagrebu
  restored: '23.06.1990.', // ČINJENICA: obnovljena nakon zabrane 1946.
  totalRaised: 24800, // € prikupljeno — ILUSTRATIVNO (demo)
  totalInvested: 27300, // € uloženo u baštinu — ILUSTRATIVNO (demo)
  reserves: 6120, // € rezerva u fondu — ILUSTRATIVNO (demo)
  transparencyNote: 'Sve transakcije onchain, javno auditabilne na Gnosisu.',
  oib: '78879984090', // ČINJENICA (dbhz.hr/kontakt)
  iban: 'HR8923400091100055160', // ČINJENICA (dbhz.hr/kontakt)
  bank: 'Privredna banka Zagreb (PBZ)', // izvedeno iz IBAN bankovnog koda 2340009
  regNumber: '00000113', // ČINJENICA: Registar udruga RH (statut 2024.)
};
