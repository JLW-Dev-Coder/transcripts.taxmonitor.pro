# Transcript.Tax Monitor Pro

**Serverless · Contract-Driven · Idempotent · Event-Driven · R2-Authoritative**

---

## Table of Contents (Alphabetical)

* [About Transcript.Tax Monitor Pro](#what-transcripttax-monitor-pro)
* [Authentication Model](#authentication-model)
* [ClickUp Projection Layer](#clickup-projection-layer)
* [Contracts (Mutation Ingress Only)](#contracts-mutation-ingress-only)
* [Core Stack](#core-stack-alphabetical)
* [Data Model (R2 Canonical Authority)](#data-model-r2-canonical-authority)
* [Domains & Routing](#domains--routing)
* [Event Trigger System](#event-trigger-system)
* [Idempotency & Safety](#idempotency--safety)
* [Lifecycle State Model (Order StepBooleans)](#lifecycle-state-model-order-stepbooleans)
* [Operational Checklist](#operational-checklist)
* [Payloads (Stripe, Transcript Report, Cal Support)](#payloads-stripe-transcript-report-cal-support)
* [Processing Contract (Write Order)](#processing-contract-write-order)
* [Read Models (Worker GET Endpoints)](#read-models-worker-get-endpoints)
* [Report Rendering Contract](#report-rendering-contract)
* [Repository Structure (Exact Tree)](#repository-structure-exact-tree)
* [Security & Legal Controls](#security--legal-controls)
* [Stripe Payments (Payment Links + Confirmation Redirect)](#stripe-payments-payment-links--confirmation-redirect)
* [Support Message Contract (v1)](#support-message-contract-v1)
* [System Architecture](#system-architecture)
* [Worker Environment Variables](#worker-environment-variables)

---

# About Transcript.Tax Monitor Pro

Transcript.Tax Monitor Pro is a **serverless CRM + delivery system for IRS transcript monitoring and structured report generation**.

It is:

* Contract-driven
* Event-driven
* Idempotent
* R2-authoritative
* Worker-orchestrated

HTML never defines valid data. JSON contracts define valid data.

---

# System Architecture

## Presentation Layer

Cloudflare Pages serves:

* `/` (marketing + product)
* `/assets/*` (product pages + report UI)
* `/magnets/*` (lead magnets)

UI never mutates canonical state directly. All mutations go through Worker endpoints.

---

## Logic Layer

Cloudflare Worker (`api.taxmonitor.pro`):

* Validates inbound events
* Writes append-only receipts
* Upserts canonical state
* Enforces lifecycle gating
* Projects to ClickUp
* Sends email (after canonical update only)
* Serves read-only GET endpoints

---

## Storage Layer

Cloudflare R2:

* Canonical objects (mutable state)
* Append-only receipt ledger (immutable)
* Generated artifacts (reports, PDFs)

R2 is authority. Nothing else is authoritative.

---

## Execution Layer

ClickUp:

* Accounts list
* Orders list
* Support list
* Transcripts list (credit tracking + report projection)

ClickUp is projection only. Worker writes to R2 first, then projects.

---

# Domains & Routing

## UI Domain

```
https://transcript.taxmonitor.pro
```

Serves:

* `/assets/*`
* `/magnets/*`
* `/` (marketing + product)

---

## API Domain

```
https://api.taxmonitor.pro
```

Worker route:

```
api.taxmonitor.pro/*
```

Rules:

* All forms must POST absolute URLs
* No relative form actions
* No UI → ClickUp direct calls
* No UI → Stripe direct calls
* No SMTP ever

---

# Event Trigger System

Transcript.Tax Monitor Pro does not use login sessions, in-app messaging, or client-side activity beacons. The system only reacts to real mutation sources.

## Final Trigger Set (Alphabetical)

* Appt
* Email
* Form
* Payment
* Task

## Trigger Sources

Appt → Cal webhook (support bookings)
Email → Google Workspace outbound (sent only after canonical update)
Form → Public site POST endpoints (token consume, transcript parse, report email)
Payment → Stripe webhooks (credit purchases)
Task → ClickUp webhook (projection-side updates when required)

All triggers must result in one of the following:

* Receipt append
* Canonical R2 mutation
* ClickUp projection

If none of the above occur, it is not a trigger in this system.

---

# Processing Contract (Write Order)

For every inbound mutation event:

1. Validate signature (if webhook)
2. Validate payload against JSON contract
3. Append receipt (immutable)
4. Upsert canonical object
5. Project to ClickUp
6. Send email (if required)

If receipt exists → exit safely.

Receipt append always precedes canonical mutation.

Payment Links are treated as:

* UI redirect only (no mutation)
* Stripe webhook is the mutation source of truth

---

# Data Model (R2 Canonical Authority)

```
accounts/{accountId}.json
orders/{orderId}.json
receipts/{source}/{eventId}.json
reports/{reportId}.json
support/{supportId}.json
transcripts/{transcriptId}.json
```

Notes:

* `receipts/*` is the immutable ledger.
* `accounts/*` holds credit balance.
* `orders/*` holds each Stripe purchase (one per successful payment event).
* `reports/*` is the authoritative render model for UI download/preview.
* `transcripts/*` stores parsed transcript data (source + normalized output).
* `support/*` stores Cal bookings and status changes.

Receipts are immutable ledger entries. Canonical objects are mutable state. Reports are authoritative render models.

---

# Lifecycle State Model (Order StepBooleans)

Each order tracks progression via strict booleans:

```
intakeComplete
offerAccepted
agreementAccepted
paymentCompleted
welcomeConfirmed
filingStatusSubmitted
addressUpdateSubmitted
reportReady
```

Worker enforces:

* No forward step without prior completion
* No projection before canonical update
* No report rendering unless `reportReady = true`

---

# Report Rendering Contract

Report rendering follows strict priority:

1. `orders` object (primary)
2. `accounts` object (secondary)

For transcript download flow:

* A credit is consumed only after successful R2 persistence of `reports/{reportId}.json`
* Rendering always loads by `reportId`
* Preview mode never mutates state

If `reportReady = false`:

* Render placeholders
* Do not render compliance artifacts

Rendering logic never infers state from UI.

---

# Read Models (Worker GET Endpoints)

Read models:

* Do not append receipts
* Do not mutate canonical R2
* Do not project to ClickUp
* Are not included in contract-registry.json

Examples:

```
GET /app/payments
GET /app/reports/{reportId}
```

## Token Balance (Index Page)

The site `/index.html` checks token availability via a **read model** call before enabling parsing. The client logic:

* Stores token ID in `localStorage.tmp_tokenId`
* Calls `GET /transcript/tokens?tokenId=...`
* Expects JSON with a numeric `balance`
* Tries base URLs in order: `https://api.taxmonitor.pro`, then `window.location.origin` (sorted)

If the endpoint is unreachable or returns non-2xx, the UI shows “Token status unavailable (API not reachable).”

This endpoint must be **read-only** (no receipts, no mutations).

Purpose:

Return canonical R2-derived data for rendering only.

Read models are documented here, not registered as mutation contracts.

---

# Contracts (Mutation Ingress Only)

This repo does not maintain a separate contract registry file.

Mutation contracts are defined implicitly by Worker handlers. A contract exists whenever:

* An endpoint receives a POST
* The Worker appends a receipt
* The Worker mutates canonical R2 state
* The Worker performs credit consumption
* The Worker projects to ClickUp

There is no standalone `contract-registry.json` in this system.

Validation rules (enforced in Worker code):

* All mutation requests must include `eventId`
* Unknown fields must be rejected
* Credit consumption must be idempotent by `requestId` (shared with `eventId`)
* No business logic is trusted from UI state

UI never defines valid data. The Worker enforces shape and state transitions.

---

# ClickUp Projection Layer

ClickUp is projection only. R2 is the only authority.

## Lists

* Account — 901710909567
* Orders — 901710818340
* Support — 901710818377
* Transcripts — 901711373249

## Task Model

All tasks link to the account via the **Account ID** custom field ([https://api.clickup.com/api/v2/task/{task_id}/link/{links_to](https://api.clickup.com/api/v2/task/{task_id}/link/{links_to)}).

* `accounts/{accountId}.json` → upsert one task per `accountId` in **Account** list
* `orders/{orderId}.json` → upsert one task per `orderId` in **Orders** list
* `support/{supportId}.json` → upsert one task per `supportId` in **Support** list
* `transcripts/{transcriptId}.json` → upsert one task per `accountId` in **Transcripts** list (credit + latest report)

## Custom Fields (Authoritative Set)

### Account fields

* Account Company Name — `059a571b-aa5d-41b4-ae12-3681b451b474`  
* Account Event ID — `33ea9fbb-0743-483a-91e4-450ce3bfb0a7`  
* Account Full Name — `b65231cc-4a10-4a38-9d90-1f1c167a4060`  
* Account ID — `e5f176ba-82c8-47d8-b3b1-0716d075f43f`  
* Account Order Task Link — `4b22ab15-26f3-4f6f-98b5-7b4f5446e62d`  
* Account Primary Email — `a105f99e-b33d-4d12-bb24-f7c827ec761a`  
* Account Support Task Link — `4b22ab15-26f3-4f6f-98b5-7b4f5446e62d`  
* Account Transcript Credits — `f938260c-600d-405a-bee7-a8db5d09bf6d`

### Order fields

* Order Event ID — `77197d46-559d-43c1-9dfc-5123ce2a02f1`
* Order Payment Intent ID — `6fc65cba-9060-4d70-ab36-02b239dd4718`
* Stripe Customer ID — `a5e09a6a-5c14-4efe-86a7-3f76fa7739e6`
* Stripe Order Receipt URL — `f8cb77f1-26b3-4788-83ed-2914bb608c11`
* Stripe Payment Status — `1b9a762e-cf3e-47d7-8ae7-98efe9e11eab`
* Stripe Payment URL — `0609cd0b-dd5e-4523-a21f-c4df8e9da4db`
* Stripe Session ID — 57e6c42b-a471-4316-92dc-23ce0f59d8b4

### Transcript fields

* Transcript Event ID — `73570eb4-1908-4950-91d2-8cdd42dd4bc2`
* Transcript Report ID — `5250265e-b9cc-4c13-8693-718b28d9d0e2`

### Support fields (latest Cal booking event)

* Support Event ID — `8e8b453e-01f3-40fe-8156-2e9d9633ebd6`
* Support Latest Update — `03ebc8ba-714e-4f7c-9748-eb1b62e657f7`

## Projection Rules

* Worker never reads ClickUp to decide canonical state.
* Worker always writes: receipt → canonical R2 → ClickUp projection.
* Credit balance is projected from `accounts/{accountId}.json`.

## Comments (Audit Trail)

Add one ClickUp comment per credit mutation:

* Purchase: `+{credits} credits (Stripe session {stripeSessionId})`
* Consumption: `-{creditsUsed} credit (Report {reportId})`

ClickUp is never authoritative.

---

# Idempotency & Safety

* Every event includes `eventId`
* Stripe dedupe key = Stripe Checkout Session ID (from Payment Links)
* Receipt written before canonical change
* No duplicate credits
* No duplicate emails
* Retry-safe processing

ClickUp projection must be idempotent:

* Upsert the same task for the same `accountId`
* Avoid duplicate comments by using a deterministic comment fingerprint (stored in canonical state)

---
```
{
  "id": "901711473499",
  "name": "Accounts",
  "deleted": false,
  "orderindex": 0,
  "priority": null,
  "assignee": null,
  "task_count": 1,
  "due_date": null,
  "start_date": null,
  "folder": {
    "id": "90177070460",
    "name": "VA Starter Track",
    "hidden": false,
    "access": true
  },
  "space": {
    "id": "90170896661",
    "name": "Admin",
    "access": true
  },
  "inbound_address": "a.t.901711473499.u-10505295.52a1190a-b1ef-4327-ad0d-4575859c3166@tasks.clickup.com",
  "archived": false,
  "override_statuses": true,
  "statuses": [
    {
      "id": "sc901711473499_ql3JDGwp",
      "status": "lead",
      "orderindex": 0,
      "color": "#87909e",
      "type": "open",
      "status_group": "subcat_901711473499"
    },
    {
      "id": "sc901711473499_YGi7USAJ",
      "status": "active prospect",
      "orderindex": 1,
      "color": "#5f55ee",
      "type": "custom",
      "status_group": "subcat_901711473499"
    },
    {
      "id": "sc901711473499_paQXZWfu",
      "status": "active client",
      "orderindex": 2,
      "color": "#30a46c",
      "type": "custom",
      "status_group": "subcat_901711473499"
    },
    {
      "id": "sc901711473499_PtMresA8",
      "status": "inactive prospect",
      "orderindex": 3,
      "color": "#f76808",
      "type": "done",
      "status_group": "subcat_901711473499"
    },
    {
      "id": "sc901711473499_P199BDW5",
      "status": "inactive client",
      "orderindex": 4,
      "color": "#e5484d",
      "type": "done",
      "status_group": "subcat_901711473499"
    },
    {
      "id": "sc901711473499_2rFUlBQ6",
      "status": "case closed",
      "orderindex": 5,
      "color": "#008844",
      "type": "closed",
      "status_group": "subcat_901711473499"
    }
  ],
  "permission_level": "create"
}
```
```
{
  "fields": [
    {
      "id": "059a571b-aa5d-41b4-ae12-3681b451b474",
      "name": "Account Company Name",
      "type": "short_text",
      "type_config": {},
      "date_created": "1772037874392",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "1b9a762e-cf3e-47d7-8ae7-98efe9e11eab",
      "name": "Stripe Payment Status",
      "type": "short_text",
      "type_config": {},
      "date_created": "1770919480157",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "33ea9fbb-0743-483a-91e4-450ce3bfb0a7",
      "name": "Account Event ID",
      "type": "short_text",
      "type_config": {},
      "date_created": "1772040729038",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "57e6c42b-a471-4316-92dc-23ce0f59d8b4",
      "name": "Stripe Session ID",
      "type": "short_text",
      "type_config": {},
      "date_created": "1770919466454",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "6fc65cba-9060-4d70-ab36-02b239dd4718",
      "name": "Stripe Payment Intent ID",
      "type": "short_text",
      "type_config": {},
      "date_created": "1772042380577",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "9e14a458-96fd-4109-a276-034d8270e15b",
      "name": "Account Support Task Link",
      "type": "tasks",
      "type_config": {
        "fields": []
      },
      "date_created": "1770919329551",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "a105f99e-b33d-4d12-bb24-f7c827ec761a",
      "name": "Account Primary Email",
      "type": "email",
      "type_config": {},
      "date_created": "1770919006808",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "b65231cc-4a10-4a38-9d90-1f1c167a4060",
      "name": "Account Full Name",
      "type": "short_text",
      "type_config": {},
      "date_created": "1772037556900",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "bbdf5418-8be0-452d-8bd0-b9f46643375e",
      "name": "Account Support Status",
      "type": "drop_down",
      "type_config": {
        "sorting": "manual",
        "new_drop_down": true,
        "options": [
          {
            "id": "32b2e245-fd5c-4a03-bc17-4ebdd8eae089",
            "name": "New / Open",
            "color": "#f900ea",
            "orderindex": 0
          },
          {
            "id": "c05a8aa5-f7f9-4b00-bd8d-079295791afc",
            "name": "Blocked",
            "color": "#E65100",
            "orderindex": 1
          },
          {
            "id": "4fa76dee-a591-4fff-ad19-d71774341d3b",
            "name": "In Progress",
            "color": "#e50000",
            "orderindex": 2
          },
          {
            "id": "1305897c-c718-497d-8120-348e10e6ed30",
            "name": "Needs Review",
            "color": "#0231E8",
            "orderindex": 3
          },
          {
            "id": "228c6ef0-4895-4cdb-8cae-4d1e1bb49fde",
            "name": "Waiting on Client",
            "color": "#FF4081",
            "orderindex": 4
          },
          {
            "id": "741f1d07-8409-4c1b-ad5f-4243793b5710",
            "name": "Complete",
            "color": "#EA80FC",
            "orderindex": 5
          },
          {
            "id": "3c97368c-56b7-472b-98d0-4bd5d1825f3d",
            "name": "Closed",
            "color": "#02BCD4",
            "orderindex": 6
          }
        ]
      },
      "date_created": "1770919308725",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "e5f176ba-82c8-47d8-b3b1-0716d075f43f",
      "name": "Account ID",
      "type": "short_text",
      "type_config": {},
      "date_created": "1770918977961",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "f8cb77f1-26b3-4788-83ed-2914bb608c11",
      "name": "Stripe Receipt URL",
      "type": "url",
      "type_config": {},
      "date_created": "1772042441485",
      "hide_from_guests": false,
      "required": false
    }
  ]
}
```
```
{
  "id": "901711478590",
  "name": "Support",
  "deleted": false,
  "orderindex": 1,
  "content": "",
  "priority": null,
  "assignee": null,
  "task_count": 0,
  "due_date": null,
  "start_date": null,
  "folder": {
    "id": "90177070460",
    "name": "VA Starter Track",
    "hidden": false,
    "access": true
  },
  "space": {
    "id": "90170896661",
    "name": "Admin",
    "access": true
  },
  "inbound_address": "a.t.901711478590.u-10505295.0efe4f13-5134-457f-8106-3bb6cacfe01a@tasks.clickup.com",
  "archived": false,
  "override_statuses": true,
  "statuses": [
    {
      "id": "sc901711478590_dn2dRFVb",
      "status": "open / new",
      "orderindex": 0,
      "color": "#87909e",
      "type": "open",
      "status_group": "subcat_901711478590"
    },
    {
      "id": "sc901711478590_OKMm7y2k",
      "status": "in progress",
      "orderindex": 1,
      "color": "#5f55ee",
      "type": "custom",
      "status_group": "subcat_901711478590"
    },
    {
      "id": "sc901711478590_gpKVHSl7",
      "status": "waiting on client",
      "orderindex": 2,
      "color": "#4466ff",
      "type": "custom",
      "status_group": "subcat_901711478590"
    },
    {
      "id": "sc901711478590_HlAcH0UR",
      "status": "blocked",
      "orderindex": 3,
      "color": "#1090e0",
      "type": "custom",
      "status_group": "subcat_901711478590"
    },
    {
      "id": "sc901711478590_fdQqQDwm",
      "status": "in review",
      "orderindex": 4,
      "color": "#b660e0",
      "type": "custom",
      "status_group": "subcat_901711478590"
    },
    {
      "id": "sc901711478590_cExcoTWL",
      "status": "resolved",
      "orderindex": 5,
      "color": "#f8ae00",
      "type": "custom",
      "status_group": "subcat_901711478590"
    },
    {
      "id": "sc901711478590_B9XfYTKa",
      "status": "client feedback",
      "orderindex": 6,
      "color": "#aa8d80",
      "type": "custom",
      "status_group": "subcat_901711478590"
    },
    {
      "id": "sc901711478590_eLZNX2kO",
      "status": "complete",
      "orderindex": 7,
      "color": "#656f7d",
      "type": "done",
      "status_group": "subcat_901711478590"
    },
    {
      "id": "sc901711478590_jEEaBdaL",
      "status": "Closed",
      "orderindex": 8,
      "color": "#008844",
      "type": "closed",
      "status_group": "subcat_901711478590"
    }
  ],
  "permission_level": "create"
}
```
```
{
  "fields": [
    {
      "id": "03ebc8ba-714e-4f7c-9748-eb1b62e657f7",
      "name": "Support Latest Update",
      "type": "text",
      "type_config": {},
      "date_created": "1772135243246",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "7f547901-690d-4f39-8851-d19e19f87bf8",
      "name": "Support Email",
      "type": "email",
      "type_config": {},
      "date_created": "1770919584021",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "8e8b453e-01f3-40fe-8156-2e9d9633ebd6",
      "name": "Support Event ID",
      "type": "short_text",
      "type_config": {},
      "date_created": "1771382872871",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "aac0816d-0e05-4c57-8196-6098929f35ac",
      "name": "Support Action Required",
      "type": "drop_down",
      "type_config": {
        "sorting": "manual",
        "new_drop_down": true,
        "options": [
          {
            "id": "165c6aac-bb5a-420c-a64b-bca47b769e21",
            "name": "Acknowledge",
            "color": "#E65100",
            "orderindex": 0
          },
          {
            "id": "a233b302-7779-4136-bb37-eff6cd5e41cc",
            "name": "Triage",
            "color": "#1bbc9c",
            "orderindex": 1
          },
          {
            "id": "8c45bf38-2cc7-45bc-9c48-9dae275938a3",
            "name": "Resolve",
            "color": "#b5bcc2",
            "orderindex": 2
          },
          {
            "id": "dc9e42fb-a1ef-4b3e-a037-cc5b41d33209",
            "name": "Close",
            "color": "#EA80FC",
            "orderindex": 3
          }
        ]
      },
      "date_created": "1770919566506",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "b96403c7-028a-48eb-b6b1-349f295244b5",
      "name": "Support Priority",
      "type": "drop_down",
      "type_config": {
        "sorting": "manual",
        "new_drop_down": true,
        "options": [
          {
            "id": "fe8469b4-0ee1-4fa0-993d-bc9458f1ab6d",
            "name": "🟦 Low — As Scheduled",
            "color": "#0091ff",
            "orderindex": 0
          },
          {
            "id": "ea5fda7f-7c60-4e72-9034-0434836950a2",
            "name": "🟨 Normal — 3–5 Days",
            "color": "#ffc53d",
            "orderindex": 1
          },
          {
            "id": "8f155d97-8512-489f-88c6-77973e76e3c8",
            "name": "🟧 High — 48 Hours",
            "color": "#f76808",
            "orderindex": 2
          },
          {
            "id": "c8862a36-00cd-41b2-94be-22120bfe2f0b",
            "name": "🟥 Critical — Today",
            "color": "#e5484d",
            "orderindex": 3
          }
        ]
      },
      "date_created": "1770919693498",
      "hide_from_guests": false,
      "required": false
    },
    {
      "id": "e09d9f53-4f03-49fe-8c5f-abe3b160b167",
      "name": "Support Type",
      "type": "drop_down",
      "type_config": {
        "sorting": "manual",
        "new_drop_down": true,
        "options": [
          {
            "id": "5f847513-d4dd-4e45-af47-b229dbfbbb8f",
            "name": "Appt - Demo",
            "color": "#b5bcc2",
            "orderindex": 0
          },
          {
            "id": "a8d9484d-df52-42fa-a2c8-e4df801e398e",
            "name": "Appt - Exit / Offboarding",
            "color": "#04A9F4",
            "orderindex": 1
          },
          {
            "id": "75f47f09-fa16-40d4-9be3-583102361799",
            "name": "Appt - Intro",
            "color": "#3397dd",
            "orderindex": 2
          },
          {
            "id": "6ac3e8dc-ca14-4c84-b4da-a8fbefa6ad13",
            "name": "Appt - Onboarding",
            "color": "#3397dd",
            "orderindex": 3
          },
          {
            "id": "27d991dd-a5ee-4713-a844-ddc53650756b",
            "name": "Appt - Support",
            "color": "#3082B7",
            "orderindex": 4
          },
          {
            "id": "b3ae14e7-981d-4756-a14f-7d9a901392d0",
            "name": "Ticket - Intake",
            "color": "#e50000",
            "orderindex": 5
          },
          {
            "id": "fcd840f5-2a38-43db-92c9-611403fa90f6",
            "name": "Ticket - Offer",
            "color": "#bf55ec",
            "orderindex": 6
          },
          {
            "id": "f5e26bdf-adb1-4ad4-a9f7-97f63a6d2977",
            "name": "Ticket - Agreement",
            "color": "#800000",
            "orderindex": 7
          },
          {
            "id": "27f0a9ac-ba0f-4d04-bb02-0a90acdadfac",
            "name": "Ticket - Payment",
            "color": "#667684",
            "orderindex": 8
          },
          {
            "id": "349565f0-90d8-4c35-be41-62cd33ef3398",
            "name": "Ticket - Welcome",
            "color": "#FF4081",
            "orderindex": 9
          },
          {
            "id": "75ec9e09-bb75-4f4a-bc24-35c7da294c26",
            "name": "Ticket - Filing Status",
            "color": "#bf55ec",
            "orderindex": 10
          },
          {
            "id": "360e0d08-ae19-4a08-a7bf-08ac4579f7e2",
            "name": "Ticket - Address Update",
            "color": "#b5bcc2",
            "orderindex": 11
          },
          {
            "id": "ee2d7f9f-e102-4d91-9afa-431361d6bdcf",
            "name": "Ticket - Esign 2848",
            "color": "#b5bcc2",
            "orderindex": 12
          },
          {
            "id": "6aa21211-7691-42fc-9feb-b624f634f8a3",
            "name": "Ticket - Wet Sign 2848",
            "color": "#7C4DFF",
            "orderindex": 13
          },
          {
            "id": "789e2a6b-0c5c-4b3c-8b65-851d4eb4d798",
            "name": "Ticket - Compliance Report",
            "color": "#b5bcc2",
            "orderindex": 14
          },
          {
            "id": "231f2d26-3bad-4c35-b8e4-a8b126415751",
            "name": "Ticket - Client Exit Survey",
            "color": "#02BCD4",
            "orderindex": 15
          },
          {
            "id": "1e837d40-495d-4078-80d1-246c2a76e830",
            "name": "Ticket - Gaming Token",
            "color": "#aec0f5",
            "orderindex": 16
          },
          {
            "id": "9fa5592b-3b29-4ce8-84b8-052698ad026b",
            "name": "Ticket - Transcript Token",
            "color": "#96c7f2",
            "orderindex": 17
          },
          {
            "id": "84c7bb75-1f12-48b2-82d5-6b4f76db62a7",
            "name": "Ticket - VA Landing Page Setup",
            "color": "#b6b6ff",
            "orderindex": 18
          }
        ]
      },
      "date_created": "1770919632977",
      "hide_from_guests": false,
      "required": false
    }
  ]
}
```

---

# Stripe Payments (Payment Links + Confirmation Redirect)

Transcript.Tax Monitor Pro uses **Stripe Payment Links** for credit pack purchases.

## Payment Links

### Live links (authoritative)

* 10 credits

  * Billing link: `https://billing.taxmonitor.pro/b/4gM8wOaAe1oKcUEdTkaR203`
  * Payment Link ID: `plink_1T4QbWCMpIgwe61Zo0VGAWjd`
* 25 credits

  * Billing link: `https://billing.taxmonitor.pro/b/cNi14m5fU3wS1bW9D4aR204`
  * Payment Link ID: `plink_1T4QoqCMpIgwe61Zp7aAL4lJ`
* 100 credits

  * Billing link: `https://billing.taxmonitor.pro/b/dRm8wO7o27N83k47uWaR205`
  * Payment Link ID: `plink_1T4QpbCMpIgwe61ZJ5m5HltC`

Rules:

* UI never calls Stripe APIs directly
* Success redirect must go to the site confirmation page
* Credits are granted only by Stripe webhook processing (not by the redirect)

### Success redirect

Stripe Payment Link “Confirmation page” must be set to:

```
https://transcript.taxmonitor.pro/payment-confirmation.html
```

### Redirect mapping (Cloudflare Pages)

`_redirects` must include:

```
/payment-confirmation.html /assets/confirmation.html 302
```

### Cancel URL

Set cancel URL to:

```
https://transcript.taxmonitor.pro/assets/product.html
```

## Confirmation Page

`/assets/confirmation.html` is UI-only.

It may:

* Display purchase success messaging
* Read `session_id` from the querystring (when provided)
* Poll a read model endpoint to show “credits applied” status

It must not:

* Grant credits
* Mutate canonical state

## Webhook Source of Truth

Credits are granted by a Stripe webhook handler that:

1. Validates Stripe signature
2. Appends receipt to R2 (`receipts/stripe/{eventId}.json`)
3. Upserts canonical credit balance/state
4. Optionally projects to ClickUp

---

# Support Message Contract (v1)

Endpoint:

```
POST https://api.taxmonitor.pro/forms/support/message
```

## Required Fields

* eventId
* name
* email
* subject
* message

## Optional Fields

* tokenId
* utm_*

## Processing Order

1. Append receipt → `receipts/forms/{eventId}.json`
2. Upsert `support/{supportId}.json`
3. Project to ClickUp Support List
4. Send transactional email (Google Workspace)

Rules:

* `eventId` is the idempotency key.
* Receipt must be written before canonical mutation.
* Email is sent only after canonical update.
* ClickUp is projection only.

## Response

```json
{
  "supportId": "SUP-2026-0001"
}
```

---

# Support Status Read Model

## Endpoint

```
GET /app/support/status?supportId=SUP-...
```

## Response (minimal)

* `latestUpdate`
* `status`
* `updatedAt`

Rules:

* Reads canonical `support/{supportId}.json` from R2
* No ClickUp API calls
* No receipt append
* No canonical mutation
* Pure read model only

UI must always read R2. Never ClickUp.

---

# Support Status Webhook Ingestion

## Flow (Authoritative Path)

1. Human updates Support task in ClickUp (status + Latest Update field)
2. ClickUp webhook fires → Worker
3. Worker appends receipt → `receipts/clickup/{eventId}.json`
4. Worker upserts canonical → `support/{supportId}.json`

Canonical fields mirrored into R2:

* `latestUpdate`
* `status`
* `updatedAt`

Supported statuses (alphabetical):

* BLOCKED
* CLIENT FEEDBACK
* CLOSED
* COMPLETE
* IN PROGRESS
* IN REVIEW
* OPEN / NEW
* RESOLVED
* WAITING ON CLIENT

Rules:

* Worker never reads ClickUp to determine canonical truth.
* R2 is updated only via verified webhook ingestion.
* Page reads R2 only.

---

# Support Webhook Health Watchdog

## R2 Meta Key

Path:

```
support/_meta/clickup_webhook.json
```

Shape (minimal):

* `lastError`
* `lastErrorAt`
* `lastEventAt`
* `lastEventId`
* `openAlertTaskId`

This key is updated whenever a ClickUp webhook is successfully processed.

---

## Daily Cron (UTC)

If `now - lastEventAt` exceeds threshold (e.g. 24h):

* Create one ClickUp alert task (dedupe via `openAlertTaskId`)
* Assign to `10505295`
* List: `901710818377`
* Status: `open / new`

Alert task name format (exact):

```
Transcript Tax Monitor Pro Support Ticket - Webhook Health Review Needed - Errored At MM-DD-YYYY HH:SS:MS
```

If webhook processing throws:

* Update `lastError`
* Update `lastErrorAt`
* Create or refresh the same alert task (dedupe rule applies)

---

# Wrangler Cron Configuration

Cloudflare cron runs in UTC.

```toml
[triggers]
crons = ["0 16 * * *"]
```

Move hour if operationally preferred.

---

# Core Stack (Alphabetical)

* Cal.com — Appointment webhooks
* ClickUp — Projection layer
* Cloudflare Pages — UI hosting
* Cloudflare R2 — Canonical storage + artifacts
* Cloudflare Worker — API orchestration
* Google Workspace — Transactional email (only permitted system)
* Stripe — Payment webhooks

---

# Worker Environment Variables

## Secrets

* CAL_WEBHOOK_SECRET
* CLICKUP_API_KEY
* GOOGLE_PRIVATE_KEY
* STRIPE_SECRET_KEY
* STRIPE_WEBHOOK_SECRET

## Plaintext

* BILLING_LINK_10
* BILLING_LINK_100
* BILLING_LINK_25
* CLICKUP_ACCOUNTS_LIST_ID
* CLICKUP_ORDERS_LIST_ID
* CLICKUP_SUPPORT_LIST_ID
* CLICKUP_TRANSCRIPTS_LIST_ID
* CREDIT_MAP_JSON
* GOOGLE_CLIENT_EMAIL
* GOOGLE_TOKEN_URI
* GOOGLE_WORKSPACE_USER_INFO
* GOOGLE_WORKSPACE_USER_NO_REPLY
* GOOGLE_WORKSPACE_USER_SUPPORT
* MY_ORGANIZATION_ADDRESS
* MY_ORGANIZATION_BUSINESS_LOGO
* MY_ORGANIZATION_CITY
* MY_ORGANIZATION_NAME
* MY_ORGANIZATION_STATE_PROVINCE
* MY_ORGANIZATION_ZIP
* PRICE_10
* PRICE_100
* PRICE_25
* PRICE_LINK_10
* PRICE_LINK_100
* PRICE_LINK_25
* TRANSCRIPT_RETURN_ORIGINS_JSON

### Transcript pricing/token vars (from wrangler.toml)

```toml
CREDIT_MAP_JSON = "{\"price_1T4Ar2CMpIgwe61ZMzAI6yKa\":10,\"price_1T4AxzCMpIgwe61ZsWh7GGAb\":25,\"price_1T4B1gCMpIgwe61ZG12b5tjN\":100}"
PRICE_10 = "price_1T4Ar2CMpIgwe61ZMzAI6yKa"
PRICE_25 = "price_1T4AxzCMpIgwe61ZsWh7GGAb"
PRICE_100 = "price_1T4B1gCMpIgwe61ZG12b5tjN"
TRANSCRIPT_RETURN_ORIGINS_JSON = "[\"https://transcript.taxmonitor.pro\"]"
```

---

# Payloads (Stripe, Transcript Report, Cal Support)

This section documents the inbound payload shapes the Worker must accept.

## Stripe (checkout.session.completed)

Event source: Stripe webhook.

Minimum fields used:

* `id` (event id) → receipt + Account Event ID CF
* `data.object.id`  → Stripe Session ID CF (dedupe key)
* `data.object.customer_details.name` → Account Full Name CF
* `data.object.customer_details.email` → Account Primary Email CF
* `data.object.customer_details.business_name` → Account Company Name CF
* `data.object.status` → Stripe Payment Status CF
* `data.object.payment_link` → Stripe Payment URL CF
* `data.object.payment_intent` → Order Payment Intent ID CF

Example (trimmed):

```json
{
  "id": "evt_1SzncbCMpIgwe61ZklDYVjgV",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_live_a15vr7buckd0jG38Vzsuf7QObOwGanLb20JXqw7CZLeDve32AatnSY7TaY",
      "status": "complete",
      "payment_status": "paid",
      "payment_intent": "pi_3SzncZCMpIgwe61Z0ro4Ruxv",
      "payment_link": "plink_1SznXhCMpIgwe61ZUclAKXCj",
      "customer_details": {
        "name": "Jamie L Williams",
        "email": "jamie.williams@virtuallaunch.pro",
        "business_name": null
      }
    }
  }
}
```

Canonical effects:

* Create account (if new)
* Create order (one per successful purchase)
* Increase `accounts/{accountId}.transcriptCredits`

## Stripe (payment_intent.succeeded)

Event source: Stripe webhook.

Purpose:

* Confirms payment intent succeeded
* Links to Checkout Session + Charge by `payment_intent` id

Minimum fields used:

* `id` (event id) → Order Event ID CF
* `data.object.id` → Order Payment Intent ID CF
* `data.object.status` → Stripe Payment Status CF

Example (trimmed):

```json
{
  "id": "evt_3SzncZCMpIgwe61Z0XeE9DfJ",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_3SzncZCMpIgwe61Z0ro4Ruxv",
      "status": "succeeded",
      "latest_charge": "ch_3SzncZCMpIgwe61Z0faf2v3f"
    }
  }
}
```

## Stripe (charge.succeeded)

Event source: Stripe webhook.

Purpose:

* Supplies receipt URL for the order

Minimum fields used:

* `object.payment_intent` → Order Payment Intent ID CF
* `object.receipt_url` → Stripe Order Receipt URL CF
* `object.status` → Stripe Payment Status CF

Example (trimmed):

```json
{
  "object": {
    "id": "ch_3SzncZCMpIgwe61Z0faf2v3f",
    "object": "charge",
    "status": "succeeded",
    "payment_intent": "pi_3SzncZCMpIgwe61Z0ro4Ruxv",
    "receipt_url": "https://pay.stripe.com/receipts/payment/CAcQARoXChVhY2N0XzFSTmdtWENNcElnd2U2MVoo-bi0zAYyBnyGtbiKBjosFlkRUNJF8liaNSNl-GMQaxhh_fccQx5an3FCrTmIN6kgO6QtPRoXRJr3ZR8"
  }
}
```

## Cal.com (BOOKING_CREATED, BOOKING_CANCELLED, BOOKING_RESCHEDULED)

Event source: Cal webhook.

Minimum fields used:

* `triggerEvent`
* `payload.eventTypeId` (must match transcript support event type)
* `payload.uid` (booking UID)
* `payload.bookingId`
* `payload.status`
* `payload.responses.email.value` (or attendee email)

Canonical effects:

* Upsert `support/{supportId}.json`
* Project latest Support Event ID CF

## Transcript Report (Parsed IRS Transcript Data)

Event source: Transcript parse pipeline (mutation endpoint).

The Worker must support four IRS transcript types:

* Account Transcript
* Record of Account Transcript
* Tax Return Transcript
* Wage & Income Transcript

Each transcript type produces a normalized `transcripts/{transcriptId}.json` object and may produce a derived `reports/{reportId}.json` render model.

---

### Account Transcript (Authoritative for Balance + TC Timeline)

This transcript type is the primary source for:

* Account balance
* Transaction code timeline
* IRS posting dates

#### Normalized Transcript Object (`transcripts/{transcriptId}.json`)

Top-level keys (alphabetical):

* `accountId`
* `createdAt`
* `reportId`
* `source`
* `taxPeriodEnding`
* `taxpayerName`
* `transactions[]`
* `transcriptType`

`transcriptType` must equal:

```
"ACCOUNT"
```

`source` keys (alphabetical):

* `filename`
* `pages`
* `sha256`
* `sourceType` (must equal "pdf")

`transactions[]` keys (alphabetical):

* `amount`
* `code`
* `cycle` (optional)
* `date`
* `description`

Example:

```json
{
  "accountId": "acct_123",
  "createdAt": "2026-02-25T12:34:56.000Z",
  "reportId": "rpt_abc123",
  "source": {
    "filename": "irs-account-transcript.pdf",
    "pages": 4,
    "sha256": "abc...",
    "sourceType": "pdf"
  },
  "taxPeriodEnding": "12/31/2024",
  "taxpayerName": "John A Smith",
  "transactions": [
    {
      "amount": "$0.00",
      "code": "150",
      "cycle": "20252405",
      "date": "06/16/2025",
      "description": "Tax return filed"
    }
  ],
  "transcriptType": "ACCOUNT"
}
```

---

#### Derived Report Model (`reports/{reportId}.json`)

The Worker derives a UI-ready model for `assets/report.html`.

Top-level keys (alphabetical):

* `actionRequired`
* `currentBalance`
* `logo`
* `logoWidth`
* `noticesIssued`
* `preparedBy`
* `refundStatus`
* `reportDate`
* `riskLevel`
* `summary`
* `taxPeriodEnding`
* `taxpayerName`
* `transactions[]`

`transactions[]` keys (alphabetical):

* `code`
* `date`
* `description`
* `impact`

Rules:

* `currentBalance` is extracted directly from the transcript when present.
* `transactions[]` is derived from the IRS "TRANSACTIONS" table.
* `impact` is generated deterministically from the TC code.
* `summary`, `riskLevel`, `refundStatus`, and `actionRequired` are rule-based fields derived from normalized data.
* If `transactions[]` is empty, Page 2 (Technical Analysis) does not render.

Canonical effects (Account Transcript only):

* Persist `transcripts/{transcriptId}.json`
* Persist `reports/{reportId}.json`
* Reduce `accounts/{accountId}.transcriptCredits` only after report persistence
* Project Transcript Event ID CF
* Project Transcript Report ID CF

---

### Record of Account Transcript (Composite: Balance + Return Data)

This transcript type combines:

* Account Transcript data (balance + transaction codes)
* Tax Return Transcript data (return metadata + line items)

It is the most complete single-source transcript and may serve as the preferred input when available.

#### Normalized Transcript Object (`transcripts/{transcriptId}.json`)

Top-level keys (alphabetical):

* `accountId`
* `createdAt`
* `reportId`
* `returnData`
* `source`
* `taxPeriodEnding`
* `taxpayerName`
* `transactions[]`
* `transcriptType`

`transcriptType` must equal:

```
"RECORD_OF_ACCOUNT"
```

`returnData` keys (alphabetical):

* `filingStatus`
* `receivedDate`
* `returnProcessedDate`
* `totalTax`

`source` keys (alphabetical):

* `filename`
* `pages`
* `sha256`
* `sourceType` (must equal "pdf")

`transactions[]` keys (alphabetical):

* `amount`
* `code`
* `cycle` (optional)
* `date`
* `description`

Example:

```json
{
  "accountId": "acct_123",
  "createdAt": "2026-02-25T12:34:56.000Z",
  "reportId": "rpt_abc123",
  "returnData": {
    "filingStatus": "Single",
    "receivedDate": "03/15/2024",
    "returnProcessedDate": "06/16/2025",
    "totalTax": "$0.00"
  },
  "source": {
    "filename": "irs-record-of-account.pdf",
    "pages": 6,
    "sha256": "def...",
    "sourceType": "pdf"
  },
  "taxPeriodEnding": "12/31/2024",
  "taxpayerName": "John A Smith",
  "transactions": [
    {
      "amount": "$0.00",
      "code": "150",
      "cycle": "20252405",
      "date": "06/16/2025",
      "description": "Tax return filed"
    }
  ],
  "transcriptType": "RECORD_OF_ACCOUNT"
}
```

---

#### Derived Report Model (`reports/{reportId}.json`)

Uses the same render schema as Account Transcript.

Differences in derivation rules:

* `currentBalance` extracted from Account section.
* `summary` may incorporate `returnData` values.
* `riskLevel` may consider discrepancies between return totals and account balance.
* `transactions[]` derived from the embedded Account Transcript section.

Canonical effects (Record of Account only):

* Persist `transcripts/{transcriptId}.json`
* Persist `reports/{reportId}.json`
* Reduce `accounts/{accountId}.transcriptCredits` only after report persistence
* Project Transcript Event ID CF
* Project Transcript Report ID CF

---

### Tax Return Transcript (Return Metadata Only — No Account Balance)

This transcript type contains return-level data but does not contain a transaction code ledger or authoritative account balance.

It may produce a client-ready report, but Page 2 (Technical Analysis) will only render if synthetic or derived transactions are generated.

#### Normalized Transcript Object (`transcripts/{transcriptId}.json`)

Top-level keys (alphabetical):

* `accountId`
* `createdAt`
* `reportId`
* `returnData`
* `source`
* `taxPeriodEnding`
* `taxpayerName`
* `transcriptType`

`transcriptType` must equal:

```
"TAX_RETURN"
```

`returnData` keys (alphabetical):

* `adjustedGrossIncome`
* `filingStatus`
* `receivedDate`
* `returnProcessedDate`
* `totalPayments`
* `totalTax`

`source` keys (alphabetical):

* `filename`
* `pages`
* `sha256`
* `sourceType` (must equal "pdf")

Example:

```json
{
  "accountId": "acct_123",
  "createdAt": "2026-02-25T12:34:56.000Z",
  "reportId": "rpt_abc123",
  "returnData": {
    "adjustedGrossIncome": "$85,000.00",
    "filingStatus": "Single",
    "receivedDate": "03/15/2024",
    "returnProcessedDate": "06/16/2025",
    "totalPayments": "$10,000.00",
    "totalTax": "$9,500.00"
  },
  "source": {
    "filename": "irs-tax-return-transcript.pdf",
    "pages": 5,
    "sha256": "ghi...",
    "sourceType": "pdf"
  },
  "taxPeriodEnding": "12/31/2024",
  "taxpayerName": "John A Smith",
  "transcriptType": "TAX_RETURN"
}
```

---

#### Derived Report Model (`reports/{reportId}.json`)

Uses the same render schema as Account Transcript with the following derivation rules:

* `currentBalance` must be set to "N/A" unless an Account Transcript or Record of Account Transcript is also present.
* `transactions[]` may be empty.
* If `transactions[]` is empty, Page 2 (Technical Analysis) does not render.
* `summary` is derived from `returnData` (filing status, tax owed vs payments).
* `riskLevel` is based on discrepancies between `totalTax` and `totalPayments`.
* `actionRequired` is "Yes" if `totalTax > totalPayments`.

Canonical effects (Tax Return only):

* Persist `transcripts/{transcriptId}.json`
* Persist `reports/{reportId}.json`
* Reduce `accounts/{accountId}.transcriptCredits` only after report persistence
* Project Transcript Event ID CF
* Project Transcript Report ID CF

---

### Wage & Income Transcript (Third-Party Information Returns — Future Tax Planning)

This transcript type contains third-party IRS information returns (W-2, 1099 series, 1098 series, SSA-1099, broker statements, etc.).

It does not include:

* Account balance
* Transaction code ledger

This dataset can be used in the future to support tax planning, reconciliation, and return completeness checks.

#### Normalized Transcript Object (`transcripts/{transcriptId}.json`)

Top-level keys (alphabetical):

* `accountId`
* `createdAt`
* `incomeDocuments[]`
* `reportId`
* `source`
* `taxPeriodEnding`
* `taxpayerName`
* `transcriptType`

`transcriptType` must equal:

```
"WAGE_INCOME"
```

`source` keys (alphabetical):

* `filename`
* `pages`
* `sha256`
* `sourceType` (must equal "pdf")

`incomeDocuments[]` keys (alphabetical):

* `documentType`
* `ein` (optional)
* `payerName`
* `recipientName`
* `taxYear`
* `values` (object)

Rules:

* `values` should preserve IRS field names where possible.
* Unknown/unsupported fields must be ignored (rejectUnknownValues applies at contract validation).

Example:

```json
{
  "accountId": "acct_123",
  "createdAt": "2026-02-25T12:34:56.000Z",
  "incomeDocuments": [
    {
      "documentType": "W2",
      "ein": "12-3456789",
      "payerName": "ACME Corporation",
      "recipientName": "John A Smith",
      "taxYear": "2024",
      "values": {
        "wages": "$85,000.00",
        "federalIncomeTaxWithheld": "$10,000.00"
      }
    },
    {
      "documentType": "1099-INT",
      "payerName": "Example Bank",
      "recipientName": "John A Smith",
      "taxYear": "2024",
      "values": {
        "interestIncome": "$120.00"
      }
    }
  ],
  "reportId": "rpt_abc123",
  "source": {
    "filename": "irs-wage-income-transcript.pdf",
    "pages": 8,
    "sha256": "jkl...",
    "sourceType": "pdf"
  },
  "taxPeriodEnding": "12/31/2024",
  "taxpayerName": "John A Smith",
  "transcriptType": "WAGE_INCOME"
}
```

---

#### Derived Report Model (`reports/{reportId}.json`)

Uses the same render schema as Account Transcript with the following derivation rules:

* `currentBalance` must be set to "N/A" unless an Account Transcript or Record of Account Transcript is also present.
* `transactions[]` must be empty.
* If `transactions[]` is empty, Page 2 (Technical Analysis) does not render.
* `summary` is derived from totals across `incomeDocuments[]`.
* `riskLevel` may be derived from mismatch checks (future).
* `actionRequired` is "N/A" unless additional transcript types are present.

Canonical effects (Wage & Income only):

* Persist `transcripts/{transcriptId}.json`
* Persist `reports/{reportId}.json`
* Reduce `accounts/{accountId}.transcriptCredits` only after report persistence
* Project Transcript Event ID CF
* Project Transcript Report ID CF

---

# Operational Checklist

* All forms POST absolute Worker URLs
* Every event includes `eventId`
* Receipt written before state change
* Canonical upsert before ClickUp update
* Emails sent only after canonical update
* Lifecycle booleans strictly enforced
* Login writes receipt
* Read models never mutate state

---

# Repository Structure (Exact Tree)

This structure is authoritative and must not be modified without updating this file.

```
.
├─ _redirects
├─ build.mjs
├─ index.html
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ README.md
├─ tailwind.config.js
├─ assets/
│  ├─ confirmation.html
│  ├─ favicon.ico
│  ├─ logo.svg
│  ├─ product.html
│  ├─ report-preview.html
│  └─ report.html
├─ legal/
│  ├─ privacy.html
│  └─ terms.html
├─ magnets/
│  ├─ guide.html
│  └─ lead-magnet.html
├─ partials/
│  ├─ footer.html
│  └─ header.html
├─ scripts/
│  └─ report-renderer.js
├─ styles/
│  └─ site.css
└─ _sdk/
   └─ element_sdk.js
```

To complete Stripe credit granting (canonical + idempotent), this repo depends on Worker code that lives in **another repo**:

* `taxmonitor.pro-site/workers/api/wrangler.toml`
* `taxmonitor.pro-site/workers/api/src/index.js`

This repo still needs (deployment/config):

* R2 binding configuration (bucket + env vars)
* Stripe webhook secret as a Worker secret

---

# Security & Legal Controls

* Deny-by-default endpoints
* Webhook signature validation (Stripe + Cal)
* No secrets in client payloads
* No raw SSN logging
* PII masked in UI
* R2 is authority
* ClickUp is projection only

---

# Final Authority

R2 is authority.
Worker enforces contracts.
ClickUp is projection.
Worker code governs mutation ingress only.
Read models are documented in README.

Architecture is locked.
