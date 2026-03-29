<<<<<<< HEAD
# transcript.taxmonitor.pro — Claude Context

## Role of This Repo
FRONTEND ONLY. No backend logic lives here.
All API calls go to https://api.virtuallaunch.pro

## Migration Complete
Backend:  ✅ All 24 routes live in VLP Worker
Frontend: ✅ All API calls pointing to api.virtuallaunch.pro
Worker:   ✅ Deleted from this repo
Remaining: Delete Worker from Cloudflare dashboard (manual step)

## Hard Rules
- Never create a new Worker in this repo
- Never add backend logic to this repo
- All fetch() calls must go to https://api.virtuallaunch.pro
- The workers/ directory is scheduled for deletion

## VLP API Base URL
https://api.virtuallaunch.pro

## Route Mapping (Legacy → VLP)
/api/transcripts/magic-link/request → /v1/auth/magic-link/request
/api/transcripts/magic-link/verify  → /v1/auth/magic-link/verify
/api/transcripts/me                 → /v1/auth/session
/api/transcripts/preview            → /v1/transcripts/preview
/api/transcripts/checkout/status    → /v1/checkout/status
/api/transcripts/reports            → /v1/transcripts/reports
/api/transcripts/purchases          → /v1/transcripts/purchases
/api/transcripts/sign-out           → /v1/auth/logout
/forms/transcript/report-email      → /v1/transcripts/report-email
/transcript/prices                  → /v1/pricing/transcripts
/transcript/checkout                → /v1/checkout/sessions
/transcript/report-link             → /v1/transcripts/report-link
/transcript/report-data             → /v1/transcripts/report-data
/transcript/report                  → /v1/transcripts/report
/transcript/tokens                  → /v1/tokens/balance/{account_id}
/transcript/consume                 → /v1/tokens/consume
/v1/help/tickets                    → /v1/support/tickets
/v1/help/status                     → /v1/support/tickets/{ticket_id}

## Migration Status
Backend:  ✅ Complete — all 24 routes live in VLP Worker
Frontend: 🔄 In Progress — updating API calls
Worker:   ✅ Deleted — workers/ directory removed from repo
=======
# Transcript Tax Monitor Pro — Claude Context

## Stack
- Next.js 14 (App Router) + TypeScript
- Static generation only (`generateStaticParams`)
- Content: JSON files under `/content/resources/`
- Hosting: Vercel (later Cloudflare Pages)
- Repo: transcript.taxmonitor.pro

## File Inventory (DEFINITIVE - Last Updated 2026-03-27)

### Active TSX Pages (Next.js App Router)
```
/app
  page.tsx                     → / (root)
  layout.tsx                   → root layout
  not-found.tsx               → 404 page
  /about/page.tsx             → /about
  /contact/page.tsx           → /contact
  /demo/page.tsx              → /demo
  /login/page.tsx             → /login
  /pricing/page.tsx           → /pricing
  /product/page.tsx           → /product
  /resources/page.tsx         → /resources
  /resources/[slug]/page.tsx  → /resources/[slug] (dynamic)
  /app/dashboard/page.tsx     → /app/dashboard
  /legal/privacy/page.tsx     → /legal/privacy
  /legal/refund/page.tsx      → /legal/refund
  /legal/terms/page.tsx       → /legal/terms
  /magnets/lead-magnet/page.tsx    → /magnets/lead-magnet
  /magnets/section-7216/page.tsx   → /magnets/section-7216
  /magnets/guide/page.tsx          → /magnets/guide
  /sitemap.xml/route.ts       → /sitemap.xml
```

### Legacy HTML Files (ORPHANED - REMOVE)
```
⚠️ /app/account.html        ← NO TSX equivalent, dead code
⚠️ /app/calendar.html       ← NO TSX equivalent, dead code
⚠️ /app/receipts.html       ← NO TSX equivalent, dead code
⚠️ /app/reports.html        ← NO TSX equivalent, dead code
⚠️ /app/support.html        ← NO TSX equivalent, dead code
⚠️ /app/token-usage.html    ← NO TSX equivalent, dead code
```

### Asset Files (KEEP)
```
/assets/payment-success.html    ← Static asset
/assets/report-preview.html     ← Static asset
/assets/report.html             ← Static asset
/partials/app-sidebar.html      ← Template partial
/partials/app-topbar.html       ← Template partial
/partials/parse-lab.html        ← Template partial
```

### Components & Libraries
```
/components
  ResourceLayout.tsx
  CTA.tsx
  Sidebar.tsx
  /templates
    IRSCodeTemplate.tsx
    ExplainerTemplate.tsx
    ComparisonTemplate.tsx
    HowToTemplate.tsx
    SalesTemplate.tsx

/content
  /resources
    irs-code-150.json
    irs-code-570.json
    how-to-read-transcript.json
    canopy-vs-ttmp.json

/lib
  getResource.ts
  getAllResources.ts
  templateRouter.ts

/public
  (empty)
```

## Content JSON Schema

```json
{
  "slug": "irs-code-150-meaning",
  "title": "IRS Code 150 Meaning",
  "template": "irs-code",
  "category": "transaction-code",
  "cta": "transcript-analysis",
  "description": "IRS code 150 explained...",
  "content": "<p>HTML content here</p>",
  "related": ["irs-code-570-meaning", "how-to-read-irs-transcripts"]
}
```

## Template Types — EXACTLY 5, never add more

| `template` value | Component |
|---|---|
| `irs-code` | IRSCodeTemplate |
| `explainer` | ExplainerTemplate |
| `comparison` | ComparisonTemplate |
| `how-to` | HowToTemplate |
| `sales` | SalesTemplate |

## Page Route

All resources render at `/resources/[slug]`. Flow:
1. `generateStaticParams()` reads all JSON from `/content/resources/`
2. `getResource(slug)` loads matching JSON
3. `templateRouter` selects component
4. Template renders with `dangerouslySetInnerHTML` — do not convert to markdown
5. `CTA` injected after intro, after content, and in sidebar
6. SEO metadata generated from JSON fields

## CTA Rules

Every page must include CTA. Never omit. Positions: after intro, after content, sidebar.

- `transcript-analysis` → "Transcript Analysis Tool"
- `free-trial` → "Start Free Trial"
- `demo` → "Book Demo"
- `buy` → "Buy Now"

## SEO — Every Page Must Have

- `<title>` from `title`
- `<meta name="description">` from `description`
- Canonical URL: `https://transcript.taxmonitor.pro/resources/[slug]`
- Open Graph tags
- JSON-LD Article structured data

## Internal Linking

Each page links programmatically to items in `related[]`, `/pricing`, and `/demo`.
No hardcoded links.

## Static Build Requirements

- `generateStaticParams()` required in `[slug]/page.tsx`
- No `fetch()` at runtime
- No `"use client"` on resource pages
- No API routes for content
- No CMS, no database

## HTML Migration Rules

When converting `/resources/*.html` → `/content/resources/*.json`:
1. Extract `<title>` → `title`
2. Extract body HTML → `content` verbatim
3. Determine `template` from content type
4. Preserve slug exactly
5. Write JSON file

Never rewrite, summarize, or shorten content.

## Self-Check Before Every Change

1. ✅ Only 5 template types exist
2. ✅ Slug unchanged
3. ✅ Content not rewritten
4. ✅ Page uses `generateStaticParams`
5. ✅ CTA present

If any fail → stop and report.

## File Type Rules — TSX ONLY Going Forward

**RULE: All pages must be .tsx files in the App Router structure**

- ✅ **Pages:** Use `app/*/page.tsx` only
- ✅ **Layouts:** Use `app/*/layout.tsx` only
- ✅ **Components:** Use `.tsx` files in `/app` or `/components`
- ❌ **Never:** Create `.html` files in `/app` directory
- ❌ **Never:** Create static HTML routes
- ⚠️ **Legacy:** 6 orphaned HTML files exist in `/app` - these should be deleted

**Why TSX Only:**
- Next.js App Router ignores `.html` files in `/app`
- Static generation via `generateStaticParams()` creates optimized HTML at build time
- TypeScript + React provides better developer experience
- SEO and performance optimizations built into Next.js

## Build & Deploy Commands

```bash
# Development
npm run dev              # Start Next.js dev server

# Static Build
npm run build           # Next.js static build to /out

# Cloudflare Pages Deployment
npm run cf:build        # OpenNext.js build for CF Pages
npm run deploy          # Deploy to Cloudflare Pages
npm run preview         # Preview CF Pages deployment

# Hosting
npm run start           # Start production server (if needed)
```

**Build Output:** Static files generated to `/out` directory for deployment.

## Hard Constraints — Never Do

- ❌ Create a 6th template type
- ❌ Add a database or CMS
- ❌ Create API routes for content
- ❌ Convert HTML content to markdown
- ❌ Rewrite or summarize SEO content
- ❌ Change slugs
- ❌ Add `"use client"` to resource pages
- ❌ **NEW:** Create `.html` files in `/app` directory
- ❌ **NEW:** Use static HTML instead of TSX pages

## Success Criteria

- [ ] All JSON files in `/content/resources/` load and render
- [ ] `generateStaticParams` covers all slugs
- [ ] Every page has CTA (3 positions)
- [ ] Sitemap auto-generates from content files
- [ ] Internal links generated from `related[]` field
- [ ] Build completes with zero runtime fetches
>>>>>>> bf326c332e5e6078709488ba529af46480ddc565
