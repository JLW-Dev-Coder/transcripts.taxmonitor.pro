# README.md — Transcript Tax Monitor Pro
Last updated: 2026-04-03

**Repo:** transcript.taxmonitor.pro
**Domain:** transcript.taxmonitor.pro
**Purpose:** SEO-driven static site and outreach batch generator for TTMP

---

## 1. What This Repo Is

Two things in one repo:

**1. Static SEO acquisition engine**
Generates 400+ resource pages from JSON content files. Drives organic traffic and converts to TTMP product.

**2. SCALE outreach batch generator**
Produces daily Email 1/2 batches, Gmail import CSVs, and asset page JSON from prospect CSV. Prepares queues for VLP Worker delivery.

---

## 2. What This Repo Is NOT

- Not an email sender
- Not a backend system
- Not a database or CMS
- Not responsible for API execution, cron jobs, or R2 writes beyond what `scale/push-*.js` handles

---

## 3. Architecture
User search
↓
Static resource page (/resources/[slug])
↓
Free code lookup tool or asset page
↓
Booking or pricing page
↓
VLP Worker (api.virtuallaunch.pro) handles auth/billing

**Frontend:** Next.js 14 (App Router), static generation only
**Content:** `/content/resources/*.json` → rendered via template router
**Outreach:** `scale/` directory → batch generation → VLP Worker cron sends
**Backend:** All backend logic owned by `api.virtuallaunch.pro` — never modified in this repo

---

## 4. Repo Structure
/
├── .claude/
│   └── CLAUDE.md                        ← authoritative system rules
├── SCALE.md                             ← reference only
├── app/
│   ├── resources/[slug]/page.tsx        ← static resource page route
│   └── asset/[slug]/                    ← asset page route
├── components/
│   └── CTA.tsx                          ← global CTA component (required on all pages)
├── lib/
│   └── templateRouter.ts               ← maps template string → component
├── content/
│   └── resources/*.json                 ← content source of truth (400+ files)
├── scale/
│   ├── prospects/                       ← source CSVs (gitignored)
│   ├── batches/                         ← generated JSON (committed)
│   ├── gmail/email1/                    ← Gmail import CSVs (committed)
│   ├── generate-batch.js
│   ├── push-email1-queue.js
│   ├── push-email2-queue.js
│   └── push-asset-pages.js
└── app/sitemap.xml/route.ts            ← auto-generated from content files

---

## 5. Templates (exactly 5 — never add a 6th)

| Value | Component | Use |
|-------|-----------|-----|
| `irs-code` | IRSCodeTemplate | IRS transaction code pages |
| `explainer` | ExplainerTemplate | Concept explainers |
| `comparison` | ComparisonTemplate | Product comparisons |
| `how-to` | HowToTemplate | Step-by-step guides |
| `sales` | SalesTemplate | Conversion pages |

---

## 6. Content File Schema

Path: `/content/resources/{slug}.json`

Required fields:
```json
{
  "slug": "string",
  "title": "string",
  "template": "irs-code | explainer | comparison | how-to | sales",
  "category": "string",
  "cta": "transcript-analysis | free-trial | demo | buy",
  "description": "string",
  "content": "string (HTML)",
  "related": []
}
```

Adding a JSON file to `/content/resources/` automatically creates a new static page and includes it in the sitemap.

---

## 7. CTA Rules

CTA must appear on every resource page in 3 positions:
- Top of content
- Mid-content
- Post-content

Component: `components/CTA.tsx`
Never remove CTA from any template.

---

## 8. Local Development
```bash
npm install
npm run dev
```

### Build Commands

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local development server |
| `npm run cf:build` | Production build (OpenNext adapter for Cloudflare Pages) |
| `npm run pages:build` | Alias for `cf:build` |
| `npm run deploy` | Deploy `.open-next/assets` to Cloudflare Pages |
| `npm run preview` | Local preview of Cloudflare Pages build |

---

## 9. Commands
```bash
npm run dev          # development server
npm run build        # static site generation
npm run start        # run production build locally

# SCALE batch operations (run after build)
node scale/generate-batch.js
node scale/push-email1-queue.js scale/gmail/email1/{YYYY-MM-DD}-batch.csv
node scale/push-asset-pages.js scale/batches/scale-batch-{YYYY-MM-DD}.json
node scale/push-email2-queue.js scale/batches/scale-batch-{YYYY-MM-DD}.json
```

---

## 10. Deployment

- **Platform:** Cloudflare Pages
- **Trigger:** Git push to main
- **Build:** Static generation at deploy time
- **Canonical base:** `https://transcript.taxmonitor.pro`

---

## 11. Hard Constraints

**Static generation:**
- No runtime fetch
- No database
- No CMS
- Static generation only

**Templates:**
- Never add a 6th template
- Never modify templateRouter.ts mapping logic without owner sign-off
- Never rewrite content JSON structure

**CTA:**
- Must appear on every page
- Must appear in all 3 positions

**Content:**
- Never rewrite JSON source files — they are authoritative
- Add new files; do not reshape existing ones

**Canonical domain:** All URLs must reference `https://transcript.taxmonitor.pro`

---

## 12. Related Systems

| System | Repo / URL | Relationship |
|--------|-----------|--------------|
| VLP Worker | `C:\Users\britn\OneDrive\virtuallaunch.pro` | Owns all backend routes, auth, billing, cron |
| TMP | `C:\Users\britn\OneDrive\taxmonitor.pro-site` | Sibling platform |
| api.virtuallaunch.pro | Production Worker URL | Backend for all VLP platforms |

---

## 13. Claude Context

| File | Purpose |
|------|---------|
| `.claude/CLAUDE.md` | Authoritative system rules for this repo |
| `.claude/registry.json` | File registry and scaffold state |
| `.claude/settings.local.json` | Session permissions and auto-approve patterns |
| `SCALE.md` | Reference documentation (CLAUDE.md wins on conflict) |