# TTMP Claude-Ready Workflow

Last updated: 2026-04-04

---

## Table of Contents

* [Objective](#objective)
* [Required Output Schema](#required-output-schema)
* [Phase 1 — Source Data from BigQuery](#phase-1--source-data-from-bigquery)
* [Phase 2 — Sheet Setup and Initial Processing](#phase-2--sheet-setup-and-initial-processing)
* [Phase 3 — Export to Clay](#phase-3--export-to-clay)
* [Phase 4 — Clay Enrichment](#phase-4--clay-enrichment)
* [Phase 5 — Return to Google Sheets](#phase-5--return-to-google-sheets)
* [Phase 6 — Final Processing in Google Sheets](#phase-6--final-processing-in-google-sheets)
* [Phase 7 — Final Export for Claude](#phase-7--final-export-for-claude)

---

## Objective

Prepare a Claude-ready CSV from IRS FOIA raw data using BigQuery, Google Sheets, Clay, and the Lead Tools Apps Script. The exported CSV feeds into the two-file merge workflow — it is placed at `scale/prospects/new-prospects.csv`, and the merge script appends validated rows into the master CSV that Claude reads.

---

## Required Output Schema

The Google Sheet uses this exact column order:

```text
LAST_NAME
First_NAME
FULL_NAME
DBA
BUS_ADDR_CITY
BUS_ST_CODE
WEBSITE
BUS_PHNE_NBR
PROFESSION
domain_clean
email_found
email_status
firm_bucket
clay_workbook_ref
```

Notes:
- `FULL_NAME` is required by Clay for Work Email enrichment. The merge script drops it before appending to the master CSV.
- `clay_workbook_ref` is kept for recordkeeping and dedup across batches. The merge script preserves it but Claude ignores it during batch generation.
- The merge script adds tracking columns (`email_1_prepared_at`, `email_2_prepared_at`, `email_3_prepared_at`) as empty values. Never add these columns manually.

---

## Active Google Sheet

The current working sheet with 66K+ shaped records from BigQuery:

[IRS FOIA Shaped — Google Sheets](https://docs.google.com/spreadsheets/d/1r9lkdOKj3Dcfh_tppN2NfORH0jTQBLYCXuElYnn2m7w/edit?gid=2106429687#gid=2106429687)

This sheet already has the Apps Script installed and initial processing (Clean domains, Normalize phone numbers, Classify firm buckets) completed. To refill the pipeline, start at **Step 8** — you do not need to re-run BigQuery or repeat Steps 1-7 until this sheet is exhausted.

---

## Phase 1 — Source Data from BigQuery

These steps only need to run once per BigQuery export. If the active Google Sheet above still has unprocessed rows, skip to Step 8.

### Step 1 — Open BigQuery

Open the query page in Google Cloud for the IRS FOIA table:

[BigQuery Console — IRS FOIA Raw](https://console.cloud.google.com/bigquery?project=tax-monitor-pro&ws=!1m16!1m4!4m3!1svirtual-launch-pro!2sfoiaextract_1775094209207!3sirs_foia_raw_2026_0401!1m10!12m5!1m3!1stax-monitor-pro!2snorthamerica-northeast1!3s31a4d9ff-f91b-46a3-aa06-b0ab2274de2c!2e1!14m3!1stax-monitor-pro!2sbquxjob_102eaf3e_19d55d169c4!3sUS)

### Step 2 — Run the shaped query

Use the shaped query (file: `bigquery-shaped-query-v2.sql`), not the raw FOIA query.

The shaped query pre-filters to:
- US-based records only (valid 2-letter state codes)
- Recognized professions only (EA, CPA, ATTY)
- Records with a website (required for Clay domain enrichment)
- Excludes known national firms by DBA name

This reduces 858K+ raw rows to an exportable size that fits within Google Sheets limits.

### Step 3 — Save results to Google Sheets

After the query finishes, click **Save results → Google Sheets**.

### Step 4 — Open the Google Sheet

Open the generated Google Sheet. Verify the header row matches the Required Output Schema above.

---

## Phase 2 — Sheet Setup and Initial Processing

These steps only need to run once per new Google Sheet. If using the active sheet above, skip to Step 8.

### Step 5 — Add the Apps Script

In Google Sheets, go to **Extensions → Apps Script**.

Paste in the Lead Tools script (file: `lead-tools-apps-script.js`).

Save the script. Deploy it:

* **Deploy → New deployment**
* Select **Web app**
* Click **Deploy**

Return to the sheet and refresh the page.

### Step 6 — Verify the Lead Tools menu

After refresh, the custom menu appears as **Lead Tools** with three submenus:

* **Prepare** — Clean domains, Normalize phone numbers, Mark email_status, Validate email-domain match
* **Classify** — Classify firm buckets
* **Clay Batch** — Select next 50 rows, Clear Clay batch markers

### Step 7 — Run initial processing

From **Lead Tools**, run these in order:

1. **Prepare → Clean domains** — extracts and normalizes domains from the WEBSITE column into domain_clean
2. **Prepare → Normalize phone numbers** — standardizes all phone numbers to (XXX) XXX-XXXX format
3. **Classify → Classify firm buckets** — assigns solo_brand, local_firm, or national_firm to each row

---

## Repeatable Pipeline (Steps 8–20)

Start here each time you need to refill the prospect pipeline. Each cycle adds up to 50 enriched prospects to the master CSV.

### Step 8 — Select the next Clay batch

The BigQuery query already excluded known national firms, but the classifier may catch additional ones based on DBA patterns. Filter the `firm_bucket` column to confirm only `solo_brand` and `local_firm` rows remain.

From **Lead Tools**, run:

* **Clay Batch → Select next 50 rows**

This highlights the next 50 eligible rows in yellow. Eligible means: `firm_bucket` is solo_brand or local_firm, `clay_workbook_ref` is empty, and `domain_clean` is populated.

---

## Phase 3 — Export to Clay

### Step 9 — Export only the highlighted batch to CSV

Select only the 50 highlighted rows and export as CSV. Do not export the full sheet.

Each Clay workbook receives exactly one 50-row batch. This matches Clay's free-tier Work Email enrichment limit.

---

## Phase 4 — Clay Enrichment

### Step 10 — Create a Clay workbook

Go to [Clay.com](https://app.clay.com), log in, and click **+ New workbook**.

Name the workbook:

```text
IRS FOIA RAW YYYY_MMDD_###
```

Examples: `IRS FOIA RAW 2026_0403_050`, `IRS FOIA RAW 2026_0404_100`

The trailing number is the running total of prospects processed across all batches.

### Step 11 — Import and enrich

Upload the CSV from Step 9.

Run **Tools → Enrichment → Work Email** with this field mapping:

* **Full Name** → `FULL_NAME`
* **Company Domain** → `domain_clean`

Wait for Clay to populate the **Work Email** column.

### Step 12 — Clean up the exported CSV

After Clay has imported the file, delete the CSV from your Downloads folder. Clay has its own copy in the workbook. The local file is no longer needed and leaving it creates confusion about which file is current.

---

## Phase 5 — Return to Google Sheets

### Step 13 — Paste enriched emails using key-based alignment

Return to the Google Sheet.

**Critical: do not paste by row position alone.**

Before pasting Clay's Work Email values into the `email_found` column:

1. Verify the Google Sheet is unfiltered and in original row order
2. Verify Clay's workbook is in the same row order as the exported CSV
3. Match each email to its row using `FULL_NAME` + `domain_clean` as the join key
4. If any row in Clay has a different name or domain than the corresponding Sheet row, stop and re-align before pasting

Misaligned paste is the highest-risk step in this workflow. One off-by-one error maps emails to wrong prospects, which means wrong people receive outreach.

### Step 14 — Record the Clay workbook reference

Copy the workbook ID from the Clay browser URL.

Example: `https://app.clay.com/workspaces/1093026/workbooks/wb_0tcxx39EqV5JFjvqdfQ/all-tables`

The workbook ID is: `wb_0tcxx39EqV5JFjvqdfQ`

Paste this into the `clay_workbook_ref` column for all 50 rows in this batch. This serves as permanent recordkeeping and prevents the same rows from being selected in future Clay batches.

---

## Phase 6 — Final Processing in Google Sheets

### Step 15 — Mark email status and validate

From **Lead Tools**, run these in order:

1. **Prepare → Mark email_status** — sets `valid` or `invalid` based on email format
2. **Prepare → Validate email ↔ domain match** — cross-checks each email's domain against `domain_clean`

After validation:
- **Red highlighted rows** = domain mismatch. Review these — the email may belong to a different person. Fix or remove the email before exporting.
- **Orange highlighted rows** = personal email provider (gmail.com, yahoo.com, etc.). These are not necessarily wrong — Clay sometimes returns personal emails when no work email exists. Review and decide whether to keep.

### Step 16 — Review send-ready rows

Filter to rows where:
- `clay_workbook_ref` is populated (this batch)
- `email_status` = `valid`
- No red highlights from validation

These are the rows ready for export.

---

## Phase 7 — Final Export for Claude

### Step 17 — Export and place the CSV

Download the filtered rows as CSV. Save the file into the `scale/prospects/` folder with the exact filename `new-prospects.csv`. If a previous `new-prospects.csv` exists there with data rows, the merge script has not been run yet — run it first before overwriting.

### Step 18 — Clean up the downloaded CSV

After saving the file as `new-prospects.csv` in `scale/prospects/`, delete the original downloaded CSV from your Downloads folder. The repo copy is now the only copy that matters.

### Step 19 — Run the merge script via Claude Code

Open Claude Code in the TTMP repo (`C:\Users\britn\OneDrive\transcript.taxmonitor.pro`) and give this prompt:

```
Run the merge script: node scale/scripts/merge-intake.js
Report back the full summary output.
If any rows were rejected, list the reasons.
If the script refused to run, explain why.
```

Do not run the merge script manually. Repo Claude runs it, reads the output, and reports back so you can confirm before proceeding to batch generation.

### Step 20 — Trigger Claude batch generation

After Repo Claude confirms a successful merge, the new rows are in the master CSV and eligible for selection. In the same Claude Code session, give this prompt:

```
Run the daily batch generation per CLAUDE.md daily loop.
Select the next 50 eligible records from the master CSV where email_1_prepared_at is empty.
Generate Email 1 copy and asset page data.
Write the output files.
Stamp the tracking columns.
Report back: how many records processed, output file paths, and remaining eligible count.
```

---

## Batch Cadence

Each cycle through this workflow adds up to 50 prospects to the master CSV. Run one cycle per day during Week 1. Scale to multiple cycles per day as Clay credits allow.

Running total tracking: the Clay workbook naming convention (`_050`, `_100`, `_150`) tracks cumulative prospects processed across all batches.

---

## File Cleanup Summary

| When | Delete what | Why |
|------|------------|-----|
| After Step 12 (Clay import) | CSV in Downloads folder | Clay has its own copy in the workbook |
| After Step 17 (save to repo) | CSV in Downloads folder | Repo copy at `scale/prospects/new-prospects.csv` is the only one that matters |
| Automatic (merge script) | `new-prospects.csv` data rows | Script archives to `scale/prospects/archive/` and truncates to headers only |

Never delete files from `scale/prospects/archive/`. That is your audit trail.

---

## File Paths Reference

| File | Purpose | Who writes it |
|------|---------|---------------|
| `scale/prospects/new-prospects.csv` | Intake file — human places export here | Human (you) |
| `scale/prospects/IRS*.csv` | Master CSV — Claude reads this | Merge script + Claude |
| `scale/prospects/archive/intake-*.csv` | Archived intake files | Merge script |
| `scale/prospects/.batch-in-progress` | Lockfile — signals Claude is mid-batch | Claude batch script |
| `scale/scripts/merge-intake.js` | Merge script | Repo Claude (one-time creation, done) |
| `scale/generate-batch.js` | Batch orchestrator — selection, slugs, tracking | Repo Claude (one-time creation, done) |