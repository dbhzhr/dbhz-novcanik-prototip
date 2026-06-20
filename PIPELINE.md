# PIPELINE.md — Autonomni multi-agent pipeline za white-label self-custody wallet prototip

Operativni blueprint: kako od **(URL zajednice)** autonomno proizvesti **design-mock prototip
novčanika** za tu zajednicu. Komplementaran s [`BLUEPRINT.md`](BLUEPRINT.md) (ručni referentni
opis intervencijskih točaka). Ovaj dokument opisuje **automatiziran** tijek preko subagenata.

> 🧭 **STATUS (odluka vlasnika, 2026-06-19): VIZIJA, nije aktivna praksa.** Autonomni pipeline
> ovdje (template + skripte) **nije** izgrađen i **neće se** graditi zasad. **Aktualni način rada
> za novi community = ručni klon postojećeg prototipa (npr. VG) + slijeđenje [`BLUEPRINT.md`](BLUEPRINT.md)**
> — provjereno radi (e-Demokracija → MOST → VG → Mama uspio sam). Ovaj dokument čuvamo kao mapu
> ako se autonomija ikad poželi; do tada je BLUEPRINT.md mjerodavan.

Odluke vlasnika (2026-06-19), koje oblikuju cijeli pipeline:

| Odluka | Izbor | Posljedica |
|---|---|---|
| **Tip outputa** | Design mock (lineage #2) | `mock.ts` + ekrani, bez onchaina. Brz pitch demo. |
| **Bazni template** | Čisti neutralni `novcanik-template` | Stage 0 prerequisite: izdvojiti zajedničku jezgru iz VG/MOST/e-DEM. |
| **Autonomija** | Gated na činjenice + pred-deploy | 2 ljudske kontrolne točke; ostalo autonomno. |
| **Isporuka** | Auto-deploy CF Pages | Pipeline radi KV + deploy + domenu. |

---

## 0. Ključni arhitektonski uvid (pročitaj prvo)

Postoje **dva odvojena codebasea**, nemoj ih brkati:

1. **Funkcionalni wallet** — `/Users/ms/git/domovinatv/pay.domovina.ai/wallet`.
   Pravi proizvod: React+wouter+zustand+viem, Safe 1.4.1 + passkey/WebAuthn, EURe na Gnosisu,
   relayer, **stvarne onchain tx**. White-label = `src/brands/<id>/brand.ts` (jedan TS objekt:
   boje, copy, feature-flag) + runtime resolucija po hostnameu. **Ovo NIJE ono što ovaj pipeline gradi**,
   ali je izvor istine za koncepte (Safe, passkey, EURe, counterfactual adresa, MultiSend).

2. **Design-prototip lineage** — `e-demokracija/novcanik → most/novcanik → velikagorica/novcanik-prototip
   → mamauspiosam/novcanik-prototip`. **Mock demo-i** (nema onchaina; `src/lib/mock.ts` + ekrani + `TABS`),
   klonirani jedan iz drugoga. Vizualno predstavljaju funkcionalni wallet za pitch svakoj zajednici.
   **Ovaj pipeline klonira i puni lineage #2.**

Mock ekrani su **brand-agnostični** i čitaju ISKLJUČIVO iz `src/lib/mock.ts`. Sva logika ostaje konstantna;
mijenja se **sadržaj** (koje činjenice se kodiraju) i **UI konfiguracija** (koji ekrani, koje labele).

---

## Stage 0 (jednokratno) — Izdvoji čisti `novcanik-template`

> ⚠️ **STATUS: NIJE JOŠ IZRAĐEN (2026-06-19).** Ovaj template **ne postoji** na disku.
> Dok ne postoji, pipeline NIJE izvediv iz praznog repoa — novi session nema što klonirati.
> Ovo je kamen temeljac cijele autonomije; sve faze ispod ovise o njemu. Trenutni način rada
> (novi prototip = klon postojećeg, npr. VG, + ručno slijeđenje blueprinta) i dalje vrijedi.

Prerequisite za sve. Cilj: repo bez ijedne community-specifičnosti, s **praznim tipiziranim slotovima**,
tako da per-community pipeline puni minimalnu površinu (idealno 3 datoteke).

**Izvor:** presjek zajedničke jezgre VG/MOST/e-DEM (vidi `BLUEPRINT.md §2` za popis konstantnih datoteka).

**Strugaj (ukloni community-specifično):**
- VG: `Komunalno.tsx`, `Primanja.tsx`, `Stipendije.tsx`, `cityPayouts`, `localCouncils`, `localGov`,
  `cityBudget`, `tokenomics` (σ/DESUB/myRatio).
- Sve realne osobe/iznose/IBAN/OIB iz `mock.ts` → zamijeni placeholderima.
- `brand/raw/*`, logotipe, fontove → ukloni; ostavi prazne foldere + `BRAND.md` predložak.

**Ostavi (generička jezgra):**
- Ekrani: `Home, Doniraj, Clanarina, Projekti, Nagrade, Aktivnost, Primi, Onboarding` + `docs/DocsPage`.
- Feedback widget + `functions/api/feedback.ts` + KV scaffolding.
- Tema (CSS var RGB kanali), `theme.ts`, no-FOUC script.
- Build/deploy scaffolding (`vite.config.ts`, `postcss`, `tsconfig`, `_headers`, `sw.js`).
- **Phone frame sizing (naučeno):** `md:h-[86vh] md:max-h-[860px] md:min-h-[620px] md:w-[392px]`
  (fiksna širina 392px — NE aspect-ratio; vidi gotcha #G1 dolje).

**Definiraj jedinstveni intervencijski sloj** — `src/lib/community.ts` (novo), koji `mock.ts` konzumira:

```ts
export interface CommunityConfig {
  slug: string;                 // 'mama-uspio-sam' → CF Pages 'musw-prototip'
  legalName: string;            // 'Udruga „Mama, uspio sam"'
  shortName: string;            // ≤12 znakova za uske slotove
  slogan: string;               // <h1>
  subtitle: string;             // podnaslov
  website: string;
  brand: { primaryHex; accentHex; pageHex; font; logoSourceUrl };
  identity: { oib; iban; bank; founded };           // provjereno!
  governance: { boardName; memberLabel; tierLabels: [redovni, uo] };
  loyalty: { token; earnRules; sink };              // 'mamaEUR' …
  funds: Fund[];                // grant fondovi / projekti / kampanje (zasebni Safe-ovi)
  people: Beneficiary[];        // realni primatelji — IME, grad, sektor, iznos (provjereno!)
  stats: CommunityStats;        // totalRaised, members, goal …
  conceptMap: Record<string,string>; // 'grad'→'udruga', 'komunalno'→null …
  navScreens: { tabs: ScreenKey[]; more: ScreenKey[] }; // koji opcionalni ekrani
}
```

**Brand tokeni kao placeholderi** u `tailwind.config.js` (imena `navy`/`orange` zadržana) i `src/index.css`
(`:root`/`.theme-dark` RGB kanali) — pipeline ih prepisuje vrijednostima iz `brand`.

**Deliverable Stage 0:** repo `/Users/ms/git/_template/novcanik-template` koji se buildira s placeholder
sadržajem i prolazi `tsc --noEmit && npm run build`.

---

## Per-community pipeline (orkestrirano iz ovog chata)

**Orkestrator = ovaj session** (Opus 4.8 1M — velik prozor drži cijeli blueprint). Pokreće faze preko
`Agent`/`Workflow` poziva; **subagenti mogu biti `model: 'sonnet'`** (Sonnet 4.6, svaki svoj 200k prozor).

> **Zašto chat-orkestracija, a ne jedan veliki `Workflow`?** Gate-ovi traže ljudsku potvrdu *usred* tijeka.
> `Workflow` se izvodi do kraja bez prekida (ne može pitati korisnika). Zato su gate-ovi granice između
> zasebnih poziva: orkestrator pokrene fazu → ja predočim artefakte → `AskUserQuestion` → sljedeća faza.
> Unutar faze (paralelni fan-out bez ljudske odluke) koristi se `Workflow`/`parallel`.

**Ulaz (args):** `{ communityName, website, conceptHints? }`. Za MUSW: `{ "Udruga Mama uspio sam",
"https://mamauspiosam.hr/" }`.

### Faza 1 — RESEARCH (paralelni multi-modalni sweep · Sonnet subagenti)

Svaki agent vraća schema-validiran JSON; agenti su slijepi jedan na drugoga (multi-modal sweep pattern):

| Agent | Zadatak | Alati | Output |
|---|---|---|---|
| `web-mission` | Misija, slogan, programi, vrijednosti, ton | firecrawl/WebFetch | `mission` dio |
| `web-people` | Realni primatelji/članovi/partneri + iznosi iz medija | WebSearch + scrape | `people[]` |
| `registry` | OIB, IBAN, banka, datum osnivanja, pravni oblik | sudreg/registri | `identity` |
| `brand-extract` | Boje iz CSS-a, font, **logo URL iz WP media** (`/wp-content/uploads/`) | scrape CSS/HTML | `brand` + logo asset |
| `stats` | Brojevi (prikupljeno, članovi, ciljevi) — ili razumne procjene označene kao takve | scrape | `stats` |

Spoji u `CommunityFacts` + `BrandTokens`. Preuzmi logo u `brand/logos/`.

> **GATE 1 — provjera činjenica (OBVEZNO).** Predoči korisniku: sve osobe+iznose, OIB/IBAN, boje, **logo
> preview**. Razlog: rizik halucinacije (vidi [[feedback-no-hallucinated-logos]] — danas je „M" logo bio
> izmišljen). Ništa neprovjereno ne ulazi u mock. Korisnik potvrđuje/ispravlja → tek onda dalje.

### Faza 2 — CONCEPT MAPPING / SYNTHESIS

Jedan agent (ili orkestrator) mapira baznu domenu na zajednicu i bira ekrane:
- koncepti: `grad→udruga`, `gradsko vijeće→upravni odbor`, `vgEUR→mamaEUR`, `komunalno→∅`,
  `stipendije→grantovi`, `participativni proračun→transparentni grant fondovi` …
- `navScreens`: koji su tab-ovi, što ide u „Više". Output `ProductMap` → popunjava `community.ts`.

### Faza 3 — GENERATION (pipeline po datotekama)

1. Kloniraj `novcanik-template` → `/Users/ms/git/<owner>/<slug>-prototip` (worktree izolacija ako paralelno).
2. Zapiši `src/lib/community.ts` iz `CommunityFacts` + `ProductMap`.
3. Brand: prepiši `tailwind.config.js` (boje/font), `src/index.css` (RGB kanali light+dark), `index.html`
   (`theme-color`, `<title>`, font `<link>`/preconnect), `public/manifest.webmanifest`.
4. Logo → ikone: `public/icons/{192,512,maskable-512,apple-touch}` + in-app `public/emblem.png`
   (vidi gotcha #G2: bijeli emblem na navy, zaobljeni kutovi; ImageMagick/rsvg).
5. `App.tsx`: `TABS`, `MORE_ITEMS`, `Screen` tip, `SCREENS` iz `navScreens`.
6. Compliance docs (`docs/compliance/*.md`): zamijeni nazive tokena/entiteta (display copy), interne
   slugove (`edeur`) ostavi.
7. Napiši `CLAUDE.md` (konvencije, deploy, gotchas, KV id placeholder).

### Faza 4 — VERIFY

- `tsc --noEmit && npm run build` (mora proći).
- `vite preview` + screenshot **svakog** ekrana, light i dark (Chrome DevTools MCP).
- **Adversarial remnant-check agent**: grep za ostacima bazne zajednice (`Gorica|grad|komunalno|MOST|
  e-Demokracija`), placeholder tekstom, slomljenim kontrastom (gold CTA AA), VG-tokenomikom.
  Sve nađeno → popravi i ponovno verify (loop-until-clean).

> **GATE 2 — pred-deploy.** Predoči screenshote svih ekrana (light+dark) + remnant-report. Korisnik
> potvrđuje → deploy.

### Faza 5 — DEPLOY (auto)

```bash
# 1. KV namespace
wrangler kv namespace create "<slug>-feedback" --account-id 7dc7167b7e2e00923bfa7cd697df14e4
#    → upiši id u wrangler.toml [[kv_namespaces]] id="…"
# 2. Build + deploy
npm run build
CLOUDFLARE_ACCOUNT_ID=7dc7167b7e2e00923bfa7cd697df14e4 \
  npx wrangler pages deploy dist --project-name=<slug>-prototip --branch=main --commit-dirty=true
# 3. Custom domena: CNAME <slug>-prototip → <slug>-prototip.pages.dev (proxied) u zoni domovina.ai
#    (CF API token s DNS:Edit; inače ručni korak — pipeline javi i stane).
```
Output: live URL + commit na novoj grani.

---

## Orkestracijski kostur (pseudo, iz ovog chata)

```
facts   = Workflow(research.js, {community, website})   // Faza 1: parallel sonnet agents → CommunityFacts
review(facts)                                            // GATE 1: AskUserQuestion (potvrdi/ispravi)
map     = Agent("concept-map", {facts})                  // Faza 2
Workflow(generate.js, {template, facts, map})            // Faza 3+4: clone, fill, build, screenshot, remnant-loop
review(screenshots)                                      // GATE 2: AskUserQuestion
deploy(slug)                                             // Faza 5: KV + pages deploy + CNAME
```

Subagentima koji pišu datoteke paralelno daj `isolation: 'worktree'`. Research/verify agenti su read/scrape.

---

## Gotchas specifični za pipeline

- **#G1 Phone frame:** koristi **fiksnu širinu** `md:w-[392px]` + `md:h-[86vh] md:max-h-[860px]
  md:min-h-[620px]`. NE `aspect-[w/h]` s visinom vezanom na `vh` — to suzi frame na laptopu pa tekst
  izgleda ogroman (naučeno na MUSW; svi VG/MOST/e-DEM koriste fiksnu širinu).
- **#G2 Logo — nikad ne haluciniraj.** Povuci pravi logo iz WP media (`LOGO-clean.png`, često
  bijelo-na-prozirnom). Izvedi ikone iz njega. Vidi `BLUEPRINT.md` gotcha #8 + [[feedback-no-hallucinated-logos]].
- **#G3 Croatian fontovi:** osiguraj `latin-ext` subset (č ć ž š đ). CDN font → preconnect obvezan;
  self-hosted → `-latin` + `-latinext` WOFF2 s `unicode-range`.
- **#G4 Tailwind opacity:** brand var MORA biti RGB kanali (`29 36 64`), ne hex — inače `bg-navy/10` puca.
- **#G5 CF Pages SW keš:** hard refresh nakon deploya.
- **#G6 KV eventual consistency:** feedback `POST` 200, ali `list()` kasni ~60s — čitaj preko stabilnog
  INDEX ključa (e-DEM uzorak).
- **#G7 Account D.O.M.:** `7dc7167b7e2e00923bfa7cd697df14e4` ide kao env var (nije u Pages wrangler.toml).

---

## Poznate instance (SSOT za buduće klonove)

| Brand | Dir | KV id | Status |
|---|---|---|---|
| e-Demokracija | `/Users/ms/git/e-demokracija/novcanik` | `ad7201612d6440adaf2a72b49d871da5` | prva baza |
| MOST | `/Users/ms/git/most/novcanik` | `2613cbe1690742b49e0e5db9c20d997b` | v2 |
| Velika Gorica | `/Users/ms/git/velikagorica/novcanik-prototip` | `463a01fd515d4dd192ed82a77b4aa1be` | najnapredniji |
| Mama uspio sam | `/Users/ms/git/mamauspiosam/novcanik-prototip` | `44751269fdd4458587490444d9cacf32` | live (referentni primjer) |

MUSW služi kao **validacijski referentni primjer**: pipeline pokrenut na `mamauspiosam.hr` mora
reproducirati poznate-dobre činjenice (6 poduzetnika, OIB 23680302635, navy #1D2440 / gold #EFAB23).
