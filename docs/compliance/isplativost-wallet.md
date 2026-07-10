# Isplativost — DBHZ novčanik vs. ostali kanali donacija

**Izdavatelj:** Družba „Braća Hrvatskoga Zmaja" · OIB: 78879984090 · Kamenita ulica 3, 10000 Zagreb
**Verzija:** nacrt 0.1 · **Datum:** 10. srpnja 2026.

> ⚠️ **Disclaimer.** Ovo je interna radna analiza isplativosti, **ne financijski ni pravni savjet**. Stope naknada vrijede na dan izrade (Stripe EEA, HR banke — srpanj 2026.) i mogu se promijeniti. **Iznosi u projekcijama su ILUSTRATIVNI** — odabrani volumeni za prikaz reda veličine, ne stvarni podaci Družbe.

---

## 1. Ideja: novčanik ne zamjenjuje kanale, nego ih nadopunjuje

Družba danas prima donacije i članarine klasično — **uplatom na IBAN** (HR8923400091100055160, PBZ). Uz to bi web donacije mogle ići **karticom** (npr. Stripe), a za šire akcije postoji i **humanitarni SMS**. Svaki kanal ima svoje mjesto.

**DBHZ novčanik** dolazi kao **četvrti, zadano preporučeni kanal** — EURe stablecoin transfer izravno s novčanika donatora na namjenski Safe fonda za baštinu. Nije prisila: tko želi uplatnicu, i dalje je koristi. Ali za sve koji mogu platiti u EURe, novčanik je **najjeftiniji i najtransparentniji** put — pogotovo za **male, česte donacije** i **redovitu članarinu** (1 € tjedno!).

Ključna razlika je gdje „curi" novac: fiksne naknade i postoci koje uzmu posrednici jesu novac koji **ne stigne baštini**.

```mermaid
flowchart TB
    DON["Donator · primjer 100 €"]
    DON --> W["DBHZ novčanik<br/>EURe P2P · Gnosis"]
    DON --> K["Kartica<br/>(Stripe)"]
    DON --> I["IBAN / SEPA<br/>bankovni prijenos"]
    DON --> S["Humanitarni SMS<br/>(fiksne denominacije)"]
    W -->|"~0,001 € gas"| FW["Fondu stiže<br/>~100,00 €"]
    K -->|"1,5% + 0,25 €"| FK["Fondu stiže<br/>98,25 €"]
    I -->|"donator plati +0,25–0,40 €"| FI["Fondu stiže 100,00 €<br/>ali donatoru nije besplatno *"]
    S -->|"samo 0,66–6,64 € po SMS-u"| FS["Za 100 € treba<br/>15+ poruka **"]
    classDef win fill:#e6f4ea,stroke:#1e8e5a,stroke-width:2px,color:#14532d;
    classDef leak fill:#fdecea,stroke:#d64d3f,stroke-width:2px,color:#7a271a;
    classDef warn fill:#fff4e0,stroke:#c9820a,stroke-width:2px,color:#7a4a00;
    class FW win;
    class FK leak;
    class FI,FS warn;
```

\* **Primatelj** doista dobije 100%, ali **pošiljatelj** kod hrvatskih banaka plaća **fiksnu naknadu po nalogu (~0,25–0,40 €)** — pa mu mala uplata nije isplativa (vidi §3.1). Uz to je IBAN **ručan** (bez recurringa, spor uvid); za **prekogranične** uplate (5 inozemnih zmajskih stolova!) SWIFT izvan SEPA-e naplaćuje **5–30 € fiksno** + tečajnu razliku.
\*\* Humanitarni SMS radi samo u **fiksnim denominacijama** i samo za **domaće pretplatnike**; traži posebno odobrenu akciju, bez recurringa i bez javnog uvida po donatoru. Za baštinski use-case Družbe nije praktičan kao stalni kanal.

---

## 2. Naknade po kanalu (EU donator)

| Kanal | Naknada po uplati | Na 1 € (tjedna članarina) | Na 5 € | Na 100 € |
|---|---|---|---|---|
| **DBHZ novčanik** (EURe/Gnosis) | ~0,001 € (gas) | **~0%** | **~0%** | **~0%** |
| **Kartica** (Stripe EEA) | 1,5% + 0,25 € | 0,27 € · **27%** | 0,33 € · **6,5%** | 1,75 € · 1,75% |
| **IBAN / SEPA** (HR banke) | 0,25–0,40 € po nalogu — **plaća donator** \* | do 0,40 € · **do 40%** \* | do 0,40 € · **do 8%** \* | 0,40 € · 0,4% \* |
| **Humanitarni SMS** | fiksne denominacije, posebna akcija \*\* | ne postoji 1 € opcija svugdje | ✓ (uz ograničenja) | ~15 poruka |

\* Fondu stigne 100%, ali **donator** kod hrvatskih banaka (ZABA, PBZ, Erste, OTP, HPB) plaća **fiksni nalog ~0,25–0,40 €** (ovisno o paketu/kanalu). Taj fiksni iznos „pojede" male uplate jednako kao kartica — samo na strani **pošiljatelja**.
\*\* SMS akcije se odobravaju pojedinačno, denominacije su fiksne, dostupno samo domaćim pretplatnicima, bez recurringa; uvjeti ovise o operateru i akciji.

**Zaključak reda veličine:** fiksni dio naknade — bilo kartične (0,25 €), bilo bankovne (0,25–0,40 €) — **ubija mikrouplate**. Kod Družbe je to posebno bolno jer je model upravo mikrouplata: **članarina 1 € tjedno**. Preko banke bi donatora tjedna članarina koštala **25–40% pride**; jedino onchain transfer nema fiksni dio ni na jednoj strani.

---

## 3. Mikrodonacija: gdje curi novac

Za donaciju od **5 €** karticom, od svakog eura dio ode procesoru. Kod novčanika ne ode ništa.

```mermaid
pie showData
    title 5 € karticom (Stripe) — kamo ode
    "Stigne fondu za baštinu" : 4.68
    "Naknada (6,5%)" : 0.32
```

Naizgled sitnica — ali na **tisućama** malih uplata (npr. solidarna kampanja za krovište Ozlja, tjedne članarine 385 članova) taj postotak postaje ozbiljan novac koji je mogao ići u obnovu baštine.

### 3.1 Hrvatsko tržište: SEPA **nije** besplatan kao Revolut

Čest prigovor je: „pa IBAN je besplatan, čemu novčanik?". To vrijedi za **primatelja** — Družba doista dobije 100%. Ali **pošiljatelja** klasične hrvatske banke naplaćuju: **ZABA, PBZ, Erste, OTP, HPB** tipično uzimaju **fiksni nalog ~0,25–0,40 € po transakciji** (ovisno o paketu i kanalu). Za razliku od npr. **Revoluta**, gdje je SEPA prijenos besplatan — pa poslati 1,00 € nikoga ništa ne košta — na hrvatskim bankama **svaka mala uplata donatoru je gubitak**.

Zato donator neće slati 1–5 €: nije mu isplativo platiti nalog da bi donirao sitan iznos. Efekt je isti kao kod kartice, samo trošak snosi **pošiljatelj**:

| Donator šalje | HR banka (nalog ~0,40 €) | DBHZ novčanik (gas ~0,001 €) |
|---|---|---|
| **1 €** (tjedna članarina) | trošak **~40%** | ~0% |
| **5 €** | trošak **~8%** | ~0% |
| **20 €** | trošak ~2% | ~0% |
| **100 €** | trošak ~0,4% | ~0% |

Novčanik je jedini kanal **bez fiksne naknade ni na jednoj strani** — pa članarina od 1 € tjedno i mikrodonacija za Ozalj imaju smisla. Na hrvatskom tržištu, gdje je fiksni bankovni nalog pravilo a ne iznimka, ova inovacija ima **još više** smisla.

---

## 4. Projekcije kroz godine

Pretpostavimo tri ilustrativna godišnja scenarija i usporedimo **karticu** (glavni plaćeni kanal) s **DBHZ novčanikom**.

| Scenarij (godišnje) | Volumen | Kartica (naknade) | DBHZ novčanik | **Ušteda / god** |
|---|---|---|---|---|
| **A · Mikro-kampanja** (krovište Ozlja) | 3.000 × 5 € = 15.000 € | 975 € (6,5%) | ~3 € | **~972 €** |
| **B · Tjedne članarine** | 200 članova × 52 × 1 € = 10.400 € | 2.756 € (**26,5%**) | ~10 € | **~2.746 €** |
| **C · Veće donacije + inozemni stolovi** | 500 × 100 € = 50.000 € | ~1.000 € † | ~1 € | **~999 €** |

† uključuje udio međunarodnih (ne-EEA) kartica po višoj stopi (3,25% + 0,25 €); 5 zmajskih stolova je u inozemstvu.

Scenarij B je najdramatičniji: kod **tjedne članarine od 1 €** fiksna naknada guta **više od četvrtine** prikupljenog. Upravo zato prepaid model novčanika (jedna potvrda otiskom za N tjedana, MultiSend) nema alternativu za ovaj use-case.

Kroz vrijeme se ušteda **akumulira**. U mikro-scenariju (A), naknade koje **ne stignu** baštini izgledaju ovako:

```mermaid
xychart-beta
    title "Kumulativne kartične naknade koje NE stignu baštini (mikro-scenarij), €"
    x-axis ["2026", "2027", "2028", "2029", "2030"]
    y-axis "€ na naknadama" 0 --> 5000
    bar [975, 1950, 2925, 3900, 4875]
    line [3, 6, 9, 12, 15]
```

Stupci = kumulativne kartične naknade; donja linija ≈ 0 = DBHZ novčanik (samo gas). Nakon **5 godina** mikro-scenarija razlika je **~4.875 €** — red veličine godišnjeg fonda izdavaštva („Zmajske vijesti"), ili značajan dio tranše za obnovu krovišta. Novac koji je inače otišao procesoru, ostaje baštini.

---

## 5. Nije samo cijena — pozicioniranje kanala

Trošak je samo jedna os. Druga je **automatizacija i transparentnost** (recurring bez auto-debita, MultiSend, javni onchain uvid — temeljna vrijednost Družbe). Novčanik je jedini kanal u „idealnom" kutu.

```mermaid
quadrantChart
    title Trošak vs. transparentnost i automatizacija
    x-axis "Viši trošak" --> "Niži trošak"
    y-axis "Ručno / neprozirno" --> "Automatizirano / transparentno"
    quadrant-1 "Idealno"
    quadrant-2 "Skupo, ali glatko"
    quadrant-3 "Skupo i ručno"
    quadrant-4 "Jeftino, ali ručno"
    "DBHZ novčanik": [0.9, 0.92]
    "IBAN / SEPA": [0.62, 0.25]
    "Kartica (Stripe)": [0.45, 0.55]
    "Humanitarni SMS": [0.35, 0.2]
```

- **IBAN / SEPA** je jeftin za **veće** iznose, ali kod hrvatskih banaka ima **fiksni nalog pošiljatelju (0,25–0,40 €)** koji poskupljuje male uplate; uz to ručan i spor za uvid → donji desni kut.
- **Kartica** je glatka za donatora, ali plaćena i custodijalna (posrednik drži novac) → sredina.
- **Humanitarni SMS** traži posebno odobrenu akciju, fiksne denominacije, radi samo domaćim pretplatnicima i ne daje javni uvid → donji lijevi kut; koristan za jednokratne medijske akcije.
- **DBHZ novčanik** spaja niski trošak s automatizacijom i javnom transparentnošću → gornji desni kut.

---

## 6. Zašto je ovo inovacija koja ima smisla

1. **Mikrouplate postaju isplative.** Bez fiksne naknade, članarina od 1 € tjedno i donacija od 2–5 € imaju smisla — što širi bazu malih, čestih donatora (dugoročno najstabilniji izvor za neprofitnu udrugu).
2. **Recurring bez auto-debita.** Prepaid model (jedna potvrda otiskom za N tjedana, MultiSend) daje redovitost bez skrbništva nad karticom donatora.
3. **Transparentnost = povjerenje.** Svaki euro javno je vidljiv i auditabilan onchain — donator vidi da je njegova uplata stigla u fond „Stari grad Ozalj", što kartica i IBAN ne mogu ponuditi.
4. **Prekogranično bez SWIFT-a.** Družba ima 5 zmajskih stolova u inozemstvu — iseljenik šalje EURe jednako jeftino kao donator iz Zagreba, bez 5–30 € SWIFT naknada i tečajnih gubitaka.
5. **Programabilnost.** Jedna potvrda → raspodjela na više fondova za baštinu (MultiSend); kampanje s javnim brojačem prema cilju (krovište Ozlja) i automatskim prelijevom viška u Opći fond.
6. **Regulirano i self-custody.** EURe je token e-novca reguliranog izdavatelja (Monerium); sredstva su u vlasništvu donatora (Safe + passkey) do trenutka slanja.
7. **Hrvatski kontekst.** Klasične HR banke naplaćuju **fiksni SEPA nalog (~0,25–0,40 €)** pošiljatelju — pa ni „besplatni" bankovni prijenos nije besplatan za male donacije. Novčanik je jedini kanal bez fiksne naknade ni na jednoj strani.

**Companion, ne zamjena.** Novčanik ne ukida uplatnicu, karticu ni SMS akcije — nudi **najjeftiniji i najtransparentniji** put onima koji ga mogu koristiti, a ostavlja postojeće kanale za sve ostale. To je razlika između „još jednog načina plaćanja" i **infrastrukture koja Družbi čuva novac i povjerenje**.

---

### Metodologija i izvori

- **Stripe EEA** domaća kartica: 1,5% + 0,25 € po transakciji; ne-EEA/međunarodne: 3,25% + 0,25 € (Stripe pricing, srpanj 2026.).
- **IBAN/SEPA (HR banke):** iako SEPA pravila ne nalažu naknadu primatelju, hrvatske banke (ZABA, PBZ, Erste, OTP, HPB) uobičajeno naplaćuju **fiksni nalog pošiljatelju ~0,25–0,40 €** (ovisno o paketu/kanalu); prekogranični SWIFT izvan SEPA-e tipično 5–30 € fiksno. Za usporedbu, neke fintech usluge (npr. Revolut) nude besplatan SEPA prijenos.
- **Humanitarni SMS (HR):** akcije se odobravaju pojedinačno, denominacije fiksne, dostupno domaćim pretplatnicima; komercijalni i tehnički uvjeti ovise o operateru i akciji — ovdje prikazano kvalitativno, ne kao cjenik.
- **DBHZ novčanik:** EURe transfer na mreži Gnosis; gas trošak reda ~0,001 € po transakciji. Trošak ulaza/izlaza (fiat ↔ EURe) nije uključen jer se odnosi na on/off-ramp, ne na sam prijenos.
- **Volumeni u §4 su ilustrativni** — odabrani za prikaz reda veličine, nisu stvarni podaci Družbe (Družba ne objavljuje financijske brojke).
