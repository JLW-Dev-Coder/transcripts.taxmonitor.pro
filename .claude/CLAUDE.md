# CLAUDE.md — transcript.taxmonitor.pro
Last updated: 2026-04-12

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
| Generates daily Email 1/2 outreach batches | Send emails |
| Produces Gmail import CSVs | Call Gmail API |
| Produces per-prospect asset page JSON | Push to R2 |
| Updates tracking columns in source CSV | Execute cron jobs |
| Serves static SEO resource pages | Modify backend routes |

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
├── scale/
│   ├── prospects/                 ← source CSVs (gitignored, authoritative input)
│   ├── batches/                   ← generated JSON batches (committed output)
│   ├── gmail/
│   │   └── email1/                ← Gmail import CSVs (committed output)
│   ├── find-emails.js             ← MX precheck + pattern guess + Reoon Quick finder
│   ├── validate-emails.js         ← Reoon bulk verification for existing emails
│   └── generate-batch.js          ← selection + copy generation orchestrator
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

`scale/prospects/` = source of truth input. Never regenerate or reshape it.
`scale/batches/` = generated output. Never treat as source.

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
- **IMPORTANT:** Every deploy must flush the KV incremental cache (`NEXT_INC_CACHE_KV`, namespace ID `dda38413b0be42e6b7bcb3ff8308439e`). OpenNext caches pre-rendered HTML in KV with `s-maxage=31536000` (1 year). Redeploying the Worker does not invalidate this cache. The `npm run deploy` script includes the flush automatically. If deploying manually, run `npx wrangler kv bulk delete --namespace-id dda38413b0be42e6b7bcb3ff8308439e --force` after every deploy.

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

## 5. Source CSV

**Canonical file:**
`scale/prospects/IRS_FOIA_SORTED_-_results-20260401-195853.csv`

### Original columns (immutable — do not modify)

| Column | Notes |
|--------|-------|
| LAST_NAME | Uppercase |
| First_NAME | Mixed case |
| DBA | Firm/practice name |
| BUS_ADDR_CITY | City |
| BUS_ST_CODE | 2-letter state |
| WEBSITE | Raw website string |
| BUS_PHNE_NBR | Not used in output |
| PROFESSION | EA, CPA, JD |
| domain_clean | Sanitized domain |
| email_found | Delivery address |
| email_status | valid / invalid |
| firm_bucket | solo_brand / local_firm / national_firm |
| send_today | Legacy — not used in selection logic |

### Tracking columns (append only — never modify originals)

| Column | Set when |
|--------|----------|
| email_1_prepared_at | ISO timestamp — Email 1 generated |
| email_2_prepared_at | ISO timestamp — Email 2 generated |
| email_3_prepared_at | ISO timestamp — Email 3 generated |
| email_1_sent_at | ISO timestamp — set by VLP Worker after send |
| email_2_scheduled_for | ISO date — when Email 2 should send |
| email_2_sent_at | ISO timestamp — set by VLP Worker after send |
| email_find_attempted | ISO timestamp — set by `scale/find-emails.js` the first time a row is scanned, regardless of outcome. Prevents re-scanning on subsequent runs. |

**Note:** The `email_status` column is NOT an original column in the strict sense, but the scale pipeline writes canonical values (`valid` / `invalid` / `disposable` / `risky` / `no_mx` / empty) back into it via `scale/validate-emails.js` (bulk), `scale/generate-batch.js` (per-record Quick), and `scale/find-emails.js` (MX + pattern discovery). See §6b for the canonical values and §6c for the Reoon → canonical mapping.

### Required environment variables

| Var | Used by | Purpose |
|-----|---------|---------|
| `REOON_API_KEY` | `scale/validate-emails.js`, `scale/generate-batch.js`, `scale/find-emails.js` | Reoon email verification API key. `validate-emails.js` and `find-emails.js` exit with an error if unset (except `find-emails.js --dry-run`); `generate-batch.js` warns and proceeds without validation. |

### Two-file intake workflow

Humans never edit the master CSV directly. New prospects are added through:

1. Human exports enriched rows from Google Sheets into `scale/prospects/new-prospects.csv`
2. Human runs `node scale\scripts\merge-intake.js` from the repo root (PowerShell)
3. The merge script validates, deduplicates, and appends rows to the master CSV
4. The merge script archives the intake file and truncates it to headers only

The merge script checks for a lockfile (`scale/prospects/.batch-in-progress`) before writing. If the lockfile exists, the merge refuses to run. The batch generation script creates this lockfile at start and removes it on completion.

File paths:
- Intake: `scale/prospects/new-prospects.csv`
- Master: `scale/prospects/IRS*.csv` (single file, auto-detected)
- Archive: `scale/prospects/archive/intake-{YYYY-MM-DD}.csv`
- Lockfile: `scale/prospects/.batch-in-progress`

---

## 6. Selection Logic (mandatory, in exact order)

1. `email_found` is not empty, not `"undefined"`, not NaN
2. `email_status` is not `"invalid"` and not `"disposable"`
3. `email_1_prepared_at` is empty
4. Sort ascending by `domain_clean` (nulls last)
5. Walk in sort order; for each candidate apply the Reoon Quick gate (see §6a) until the limit (default 50) is filled

If fewer than the limit are eligible: process all remaining and log the count.
If zero eligible: halt and report pipeline exhaustion.

### 6a. Reoon Quick validation gate (generate-batch.js)

Per-record gate applied during the selection walk:

| Current `email_status` | Action |
|------------------------|--------|
| `valid` | Proceed — already validated |
| `invalid` / `disposable` | Skip (pre-filtered) |
| `risky` | Proceed with console warning |
| empty + `REOON_API_KEY` set + `--skip-validation` NOT set | Call Reoon Quick API (`mode=quick`), map status, write back to CSV, apply this table recursively |
| empty + `REOON_API_KEY` unset | Warn once at start; proceed unvalidated |
| empty + `--skip-validation` | Warn per record; proceed unvalidated |

Rate limit for Reoon Quick calls: 1 request per second.

At the start of a run, if any records will need validation, call Reoon's balance endpoint and log `daily` / `instant` credit counts. Warn if `daily < emptyStatusCount`.

### 6b. Canonical `email_status` values

The `email_status` column uses exactly these five canonical values (plus empty = not yet validated):

| Value | Meaning | Batch gate behavior |
|-------|---------|---------------------|
| `valid` | Deliverable | Include |
| `invalid` | Undeliverable / spamtrap / disabled mailbox | Skip |
| `disposable` | Disposable / throwaway domain | Skip |
| `risky` | Catch-all, role account, inbox full, unknown — may bounce | Include with warning |
| `no_mx` | Domain has no MX records — mail cannot be delivered. Written by `scale/find-emails.js` during the MX precheck stage. Rows with this status never have an `email_found` value, so they are already filtered out by `generate-batch.js` on the empty-email check. |

### 6c. Reoon raw → canonical mapping

| Reoon raw status | Canonical |
|------------------|-----------|
| `safe`, `valid` | `valid` |
| `invalid`, `disabled`, `spamtrap` | `invalid` |
| `disposable` | `disposable` |
| `inbox_full`, `catch_all`, `role_account`, `unknown` | `risky` |
| anything else | `risky` (defensive default) |

---

## 7. Per-Prospect Generation

### Slug
Format: `{first}-{last}-{city}-{state}` — lowercase, hyphen-separated, strip titles (Dr./Mr./Jr.)
Dedup: append `-2`, `-3` on collision.

### Time savings by credential

| Credential | Hrs/week | Hrs/year | Revenue opportunity |
|------------|----------|----------|---------------------|
| EA | 6.7 | 348 | $34,800–$104,400/yr |
| CPA | 5.0 | 260 | $39,000–$104,000/yr |
| JD | 3.3 | 174 | $34,800–$87,000/yr |
| Unknown | 5.0 | 260 | $39,000–$104,000/yr |

### Personalization by firm_bucket

**solo_brand**
- Subject: `{First} - {PROFESSION}s running {DBA} spend {hrs}+ hours/week on this`
- Headline: `{First}, here's what 20 minutes per transcript is costing {DBA}`

**local_firm**
- Subject: `{First} - {PROFESSION}s in {City} are spending {hrs}+ hours/week on this`
- Headline: `{First}, here's what 20 minutes per transcript is costing your {City} practice`

### asset_page object schema
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

### Email 1 body structure (plain text)
{First},
[Pain — 20 min/transcript, X hrs/week, Y hrs/year — 2 sentences]
[Tool pitch — seconds, plain-English report, $19/10 analyses — 2 sentences]
Here's a free IRS code lookup to try first, no account needed:
https://transcript.taxmonitor.pro/tools/code-lookup
And here's a quick practice analysis I put together for {firm or city practice}:
https://transcript.taxmonitor.pro/asset/{slug}
If any of this lands, I'd be glad to show you a live analysis on a real transcript — 15 minutes on Google Meet.
https://cal.com/tax-monitor-pro/ttmp-discovery?slug={slug}
—
Jamie L Williams
Transcript Tax Monitor Pro
transcript.taxmonitor.pro

### Email 2 body structure

- Subject: `Quick practice analysis for your firm, {First} - {N} hours/yr on the table`
- Must reference prior email
- Must reference "quick practice analysis generated for your firm"
- Lead with asset page URL
- CTAs: pricing + booking

### Email signature (mandatory — never a placeholder)
—
Jamie L Williams
Transcript Tax Monitor Pro
transcript.taxmonitor.pro

---

## 8. Output Files

### JSON batch
**Path:** `scale/batches/scale-batch-{YYYY-MM-DD}-{N}.json`

Multiple batches per day are supported. The sequence number `{N}` starts at 1 and increments for each batch run on the same date.

Per-prospect schema:
```json
{
  "slug": "...",
  "email": "...",
  "name": "...",
  "credential": "EA",
  "city": "...",
  "state": "...",
  "firm": "...",
  "firm_bucket": "solo_brand",
  "domain_clean": "...",
  "asset_page": { ... },
  "email_1": { "subject": "...", "body": "..." },
  "email_2": { "subject": "...", "body": "..." }
}
```

### Gmail import CSV
**Path:** `scale/gmail/email1/{YYYY-MM-DD}-{N}-batch.csv`

Columns (exactly, no extras): `email, first_name, subject, body`
- RFC-4180 compliant
- Body field quoted, may contain newlines
- Signature must resolve to Jamie L Williams — never a placeholder

### Source CSV update
Write `email_1_prepared_at` ISO timestamp to source CSV immediately after each batch is generated.

---

## 9. R2 Push Commands (run after each batch)
```bash
# Push email1 queue
node scale/push-email1-queue.js scale/gmail/email1/{YYYY-MM-DD}-{N}-batch.csv

# Push asset pages
node scale/push-asset-pages.js scale/batches/scale-batch-{YYYY-MM-DD}-{N}.json

# Push Email 2 queue (when Email 2 batch is generated)
node scale/push-email2-queue.js scale/batches/scale-batch-{YYYY-MM-DD}-{N}.json

# Push batch history manifest (append entry)
node scale/push-batch-history.js scale/batches/scale-batch-{YYYY-MM-DD}-{N}.json

# Push updated master CSV
node scale/push-master-csv.js

# Push prospect email-to-slug index (append entries)
node scale/push-prospect-index.js scale/batches/scale-batch-{YYYY-MM-DD}-{N}.json
```

### R2 Key Inventory

| R2 Key | Type | Script |
|--------|------|--------|
| `vlp-scale/send-queue/email1-pending.json` | Merge-append | `push-email1-queue.js` |
| `vlp-scale/send-queue/email2-pending.json` | Merge-append | `push-email2-queue.js` |
| `vlp-scale/asset-pages/{slug}.json` | One per prospect | `push-asset-pages.js` |
| `vlp-scale/batch-history.json` | Append array | `push-batch-history.js` |
| `vlp-scale/prospects/master.csv` | Overwrite | `push-master-csv.js` |
| `vlp-scale/prospect-index.json` | Merge-append object | `push-prospect-index.js` |

---

## 10. Asset Page Route

URL: `transcript.taxmonitor.pro/asset/[slug]`
R2 key: `vlp-scale/asset-pages/{slug}.json`

---

## 11. Email 2 Rules

- Timing: 2–3 days after Email 1
- Must reference prior email
- Must reference "quick practice analysis generated for your firm"
- Lead with asset page URL
- CTAs: pricing + booking

---

## 12. Daily Operational Loop

### Steps

0a. (When rows have empty `email_found` but a valid `domain_clean`) Run `REOON_API_KEY=xxx node scale/find-emails.js` — MX precheck + pattern-guess up to 100 prospects per run, writes discovered emails to `email_found` and stamps `email_find_attempted`. Rows with no MX records are marked `email_status = no_mx` and permanently skipped.
0b. (Weekly or when the unvalidated backlog grows) Run `REOON_API_KEY=xxx node scale/validate-emails.js` — bulk-validates up to 500 emails via Reoon and writes results to `email_status`
1. Run `node scale/generate-batch.js` — selects next 50 eligible records, applies the Reoon Quick gate, generates slugs, writes selection file, stamps tracking
2. Claude Code reads `scale/batches/batch-selection-{YYYY-MM-DD}-{N}.json` and generates personalized copy per SKILL.md
3. Claude Code writes final outputs:
   - `scale/batches/scale-batch-{YYYY-MM-DD}-{N}.json` — full batch with asset pages and email copy
   - `scale/gmail/email1/{YYYY-MM-DD}-{N}-batch.csv` — Gmail import CSV
4. Push email1 queue to R2
5. Push asset pages to R2
6. Push batch history manifest to R2
7. Push updated master CSV to R2
8. Push prospect email-to-slug index to R2

### generate-batch.js flags

```
node scale/generate-batch.js [source.csv] [--limit N] [--dry-run] [--skip-validation]
```

- `source.csv` (positional, optional) — override master CSV auto-detect
- `--limit N` — process N records instead of the default 50
- `--dry-run` — write selection file but do NOT stamp `email_1_prepared_at` and do NOT persist Reoon updates to the source CSV
- `--skip-validation` — skip the Reoon Quick gate entirely (e.g., credits exhausted)

Examples:
```
node scale/generate-batch.js                              # default: 50, stamps CSV
node scale/generate-batch.js --limit 2 --dry-run          # preview 2, no writes
node scale/generate-batch.js --limit 25 --skip-validation # 25 records, no Reoon
```

### find-emails.js (MX + pattern-guess email discovery)

```
REOON_API_KEY=xxx node scale/find-emails.js [source.csv] [--limit N] [--dry-run]
```

- Selects rows where `email_found` is empty, `domain_clean` is non-empty, `email_find_attempted` is empty, and `email_1_prepared_at` is empty
- Sorts by `domain_clean` ascending (same order as `generate-batch.js`)
- Default limit: 100 rows per run. Override with `--limit N`
- Per row:
  1. DNS MX precheck (free) — if no MX records, sets `email_status = no_mx`, stamps `email_find_attempted`, and skips
  2. Generates up to 5 candidate patterns from `First_NAME` + `LAST_NAME` + `domain_clean`:
     - `first@domain` → `first.last@domain` → `firstlast@domain` → `flast@domain` → `first.l@domain`
  3. Verifies candidates via Reoon Quick API (1 req/sec) — stops at the first `valid` response and writes to `email_found` + `email_status = valid`
  4. If Reoon returns `disposable` on any candidate, sets `email_status = disposable` and stops trying patterns for that row
  5. If all patterns fail, stamps `email_find_attempted` only (row is not re-scanned)
- Credit safety cap: stops when cumulative Reoon calls reach 450 (safety margin below the 500 daily free-tier limit). Prints "Resume tomorrow."
- `--dry-run`: MX precheck + pattern generation only. No Reoon calls, no CSV writes
- Writes `email_find_attempted` for every scanned row so subsequent runs never retry the same row
- Requires `REOON_API_KEY` unless `--dry-run` is set

### validate-emails.js (bulk pre-validation)

```
REOON_API_KEY=xxx node scale/validate-emails.js [source.csv]
```

- Reads the CSV, filters to records with non-empty `email_found` and empty `email_status`
- Collects up to 500 addresses (Reoon daily free-tier cap)
- POSTs to `create-bulk-verification-task` with `{ name, emails, key }`
- Polls `get-result-bulk-verification-task` every 10s until `status === "completed"` (20 min max)
- Maps raw statuses to canonical (see §6c), writes results to `email_status`
- Prints summary: valid / invalid / risky / disposable / failed
- Requires `REOON_API_KEY` env var — exits with error if unset
- Performs a balance check at start; warns if `daily < emails to submit`

---

## 13. Hard Constraints

- No backend changes in this repo
- No modifications to original CSV columns — append tracking columns only
- Never output `email: "undefined"` or empty email values
- Never invent endpoints, contracts, or schema fields not in this document
- Minimum 50 Email 1 records per batch — flag and halt if source is exhausted
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