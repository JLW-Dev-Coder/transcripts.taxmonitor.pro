---
name: vlp-scale-batch-generator
description: >
  Processes a CSV or JSON file of tax professional prospects (CPAs, EAs, tax attorneys)
  and generates a complete outreach JSON package per prospect — including personalized
  Email 1, Email 2, and full audit page data — ready for Instantly.ai delivery and R2 storage.
  Use this skill ANY TIME the user uploads a CSV or mentions prospects, leads, outreach,
  batch emails, asset pages, TTMP emails, or SCALE pipeline. Also triggers for phrases like
  "process my leads", "generate emails", "build asset pages", or "run the batch".
  This skill is the engine of the VLP SCALE client acquisition system.
---

# VLP SCALE Batch Generator

Converts a prospect CSV into a complete outreach package per day:
1. `scale-batch-{YYYY-MM-DD}.json` — full data for R2 / asset pages
2. `scale/instantly/email1/YYYY-MM-DD-batch.csv` — Instantly.ai import, Email 1

Sender: **Jamie L Williams** — never use placeholders.
Terminology: use **asset page** and **practice analysis** — never "audit".

---

## Canonical CSV Schema

Source: `scale/prospects/IRS_FOIA_SORTED_-_results-20260401-195853.csv`
Do not modify original columns. Append tracking columns only.

| Column | Notes |
|--------|-------|
| LAST_NAME | |
| First_NAME | |
| DBA | Firm/practice name |
| BUS_ADDR_CITY | City |
| BUS_ST_CODE | 2-letter state |
| WEBSITE | Raw |
| BUS_PHNE_NBR | Not used in output |
| PROFESSION | EA, CPA, JD |
| domain_clean | Sanitized domain |
| email_found | Delivery address |
| email_status | valid / invalid |
| firm_bucket | solo_brand / local_firm / national_firm |
| send_today | Legacy — not used in selection logic |

Tracking columns (append if missing):
- email_1_prepared_at
- email_2_prepared_at
- email_3_prepared_at

---

## Step 1 — Selection Logic

1. Filter: email_found not empty, not "undefined", not NaN
2. Filter: email_status not "invalid"
3. Filter: email_1_prepared_at is empty
4. Sort: ascending by domain_clean (nulls last)
5. Select: first 50 eligible records (if fewer, process all and log count)

---

## Step 2 — Per-Prospect Generation

### Slug
`{first}-{last}-{city}-{state}` — lowercase, hyphens, strip titles (Dr./Mr./Jr.)
Dedup: append -2, -3 on collision.

### Time savings by credential

| Credential | Hrs/week | Hrs/year | Revenue opportunity |
|------------|----------|----------|---------------------|
| EA | 6.7 | 348 | $34,800–$104,400/yr |
| CPA | 5.0 | 260 | $39,000–$104,000/yr |
| JD/Attorney | 3.3 | 174 | $34,800–$87,000/yr |
| Unknown | 5.0 | 260 | $39,000–$104,000/yr |

### Asset page object (key: `asset_page` — not `audit_page`)

```json
{
  "headline": "{First}, here's what 20 minutes per transcript is costing {DBA or city practice}",
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

Asset page URL: `https://transcript.taxmonitor.pro/asset/{slug}`

### Personalization by firm_bucket

**solo_brand:**
- Subject: "{First} — {PROFESSION}s running {DBA} spend {hrs}+ hours/week on this"
- Headline: "{First}, here's what 20 minutes per transcript is costing {DBA}"

**local_firm:**
- Subject: "{First} — {PROFESSION}s in {City} are spending {hrs}+ hours/week on this"
- Headline: "{First}, here's what 20 minutes per transcript is costing your {City} practice"

### Email 1 body structure (plain text)

```
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
```

### Email 2 body structure

- Subject: "Quick asset generated for your firm, {First} — {N} hours/yr on the table"
- Reference prior email: "I sent you a note a few days ago..."
- Reference asset: "quick practice analysis generated for your firm"
- Lead with asset page URL
- CTAs: pricing + booking

---

## Step 3 — Output Files

### JSON batch
Path: `/mnt/user-data/outputs/scale-batch-{YYYY-MM-DD}.json`
(In repo: `scale/batches/scale-batch-{YYYY-MM-DD}.json`)

### Instantly CSV
Path: `/mnt/user-data/outputs/instantly-import-email1-{YYYY-MM-DD}.csv`
(In repo: `scale/instantly/email1/{YYYY-MM-DD}-batch.csv`)

Columns exactly: `email, first_name, subject, body`
- No extra columns
- RFC-4180 — body field quoted, contains newlines
- Jamie L Williams in every signature

### Updated source CSV
Write email_1_prepared_at = ISO timestamp back to source after batch.

---

## Step 4 — Present and Summarize

Present both output files. Then print:
```
Batch complete — {N} prospects
Remaining eligible: {N}
Days of pipeline remaining: {N}

NEXT STEPS:
1. Import instantly-import-email1-{date}.csv into Instantly.ai → send today
2. Push scale-batch-{date}.json to R2: vlp-scale/asset-pages/{slug}.json
3. Email 2 queued for: {date + 3 days}
4. New prospect CSV needed by: {date when source exhausted}
```

---

## Tone Rules

- Direct, no fluff
- No emoji anywhere
- No exclamation marks
- Problem-first
- Specific numbers always
