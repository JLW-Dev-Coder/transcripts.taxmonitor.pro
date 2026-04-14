# README.md — Transcript Tax Monitor Pro
Last updated: 2026-04-13

**Repo:** transcript.taxmonitor.pro
**Domain:** transcript.taxmonitor.pro
**Purpose:** SEO-driven static site and outreach frontend for TTMP

---

## 1. What This Repo Is

Two things in one repo:

**1. Static SEO acquisition engine**
Generates 400+ resource pages from JSON content files. Drives organic traffic and converts to TTMP product.

**2. SCALE outreach frontend**
Serves asset page route (`/asset/[slug]`) for prospect-specific practice analyses. Batch generation has migrated to the VLP Worker campaign processor — this repo no longer produces batches.

---

## 2. What This Repo Is NOT

- Not an email sender
- Not a backend system
- Not a database or CMS
- Not responsible for API execution, cron jobs, or R2 writes (all handled by VLP Worker)

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
VLP Worker (api.taxmonitor.pro) handles auth/billing

**Frontend:** Next.js 14 (App Router), static generation only
**Content:** `/content/resources/*.json` → rendered via template router
**Outreach:** VLP Worker campaign processor generates batches from Clay CSVs → Worker sends via Gmail API
**Backend:** All backend logic owned by `api.taxmonitor.pro` — never modified in this repo

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
├── scale/                               ← RETIRED — batch generation moved to VLP Worker
│   ├── prospects/                       ← legacy source CSVs (gitignored)
│   ├── batches/                         ← legacy generated JSON
│   ├── gmail/email1/                    ← legacy Gmail import CSVs
│   ├── generate-batch.js               ← RETIRED
│   ├── push-email1-queue.js            ← RETIRED
│   ├── push-email2-queue.js            ← RETIRED
│   └── push-asset-pages.js             ← RETIRED
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
| `npm run cf:build` | Production build (OpenNext for Cloudflare Workers) |
| `npm run deploy` | Build + deploy to Cloudflare Workers |
| `npm run preview` | Build + local preview with Wrangler |

Deploys automatically via GitHub Actions on push to `main`.
Adapter: `@opennextjs/cloudflare` (Cloudflare's recommended Next.js adapter).

---

## 9. Commands
```bash
npm run dev          # development server
npm run build        # static site generation
npm run start        # run production build locally

# SCALE batch operations — RETIRED
# Batch generation has moved to VLP Worker campaign processor.
# See CLAUDE.md §12 for the new pipeline.
```

---

## 10. Deployment

- **Platform:** Cloudflare Pages
- **Trigger:** Git push to main (Cloudflare Pages auto-deploy)
- **Build:** `npm run cf:build` (vercel build + next-on-pages)
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
| api.taxmonitor.pro | Production Worker URL | Backend for all VLP platforms |

---

## 13. Claude Context

| File | Purpose |
|------|---------|
| `.claude/CLAUDE.md` | Authoritative system rules for this repo |
| `.claude/registry.json` | File registry and scaffold state |
| `.claude/settings.local.json` | Session permissions and auto-approve patterns |
| `SCALE.md` | Reference documentation (CLAUDE.md wins on conflict) |