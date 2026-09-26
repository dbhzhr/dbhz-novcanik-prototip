# BACKPORT-PLAN — nadogradnje iz novijih wallet prototipova u DBHZ

DBHZ je rebrandan iz MUSW baze 2026-06-20; kasnije su srodni repoi dobili nadogradnje
koje DBHZ nema. Ovaj plan ih backporta, **prilagođene DBHZ brandu i baštinskom sadržaju**.
Fork-kontekst: `/Users/ms/git/domovinatv/novcanik-template/LOZA-NOVCANIKA.md`.

## Izvori (lokalni repoi + commitevi — čitaj njihove diffove kao predložak)

| Izvor | Commit | Što |
|---|---|---|
| `/Users/ms/git/domovinatv/novcanik-template` | `90f45da` | lucide ikone (`src/components/icons.tsx` pattern) + PWA splash + UI dorade |
| `/Users/ms/git/domovinatv/novcanik-template` | `8970e19` | Glasovanje ekran kao standardni primitiv (`src/screens/Glasovanje.tsx` + mock) |
| `/Users/ms/git/zef/zef-novcanik-prototip` | `65629ef` + `aa9f76c` | compliance dokument „isplativost" (wallet vs. ostali kanali; SEPA skup za mikrouplate) |
| `/Users/ms/git/zef/zef-novcanik-prototip` | `2042382` | Doniraj: solidarna kampanja + fee-free mikrodonacije |
| `/Users/ms/git/ss/ss-novcanik-prototip` | `4041691` | OpenGraph/Twitter tagovi + iOS splash setovi (edge middleware NE treba — DBHZ je single-tenant) |

## Faze (redom; svaka = implementacija → verifikacija → commit)

### Faza 1 — Lucide ikone + PWA splash (template `90f45da`)
- `npm i lucide-react` (pinaj verziju kao u template-u).
- Kopiraj/adaptiraj `src/components/icons.tsx`: jednobojni SVG kroz `currentColor`;
  **sektorske ikone premapiraj na DBHZ baštinske kategorije** (npr. Landmark/Castle za
  Stari grad Ozalj, Archive/ScanText za digitalizaciju arhiva, BookOpen za izdavaštvo,
  Church/Shield/ScrollText po smislu) — vidi `src/lib/mock.ts` kategorije.
- Zamijeni emojije po ekranima i komponentama (template diff je vodič; DBHZ ima iste
  MUSW ekrane + vlastite `Bista.tsx`/`BistaViewer.tsx` — 3D viewer NE dirati).
- PWA splash: generiraj `public/icons/splash/*.png` (sve dimenzije iz template commita,
  po mogućnosti i 1206×2622/1320×2868 iz ss `4041691`) — **grb `public/emblem.png`
  centriran na zmajsko-zelenoj `#0C5430`** (Python/PIL ili sips+ImageMagick skripta u
  `scripts/`); `apple-touch-startup-image` linkovi u `index.html`.
- ⚠️ CLAUDE.md gotcha #3 (tipografski navodnici u atributima) i #9 (brand tokeni,
  ne hardkodirati hex u komponentama).

### Faza 2 — Dokument „Isplativost" (zef `65629ef` + `aa9f76c`)
- Novi `docs/compliance/isplativost-wallet.md` po uzoru na zef (142 linije + SEPA dopuna),
  **adaptiran na DBHZ**: mikrodonacije i članarine za očuvanje baštine vs. bankovni
  kanali/kartice/humanitarni SMS; iznosi ilustrativni (označi).
- Registriraj rutu u `src/docs/DocsPage.tsx` (`/dokumenti/isplativost`) + karticu na
  `/dokumenti` + link s Doniraj ekrana (kao zef `65629ef` diff).
- ⚠️ Gotcha #1: mermaid + Titillium Web font (`ensureFonts()` već postoji — samo slijedi postojeći pattern).

### Faza 3 — Solidarna kampanja + fee-free mikrodonacije (zef `2042382`)
- `Doniraj.tsx` proširenje po zef diffu: istaknuta solidarna kampanja s progressom +
  poruka da mikrodonacije idu bez naknada (fee-usporedba), mock podaci u `src/lib/mock.ts`.
- DBHZ adaptacija: kampanja **„Obnova krovišta — Stari grad Ozalj"** (ilustrativno,
  označi komentarom u mock.ts); ton apolitičan, baštinski.
- NE duplicirati 3D bista kampanju — ovo je zasebna, manja solidarna kartica na Doniraj.

### Faza 4 — OpenGraph/Twitter meta tagovi (ss `4041691`, pojednostavljeno)
- DBHZ je single-tenant → **statični** OG/Twitter tagovi u `index.html`
  (title/description/url/image), BEZ `functions/_middleware.ts`.
- Generiraj `public/og-image.png` (1200×630): grb na zmajsko-zelenoj + naziv novčanika
  (ista skripta kao splash). ⚠️ Gotcha #3 za navodnike u `content="…"`.

### Faza 5 (opcionalno, zadnje) — Glasovanje ekran (template `8970e19`)
- `src/screens/Glasovanje.tsx` + mock: adaptirati kao **interno glasovanje Družbe**
  (skupština/Meštarski zbor odlučuje o prioritetima obnove — apolitično, članske odluke).
- Ulaz kroz „Više" sheet (kao ostali sekundarni ekrani), screen key `glasovanje`,
  deep-link `?screen=glasovanje`.

## Verifikacija (prije svakog commita)

- `npm run build` čist; smoke: headless Chrome `--headless=new --timeout=N` (+ swiftshader
  flagovi za WebGL ekrane; NIKAD `--virtual-time-budget` uz autoRotate).
- Vizualno: pravi Chrome kroz chrome-devtools MCP (`new_page`, `resize_page` 390×844,
  screenshot) — provjeri Home, Doniraj, Dokumenti, Više sheet, i da je ekran Bista netaknut.
- PWA splash/OG: provjeri `index.html` linkove + da datoteke postoje u buildu.

## Git / deploy higijena

- Commit po fazi (hrvatske opisne poruke), push na origin.
- Na kraju SVEGA: **SW cache bump** u `public/sw.js` (`dbhz-novcanik-v5` → `v6`),
  build, deploy (komanda u CLAUDE.md), provjera live URL-a.
- Ažuriraj CLAUDE.md (nova sekcija: ikone/splash/OG konvencije) i memory datoteke
  (dbhz-prototip memorija: što je backportano, iz kojih commitova).
- 3D bista i svi njeni gotchas ostaju netaknuti; sve kopije hrvatski; iznosi ilustrativni.

---

# Backport 2 (2026-09-26) — znanje iz funkcionalnog novčanika i e-demokracije

Izvor odabran pregledom loze (2026-09-26): jedini pravi self-custody kod i najbogatija dokumentacija su u
funkcionalnom novčaniku; među prototipovima je samo e-demokracija dobila nešto novo nakon Backporta 1.
DBHZ je Faza 1 (mock) → **prenosi se znanje, obrasci i tekstovi, ne onchain kod.**

| Izvor | Commit / datoteka | Što |
|---|---|---|
| `/Users/ms/git/domovinatv/pay.domovina.ai` | `docs/postmortems/0001-trapped-funds-passkey-only-campaign-safe.md` | lekcija: kampanjski Safe samo s passkeyem = zarobljena sredstva |
| isto | `wallet/docs/security-custody-model.md`, `docs/decisions/0001`, `0008`, `0012` | model skrbništva, više passkeyeva, seed kao drugi vlasnik, nema server-side recoveryja |
| isto | `docs/decisions/0016-tenant-payout-whitelist.md` | fail-closed whitelist isplata |
| isto | `wallet/docs/user-flows.md`, `wallet/docs/passkey-onboarding.md` | realističan onboarding tok (mock) |
| isto | `wallet/src/components/UpdateBanner.tsx`, `wallet/docs/deploy-and-pwa.md` | banner „nova verzija” umjesto ručnog hard refresha |
| `/Volumes/DOMOVINA2TB/git/e-demokracija/novcanik` | `a13c82d` → `docs/ROADMAP.md` | metodologija i faze od prototipa do pravog novčanika |

Namjerno izostavljeno: ekran Pošalji/QR skener (DBHZ je donacijski novčanik), pitch deck (SAFE/vlasništvo
nije primjenjivo na udrugu), interna Monerium ToS analiza (ne objavljuje se), neprovjereni nalazi WP-01/02/03/06
iz `docs/reviews/2026-07-fable5`.

### Faza A — dokument „Sigurnost i skrbništvo” (`docs/compliance/sigurnost-i-skrbnistvo.md`, `/dokumenti/sigurnost`)
Model skrbništva + višestruki passkeyevi + seed kao drugi vlasnik + postmortem kao lekcija za kampanjske
Safeove (bista, obnova Ozlja) + whitelist isplata fondova. Mermaid dijagrami, sve kao ciljna arhitektura.

### Faza B — plan razvoja (`docs/compliance/plan-razvoja.md`, `/dokumenti/plan-razvoja`)
ROADMAP e-demokracije prilagođen DBHZ-u (bista, glasovanje, članarina 1 €/tj., fondovi baštine).

### Faza C — Onboarding (mock) + UpdateBanner
Onboarding po `user-flows.md`/`passkey-onboarding.md` (kreiranje passkeya, dodavanje drugog uređaja,
upozorenje o duplim passkeyevima) — sve mock. UpdateBanner: SW `waiting` → banner → `SKIP_WAITING` → reload.

### Faza D — integracija
Registracija dokumenata u `DocsPage`, tehnički paneli (`SCREEN_DOCS`) za Bista/Doniraj/Fondovi s lekcijom
postmortema i whitelistom, oznaka „isplata samo na odobrene račune Družbe” na fondovima, CLAUDE.md, deploy.
