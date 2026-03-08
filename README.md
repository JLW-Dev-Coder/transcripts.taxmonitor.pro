# Transcript Tax Monitor Pro

## Overview

Transcript Tax Monitor Pro is a signed-in transcript workspace backed by a dedicated Cloudflare Worker. The system supports magic-link authentication, token balances, transcript preview creation, permanent report links, email delivery of reports, Stripe credit purchases, and support-status lookups.

This repository contains the frontend pages, shared report presentation, and Worker deployment configuration for the transcript app.

---

## Architecture

The system uses a focused serverless architecture.

Components:

* Cloudflare KV for permanent report links, report metadata, session records, support-status records, and magic-link state
* Cloudflare R2 for receipt records and transcript-related event storage
* Cloudflare Workers for API orchestration, authentication, report-link handling, Stripe integration, and support projections
* Durable Objects for authoritative token balances and idempotent credit and consume operations
* Gmail API via Google service account for magic-link and report email delivery
* ClickUp webhook integration for support-status projection
* Static frontend pages for sign-in, dashboard, pricing, report, and confirmation flows
* Stripe for checkout and purchase webhooks

---

## Core Features

* ClickUp-powered support status sync
* Magic-link sign-in with secure session cookies
* Paginated purchase history for signed-in users
* Paginated report history for signed-in users
* Permanent short report links stored in KV
* Preview creation that spends 1 token and returns `eventId`, `reportId`, and `reportUrl`
* Real token balance retrieval from Durable Objects
* Report email delivery using permanent short links
* Report print completion tracking
* Session-based authenticated transcript workspace
* Stripe checkout for transcript credits
* Stripe checkout status retrieval for receipt and success pages
* Support ticket creation backed by canonical Worker state and ClickUp projection
* Support ticket public status lookup

---

## End-to-End Flow

The current transcript flow is:

```text
sign in
→ refresh balance
→ upload PDF
→ extract
→ parse
→ save preview
→ preview response returns eventId/reportId/reportUrl
→ open report
→ print
→ print-complete marks report printed
→ dashboard shows printed
→ email report sends permanent short link
```

### Preview Flow

The preview workflow now:

* creates a new preview through `POST /api/transcripts/preview`
* returns real `eventId`, `reportId`, and `reportUrl`
* spends 1 token through the Durable Object ledger
* stores canonical report metadata in KV
* stores a preview receipt record in R2
* uses signed-in session auth

### Report Link Flow

The report-link workflow now:

* builds permanent short links through `/transcript/report-link`
* redirects short links through `/transcript/report?r=...`
* stores report payloads in KV instead of relying only on raw hash links
* supports report payload transport by hash or query

### Report Print Flow

The report page finalizes printing through:

`POST /api/transcripts/report/{reportId}/print-complete`

The frontend uses:

* `afterprint`
* a timeout fallback
* `credentials: "include"`
* duplicate protection with `hasReportedPrintComplete`

---

## API Endpoints

The Worker now exposes three main groups of routes.

### Authenticated App API

| Method | Endpoint                                           | Description                                                                |
| ------ | -------------------------------------------------- | -------------------------------------------------------------------------- |
| GET    | `/api/transcripts/checkout/status?session_id=...`  | Return finalized Stripe checkout details for the success page and receipts |
| GET    | `/api/transcripts/me`                              | Return the signed-in user state with `email`, `tokenId`, and `balance`     |
| GET    | `/api/transcripts/magic-link/verify?token=...`     | Verify a magic link, create a session, set cookie, and redirect            |
| GET    | `/api/transcripts/purchases`                       | Return signed-in purchase history                                          |
| GET    | `/api/transcripts/reports`                         | Return signed-in report history                                            |
| POST   | `/api/transcripts/magic-link/request`              | Create and email a magic link                                              |
| POST   | `/api/transcripts/preview`                         | Create a preview and spend 1 token                                         |
| POST   | `/api/transcripts/report/:reportId/print-complete` | Mark a report as printed                                                   |
| POST   | `/api/transcripts/sign-out`                        | Clear the transcript session cookie                                        |

### Public Transcript

| Method | Endpoint                               | Description                                                     |
| ------ | -------------------------------------- | --------------------------------------------------------------- |
| GET    | `/transcript/prices`                   | Return Stripe-backed pricing and credit packages                |
| GET    | `/transcript/report-data?reportId=...` | Return stored report payload data                               |
| GET    | `/transcript/report-link`              | Resolve or create report links from payload, URL, or `reportId` |
| GET    | `/transcript/report?r=...`             | Redirect a short report link to the asset report page           |
| GET    | `/transcript/tokens?tokenId=...`       | Return token balance for a token id                             |
| POST   | `/transcript/checkout`                 | Create a Stripe Checkout session                                |
| POST   | `/transcript/consume`                  | Consume tokens                                                  |
| POST   | `/transcript/credit`                   | Manually credit tokens                                          |
| POST   | `/transcript/stripe/webhook`           | Process Stripe credit purchases                                 |

### Support and Utility Routes

| Method | Endpoint                         | Description                                                 |
| ------ | -------------------------------- | ----------------------------------------------------------- |
| GET    | `/health`                        | Health check                                                |
| GET    | `/v1/help/status?ticket_id=...`  | Return public support ticket status                         |
| POST   | `/forms/transcript/report-email` | Email a permanent short report link after unlock validation |
| POST   | `/v1/clickup/webhook`            | Project ClickUp support updates into canonical Worker state |

---

## Worker Responsibilities

The Worker currently handles the following responsibilities.

Alphabetical list:

* create and verify magic links
* create permanent short report links
* create preview records and report metadata
* create Stripe Checkout sessions
* credit and consume transcript tokens
* email magic links and report links
* finalize printed reports
* mirror ClickUp support status into canonical Worker state
* redirect short report links to the report asset page
* return authenticated app state for signed-in users
* return paginated purchase history
* return paginated report history
* return public support ticket status
* store receipt records in R2
* store report payloads, unlock state, sessions, and report metadata in KV
* store session cookies

---

## Frontend Pages

The current frontend should align with the Worker routes that exist today.

### Required Pages

* `app-dashboard.html`
* `payment-confirmation.html`
* `sign-in.html`

### Purpose

#### `app-dashboard.html`

Signed-in transcript dashboard containing:

* account state
* balance display
* purchase history
* report history
* support status views
* transcript tools

This is the primary destination after magic-link verification.

#### `payment-confirmation.html`

Stripe success destination after credit purchase.

#### `sign-in.html`

Primary authentication entry point for requesting a magic link.

---

## Existing Pages

### Keep and Refactor

#### `assets/report.html`

Keep this file as the canonical report presentation page.

Current role:

* opens reports by `reportId`
* loads payload data through Worker-backed link flow
* supports print completion flow
* acts as the destination behind short report redirects

#### `assets/confirmation.html`

Keep this file as the visual reference for:

* confirmation UI
* payment success UI
* receipt presentation

#### `partials/parse-lab.html`

Keep this while the dashboard absorbs the remaining transcript tooling.

Long term:

* move transcript workflow UI into `app-dashboard.html`
* remove the partial when it is no longer used

---

## Shared UI Strategy

The app should continue reusing the strongest existing presentation patterns instead of duplicating markup everywhere, because apparently the industry still needs to relearn that every six months.

### Report UI

Use `assets/report.html` as the visual source of truth for:

* analysis sections
* branded summary blocks
* print-friendly structure
* report layout
* transaction presentation

Recommended implementation:

* keep shared report rendering in `scripts/report-renderer.js`
* keep shared styles in `styles/site.css`
* let dashboard report views and report links use the same renderer and data model

### Confirmation and Receipt UI

Use `assets/confirmation.html` as the styling reference for:

* `payment-confirmation.html`
* receipt cards
* receipt detail views

---

## Storage Model

### Cloudflare KV

Used for:

* magic-link records
* permanent short report payloads
* report indexes
* report metadata
* report unlock records
* session records
* support-status records
* user account records

### Cloudflare R2

Used for:

* manual credit receipts
* preview consume receipts
* report email receipts
* Stripe receipts
* token consume receipts

### Durable Objects

`TokenLedger` is the authoritative token ledger for:

* balance reads
* idempotent credit operations
* idempotent consume operations

---

## Recommended Repo Direction

### Keep

* `assets/confirmation.html`
* `assets/report.html`
* `partials/parse-lab.html` until the dashboard fully replaces it
* `scripts/report-renderer.js`
* `styles/site.css`

### Add or Maintain

* `app-dashboard.html`
* `payment-confirmation.html`
* `sign-in.html`

---

## Suggested Project Structure

Top level:

```text
app-dashboard.html
contact.html
index.html
payment-confirmation.html
README.md
sign-in.html
```

Keep in assets:

```text
assets/
  confirmation.html
  favicon.ico
  logo.svg
  product.html
  report-preview.html
  report.html
```

Likely supporting app files:

```text
scripts/
  report-renderer.js

styles/
  site.css
```

Worker and deployment:

```text
src/
  index.js

wrangler.toml
```

---

## Environment and Bindings

The Worker depends on these platform pieces.

### Bindings

* `KV_TRANSCRIPT`
* `R2_TRANSCRIPT`
* `TOKEN_LEDGER`

### Important Variables and Secrets

Alphabetical list:

* `CLICKUP_API_TOKEN` or `CLICKUP_TOKEN`
* `CLICKUP_WEBHOOK_SECRET`
* `CREDIT_MAP_JSON`
* `GOOGLE_CLIENT_EMAIL`
* `GOOGLE_PRIVATE_KEY`
* `GOOGLE_TOKEN_URI`
* `GOOGLE_WORKSPACE_USER_DEFAULT`
* `GOOGLE_WORKSPACE_USER_NOREPLY`
* `GOOGLE_WORKSPACE_USER_SUPPORT`
* `PRICE_10`
* `PRICE_100`
* `PRICE_25`
* `STRIPE_SECRET_KEY`
* `STRIPE_WEBHOOK_SECRET`
* `TRANSCRIPT_RETURN_ORIGINS_JSON`
