# CLAUDE.md — DBHZ novčanik (prototip)

Naučeno znanje i konvencije za buduće sesije. Čitaj prije rada.

## Što je ovo

**Design prototip** brandiranog self-custody EURe novčanika za **Družbu „Braća Hrvatskoga Zmaja"**
(DBHZ, dbhz.hr) — domoljubnu hrvatsku kulturnu udrugu za očuvanje kulturne i povijesne baštine, osnovanu
**1905.** Faza 1: sve je vizualno, **mock podaci** (`src/lib/mock.ts`), **nema onchain logike**. Tehnički je
kloniran iz `mamauspiosam/novcanik-prototip` (isti DOMOVINA Wallet stack), sadržajno prilagođen baštinskom
use-caseu: transparentne donacije i članarina → fondovi za očuvanje baštine → zmajEUR priznanje volonterskog rada.

- **Lokalni dir:** `/Volumes/DOMOVINA2TB/git/dbhz/dbhz-novcanik-prototip` (od 2026-09; prije `~/git/dbhz/…`)
- **Remotei:** `origin` = github.com/dbhzhr/dbhz-novcanik-prototip · `personal` = github.com/stepanic/dbhz-novcanik-prototip (pushaj oba)
- **Brand SSOT:** [`BRAND.md`](BRAND.md) (boje izvedene iz STVARNOG zmajskog grba + CSS teme dbhz.hr, 20.06.2026.)
- **Live:** https://dbhz-prototip.domovina.ai (Pages custom domain, od 2026-09-26) · fallback https://dbhz-prototip.pages.dev
  (stara domena `dbhzw-prototip.domovina.ai` i dalje pokazuje na isti projekt)
- ⚠️ **Logo i ime Družbe koriste se isključivo za demo prototip; produkcija traži suglasnost Družbe.**

## Deploy (Cloudflare Pages)

```bash
npm run build
CLOUDFLARE_ACCOUNT_ID=7dc7167b7e2e00923bfa7cd697df14e4 \
  npx wrangler pages deploy dist --project-name=dbhz-prototip --branch=main --commit-dirty=true
```
- Account: **D.O.M.** = `7dc7167b7e2e00923bfa7cd697df14e4` (env var; account_id nije u Pages wrangler.toml).
- **KV namespace** `FEEDBACK_KV` = `7bca47ff6cf84d1a8a885e14dca28c5c` (u `wrangler.toml`).
- **Custom domena** se dodaje API-jem (`POST /accounts/:id/pages/projects/dbhz-prototip/domains`), ali
  CNAME `dbhz-prototip → dbhz-prototip.pages.dev` u zoni `domovina.ai` treba ručno (wrangler OAuth nema DNS scope).
  Nakon dodavanja CNAME-a domena ostaje `pending` („CNAME record not set“) dok se ne pokrene ponovna validacija:
  `PATCH …/pages/projects/dbhz-prototip/domains/<domena>` → `active` za ~1–2 min. Ako si domenu `dig`-ao prije
  nego je zapis postojao, macOS/Chrome pamte NXDOMAIN — provjeri s `curl --resolve <domena>:443:<IP>`.
- **Service worker + UpdateBanner** (backport pay.domovina.ai, 2026-09-26): nova verzija SW-a ČEKA (`waiting`),
  `main.tsx` je otkrije (pri učitavanju, na povratak u tab, svakih 30 min) i prikaže banner „nova verzija” →
  `SKIP_WAITING` → jedan reload. Prva instalacija se aktivira odmah. Cache ime `dbhz-novcanik-vN` u `public/sw.js`
  (trenutno v8) — **bump pri svakom deployu s promjenom shella** (bump je ono što okida banner).
  SW nikad ne kešira HTML za ne-navigacijski zahtjev (CF Pages vraća index.html 200 za nepostojeći asset).

## Sigurnost (revizija 2026-09-26)

- **`public/_headers`**: CSP (`script-src 'self'` — NEMA inline skripti; tema je u `public/theme-init.js`),
  `frame-ancestors 'none'`, HSTS, nosniff, Referrer/Permissions-Policy. Novi vanjski resurs (CDN, font,
  API) → dodaj ga u CSP ili se tiho blokira (provjeri konzolu).
- **`/api/feedback`** je javan bez prijave: POST traži `application/json` + Origin s popisa (`ALLOWED_HOSTS`
  u `functions/api/feedback.ts` — **nova domena ide na popis**), rate limit 10/10 min po IP-u (KV `rl:*`),
  max 2000 komentara, polja skraćena i očišćena od kontrolnih znakova. GET čita samo `fb:*` ključeve kojih
  nema u indexu. Za pravu produkciju: prijava (Cloudflare Access) ili Turnstile.
- **SW** nikad ne kešira `/api/*` ni tuđe origine, a kešira samo `200 basic` odgovore (prije je
  `/api/feedback` bio cache-first zauvijek → komentari se nisu osvježavali).
- `npm audit --omit=dev` = 0. Preostaje dev-only esbuild/vite 5 advisory (dev server) — ne izlaži `npm run dev`
  na mrežu (`--host`).

## Brand (SSOT: `BRAND.md`)

- **Boje:** zmajska zelena `#0C5430` (primarno) = `navy.*`; heraldičko zlato `#D99E12` (akcent/CTA) = `orange.*`;
  tamna zelena `#062716` (dubina/hover) = `navy.deep`; topla off-white `#f7f8f4` = `page`.
  Izvedene iz STVARNOG zmajskog grba (zlatni zmaj, štit) i CSS teme dbhz.hr (zelena navigacija/footer).
  Token-imena `navy`/`orange` zadržana radi kompatibilnosti komponenti (navy = zelena, orange = zlato).
- **Font:** **Titillium Web** (font dbhz.hr; Google Fonts CDN, preconnect u `index.html`).
- **Logo:** STVARNI zmajski grb DBHZ — heraldički amblem (zlatni zmaj nad kacigom, štit s hrvatskom
  šahovnicom i zlatnim zmajevima, plavo-crveni plašt). Izvor: `brand/logos/dbhz-grb-header.png`
  (preuzet s dbhz.hr, transparentan PNG). In-app emblem = `public/emblem.png`; PWA ikone (`public/icons/*`)
  = grb centriran na zmajsko-zelenoj pozadini. ⚠️ NIKAD ne izmišljaj grb/lettermark — koristi stvarni.
- **Geslo:** „Pro aris et focis, Deo propitio!" (Za žrtvenike i ognjišta, s Božjom pomoći).

## Konceptualno mapiranje (vs Mama uspio sam baza)

| Mama uspio sam (baza) | DBHZ |
|---|---|
| Udruga „Mama, uspio sam" | Družba „Braća Hrvatskoga Zmaja" |
| Upravni odbor (UO) | **Meštarski zbor** (Veliki meštar + 8 meštara) |
| mamaEUR (loyalty) | **zmajEUR** (interni identifikator `edeur` + slug `/dokumenti/edeur` u kodu ostaju) |
| Grant fondovi (Opći/Startup/Agro/IT) | Fondovi za baštinu (Opći/Stari grad Ozalj/Digitalizacija i arhiv/Izdavaštvo) |
| Poduzetnici (primatelji grantova) | **Baština** — javni registar objekata/projekata (ekran key `poduzetnici` ostaje interni) |
| Grant poduzetniku (Primanja „Moj grant") | Naknada/priznanje volonteru (ekran „Moj doprinos") |
| Mentorstvo (mint zmajEUR) | Volonterski rad na baštini (obnova, vodstvo, digitalizacija, istraživanje) |

## Činjenična osnova (provjereno 2026-06, izvori dbhz.hr + Registar udruga + enciklopedija)

- **Naziv/osnutak:** Družba „Braća Hrvatskoga Zmaja", osn. 16.11.1905. u Zagrebu, obnovljena 23.06.1990.
- **Sjedište:** Kula nad Kamenitim vratima, Kamenita ulica 3, 10000 Zagreb.
- **OIB** `78879984090` · **IBAN** `HR8923400091100055160` (PBZ) · **Registar udruga RH** reg. br. `00000113`.
- **Struktura:** Meštarski zbor; **385** redovitih članova (numerus clausus, Pravila 2024.); **24** zmajska
  stola (19 u HR + 5 inozemnih); 7 sekcija. Zaštitnik sv. Juraj; simbol zlatni zmaj.
- **Stvarni projekti baštine:** Stari grad Ozalj (obnova od 2006.), Kula nad Kamenitim vratima, Arhiv
  Frankopana (digitalizacija 2023.), glasilo „Zmajske vijesti", biblioteka „Acta et Studia Draconica",
  tečaj glagoljice, spomenici (kralj Zvonimir Knin 2009., hrvatski jezik Var. Toplice 1997.).
- ⚠️ **Financijski/projektni iznosi NISU javno objavljeni → u prototipu su ILUSTRATIVNI demo** (označeno
  komentarima u `mock.ts`). Provjerene činjenice (članstvo, stolovi, OIB/IBAN, datumi) su stvarne.

## Ekrani i navigacija

- **4 taba** (`TABS` u `App.tsx`): Početna · Doniraj · Fondovi · Aktivnost. Ostalo kroz **„Više"** (`MoreSheet`).
- **Više sheet:** Članarina, Priznanja·zmajEUR, Glasovanje, Bista·3D, Baština, Moj doprinos, Primi, Dokumenti.
- **11 ekrana + onboarding:** home, doniraj, clanarina, projekti, nagrade, glasovanje, poduzetnici (Baština),
  primanja (Moj doprinos), aktivnost, primi, bista. **Interni screen key `poduzetnici` zadržan** (kao i `edeur`
  slug) radi deep-linkova/routera; u UI-u piše „Baština".
- **Doniraj** (backport zef `2042382`): odabir namjene — solidarna kampanja „Obnova krovišta — Stari grad
  Ozalj" (iznosi ILUSTRATIVNI, progress + demo-inkrement) ili fondovi; fee-usporedba on-chain vs kartica
  (`cardFee`/`CARD_FEE_*` u mock.ts) + link na `/dokumenti/isplativost`.
- **Glasovanje** (backport template `8970e19`): interne odluke Družbe, 1 zmaj = 1 glas, soulbound zmajEUR
  nagrada; apolitične teme (prioritet obnove, termin sijela, tečajevi); formalne odluke → skupština/Meštarski
  zbor. `polls` u mock.ts, glasovi ilustrativni (≤385 članova).
- **MoreSheet anchor:** `absolute inset-0` unutar phone framea (frame je `relative`, **nije** transformiran).

## Dokumenti (compliance)

`/dokumenti`, `/dokumenti/isplativost`, `/dokumenti/uvjeti-koristenja`, `/dokumenti/edeur`, `/dokumenti/porezi`,
`/dokumenti/mogucnosti`, `/dokumenti/sigurnost`, `/dokumenti/plan-razvoja` renderiraju `docs/compliance/*.md` (single source, `?raw` import) s mermaid dijagramima.
**Isplativost** (backport zef `65629ef`+`aa9f76c`): novčanik vs kartica/IBAN/humanitarni SMS — DBHZ killer
argument je tjedna članarina 1 € (fiksni bankovni nalog 0,25–0,40 € = 25–40% troška); iznosi ilustrativni. Prepisani za DBHZ:
neprofitna udruga → porez kao neprofitna org; zmajEUR = baštinski loyalty (MiCA/PSD2 limited-network, bez
P2P → izvan EMT); ulaganje u baštinu = trošak programske djelatnosti (NE grant trećoj osobi).

**Backport 2 (2026-09-26, `docs/BACKPORT-PLAN.md`):** `sigurnost-i-skrbnistvo.md` (model skrbništva, ADR 0001/0008/
0012/0016, postmortem 0001 → kampanjski/fondovski Safe UVIJEK M-od-N Meštarskog zbora, whitelist isplata) i
`plan-razvoja.md` (metodologija e-dem ROADMAP-a za DBHZ). Primjer praga u svim dokumentima: **5-od-9** (većina
Meštarskog zbora), uvijek označen kao ilustrativan. Relativne `./*.md` poveznice DocsPage prepisuje u rute
(`FILE_TO_SLUG`) — novi dokument dodaj i tamo. Dijagram s `%% smjer: fiksan` ne prepisuje se LR↔TB (dva stupca
nepovezanih čvorova bi u TB pala u preširok red); dva nepovezana subgrapha u TB slaži s `A ~~~ B`.

## Gotchas (naučeno teško — ne ponavljaj)

1. **Mermaid + font (naučeno teško):** `DocsPage` čeka `document.fonts.load('… "Titillium Web"')` PRIJE
   `mermaid.render` — inače mermaid izmjeri širinu nodova fallback fontom pa se tekst odsiječe. Pri rebrandu
   OBAVEZNO promijeni font i u `ensureFonts()` i u mermaid `themeVariables.fontFamily`, ne samo u CSS-u.
2. **Desktop zoom:** `md:[zoom:0.8]` SAMO na app-kompoziciji u `App.tsx`, **NE** na `html` (lomi mermaidov
   `getBoundingClientRect` na `/dokumenti`). Ne vraćaj zoom na html.
   ⚠️ Zoom lomi i sve što se mjeri `getBoundingClientRect`-om UNUTAR zumirane kompozicije: R3F Canvas je
   postavljao canvas na 0,8× kartice → 0,64 vidljivo, zalijepljeno gore lijevo = „bista necentrirana“ samo na
   desktopu (viđeno 2026-09-26). Fix: `<Canvas resize={{ offsetSize: true }}>` (offset* nisu zumirani).
3. **Tipografski navodnici u HTML/JSX atributima:** `„Braća Hrvatskoga Zmaja"` s ravnim `"` unutar
   `content="…"` (index.html) ili `sub="…"` (JSX) **lomi parser** — koristi `”` (U+201D) ili `{'…'}`.
4. **Tailwind opacity** (`bg-navy/10`) radi samo jer su varijable RGB kanali (`12 84 48`), ne hex.
5. **MoreSheet** ne smije `position:fixed` unutar transformiranog framea — `absolute inset-0`.
6. **CF Pages SW keš:** bump `CACHE` u `public/sw.js` → korisnik dobije UpdateBanner; pri rebrandu promijeni ime.
7. **PWA preview origin:** stari SW s prethodnog prototipa na istom `localhost` portu servira tuđi app-shell
   iz keša — za screenshote koristi svjež port (npr. 4199), ne 4173.
8. **Edit tool zahtijeva prethodni Read** za rsync-kopirane datoteke.
9. **Brand tokeni:** `navy` = zelena, `orange` = zlato (imena zadržana). Ne hardkodiraj hex u komponentama
   (ostali su samo progress-bar gradijenti i Logo bg — usklađeni na zelenu/zlato).

## Ikone, PWA splash i OG (backport 2026-07)

- **Lucide ikone** (`lucide-react@^1.21.0`, backport template `90f45da`): SVE ikone kroz
  `src/components/icons.tsx` — jednobojni `currentColor` (kontejneru daj `text-navy`/`text-orange`),
  NE emojiji. `sectorIcon` mapa = baštinske kategorije (Castle/Landmark/Archive/Milestone/ScrollText/
  BookOpen; fallback Shield). Za inline u gumbu: `inline-flex items-center gap-1.5`.
- **PWA splash:** `python3 scripts/gen_splash.py` (PIL) generira `public/icons/splash/splash-<WxH>.png`
  (12 iOS dimenzija, grb na zmajsko-zelenoj `#0C5430`) + `public/og-image.png` (1200×630).
  `apple-touch-startup-image` linkovi + inline `#ios-splash` u `index.html` (uklanja ga `main.tsx` nakon
  prvog painta; prikazuje se samo u standalone PWA modu).
- **OG/Twitter:** statični tagovi u `index.html` (single-tenant — NEMA edge middlewarea kao u ss prototipu);
  slika apsolutni URL `https://dbhz-prototip.pages.dev/og-image.png`. Pri promjeni domene ažuriraj og:url/og:image.

## 3D bista (crowdfunding feature)

**Trajni tehnički vodič s dijagramima: [`docs/3d-bista-tehnicki-vodic.md`](docs/3d-bista-tehnicki-vodic.md)**
(pipeline ispravljanja nagiba, FitCamera geometrija, fullscreen portal bug, materijali, verifikacija).

- **Ekran `bista`** (`src/screens/Bista.tsx`) — crowdfunding za odljev (bronca/kamen) i postavljanje biste
  kralja Tomislava po gradovima; 3D model se vrti, donator vidi što će se izraditi. Vezano uz 1100. obljetnicu
  Hrvatskoga Kraljevstva (DBHZ je glavni inicijator — činjenica).
- **3D render:** `src/screens/BistaViewer.tsx` (three.js + `@react-three/fiber@8` + `@react-three/drei@9`,
  React-18-kompatibilne verzije). **Lazy-loadan** (`React.lazy` u `Bista.tsx` i u `App.tsx`) → three.js je u
  zasebnom chunku (~915 KB), NE u glavnom bundleu. WebGL screenshot u headless Chromeu treba
  `--enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader` + `--virtual-time-budget`.
- **Model:** `public/models/tomislav-bista.glb` (1,4 MB). Generiran iz `~/Downloads/Kralj Tomislav - Bista
  final_300k.stl` (15 MB, binarni STL) skriptom `scripts/fix_upright.py` (trimesh: decimacija 300k→80k,
  **geometrijsko ispravljanje nagiba**, centriranje, normalizacija na 2 jed., export GLB). ⚠️ **STL scan je
  nagnut 42.8°** — stara `scripts/stl2glb.py` NE rotira pa daje nagnutu bistu; `fix_upright.py` nađe najveću
  koplanarnu plohu na rubu modela (ravno dno postolja) i poravna njenu normalu na −Y. Materijal (bronca)
  postavlja se u `BistaViewer` (STL nema materijal).
- **Rotacija zaključana na vertikalu:** OrbitControls `minPolarAngle === maxPolarAngle` (82° = 8° iznad
  horizonta) + `enablePan={false}` → samo azimut (360° lijevo-desno), pogled se ne može okrenuti naglavačke.
- **Materijali (3 varijante):** bronca · brački kamen · patina (korodirana bronca, verdigris zelena) — jedan
  `MeshStandardMaterial` (model nema teksture), prijelaz se ANIMIRA lerpanjem color/metalness/roughness u
  `useFrame` (~1 s, eksponencijalno prigušenje). Swatchevi gore lijevo u vieweru. Deep-link:
  `?screen=bista&materijal=kamen|patina|bronca` (koristi se i za headless testiranje varijanti).
- **Fullscreen toggle:** gumb gore desno; nativni Fullscreen API + overlay fallback za iOS. ⚠️ Overlay MORA
  ići kroz `createPortal(document.body)` s vlastitim Canvasom — `position:fixed` unutar app stabla se lomi
  jer predak s transformom/animacijom (`animate-riseIn`!) postaje containing block → model "potone" ispod
  viewporta (viđeno na iPhoneu). GLTF scenu klonirati (`scene.clone(true)`) — isti THREE objekt ne može u
  dva scene grapha. Repro na desktopu: `delete Element.prototype.requestFullscreen` (+ webkit) pa klik.
- **Standalone verzija komponente:** `/Volumes/DOMOVINA2TB/git/dbhz/bista-3d` (Vite + React 18 + R3F 8 + drei 9, iste
  verzije kao wallet) — izolirani razvoj/demo, komponenta `src/BistaViewer.tsx` s propsima
  (elevationDeg/autoRotate/initialDistance/materialColor).
- **FitCamera (responzivno kadriranje):** na promjenu veličine viewporta (fullscreen, rotacija ekrana)
  postavlja udaljenost kamere da cijeli model stane po visini i širini — širina preko horizontalnog
  cirkumradiusa (pola XZ dijagonale, jer se bista vrti) fitana na najbližoj plohi. Unutar Suspense.
- **Headless WebGL screenshot:** `--virtual-time-budget` VISI uz autoRotate (rAF petlja drži virtual time) —
  koristi `--headless=new --timeout=12000` + swiftshader flagove; povremeno flaky (prazan frame → ponovi).
  ⚠️ NEPOUZDAN za provjeru kadriranja/kamere (pokazivao staru udaljenost) — kadar verificiraj kroz
  chrome-devtools MCP u pravom Chromeu (`new_page` + `resize_page` + klik = trusted gesture za fullscreen).
- ⚠️ **ATRIBUCIJA:** NE navoditi „bista autori Ivo Kerdić i Rudolf Betzler" kao činjenicu — neprovjereno
  (Kerdić je radio MEDALJE Tomislava 1925., ne bistu; Betzler bez veze s Tomislavom). Dokumentirana bista je u
  Starom gradu Ozlju (1933.), autor Robert Frangeš Mihanović. UI to drži ilustrativnim/„potvrditi prije objave".

## Konvencije

- Sve UI kopije na hrvatskom; iznosi `Intl.NumberFormat('hr-HR', EUR)`.
- Mobile-first; desktop = phone frame + lijevi (brand/nav) i desni (tehnički opis) panel (xl).
- Deep-link `?screen=home` ulazi izravno na ekran; `?theme=dark|light` postavlja temu (ključ `dbhz_theme`).
- Apolitično: sadržaj je o očuvanju kulturne baštine i funkcijama novčanika, bez političkih tema.
