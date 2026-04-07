# CLAUDE.md — transcript.taxmonitor.pro
Last updated: 2026-04-03

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
│   └── generate-batch.js
├── app/
│   └── asset/[slug]/              ← asset page route
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
2. `email_status` is not `"invalid"`
3. `email_1_prepared_at` is empty
4. Sort ascending by `domain_clean` (nulls last)
5. Select first 50 records

If fewer than 50 eligible: process all remaining and log the count.
If zero eligible: halt and report pipeline exhaustion.

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
- Subject: `{First} — {PROFESSION}s running {DBA} spend {hrs}+ hours/week on this`
- Headline: `{First}, here's what 20 minutes per transcript is costing {DBA}`

**local_firm**
- Subject: `{First} — {PROFESSION}s in {City} are spending {hrs}+ hours/week on this`
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

- Subject: `Quick asset generated for your firm, {First} — {N} hours/yr on the table`
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

1. Run `node scale/generate-batch.js` — selects next 50 eligible records, generates slugs, writes selection file, stamps tracking
2. Claude Code reads `scale/batches/batch-selection-{YYYY-MM-DD}-{N}.json` and generates personalized copy per SKILL.md
3. Claude Code writes final outputs:
   - `scale/batches/scale-batch-{YYYY-MM-DD}-{N}.json` — full batch with asset pages and email copy
   - `scale/gmail/email1/{YYYY-MM-DD}-{N}-batch.csv` — Gmail import CSV
4. Push email1 queue to R2
5. Push asset pages to R2
6. Push batch history manifest to R2
7. Push updated master CSV to R2
8. Push prospect email-to-slug index to R2

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