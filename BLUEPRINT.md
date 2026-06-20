# BLUEPRINT — DOMOVINA Self-Custody Wallet White-Label Pipeline

Reusable knowledge for spawning new branded prototypes from the common wallet stack.
Produced during the "Mama uspio sam" session (2026-06-19) via multi-agent pipeline:
Community Research Agent + Brand Extraction Agent → Code Generation.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| UI | React 18 + TypeScript + Vite 5 | PWA, service worker |
| Style | Tailwind CSS 3 (token-based) | CSS vars as RGB channels |
| Crypto | Gnosis Chain EURe (Monerium) | euro stablecoin, fast + cheap |
| Accounts | Safe smart accounts | passkey/WebAuthn P-256 owner |
| Auth | WebAuthn (Face ID / Touch ID) | no seed phrase default |
| Gas | relayer EOA | sponsors tx (5/day/signer limit Faza 1) |
| Hosting | Cloudflare Pages + Functions | KV for feedback |
| Addresses | CREATE2 counterfactual | shows address before first deploy |

---

## 2. White-Label Intervention Points (5)

These are the only files that differ between brands. Everything else is brand-agnostic.

### 2.1 `tailwind.config.js`
```js
// colors.navy  → primary brand color (RGB channels, not hex)
// colors.orange → CTA/accent color
// fontFamily.sans → brand font stack
// boxShadow     → navy-based shadow (uses primary RGB)
// pulseDot      → orange-based pulse (for live chip)
```

### 2.2 `src/index.css`
```css
/* :root, .theme-light { --navy: R G B; --orange: R G B; --page: R G B; ... } */
/* .theme-dark { --navy: R G B; --surface: R G B; --page: R G B; ... } */
/* body { font-family: 'BrandFont', ...; } */
```
All component classes (`bg-navy`, `text-orange`, `bg-surface/10`) auto-follow theme.

### 2.3 `src/lib/mock.ts`
All community-specific content. Screens are brand-agnostic and read only from here.
Key exports to customize:
- `account` — name, address, balance, level, weeklyDues
- `community` — totalRaised, activeMembers, goal, goalLabel
- `tiers` — redovni/uo rate, presets, owed
- `projects` — grant/project fund list (id, name, desc, raised, goal, contributors, address, central)
- `loyalty` — balance, fundAvailable, log[]
- `edeur(n)` — loyalty token label (e.g. `"${n} mamaEUR"` or `"${n} vgEUR"`)
- Community-specific arrays (poduzetnici, grantPayouts, communityStats, associationBudget, ledger...)

### 2.4 `src/App.tsx`
- `Screen` type union
- `TABS` array (main 4 tabs)
- `MORE_ITEMS` array (Više sheet)
- `SCREENS` array (component mapping)
- `DesktopSurround` (logo, name, slogan, links)
- `SCREEN_DOCS` (tooltip descriptions for each screen)
- Footer text

### 2.5 `wrangler.toml` + `index.html` + `public/manifest.webmanifest`
```toml
name = "brand-prototip"
[[kv_namespaces]]
binding = "FEEDBACK_KV"
id = "REAL_KV_ID_HERE"
```
```html
<title>Brand novčanik · Slogan</title>
<meta name="theme-color" content="#PRIMARY_HEX" />
<link href="https://fonts.googleapis.com/css2?family=BrandFont..." />
```

---

## 3. Multi-Agent Pipeline

For each new white-label instance, run two parallel agents before code generation:

### Agent A — Community Research
**Goal:** Understand the community's mission, programs, key people, real data.
**Sources:** Official website, media coverage, public registries (e-Uprava, sudski registar, OIB lookup).
**Output (JSON):**
```json
{
  "name": "Mama, uspio sam",
  "slogan": "Mladi stvaraju. Mi podržavamo.",
  "mission": "udruga za poduzetnike...",
  "oib": "23680302635",
  "iban": "HR07...",
  "bank": "HPB",
  "founded": "09.05.2025.",
  "programs": ["grantovi", "mentorstvo", "radionice"],
  "real_people": [
    {"name": "Andreja Puljiz", "city": "Split", "sector": "usluge", "amount": 5000}
  ],
  "stats": {"members": 847, "grants_distributed": 29500}
}
```

### Agent B — Brand Extraction
**Goal:** Extract design tokens from live website CSS.
**Method:** Fetch CSS (WordPress theme, Elementor, BUM plugin vars), parse custom properties.
**Output (BRAND.md):**
```markdown
# BRAND.md
## Colors
- Primary/Navy: #1D2440 (`--bum-head-color`)
- Gold/CTA: #EFAB23 (`--bum-accent-color`, `--bum-btn-bg-color`)
- Background: #f8f7f5

## Typography
- Font: Poppins (weights 300–700, self-hosted in WP theme)
- Fallback: Roboto (Google Fonts for headings)

## CSS Variables → Tailwind RGB Channels
--navy: 29 36 64
--orange: 239 171 35
--page: 248 247 245
```

### Code Generation (main agent)
Takes Agent A + Agent B output, fills in the 5 intervention points.
Build check: `npx tsc --noEmit && npm run build`.

---

## 4. Token CSS Variable System

```css
/* Pattern: space-separated RGB channels, NOT hex */
:root {
  --navy: 29 36 64;        /* Primary brand color */
  --orange: 239 171 35;    /* CTA/accent */
  --page: 248 247 245;     /* Background */
  --surface: 255 255 255;  /* Card surface */
  --hairline: 232 226 218; /* Border */
  --chip: 244 240 234;     /* Tag background */
  --muted: 120 113 108;    /* Muted text */
}
```

**Why RGB channels:** Tailwind opacity modifiers (`bg-navy/10`, `text-orange/80`) require
`rgb(var(--navy) / <alpha-value>)` which only works with space-separated channels.

**tailwind.config.js mapping:**
```js
navy: {
  DEFAULT: 'rgb(var(--navy) / <alpha-value>)',
  mid: 'rgb(var(--navy-mid) / <alpha-value>)',
  deep: 'rgb(var(--navy-deep) / <alpha-value>)',
  ink: 'rgb(var(--navy-ink) / <alpha-value>)',
},
orange: {
  DEFAULT: 'rgb(var(--orange) / <alpha-value>)',
  light: 'rgb(var(--orange-light) / <alpha-value>)',
},
```

---

## 5. Loyalty Token (mamaEUR / brandEUR)

**Soulbound ERC-20** — non-transferable, issued by org, exchangeable for EURe from fund.

| Property | Value |
|---|---|
| P2P transfer | Blocked (Phase 1) |
| Mint authority | Org multisig only |
| Redemption | Discretionary (EURe from reserve fund) |
| MiCA status | Outside EMT/EMI — Limited Network Exclusion (no P2P) |
| Phase 2 unlock | M-of-N UO Safe multisig vote + EMI license |

**Earn (mint):** mentorship hours, workshop talks, grant application assistance, UO attendance.
**Spend (sink):** redeem for EURe, partner discounts, event fees, fund donation.

---

## 6. Grant Fund Architecture

```
Org (parent Safe)
  ├── Opći fond (general) ← default allocation
  ├── Startup fond         ← product/service entrepreneurs
  ├── Agro fond            ← agriculture/rural
  └── IT fond              ← tech entrepreneurs

Each fund = separate Safe address (counterfactual until first deposit)
Payouts: MultiSend (batch in one passkey confirmation)
Public: every grant visible on Gnosis explorer
```

---

## 7. Navigation Pattern

```
Bottom nav (4 tabs):
  [Početna] [Hero tab] [Fondovi/Grantovi] [Aktivnost]

"Više" (5th tab) → MoreSheet (bottom-sheet):
  Članarina · Nagrade/Loyalty · Special1 · Special2 · Primi · Dokumenti

MoreSheet: absolute inset-0 inside phone frame (NOT fixed/portal)
Frame: position:relative, NOT transformed
```

**Adapt hero tab per brand:**
- Donation-focused: Doniraj
- Civic payment: Računi / Komunalno
- Event-based: Kotizacija

---

## 8. Screen Inventory

| Screen | Key | Purpose |
|---|---|---|
| Onboarding | `onboarding` | First launch, passkey setup CTA |
| Home | `home` | Balance, quick actions, loyalty peek, goal |
| Hero | `doniraj` | One-shot or recurring donation/payment |
| Membership | `clanarina` | Prepaid subscription, fund allocation |
| Funds/Projects | `projekti` | Fund cards with progress bars |
| Loyalty | `nagrade` | Loyalty token balance, exchange, history |
| Community | `poduzetnici` | Public grant recipient registry (or equivalent) |
| My Receipts | `primanja` | Personal grants/payments from org |
| Activity | `aktivnost` | Ledger, community stats, transparency |
| Receive | `primi` | QR code / address share |

---

## 9. Cloudflare Deployment Checklist

```bash
# 1. Create KV namespace
wrangler kv:namespace create "brand-prototip-feedback" \
  --account-id 7dc7167b7e2e00923bfa7cd697df14e4

# 2. Update wrangler.toml with real KV id
# 3. Build
npm run build
# 4. Deploy
CLOUDFLARE_ACCOUNT_ID=7dc7167b7e2e00923bfa7cd697df14e4 \
  npx wrangler pages deploy dist \
  --project-name=brand-prototip \
  --branch=main \
  --commit-dirty=true
# 5. Custom domain
# CF Dashboard → Pages → brand-prototip → Custom domains → Add
# Or: CNAME brand-prototip → brand-prototip.pages.dev (proxied) in domovina.ai zone
```

D.O.M. account: `7dc7167b7e2e00923bfa7cd697df14e4`
Custom domain zone: `domovina.ai`

---

## 10. Known White-Label Instances

| Brand | Dir | Domain | KV id | Status |
|---|---|---|---|---|
| e-Demokracija | `/Users/ms/git/e-demokracija/novcanik` | edemokracija-prototip.domovina.ai | — | first prototype |
| MOST | `/Users/ms/git/most/novcanik` | most-prototip.domovina.ai | — | v2 |
| Velika Gorica | `/Users/ms/git/velikagorica/novcanik-prototip` | velika-gorica-prototip.domovina.ai | `463a01fd515d4dd192ed82a77b4aa1be` | most advanced base |
| **Mama uspio sam** | `/Users/ms/git/mamauspiosam/novcanik-prototip` | musw-prototip.domovina.ai | `44751269fdd4458587490444d9cacf32` | live |

Clone order: e-Demokracija → MOST → Velika Gorica → Mama uspio sam (most converged knowledge).
For future instances, clone from the most recent entry in this table.

---

## 11. Gotchas Across All Instances

1. **Edit tool requires prior Read** — rsync-copied files must be Read before Edit.
2. **Tailwind opacity needs RGB channels** — `rgb(var(--token) / <alpha-value>)`, not hex vars.
3. **MoreSheet must not use `position:fixed`** — use `absolute inset-0`; parent frame is `relative` not transformed.
4. **Service worker caches aggressively** — hard refresh or close/reopen PWA after deploy.
5. **VG tokenomics are VG-specific** — `DESUB`, `sigmaNow`, `myRatio`, `isProtected`, `σ(t)` belong only to VG free-rider model; remove from forks.
6. **Google Fonts CDN vs self-hosted WOFF2** — CDN is simpler for prototypes but requires preconnect links; self-hosted avoids external dependency.
7. **Dev port:** Vite prefers 5180; falls to 5181 if occupied by another wallet project.
8. **Never invent a logo — fetch the real one.** Do NOT hallucinate a lettermark/initial badge for the
   brand. Pull the actual logo from the WordPress media library (`/wp-content/uploads/<yyyy>/<mm>/...png`,
   often a `LOGO-clean.png` white-on-transparent variant) or the site header `<img>`. Save it under
   `brand/logos/`, then derive PWA icons (`public/icons/*`) and the in-app badge (`public/emblem.png`) from
   it. White-on-transparent line-art composites cleanly onto the navy icon background. The "M badge" in the
   first MUSW pass was a hallucinated placeholder — the real mark is a circular two-figure emblem.
