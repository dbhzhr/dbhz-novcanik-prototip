# BRAND.md — Družba „Braća Hrvatskoga Zmaja" (DBHZ)

Brand SSOT za prototip novčanika. Boje i font izvedeni iz **STVARNOG zmajskog grba** i CSS teme
**dbhz.hr** (scrape 20.06.2026.). Token-imena `navy`/`orange` zadržana radi kompatibilnosti komponenti
(`navy` = zmajska zelena, `orange` = heraldičko zlato).

## Logo / grb

STVARNI povijesni zmajski grb DBHZ — heraldički amblem: **zlatni zmaj** raširenih krila nad turnirskom
kacigom, ispod **štit** s hrvatskom šahovnicom (crveno-bijelo) i zlatnim zmajevima na plavom polju,
okružen plavo-crvenim plaštem.

- Izvor (transparentan PNG, header): `https://dbhz.hr/wp-content/uploads/2018/10/DBHZ-GRB-I-ZNAK-NOVI-HERALDICKI-VIZUAL-HEADER235.png`
- Lokalno: `brand/logos/dbhz-grb-header.png` (257×235, RGBA transparentno), `dbhz-grb-square.png`, `dbhz-grb-large.png`.
- In-app emblem: `public/emblem.png` (grb, transparentan, 256×256).
- PWA ikone: `public/icons/{icon-192,icon-512,icon-maskable-512,icon-180,apple-touch-icon}.png` — grb
  centriran na zmajsko-zelenoj (`#0C5430`) pozadini (ImageMagick).
- ⚠️ NIKAD ne izmišljaj grb/lettermark — koristi stvarni s dbhz.hr.

## Boje

| Uloga | Hex | RGB kanali | Token |
|---|---|---|---|
| Zmajska zelena (primarno, header, naslovi) | `#0C5430` | `12 84 48` | `navy.DEFAULT` |
| Svjetlija zelena (linkovi, sekundarno) | `#146E42` | `20 110 66` | `navy.mid` |
| Tamna zelena (dubina, hover, gradijent) | `#062716` | `6 39 22` | `navy.deep` |
| Heraldičko zlato (CTA, akcent, eyebrow) | `#D99E12` | `217 158 18` | `orange.DEFAULT` |
| Svjetlije zlato | `#F0C860` | `240 200 96` | `orange.light` |
| Topla off-white (pozadina) | `#F7F8F4` | `247 248 244` | `page` |

Izvor: zmajski grb (zlatni zmaj na štitu) + dbhz.hr CSS tema (zelena navigacija `#353d35`/`#26352a`,
akcent `#0c5430`, zlatno-žuta `#ffdd18` u meniju). Dark tema: posvijetljena zelena `#40B26E` za naslove,
duboka zelena-crna `#081610` pozadina (definirano u `src/index.css` `.theme-dark`).

## Tipografija

- **Titillium Web** (Google Fonts, SIL OFL — besplatno; font dbhz.hr). Težine 300/400/600/700/900.
- Učitava se iz CDN-a (`<link>` + preconnect u `index.html`); latin-ext subset nosi hr znakove (č ć ž š đ).
- Fallback: Inter / Segoe UI / system-ui.

## Geslo / ton

- Geslo: **„Pro aris et focis, Deo propitio!"** (Za žrtvenike i ognjišta, s Božjom pomoći).
- Ton: domoljubni, dostojanstven, baštinski. **Apolitično** — kultura i očuvanje baštine, ne politika.

## Pravna napomena

Logo i ime Družbe „Braća Hrvatskoga Zmaja" koriste se **isključivo za demo prototip**; za bilo kakvu
produkcijsku/javnu primjenu potrebna je **suglasnost Družbe**.
