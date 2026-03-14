# Transcript Tax Monitor

## Table of Contents

* [Overview](#1-overview)
* [Key Features](#2-key-features)
* [Architecture Overview](#3-architecture-overview)
* [Ecosystem Overview](#4-ecosystem-overview)
* [Repository Structure](#5-repository-structure)
* [Environment Setup](#6-environment-setup)
* [Deployment](#7-deployment)
* [Contracts or Data Model](#8-contracts-or-data-model)
* [Development Standards](#9-development-standards)
* [Integrations](#10-integrations)
* [Security and Secrets](#11-security-and-secrets)
* [Contribution Guidelines](#12-contribution-guidelines)
* [License](#13-license)

---

# Transcript Tax Monitor

Transcript Tax Monitor (TTM) is the **transcript diagnostics and analysis platform** within the Tax Monitor ecosystem.

It provides automated tools that analyze IRS transcript data to identify potential compliance issues, historical activity patterns, and tax resolution signals.

The platform is designed for:

* taxpayers reviewing their IRS activity
* tax professionals diagnosing client transcript data
* professionals providing proactive monitoring services

TTM operates as a **diagnostic engine**, not a tax preparation system.

The system is built using a **contract-driven architecture running on Cloudflare Workers**, with **R2 storage as the canonical data layer**.

---

# 1. Overview

Transcript Tax Monitor enables automated analysis of IRS transcript information.

The platform allows users to:

* upload or submit transcript data
* run automated diagnostic analysis
* retrieve structured analysis results
* detect common compliance issues
* identify potential resolution paths

Rather than replacing professional tax advice, the platform provides **structured diagnostic insight** that helps professionals and taxpayers better understand IRS account activity.

The system focuses on **analysis, monitoring signals, and structured interpretation of transcript data**.

---

# 2. Key Features

Major capabilities include:

* automated transcript analysis
* contract-driven API validation
* transcript diagnostic reports
* token-based transcript processing
* job-based processing pipeline
* R2 canonical storage for analysis results
* integration with professional infrastructure through Virtual Launch Pro
* integration with Tax Monitor professional discovery

The system allows transcript analysis to operate **independently while integrating with the broader ecosystem**.

---

# 3. Architecture Overview

Transcript Tax Monitor uses a **worker-based architecture** where all API logic runs on Cloudflare Workers.

Core architecture principles include:

* canonical storage in R2
* contract-driven request validation
* stateless worker execution
* deny-by-default API routing
* job-based processing for transcript analysis

Primary system components include:

* Cloudflare Workers for API execution
* R2 for canonical storage
* D1 database for query indexes
* static web interfaces for tool access
* token verification via Virtual Launch Pro APIs

All analysis requests follow a **validated processing pipeline** before results are generated.

---

# 4. Ecosystem Overview

Transcript Tax Monitor is part of the **four-platform tax infrastructure ecosystem**.

Each platform performs a specific role.

| Platform               | Role                                           |
| ---------------------- | ---------------------------------------------- |
| Tax Monitor Pro        | professional discovery and monitoring services |
| Tax Tools Arcade       | taxpayer education and discovery tools         |
| Transcript Tax Monitor | transcript diagnostics                         |
| Virtual Launch Pro     | professional infrastructure platform           |

The ecosystem functions as a discovery and service pipeline.

```
Tax Tools Arcade
→ Transcript Tax Monitor
→ Tax Monitor Pro
→ Virtual Launch Pro
```

This flow allows taxpayers to:

1. learn about tax issues
2. analyze transcript data
3. discover professionals
4. connect with infrastructure supporting those professionals

---

# 5. Repository Structure

Typical repository structure:

```
/app
/assets
/contracts
/pages
/partials
/site
/workers
```

Directory descriptions:

| Directory    | Purpose                              |
| ------------ | ------------------------------------ |
| `/app`       | authenticated application interfaces |
| `/assets`    | shared design assets and scripts     |
| `/contracts` | JSON API contracts                   |
| `/pages`     | workflow and tool execution pages    |
| `/partials`  | reusable UI components               |
| `/site`      | public marketing pages               |
| `/workers`   | Cloudflare Worker APIs               |

This structure separates **UI layers, contracts, and API logic**.

---

# 6. Environment Setup

Required software:

* Git
* Node.js
* Wrangler CLI

Setup process:

1. clone the repository
2. install dependencies
3. configure environment variables
4. run the worker locally

Example local development command:

```
wrangler dev
```

This launches the Worker environment for testing API routes locally.

---

# 7. Deployment

Deployment is handled using **Cloudflare Workers**.

Deployment command:

```
wrangler deploy
```

Configuration is defined in:

```
wrangler.toml
```

Typical configuration includes:

* compatibility date
* R2 bucket bindings
* D1 database bindings
* environment variables

Workers deploy globally through Cloudflare's edge network.

---

# 8. Contracts or Data Model

Transcript Tax Monitor uses **contract-driven APIs**.

Contracts define the relationship between:

* UI pages
* API routes
* R2 storage objects
* D1 query indexes

Typical request pipeline:

1 request received
2 request validated against contract
3 analysis job created
4 canonical job record written to R2
5 transcript processed
6 result stored in R2
7 result returned to client

---

## Canonical Storage

Example R2 storage structure:

```
/r2/transcript_jobs/{job_id}.json
/r2/transcript_results/{result_id}.json
```

Example job record:

```
{
  "job_id": "job_87231",
  "account_id": "acct_43822",
  "status": "processing",
  "created_at": "2026-03-12T18:10:00Z"
}
```

Example result record:

```
{
  "result_id": "result_87231",
  "job_id": "job_87231",
  "analysis_summary": "...",
  "flags": [
    "unfiled_year",
    "collection_activity"
  ]
}
```

R2 records act as the **authoritative source of transcript analysis results**.

---

# 9. Development Standards

Development standards ensure consistency across all ecosystem services.

Standards include:

* alphabetical API route documentation
* contract-first API design
* canonical Worker comment headers
* deny-by-default routing
* R2 as authoritative storage layer

Workers should follow the **canonical Worker header format** used across repositories. 

This standard ensures developers can quickly understand:

* available routes
* storage rules
* integration constraints

---

# 10. Integrations

Transcript Tax Monitor integrates with several ecosystem services.

Primary integrations:

* Cloudflare Workers infrastructure
* Cloudflare R2 storage
* Cloudflare D1 database
* Virtual Launch Pro token verification APIs
* Tax Monitor Pro discovery platform

Token verification is required before transcript analysis can run.

Example verification request:

```
GET /vlp/v1/tokens/{account_id}/transcripts
```

---

# 11. Security and Secrets

Secrets must never be committed to the repository.

Sensitive values are stored using **Wrangler secret management**.

Typical secrets include:

* API tokens
* OAuth secrets
* webhook signing secrets
* service credentials

Example secret command:

```
wrangler secret put API_KEY
```

Secrets are injected at runtime through the Worker environment.

---

# 12. Contribution Guidelines

Recommended workflow:

1 create a branch
2 implement changes
3 test locally
4 open a pull request

All contributions should:

* follow contract-driven architecture
* avoid breaking API contracts
* preserve canonical storage rules

Changes affecting Worker routes should update documentation accordingly.

---

# 13. License

This repository is proprietary software owned and maintained by Virtual Launch Pro.

Unauthorized redistribution or modification is not permitted.
