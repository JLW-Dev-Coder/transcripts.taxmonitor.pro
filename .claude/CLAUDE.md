# CLAUDE.md — transcript.taxmonitor.pro
Last updated: 2026-04-03

---

## 1. Identity

**Repo:** transcript.taxmonitor.pro
**Product:** Transcript Tax Monitor Pro (TTMP)
**Domain:** transcript.taxmonitor.pro
**Stack:** Next.js · Tailwind CSS · Cloudflare Pages
**Backend:** api.virtuallaunch.pro (VLP Worker) — no backend changes in this repo

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

- `npm run cf:build` — production build (runs `vercel build` + `@cloudflare/next-on-pages`)
- `npm run pages:build` — alias for `cf:build` (Cloudflare Pages calls this)
- `npm run deploy` — build + deploy to Cloudflare Pages
- `npm run preview` — local preview with Wrangler Pages dev server
- Build output: `.vercel/output/static` (set in `wrangler.toml` as `pages_build_output_dir`)
- Adapter: `@cloudflare/next-on-pages` (same as VLP, TTTMP, DVLP)
- Deploys via Cloudflare Pages auto-deploy on push to `main`
- No R2, KV, or D1 bindings — all data fetched client-side from `api.virtuallaunch.pro`
- Note: `cf:build` runs `vercel build --yes` as a separate step because `@cloudflare/next-on-pages` cannot spawn `npx vercel build` on Windows — this does not affect the Cloudflare Pages Linux build environment

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
  "cta_booking_url": "https://cal.com/vlp/ttmp-discovery",
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
https://cal.com/vlp/ttmp-discovery
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
**Path:** `scale/batches/scale-batch-{YYYY-MM-DD}.json`

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
**Path:** `scale/gmail/email1/{YYYY-MM-DD}-batch.csv`

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
node scale/push-email1-queue.js scale/gmail/email1/{YYYY-MM-DD}-batch.csv

# Push asset pages
node scale/push-asset-pages.js scale/batches/scale-batch-{YYYY-MM-DD}.json

# Push Email 2 queue (when Email 2 batch is generated)
node scale/push-email2-queue.js scale/batches/scale-batch-{YYYY-MM-DD}.json
```

R2 keys:
- Email 1 queue: `vlp-scale/send-queue/email1-pending.json`
- Asset pages: `vlp-scale/asset-pages/{slug}.json`

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

Each session in order:
1. Generate next 50 Email 1 records
2. Update source CSV with `email_1_prepared_at`
3. Push email1 queue + asset pages to R2
4. Generate Email 2 for prospects from 2–3 days prior
5. Push email2 queue to R2

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