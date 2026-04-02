# CLAUDE.md — transcript.taxmonitor.pro (TTMP)

This file is read by Claude Code at the start of every session in this repo.
Do not delete or move it. Keep it updated as the system evolves.

Last updated: 2026-04-01

---

## What this repo is

**Transcript Tax Monitor Pro (TTMP)**
- Domain: transcript.taxmonitor.pro
- Product: IRS transcript PDF → plain-English analysis report
- Pricing: Token-based — 10 tokens/$19, 25/$29, 100/$129
- Audience: 750,000+ U.S. tax professionals (CPAs, EAs, tax attorneys)
- Brand color: Teal #14b8a6
- Stack: Next.js, Tailwind CSS, Cloudflare Pages
- Backend: api.virtuallaunch.pro (VLP Worker) — no backend changes in this repo

---

## Repo structure (key paths)

```
transcript.taxmonitor.pro/

├── .claude/
│   ├── CLAUDE.md/             ← you are here
├── scale/
│   ├── prospects/             ← uploaded CSVs go here (input)
│   ├── batches/               ← generated JSON batches go here (output)
│   └── brevo/                 ← generated Brevo CSVs go here (output)
├── app/
│   └── audit/[slug]/          ← audit page route (to be built)
└── public/
    └── tools/code-lookup/     ← free IRS code lookup tool (to be built)
```

---

## SCALE Pipeline — Batch Generator

The SCALE system converts prospect CSVs into personalized outreach packages.

### To run a batch

1. Pull 50 prospects/rows from the prospect CSV in `scale/prospects/` (copy from upload or paste directly)
2. Run: `node scale/generate-batch.js scale/prospects/{filename}.csv`
3. Outputs are written to:
   - `scale/batches/scale-batch-{YYYY-MM-DD}.json` — full data for R2 + audit pages
   - `scale/brevo/instantly-import-email1-{YYYY-MM-DD}.csv` — Instantly import, Email 1

### Sender identity
All email signatures use: **Jamie L Williams**
All email footers: Transcript Tax Monitor Pro / transcript.taxmonitor.pro

### Input CSV columns (mapped automatically)

| Column name(s) | Field |
|----------------|-------|
| First_NAME, first_name, name (first word) | First name |
| LAST_NAME, last_name, name (remaining) | Last name |
| PROFESSION, credential | Credential (EA, CPA, JD) |
| BUS_ADDR_CITY, city | City |
| BUS_ST_CODE, state | State |
| email_found, email | Email address |
| DBA, firm, firm_name | Firm/DBA name |
| WEBSITE, website | Website (optional) |
| firm_bucket | `solo_brand` / `local_firm` / `national_firm` |
| send_today | If column exists, only process rows where value = `yes` |

### Output JSON schema (per prospect)

```json
{
  "slug": "jamie-williams-san-diego-ca",
  "email": "jwilliams@example.com",
  "name": "Jamie Williams",
  "credential": "EA",
  "city": "San Diego",
  "state": "CA",
  "firm": "Williams Tax Services",
  "firm_bucket": "solo_brand",
  "website": "williamstax.com",
  "audit_page": {
    "headline": "Jamie, here's what 20 minutes per transcript is costing Williams Tax Services",
    "subheadline": "A practice audit for Enrolled Agents who work with IRS transcripts",
    "workflow_gaps": ["...", "...", "..."],
    "time_savings_weekly": "6.7 hours",
    "time_savings_annual": "348 hours",
    "revenue_opportunity": "$34,800–$104,400/yr in recovered billable time",
    "tool_preview_codes": ["971", "846", "570"],
    "cta_pricing_url": "https://transcript.taxmonitor.pro/pricing",
    "cta_booking_url": "https://cal.com/vlp/ttmp-discovery",
    "cta_learn_more_url": "https://transcript.taxmonitor.pro"
  },
  "email_1": { "subject": "...", "body": "..." },
  "email_2": { "subject": "...", "body": "..." }
}
```

### Time savings by credential

| Credential | Hrs/week | Hrs/year | Revenue range |
|------------|----------|----------|---------------|
| EA | 6.7 | 348 | $34,800–$104,400/yr |
| CPA | 5.0 | 260 | $39,000–$104,000/yr |
| JD/Attorney | 3.3 | 174 | $34,800–$87,000/yr |

### Personalization rules

**solo_brand** (EA runs their own named practice):
- Subject: `"{First} — EAs running {DBA} spend 6+ hours/week on this"`
- Headline: `"{First}, here's what 20 minutes per transcript is costing {DBA}"`

**local_firm** (EA works at a multi-person firm):
- Subject: `"{First} — EAs in {City} are spending 6+ hours/week on this"`
- Headline: `"{First}, here's what 20 minutes per transcript is costing your {City} practice"`

---

## Audit Page Route

Audit pages are served at: `transcript.taxmonitor.pro/audit/[slug]`

The page reads its data from R2:
- Bucket: `virtuallaunch-pro`
- Key pattern: `vlp-scale/audit-pages/{slug}.json`

To push a batch to R2 (after generating):
```bash
node scale/push-to-r2.js scale/batches/scale-batch-{YYYY-MM-DD}.json
```

The audit page UI is in `app/audit/[slug]/page.jsx`.
See design spec in `scale/AUDIT-PAGE-DESIGN.md` when that file exists.

---

## Tone & Voice

- Direct — no fluff, state the benefit immediately
- Professional but accessible — tax professionals are the audience, assume intelligence
- Specific — real numbers (hours, prices, timeframes), vague claims undermine trust
- Problem-first — lead with the pain point, follow with the solution
- No emoji anywhere in email copy or audit page content
- No exclamation marks in professional copy

---

## What NOT to do in this repo

- Do not add backend routes — all API calls go to api.virtuallaunch.pro
- Do not modify the VLP Worker from this repo
- Do not hardcode API keys — all secrets are in Cloudflare Pages env vars
- Do not commit prospect CSV files containing real emails to git
  (keep them in scale/prospects/ which is .gitignored)

---

## Related repos

| Repo | Path | Purpose |
|------|------|---------|
| VLP Worker | C:\Users\britn\OneDrive\virtuallaunch.pro | Backend API, R2 writes |
| TMP | C:\Users\britn\OneDrive\taxmonitor.pro-site | Taxpayer-facing platform |
| VLP hub | C:\Users\britn\OneDrive\virtuallaunch.pro\web | Auth, billing, affiliates |

---

## Recordkeeping

Every batch run should produce two files committed to this repo:
- `scale/batches/scale-batch-{YYYY-MM-DD}.json`
- `scale/brevo/brevo-import-email1-{YYYY-MM-DD}.csv`

This creates a full audit trail: who was contacted, when, with what copy.
Do not delete old batch files.