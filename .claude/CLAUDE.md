# CLAUDE.md — transcript.taxmonitor.pro

Read at the start of every Claude Code session in this repo.
Do not delete. Keep updated as the system evolves.

Last updated: 2026-04-02

---

## What this repo is

**Transcript Tax Monitor Pro (TTMP)**
- Domain: transcript.taxmonitor.pro
- Product: IRS transcript PDF → plain-English analysis report
- Pricing: 10 tokens/$19, 25/$29, 100/$129
- Audience: U.S. tax professionals (CPAs, EAs, tax attorneys)
- Brand color: Teal #14b8a6
- Stack: Next.js, Tailwind CSS, Cloudflare Pages
- Backend: api.virtuallaunch.pro (VLP Worker) — no backend changes in this repo

---

## Terminology

| Do NOT use | Use instead |
|------------|-------------|
| audit page | asset page |
| audit | practice analysis |
| /audit/{slug} | /asset/{slug} |
| audit_page (schema key) | asset_page |

"Asset" is the canonical term across all copy, routes, schema keys, and filenames.
Terminology rule only — URL routes and schema keys updated as files are touched.

---

## Repo structure

```
transcript.taxmonitor.pro/
├── .claude/
│   └── CLAUDE.md
├── SCALE.md                    ← reference doc only, not logic source
├── scale/
│   ├── prospects/              ← source CSVs (gitignored)
│   ├── batches/                ← generated JSON batches (committed)
│   ├── gmail/
│   │   └── email1/             ← Gmail import CSVs (committed)
│   └── generate-batch.js
├── app/
│   └── asset/[slug]/           ← asset page route
└── public/
    └── tools/code-lookup/
```

---

## Source CSV Schema

Single source of truth:
`scale/prospects/IRS_FOIA_SORTED_-_results-20260401-195853.csv`

Do not modify original columns. Only append tracking columns.

### Canonical columns

| Column | Notes |
|--------|-------|
| LAST_NAME | Uppercase |
| First_NAME | Mixed case |
| DBA | Firm/practice name |
| BUS_ADDR_CITY | City |
| BUS_ST_CODE | 2-letter state |
| WEBSITE | Raw website string |
| BUS_PHNE_NBR | Phone (not used in output) |
| PROFESSION | EA, CPA, JD |
| domain_clean | Sanitized domain (www stripped, lowercase) |
| email_found | Delivery address |
| email_status | valid or invalid |
| firm_bucket | solo_brand, local_firm, national_firm |
| send_today | Legacy field — not used in selection logic |

### Tracking columns (append if missing)

| Column | Set when |
|--------|----------|
| email_1_prepared_at | ISO timestamp — Email 1 generated |
| email_2_prepared_at | ISO timestamp — Email 2 generated |
| email_3_prepared_at | ISO timestamp — Email 3 generated |
| email_1_sent_at | ISO timestamp — set by VLP Worker after send |
| email_2_scheduled_for | ISO date — when Email 2 should be sent |
| email_2_sent_at | ISO timestamp — set by VLP Worker after send |

---

## Daily batch generation — what this repo does

This repo prepares sending queues. The VLP Worker cron sends them.

### Selection logic (mandatory, in order)

1. Filter: email_found is not empty, not "undefined", not NaN
2. Filter: email_status is not "invalid"
3. Filter: email_1_prepared_at is empty
4. Sort: ascending by domain_clean (nulls last)
5. Select: first 50 eligible records

If fewer than 50 eligible: process all remaining, log the count.

### Steps

1. Run batch generation (produces scale/batches/ and scale/gmail/ files)
2. Push email1 queue to R2: `vlp-scale/send-queue/email1-pending.json`
3. Push asset pages to R2: `vlp-scale/asset-pages/{slug}.json` per prospect
4. VLP Worker cron fires daily at 14:00 UTC — reads queue, sends, updates state

This repo does not call Gmail API directly.
This repo does not send email.

### Outputs

**1. JSON batch**
Path: `scale/batches/scale-batch-{YYYY-MM-DD}.json`

Schema key: `asset_page` (not audit_page)

Per-prospect:
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

**2. Gmail import CSV**
Path: `scale/gmail/email1/YYYY-MM-DD-batch.csv`
Columns (exactly): `email, first_name, subject, body`
- No extra columns
- RFC-4180 compliant
- Jamie L Williams always in signature — never a placeholder

**3. Updated source CSV**
Write email_1_prepared_at timestamp back to source CSV after each batch.

### R2 push commands (run after each batch)

Push email1 queue:
```
node scale/push-email1-queue.js scale/gmail/email1/{YYYY-MM-DD}-batch.csv
```

Push asset pages:
```
node scale/push-asset-pages.js scale/batches/scale-batch-{YYYY-MM-DD}.json
```

Push Email 2 queue (run when Email 2 batch is generated):
```
node scale/push-email2-queue.js scale/batches/scale-batch-{YYYY-MM-DD}.json
```

---

## Time Savings & Revenue by Credential

| Credential | Hrs/week | Hrs/year | Revenue opportunity |
|------------|----------|----------|---------------------|
| EA | 6.7 | 348 | $34,800–$104,400/yr |
| CPA | 5.0 | 260 | $39,000–$104,000/yr |
| JD/Attorney | 3.3 | 174 | $34,800–$87,000/yr |
| Unknown | 5.0 | 260 | $39,000–$104,000/yr |

---

## Personalization Rules

**solo_brand:**
- Subject: "{First} — {PROFESSION}s running {DBA} spend {hrs}+ hours/week on this"
- Headline: "{First}, here's what 20 minutes per transcript is costing {DBA}"

**local_firm:**
- Subject: "{First} — {PROFESSION}s in {City} are spending {hrs}+ hours/week on this"
- Headline: "{First}, here's what 20 minutes per transcript is costing your {City} practice"

**Slug:** `{first}-{last}-{city}-{state}` — lowercase, hyphens, strip titles
Dedup: append -2, -3 on collision.

---

## Email Signatures

```
—
Jamie L Williams
Transcript Tax Monitor Pro
transcript.taxmonitor.pro
```

Never use [Your name]. Always resolved to Jamie L Williams.

---

## Asset Page Route

URL: transcript.taxmonitor.pro/asset/[slug]
R2 key: vlp-scale/asset-pages/{slug}.json

---

## Email 2 Rules

- Timing: 2–3 days after Email 1
- Subject: "Quick asset generated for your firm, {First} — {N} hours/yr on the table"
- Must reference prior email and "quick practice analysis generated for your firm"
- Lead with asset page URL
- CTAs: pricing + booking

---

## Daily Loop

Each session:
1. Generate next 50 Email 1 records
2. Push email1 queue + asset pages to R2
3. Generate Email 2 for prospects from 2–3 days prior
4. Push email2 queue to R2

---

## SCALE.md

Reference documentation only. When SCALE.md conflicts with CLAUDE.md, CLAUDE.md wins.

---

## Hard constraints

- Never commit CSVs with real emails (scale/prospects/ is gitignored)
- No backend routes in this repo
- No hardcoded secrets
- Never output email: "undefined"
- Minimum 50 Email 1 records/day — flag if source exhausted

---

## Related repos

| Repo | Path |
|------|------|
| VLP Worker | C:\Users\britn\OneDrive\virtuallaunch.pro |
| TMP | C:\Users\britn\OneDrive\taxmonitor.pro-site |