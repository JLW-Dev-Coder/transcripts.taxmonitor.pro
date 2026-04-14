# CLAUDE.md — transcript.taxmonitor.pro
Last updated: 2026-04-13

---

## 1. Identity

**Repo:** transcript.taxmonitor.pro
**Product:** Transcript Tax Monitor Pro (TTMP)
**Domain:** transcript.taxmonitor.pro
**Stack:** Next.js · Tailwind CSS · Cloudflare Workers
**Backend:** api.taxmonitor.pro (VLP Worker) — no backend changes in this repo

---

## 2. What This Repo Does

| Does | Does NOT |
|------|----------|
| Serves asset page route (`/asset/[slug]`) | Generate email copy (Worker templates) |
| Hosts free IRS code lookup tool | Generate batch JSON (Worker campaign processor) |
| Serves marketing, pricing, and tool pages | Push to R2 (Worker handles all R2 writes) |
| Provides authenticated member dashboard | Process prospect CSVs (Worker handles ingestion) |
| Serves static SEO resource pages | Send emails (Worker sends via Gmail API) |

---

## 3. Canonical Terminology

| Never use | Always use |
|-----------|------------|
| audit page | asset page |
| audit | practice analysis |
| /audit/{slug} | /asset/{slug} |
| audit_page (schema key) | asset_page |

This applies to: routes, schema keys, filenames, UI copy, email body, and all generated content.

---

## 4. Repo Structure
transcript.taxmonitor.pro/
├── .claude/
│   └── CLAUDE.md                  ← authoritative system rules
├── SCALE.md                       ← reference only (CLAUDE.md wins on conflict)
├── scale/                         ← RETIRED — batch generation moved to VLP Worker campaign processor
│   ├── prospects/                 ← legacy source CSVs (gitignored, no longer updated by this repo)
│   ├── batches/                   ← legacy generated JSON batches (no longer produced by this repo)
│   ├── gmail/
│   │   └── email1/                ← legacy Gmail import CSVs (no longer produced by this repo)
│   ├── find-emails.js             ← RETIRED — Clay pre-validates emails
│   ├── validate-emails.js         ← RETIRED — Clay pre-validates emails
│   └── generate-batch.js          ← RETIRED — replaced by VLP Worker campaign processor
├── app/
│   ├── asset/[slug]/              ← asset page route
│   └── app/                       ← authenticated dashboard (Tailwind)
│       ├── layout.tsx             ← shared shell (sidebar + topbar + content)
│       ├── AppShell.tsx           ← auth + layout wrapper (client component)
│       ├── SessionContext.tsx     ← React context for session data
│       ├── dashboard/             ← hero card, KPI grid, quick actions, recent reports
│       ├── account/               ← account details + billing
│       ├── reports/               ← saved report list
│       ├── report/                ← individual report viewer
│       ├── receipts/              ← purchase receipts
│       ├── token-usage/           ← token balance + usage history
│       ├── tools/                  ← transcript parser + resource links
│       ├── calendar/              ← booking cards (cal.com)
│       ├── affiliate/             ← referral program + commission history
│       └── support/               ← ticket form + quick links
├── components/
│   ├── member/                    ← Tailwind dashboard components
│   │   ├── MemberSidebar.tsx      ← collapsible sidebar (240px/68px)
│   │   ├── MemberTopbar.tsx       ← topbar with search, bell, avatar
│   │   ├── KPICard.tsx            ← value + label + icon card
│   │   ├── HeroCard.tsx           ← gradient banner card
│   │   ├── ContentCard.tsx        ← generic card with optional title
│   │   ├── TranscriptParser.tsx    ← transcript PDF parser (upload, parse, save, email)
│   │   └── DataTable.tsx          ← styled table with hover states
│   └── ...                        ← marketing components (CSS Modules)
└── public/
    └── tools/code-lookup/

`scale/` = legacy pipeline directory. Batch generation, email copy, and R2 push have all moved to the VLP Worker campaign processor. Files here are retained for historical reference only — this repo no longer writes to them.

---

## Build Commands

- `npm run cf:build` — production build (runs `@opennextjs/cloudflare build`)
- `npm run pages:build` — alias for `cf:build`
- `npm run deploy` — build + deploy to Cloudflare Workers
- `npm run preview` — build + local preview with Wrangler dev server
- Build output: `.open-next/` (worker at `worker.js`, static assets at `assets/`)
- Deploys via GitHub Actions on push to `main` (`.github/workflows/deploy.yml`)
- Adapter: `@opennextjs/cloudflare` (OpenNext — Cloudflare's recommended adapter)
- Incremental cache: KV-backed (`NEXT_INC_CACHE_KV` binding in `wrangler.toml`)
- Worker name: `transcript-taxmonitor-pro`
- No R2 or D1 bindings — all data fetched client-side from `api.taxmonitor.pro`
- `@cloudflare/next-on-pages` is deprecated by Cloudflare — do not switch back to it
- **DO NOT flush KV on deploy.** OpenNext populates the KV incremental cache during `wrangler deploy` with the current build's pre-rendered pages. Flushing KV deletes those entries and causes stale/broken page serving until the cache is re-populated by on-demand requests. The `npm run deploy` script is `cf:build && wrangler deploy` — no flush step.

---

## 4a. Dashboard Design System

**Hybrid styling:** Tailwind CSS v4 for authenticated app pages (`app/app/`), CSS Modules for marketing pages. Tailwind does NOT touch marketing routes.

**Tailwind setup:**
- `@tailwindcss/postcss` in `postcss.config.js`
- `@import "tailwindcss"` + `@source` directives in `globals.css`
- `@theme` block defines brand colors

**CSS variables (member app):**
```css
--member-bg: #0a0f1e;
--member-card: rgba(255,255,255,0.04);
--member-card-hover: rgba(255,255,255,0.06);
--member-border: rgba(255,255,255,0.08);
--member-accent: rgba(20,184,166,0.1);
--member-accent-strong: rgba(20,184,166,0.2);
--member-hero-bg: #042f2e;
--member-hero-bg-end: #021a19;
```

**Sidebar navigation (MemberSidebar):**
```
WORKSPACE:  Dashboard, Calendar, Transcripts, Reports, Receipts, Tokens
EARNINGS:   Affiliate
SETTINGS:   Account (→ Payments), Support
FOOTER:     Back to site, Sign out, Collapse toggle
```
- Collapsible: 240px expanded / 68px collapsed
- Icons: lucide-react
- Active: `border-l-2 border-teal-500 bg-teal-500/10 text-teal-400`

**Shared layout:** `app/app/layout.tsx` → `AppShell.tsx` provides:
- Auth check (redirects to `/login/` if unauthenticated)
- Session context via `useAppSession()` hook
- Sidebar + Topbar + scrollable content area
- Token balance pill in topbar

**Shared card components:** `components/member/`
- `KPICard` — value + label + icon, teal accent
- `HeroCard` — gradient banner
- `ContentCard` — generic card with optional header
- `DataTable` — styled table

---

## 5. Source CSV Schema

Primary source: Clay.com prospect exports (pre-validated emails)
Upload via: VLP dashboard at virtuallaunch.pro/scale/workflow (Upload tab)

### Canonical columns

| Column | Notes |
|--------|-------|
| LAST_NAME | Uppercase |
| First_NAME | Mixed case |
| FULL_NAME | Clay-provided (not used in generation) |
| DBA | Firm/practice name |
| BUS_ADDR_CITY | City |
| BUS_ST_CODE | 2-letter state |
| WEBSITE | Raw website string |
| BUS_PHNE_NBR | Phone (not used in output) |
| PROFESSION | CPA, EA, ATTY (Worker maps ATTY to JD for personalization) |
| domain_clean | Sanitized domain (www stripped, lowercase) |
| email_found | Delivery address (Clay pre-validated) |
| email_status | valid (Clay only exports validated emails) |
| firm_bucket | solo_brand, local_firm, national_firm |
| clay_workbook_ref | Clay workbook reference (not used in generation) |

Legacy columns no longer present: `send_today`, `email_find_attempted`

### Intake workflow

1. Operator downloads Clay CSV export (pre-validated emails, enriched firm data)
2. Operator uploads CSV via VLP dashboard Upload tab at `virtuallaunch.pro/scale/workflow`
3. VLP Worker stores CSV in R2: `vlp-scale/prospects/pending/{date}.csv`
4. Campaign Processor cron (12:00 UTC) parses CSV and generates all outputs

This repo no longer manages prospect CSVs, tracking columns, or environment variables for email validation. All CSV processing is handled by the VLP Worker.

---

## 6. Selection Logic

**Moved to VLP Worker.** The VLP Worker campaign processor now handles all selection, dedup, slug generation, and validation. Clay CSVs arrive pre-validated, so the Reoon Quick gate and bulk validation steps are no longer needed in this repo.

For reference, the Worker applies the same core logic:
1. `email_found` is not empty
2. `email_status` is `valid` (Clay pre-validates)
3. Not already sent (tracked in D1)
4. Sort ascending by `domain_clean`
5. Process up to `SCALE_BATCH_SIZE` (default 50) per cron run

---

## 7. Per-Prospect Generation

**Moved to VLP Worker.** The Worker campaign processor now generates slugs, asset page JSON, and email copy from templates. The reference data below is retained for context — the Worker uses these same values.

### Slug
Format: `{first}-{last}-{city}-{state}` — lowercase, hyphen-separated, strip titles (Dr./Mr./Jr.)
Dedup: append `-2`, `-3` on collision.

### Time savings by credential (used by Worker templates)

| Credential | Hrs/week | Hrs/year | Revenue opportunity |
|------------|----------|----------|---------------------|
| EA | 6.7 | 348 | $34,800–$104,400/yr |
| CPA | 5.0 | 260 | $39,000–$104,000/yr |
| JD | 3.3 | 174 | $34,800–$87,000/yr |
| Unknown | 5.0 | 260 | $39,000–$104,000/yr |

### asset_page object schema (generated by Worker, rendered by this repo)
```json
{
  "headline": "...",
  "subheadline": "A practice analysis for {Enrolled Agents/CPAs} who work with IRS transcripts",
  "workflow_gaps": ["...", "...", "..."],
  "time_savings_weekly": "6.7 hours",
  "time_savings_annual": "348 hours",
  "revenue_opportunity": "$34,800–$104,400/yr in recovered billable time",
  "tool_preview_codes": ["971", "846", "570"],
  "cta_pricing_url": "https://transcript.taxmonitor.pro/pricing",
  "cta_booking_url": "https://cal.com/tax-monitor-pro/ttmp-discovery?slug={slug}",
  "cta_learn_more_url": "https://transcript.taxmonitor.pro"
}
```

Schema key is `asset_page`. Never `audit_page`.

---

## 8. Output Files

**This repo no longer generates output files.** The VLP Worker campaign processor writes all batch JSON, email queues, and asset page JSON directly to R2. Legacy output paths are listed below for reference only.

### Legacy paths (no longer written by this repo)
- `scale/batches/scale-batch-{YYYY-MM-DD}-{N}.json` — batch JSON (now generated by Worker)
- `scale/gmail/email1/{YYYY-MM-DD}-{N}-batch.csv` — Gmail import CSV (retired — Worker sends via Gmail API directly)

---

## 9. R2 Push Commands

**Retired.** All R2 writes are now handled by the VLP Worker campaign processor. The manual `node scale/push-*.js` scripts are no longer used.

### R2 Key Inventory (written by VLP Worker)

| R2 Key | Type | Owner |
|--------|------|-------|
| `vlp-scale/send-queue/email1-pending.json` | Merge-append | Worker campaign processor |
| `vlp-scale/send-queue/email2-pending.json` | Merge-append | Worker campaign processor |
| `vlp-scale/asset-pages/{slug}.json` | One per prospect | Worker campaign processor |
| `vlp-scale/batch-history.json` | Append array | Worker campaign processor |
| `vlp-scale/prospects/pending/{date}.csv` | Upload | VLP dashboard |
| `vlp-scale/prospect-index.json` | Merge-append object | Worker campaign processor |

---

## 10. Asset Page Route

URL: `transcript.taxmonitor.pro/asset/[slug]`
R2 key: `vlp-scale/asset-pages/{slug}.json`

---

## 11. Email 2 Rules

**Generated and sent by VLP Worker.** Email 2 is auto-scheduled 3 days after Email 1 by the Worker campaign processor. Rules retained for reference:

- Timing: 3 days after Email 1 (auto-promoted by Worker)
- Must reference prior email
- Must reference "quick practice analysis generated for your firm"
- Lead with asset page URL
- CTAs: pricing + booking

---

## 12. Daily Batch Generation — What This Repo Does

This repo does NOT generate batches. The VLP Worker handles all batch generation.

### Pipeline (VLP Worker owns all steps)

1. Operator downloads Clay CSV and uploads via VLP dashboard
2. VLP Worker stores CSV in R2: `vlp-scale/prospects/pending/{date}.csv`
3. 12:00 UTC — Campaign Processor cron: parses CSV, generates email copy + asset pages from templates, writes to R2
4. 14:00 UTC — Send cron: reads R2 queue, sends via Gmail API
5. Email 2 auto-scheduled 3 days after Email 1

### What this repo still owns

- Asset page route: `app/asset/[slug]/` — renders prospect-specific practice analysis from R2 JSON
- Free code lookup tool: `public/tools/code-lookup/`
- All frontend pages (pricing, marketing, tools, member dashboard)

### What moved to VLP Worker

- Batch generation (was: Claude skill + `scale/generate-batch.js`)
- Email copy (was: Claude-generated, now: Worker templates)
- Asset page JSON creation (was: Claude-generated, now: Worker templates)
- R2 push (was: manual node scripts, now: automated in campaign processor cron)
- Selection logic, dedup, slug generation (all in Worker now)

### Retired

- 06:00 UTC find-emails cron (Clay pre-validates emails)
- 08:00 UTC validate-emails cron (Clay pre-validates emails)
- `scale/generate-batch.js` (replaced by Worker campaign processor)
- `scale/push-email1-queue.js` (replaced by Worker campaign processor)
- `scale/push-asset-pages.js` (replaced by Worker campaign processor)
- `scale/find-emails.js` (replaced by Clay email enrichment)
- `scale/validate-emails.js` (replaced by Clay email validation)

---

## 13. Hard Constraints

- No backend changes in this repo
- This repo does not generate email copy — Worker templates handle all personalization
- This repo does not process prospect CSVs — Worker campaign processor handles ingestion
- Never invent endpoints, contracts, or schema fields not in this document
- Batch size controlled by Worker env var `SCALE_BATCH_SIZE` (default 50)
- This repo does not call Gmail API, R2, or VLP Worker directly
- SCALE.md is reference only — CLAUDE.md wins on any conflict

---

## 14. Escalation Triggers (halt and report to owner)

- Any change to live routes that have active email links pointing at them
- Any schema change that would break existing R2 data
- Any batch that would contact a prospect who already has `email_1_prepared_at` set
- Pipeline exhaustion (fewer than 50 eligible Email 1 records remain)
- Repo Claude output that contradicts CLAUDE.md without explicit instruction

---

## 15. Related Repos

| Repo | Path |
|------|------|
| VLP Worker | `C:\Users\britn\OneDrive\virtuallaunch.pro` |
| TMP | `C:\Users\britn\OneDrive\taxmonitor.pro-site` |

---

## 16. API Endpoints (consumed by this frontend)

> **`api.taxmonitor.pro` is a custom domain on the `virtuallaunch-pro-api` Cloudflare Worker** — the same Worker that serves `api.virtuallaunch.pro`. All endpoints documented here (transcripts, tokens, calendar, auth, etc.) are handled by this single Worker. There is no separate TTMP API Worker.

Base URL: `https://api.taxmonitor.pro`
API client: `lib/api.ts` — exports `API_BASE`, `apiFetch()`, and named helpers.

### Transcript endpoints

| Method | Path | Purpose | Used in |
|--------|------|---------|---------|
| POST | `/v1/transcripts/preview` | Save parsed report (deducts 1 token) | `DashboardClient.tsx`, `ParserSection.tsx` |
| POST | `/v1/transcripts/report-email` | Email a report link to a recipient | `DashboardClient.tsx` |
| GET | `/v1/transcripts/reports` | List user's saved reports | `ReportsClient.tsx` |
| GET | `/v1/transcripts/report/data?r={reportId}` | Get single report by ID | `ReportClient.tsx` |

### Token endpoints

| Method | Path | Purpose | Used in |
|--------|------|---------|---------|
| GET | `/v1/tokens/pricing` | Fetch available token packages | `lib/api.ts` |
| POST | `/v1/tokens/purchase` | Create Stripe Checkout session | `lib/api.ts` |
| GET | `/v1/tokens/balance/{account_id}` | Check current token balance | `DashboardClient.tsx`, `lib/api.ts` |

### Auth endpoints

| Method | Path | Purpose | Used in |
|--------|------|---------|---------|
| POST | `/v1/auth/magic-link/request` | Request magic-link login email | `lib/api.ts` |
| GET | `/v1/auth/session` | Get current session | `lib/api.ts` |
| POST | `/v1/auth/logout` | End session | `lib/api.ts` |
| GET | `/v1/auth/handoff/exchange` | Exchange handoff token for session | `lib/api.ts` |
| GET | `/v1/auth/google/start` | Redirect to Google OAuth | `login/page.tsx` |

### Other endpoints

| Method | Path | Purpose | Used in |
|--------|------|---------|---------|
| GET | `/v1/calendar/events` | Fetch calendar events | `FullCalendar.tsx` |
| GET | `/v1/google/oauth/start` | Google Calendar OAuth redirect | `FullCalendar.tsx` |
| GET | `/v1/affiliates/{account_id}` | Get affiliate data | `lib/api.ts` |
| GET | `/v1/affiliates/{account_id}/events` | Get affiliate events | `lib/api.ts` |
| POST | `/v1/affiliates/connect/onboard` | Start affiliate onboarding | `lib/api.ts` |
| POST | `/v1/affiliates/payout/request` | Request affiliate payout | `lib/api.ts` |
| POST | `/v1/support/tickets` | Submit support ticket | `lib/api.ts` |
| GET | `/v1/scale/asset/{slug}` | Fetch asset page JSON | `AssetClient.tsx` |

---

## Canonicals Enforcement (mandatory on every task)

Before writing any file, check whether the file type has a canonical template.
Canonical templates live in `.claude/canonicals/` in the **VLP repo** (`virtuallaunch.pro`)
and define the required structure for each file type across all 8 repos.

| File type | Canonical template | Check before... |
|-----------|-------------------|-----------------|
| CLAUDE.md | canonical-claude.md | Editing any CLAUDE.md |
| Contract JSON | canonical-contract.json | Creating or modifying any contract |
| Contract registry | canonical-contract-registry.json | Adding registry entries |
| index.html (landing) | canonical-index.html | Creating landing pages |
| MARKET.md | canonical-market.md | Editing marketing copy |
| README.md | canonical-readme.md | Editing any README |
| ROLES.md | canonical-roles.md | Editing role definitions |
| SCALE.md | canonical-scale.md | Editing pipeline docs |
| SKILL.md | canonical-skill.md | Editing skill files |
| STYLE.md | canonical-style.md | Editing style guides |
| Workflow docs | canonical-workflow.md | Editing workflow docs |
| wrangler.toml | canonical-wrangler.toml | Editing Worker config |

### Rules
1. If a canonical exists for the file type, read it BEFORE making changes
2. The output must contain every required section listed in the canonical
3. If the canonical defines required keys (e.g., `usedOnPages` in contracts),
   those keys must be present — never omit them
4. If a task would create a new file type not covered by a canonical,
   stop and report to Principal Engineer before proceeding
5. After completing the task, verify the output against the canonical checklist

### Cross-repo canonical source of truth
Canonical templates live in the VLP repo only (`virtuallaunch.pro/.claude/canonicals/`).
This repo does not maintain local copies. The Principal Engineer is responsible
for ensuring compliance.

---

## Post-Task Requirements

After completing any task:
1. Stage all changes: git add -A
2. Commit with a descriptive message: git commit -m "[Phase/Area] description of changes"
3. Report the commit hash in the task report

Never leave uncommitted changes. Every task ends with a clean working tree.

---

## Post-Task Rules (mandatory after every task)

1. **Commit:** After completing any task, commit all changed files with a descriptive message. Never leave work uncommitted.
2. **Push:** After committing, run `git push origin main`.
3. **Deploy:** TTMP uses OpenNext Worker — run `wrangler deploy` after push. Push alone does NOT deploy.
4. **Report:** After commit+push+deploy, report the commit hash, deploy version ID, and any errors.