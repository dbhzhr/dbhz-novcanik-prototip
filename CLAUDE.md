# CLAUDE.md — DBHZ novčanik (prototip)

Naučeno znanje i konvencije za buduće sesije. Čitaj prije rada.

## Što je ovo

**Design prototip** brandiranog self-custody EURe novčanika za **Družbu „Braća Hrvatskoga Zmaja"**
(DBHZ, dbhz.hr) — domoljubnu hrvatsku kulturnu udrugu za očuvanje kulturne i povijesne baštine, osnovanu
**1905.** Faza 1: sve je vizualno, **mock podaci** (`src/lib/mock.ts`), **nema onchain logike**. Tehnički je
kloniran iz `mamauspiosam/novcanik-prototip` (isti DOMOVINA Wallet stack), sadržajno prilagođen baštinskom
use-caseu: transparentne donacije i članarina → fondovi za očuvanje baštine → zmajEUR priznanje volonterskog rada.

- **Lokalni dir:** `/Users/ms/git/dbhz/dbhz-novcanik-prototip`
- **Brand SSOT:** [`BRAND.md`](BRAND.md) (boje izvedene iz STVARNOG zmajskog grba + CSS teme dbhz.hr, 20.06.2026.)
- **Live:** https://dbhz-prototip.pages.dev
- ⚠️ **Logo i ime Družbe koriste se isključivo za demo prototip; produkcija traži suglasnost Družbe.**

## Deploy (Cloudflare Pages)

```bash
npm run build
CLOUDFLARE_ACCOUNT_ID=7dc7167b7e2e00923bfa7cd697df14e4 \
  npx wrangler pages deploy dist --project-name=dbhz-prototip --branch=main --commit-dirty=true
```
- Account: **D.O.M.** = `7dc7167b7e2e00923bfa7cd697df14e4` (env var; account_id nije u Pages wrangler.toml).
- **KV namespace** `FEEDBACK_KV` — id u `wrangler.toml` treba popuniti:
  `wrangler kv namespace create "dbhz-prototip-feedback" --account-id 7dc7167b7e2e00923bfa7cd697df14e4`
  → zapiši id u `[[kv_namespaces]] id = "..."`.
- **Service worker kešira** — za novu verziju hard refresh / zatvori-otvori PWA. Cache ime `dbhz-novcanik-v1`.

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
- **Više sheet:** Članarina, Priznanja·zmajEUR, Baština, Moj doprinos, Primi, Dokumenti.
- **9 ekrana + onboarding:** home, doniraj, clanarina, projekti, nagrade, poduzetnici (Baština), primanja
  (Moj doprinos), aktivnost, primi. **Interni screen key `poduzetnici` zadržan** (kao i `edeur` slug) radi
  deep-linkova/routera; u UI-u piše „Baština".
- **MoreSheet anchor:** `absolute inset-0` unutar phone framea (frame je `relative`, **nije** transformiran).

## Dokumenti (compliance)

`/dokumenti`, `/dokumenti/uvjeti-koristenja`, `/dokumenti/edeur`, `/dokumenti/porezi`, `/dokumenti/mogucnosti`
renderiraju `docs/compliance/*.md` (single source, `?raw` import) s mermaid dijagramima. Prepisani za DBHZ:
neprofitna udruga → porez kao neprofitna org; zmajEUR = baštinski loyalty (MiCA/PSD2 limited-network, bez
P2P → izvan EMT); ulaganje u baštinu = trošak programske djelatnosti (NE grant trećoj osobi).

## Gotchas (naučeno teško — ne ponavljaj)

1. **Mermaid + font (naučeno teško):** `DocsPage` čeka `document.fonts.load('… "Titillium Web"')` PRIJE
   `mermaid.render` — inače mermaid izmjeri širinu nodova fallback fontom pa se tekst odsiječe. Pri rebrandu
   OBAVEZNO promijeni font i u `ensureFonts()` i u mermaid `themeVariables.fontFamily`, ne samo u CSS-u.
2. **Desktop zoom:** `md:[zoom:0.8]` SAMO na app-kompoziciji u `App.tsx`, **NE** na `html` (lomi mermaidov
   `getBoundingClientRect` na `/dokumenti`). Ne vraćaj zoom na html.
3. **Tipografski navodnici u HTML/JSX atributima:** `„Braća Hrvatskoga Zmaja"` s ravnim `"` unutar
   `content="…"` (index.html) ili `sub="…"` (JSX) **lomi parser** — koristi `”` (U+201D) ili `{'…'}`.
4. **Tailwind opacity** (`bg-navy/10`) radi samo jer su varijable RGB kanali (`12 84 48`), ne hex.
5. **MoreSheet** ne smije `position:fixed` unutar transformiranog framea — `absolute inset-0`.
6. **CF Pages SW keš:** hard refresh nakon deploya; pri rebrandu promijeni `CACHE` ime u `public/sw.js`.
7. **PWA preview origin:** stari SW s prethodnog prototipa na istom `localhost` portu servira tuđi app-shell
   iz keša — za screenshote koristi svjež port (npr. 4199), ne 4173.
8. **Edit tool zahtijeva prethodni Read** za rsync-kopirane datoteke.
9. **Brand tokeni:** `navy` = zelena, `orange` = zlato (imena zadržana). Ne hardkodiraj hex u komponentama
   (ostali su samo progress-bar gradijenti i Logo bg — usklađeni na zelenu/zlato).

## 3D bista (crowdfunding feature)

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
- **Fullscreen toggle:** gumb gore desno; nativni Fullscreen API + CSS `position:fixed` overlay fallback za
  iOS. Fallback je siguran jer na mobitelu nema transformiranog phone framea (desktop uvijek ide nativno).
- **Standalone verzija komponente:** `/Users/ms/git/dbhz/bista-3d` (Vite + React 18 + R3F 8 + drei 9, iste
  verzije kao wallet) — izolirani razvoj/demo, komponenta `src/BistaViewer.tsx` s propsima
  (elevationDeg/autoRotate/initialDistance/materialColor).
- **Headless WebGL screenshot:** `--virtual-time-budget` VISI uz autoRotate (rAF petlja drži virtual time) —
  koristi `--headless=new --timeout=12000` + swiftshader flagove; povremeno flaky (prazan frame → ponovi).
- ⚠️ **ATRIBUCIJA:** NE navoditi „bista autori Ivo Kerdić i Rudolf Betzler" kao činjenicu — neprovjereno
  (Kerdić je radio MEDALJE Tomislava 1925., ne bistu; Betzler bez veze s Tomislavom). Dokumentirana bista je u
  Starom gradu Ozlju (1933.), autor Robert Frangeš Mihanović. UI to drži ilustrativnim/„potvrditi prije objave".

## Konvencije

- Sve UI kopije na hrvatskom; iznosi `Intl.NumberFormat('hr-HR', EUR)`.
- Mobile-first; desktop = phone frame + lijevi (brand/nav) i desni (tehnički opis) panel (xl).
- Deep-link `?screen=home` ulazi izravno na ekran; `?theme=dark|light` postavlja temu (ključ `dbhz_theme`).
- Apolitično: sadržaj je o očuvanju kulturne baštine i funkcijama novčanika, bez političkih tema.
