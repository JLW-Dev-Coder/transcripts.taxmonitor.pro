# SKILL.md — vlp-scale-batch-generator
Last updated: 2026-04-03
Version: 1.1

---

## 1. Identity

**Skill:** vlp-scale-batch-generator
**Owner:** transcript.taxmonitor.pro
**Purpose:** Convert a prospect CSV into a deterministic daily outreach package — JSON batch, Gmail import CSV, and tracking column updates.

---

## 2. What This Skill Does

Produces per session:
1. `scale/batches/scale-batch-{YYYY-MM-DD}.json` — full prospect data for R2 / asset pages
2. `scale/gmail/email1/{YYYY-MM-DD}-batch.csv` — Gmail import queue for VLP Worker cron

Does NOT:
- Call Gmail API
- Push to R2
- Send email
- Schedule Email 2
- Enrich or scrape data
- Modify backend behavior

---

## 3. Input Contract

**Source file (required):**
`scale/prospects/IRS_FOIA_SORTED_-_results-20260401-195853.csv`

**Required fields per record:**

| Field | Type | Notes |
|-------|------|-------|
| First_NAME | string | Mixed case |
| LAST_NAME | string | Uppercase |
| DBA | string | Firm name |
| BUS_ADDR_CITY | string | City |
| BUS_ST_CODE | string | 2-letter state |
| PROFESSION | string | EA / CPA / JD |
| domain_clean | string | Sanitized domain |
| email_found | string | Delivery address |
| email_status | string | valid / invalid |
| firm_bucket | string | solo_brand / local_firm / national_firm |
| email_1_prepared_at | string | Empty = eligible |

---

## 4. Preconditions — Halt if Any Fail

Before processing a single record, verify:
- Source CSV exists at canonical path
- All required columns are present
- At least 1 eligible record exists after filtering

If any condition fails: halt immediately, do not produce partial output, report the failure reason.

---

## Pre-step — Run the orchestrator

Before generating any copy, run:
```
node scale/generate-batch.js
```

This produces `scale/batches/batch-selection-{YYYY-MM-DD}.json` containing the selected records with slugs, credentials, and time savings data already populated. Use this file as the input for copy generation. Do not re-read the master CSV directly for copy generation.

---

## 5. Selection Logic (mandatory, exact order)

Source: the master CSV in `scale/prospects/` (the file starting with `IRS`).
Never read from `new-prospects.csv` — that is the human intake file.

1. `email_found` is not empty, not `"undefined"`, not NaN
2. `email_status` is not `"invalid"`
3. `email_1_prepared_at` is empty
4. Sort ascending by `domain_clean` (nulls last)
5. Select first 50 records

If fewer than 50 eligible: process all remaining and log exact count.
If zero eligible: halt and report pipeline exhaustion.

---

## 6. Per-Record Processing (in order)

### 6.1 Generate slug

Format: `{first}-{last}-{city}-{state}`
Rules: lowercase, hyphen-separated, strip titles (Dr./Mr./Jr./Sr.)
Dedup: append `-2`, `-3` on slug collision within the batch.

### 6.2 Determine time savings by credential

| Credential | Hrs/week | Hrs/year | Revenue opportunity |
|------------|----------|----------|---------------------|
| EA | 6.7 | 348 | $34,800–$104,400/yr |
| CPA | 5.0 | 260 | $39,000–$104,000/yr |
| JD | 3.3 | 174 | $34,800–$87,000/yr |
| Unknown / blank | 5.0 | 260 | $39,000–$104,000/yr |

### 6.3 Build asset_page object

Schema key must be `asset_page` — never `audit_page`.
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
  "cta_booking_url": "https://cal.com/vlp/ttmp-discovery?slug={slug}",
  "cta_learn_more_url": "https://transcript.taxmonitor.pro"
}
```

### 6.4 Apply personalization by firm_bucket

**solo_brand:**
- Subject: `{First} — {PROFESSION}s running {DBA} spend {hrs}+ hours/week on this`
- Headline: `{First}, here's what 20 minutes per transcript is costing {DBA}`

**local_firm:**
- Subject: `{First} — {PROFESSION}s in {City} are spending {hrs}+ hours/week on this`
- Headline: `{First}, here's what 20 minutes per transcript is costing your {City} practice`

**national_firm:** use local_firm pattern with city substitution.

### 6.5 Generate Email 1 body (plain text)

Exact template:
```
Hi {First},

I built a tool that turns IRS transcripts into plain-English reports in seconds — specifically for {EAs/CPAs/attorneys} who are done spending 20 minutes per client translating transaction codes manually. I'm an EA myself, so I built it from the same frustration.

At {hrs} hours per week, that adds up to {annual hrs} hours a year of work that should take seconds. Transcript Tax Monitor Pro handles it for $19 per 10 analyses, with nothing to install.

Here's a free IRS code lookup to try first, no account needed:
https://transcript.taxmonitor.pro/tools/code-lookup

And here's a quick practice analysis I put together for {DBA title-cased OR "your " + City title-cased + " practice"}:
https://transcript.taxmonitor.pro/asset/{slug}

If any of this lands, I'd be glad to show you a live analysis on a real transcript — 15 minutes on Google Meet.
https://cal.com/vlp/ttmp-discovery?slug={slug}

—
Jamie L Williams, EA
Founder, Transcript Tax Monitor Pro
transcript.taxmonitor.pro
```

Credential mapping for intro line: EA → "EAs", CPA → "CPAs", ATTY/JD → "attorneys"
Firm reference: solo_brand → title-cased DBA, local_firm → "your {City title-cased} practice"
Credibility line ("I'm an EA myself...") is mandatory in every Email 1.

Never use a placeholder. Always resolve signature to Jamie L Williams, EA.

### 6.6 Generate Email 2 body (plain text)

Subject: `Quick asset generated for your firm, {First} — {N} hours/yr on the table`

Structure (in order):
1. Greeting: "Hi {First},"
2. Reference prior email ("I sent you a note a few days ago...")
3. Credibility line ("I'm an EA myself, so I built it from the same frustration.")
4. Asset page reference with URL (lead with this)
5. Revenue figure + tool pitch
6. Booking CTA
7. Pricing CTA
8. Same signature as Email 1

### 6.7 Update tracking state

Set `email_1_prepared_at` = ISO timestamp in source CSV immediately after the record is processed.

---

## 7. Output Contract

### 7.1 JSON batch

**Path:** `scale/batches/scale-batch-{YYYY-MM-DD}.json`

Per-prospect schema:
```json
{
  "slug": "string",
  "email": "string",
  "name": "string",
  "credential": "EA | CPA | JD",
  "city": "string",
  "state": "string",
  "firm": "string",
  "firm_bucket": "solo_brand | local_firm | national_firm",
  "domain_clean": "string",
  "asset_page": { ... },
  "email_1": { "subject": "string", "body": "string" },
  "email_2": { "subject": "string", "body": "string" }
}
```

### 7.2 Gmail import CSV

**Path:** `scale/gmail/email1/{YYYY-MM-DD}-batch.csv`

Columns (exactly — no extras, no reordering): `email, first_name, subject, body`

Constraints:
- RFC-4180 compliant
- Body field quoted
- Body may contain newlines
- Signature must resolve to Jamie L Williams — never a placeholder

### 7.3 Source CSV update

Write `email_1_prepared_at` = ISO timestamp to source CSV immediately after each record is processed. Do not batch this write to the end — write per record so partial runs are recoverable.

---

## 8. Failure Handling

| Condition | Action |
|-----------|--------|
| Source CSV missing | Halt. Report path expected. |
| Required columns missing | Halt. List missing columns. |
| Zero eligible records | Halt. Report pipeline exhaustion. |
| `email_found` is empty / "undefined" / NaN | Skip record. Log. |
| `email_status` == "invalid" | Skip record. Log. |
| Slug collision | Append -2, -3. Log. |
| Batch produces fewer than 50 | Process all remaining. Log exact count. Continue. |

Never produce partial output silently. Always report skips and errors.

---

## 9. Completion Report (required after every run)

Print after every batch:
Batch complete — {N} prospects processed
Skipped: {N} (list reasons)
Errors: {N} (list reasons)
Remaining eligible: {N}
Days of pipeline remaining: {N}
NEXT STEPS:

Run Gmail cron to send gmail-email1-{date}.csv → send today
Push scale-batch-{date}.json to R2: vlp-scale/asset-pages/{slug}.json
Push batch history manifest to R2: vlp-scale/batch-history.json
Push updated master CSV to R2: vlp-scale/prospects/master.csv
Push prospect index to R2: vlp-scale/prospect-index.json
Email 2 queued for: {date + 3 days}
New prospect CSV needed by: {date when source exhausted}


---

## 10. Hard Constraints

- Never modify original CSV columns
- Never output `email: "undefined"` or any invalid email value
- Never invent schema fields not defined in this document
- Never call Gmail API, R2, or VLP Worker directly
- Never proceed past a precondition failure
- Always use `asset_page` — never `audit_page`
- Always resolve signature to Jamie L Williams
- Always follow selection order exactly as specified

---

## 11. Golden Case Example

**Input record:**
```json
{
  "First_NAME": "John",
  "LAST_NAME": "DOE",
  "BUS_ADDR_CITY": "Austin",
  "BUS_ST_CODE": "TX",
  "PROFESSION": "EA",
  "domain_clean": "example.com",
  "email_found": "john@example.com",
  "email_status": "valid",
  "firm_bucket": "solo_brand",
  "DBA": "Doe Tax Services",
  "email_1_prepared_at": ""
}
```

**Expected output (partial):**
```json
{
  "slug": "john-doe-austin-tx",
  "email": "john@example.com",
  "credential": "EA",
  "asset_page": {
    "headline": "John, here's what 20 minutes per transcript is costing Doe Tax Services",
    "time_savings_weekly": "6.7 hours",
    "time_savings_annual": "348 hours",
    "revenue_opportunity": "$34,800–$104,400/yr in recovered billable time"
  },
  "email_1": {
    "subject": "John — EAs running Doe Tax Services spend 6.7+ hours/week on this"
  }
}
```