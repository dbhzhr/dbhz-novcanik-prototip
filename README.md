# DBHZ novčanik

Self-custody EURe novčanik za **transparentno financiranje očuvanja kulturne baštine** —
brandiran za **Družbu „Braća Hrvatskoga Zmaja"** (DBHZ, dbhz.hr), domoljubnu hrvatsku kulturnu
udrugu osnovanu 1905. Logotip: stvarni zmajski grb + wordmark *DBHZ*.

> **Faza 1 — design prototip.** Sve je vizualno i koristi *mock* podatke. Nema onchain logike.
> Sadržaj je utemeljen na **provjerenim činjenicama** o Družbi (dbhz.hr + Registar udruga);
> neobjavljeni iznosi su jasno označeni kao **ilustrativni demo**.
>
> ⚠️ Grb i ime Družbe koriste se **isključivo za demo prezentaciju** rješenja; za javnu/produkcijsku
> upotrebu potrebna je suglasnost Družbe „Braća Hrvatskoga Zmaja".

## Pokretanje

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # dist/
```

Deep-link za demo/screenshote: `?screen=home` (`home|doniraj|clanarina|projekti|nagrade|poduzetnici|primanja|aktivnost|primi`).
Tema: `?theme=dark` ili `?theme=light`.

## Sadržaj (DBHZ)

- **Donacije i članarina** za očuvanje baštine; **Podupiratelj** 1 €/tjedno, **Meštarski zbor** viši doprinos.
- **Fondovi za baštinu:** Opći fond Družbe, Stari grad Ozalj (obnova dvorca), Digitalizacija i arhiv
  (Arhiv Frankopana), Izdavaštvo („Zmajske vijesti", „Acta et Studia Draconica").
- **Baština** — javni registar stvarnih objekata/projekata (Ozalj, Kula nad Kamenitim vratima, Arhiv
  Frankopana, spomenici). Bez izmišljenih imena osoba.
- **zmajEUR** — neprenosivi (soulbound) loyalty token = priznanje volonterskog rada na baštini; otkup za
  EURe iz fonda (diskrecijski), izvan MiCA EMT/EMI (limited-network, bez P2P).
- **Transparentnost** — javni, auditabilni registar financiranja; OIB `78879984090`, IBAN
  `HR8923400091100055160` (PBZ), Registar udruga RH reg. br. `00000113`.

## Brand (SSOT: [`BRAND.md`](BRAND.md))

- **Boje:** zmajska zelena `#0C5430` (primarno, `navy.*`), heraldičko zlato `#D99E12` (akcent/CTA, `orange.*`),
  topla off-white `#F7F8F4` (`page`). Izvedeno iz stvarnog zmajskog grba + CSS teme dbhz.hr.
- **Font:** Titillium Web (font dbhz.hr, Google Fonts / SIL OFL — besplatno), latin + latin-ext (č ć ž š đ).
- **Logo:** stvarni zmajski grb DBHZ (`public/emblem.png`); PWA ikone iz istog grba.
- **Geslo:** *„Pro aris et focis, Deo propitio!"*

## PWA

Instalabilno (manifest + service worker + iOS `apple-touch-icon`). Na iPhoneu: Safari →
Podijeli → *Dodaj na početni zaslon*.

## Deploy

Cloudflare Pages — v. [`CLAUDE.md`](CLAUDE.md). Live: https://dbhz-prototip.pages.dev
