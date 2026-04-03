# MARKET.md (Transcript.Tax Monitor Pro — Parser-Only)

## Build Status

- **Scaffold complete:** no
- **Existing required files:** 0
- **Missing required files:** 16
- **Missing:**
  - app/resources/[slug]/page.tsx
  - app/pricing/page.tsx
  - app/demo/page.tsx
  - app/login/page.tsx
  - app/sitemap.xml/route.ts
  - components/ResourceLayout.tsx
  - components/CTA.tsx
  - components/Sidebar.tsx
  - components/templates/IRSCodeTemplate.tsx
  - components/templates/ExplainerTemplate.tsx
  - components/templates/ComparisonTemplate.tsx
  - components/templates/HowToTemplate.tsx
  - components/templates/SalesTemplate.tsx
  - lib/getResource.ts
  - lib/getAllResources.ts
  - lib/templateRouter.ts
- **Content files found:** none yet (517 HTML files in /resources/ await migration to /content/resources/*.json)
- **Last updated by Claude:** 2026-03-27

## 1) What this product is
**Transcript.Tax Monitor Pro** is a **local IRS transcript parsing and reporting automation tool** built for tax professionals. It:
- ingests IRS transcript files (PDF).
- extracts IRS transaction codes and structured data.
- interprets codes into plain-English summaries.
- generates *client-ready branded reports*.  
All processing runs locally in the browser; **no PDFs are uploaded to a server**. :contentReference[oaicite:1]{index=1}

**Core promise:** turn intimidating IRS transcript PDFs into **usable, shareable, client reports in seconds** with no manual code translation. :contentReference[oaicite:2]{index=2}

---

## 2) Target audience (ICP)
### Primary (alphabetical)
- **CPA firms (small & mid)** — Frequent transcript review work, need consistency.
- **Enrolled Agents & tax resolution specialists** — Heavy reliance on transcript interpretation.
- **Tax attorneys** — Need accurate, plain-language reports for client files.

### Secondary (alphabetical)
- **Administrative staff & firms’ support personnel** — Simplify internal workflows.
- **Developers & automation integrators** — Want structured insertable transcript data.

Revenue motion: one-time credits purchase for parsing, not subscription. :contentReference[oaicite:3]{index=3}

---

## 3) Core problems solved
### Pain points (alphabetical)
- **Billable time wasted** interpreting transcript codes manually.
- **Client confusion** over cryptic IRS transaction codes.
- **Inconsistent interpretation** across staff.
- **No native structured output** for other practice tools.

### Value delivered (alphabetical)
- **Branded client reports** that reduce back-and-forth explanations.
- **Data extraction for practice workflows** (CSV/JSON usable).
- **Consistent interpretation** using IRS code rules.
- **Local processing** — client data stays on the user’s device. :contentReference[oaicite:4]{index=4}

---

## 4) Market context & trends
### Transcript pain is real
IRS transcripts are notorious for cryptic transaction codes that tax pros routinely consult forums to decode — which demonstrates real user frustration: “What does 150/806 mean?” is a common question online. :contentReference[oaicite:5]{index=5}

### Fragmented tooling for transcripts
- Some practice suites pull transcripts for you (e.g., built-into tax return software). :contentReference[oaicite:6]{index=6}  
- Some services combine retrieval + monitoring + summaries. :contentReference[oaicite:7]{index=7}  
- Few focus *exclusively on parsing + interpretation* with local privacy.

This creates a niche for tools that handle **just the transcript interpretation step** without pulling or storing any data externally. :contentReference[oaicite:8]{index=8}

---

## 5) Competitive landscape
### Closest alternatives (alphabetical)
- **Cloud or suite tools with transcript features** — Include IRS transcript retrieval and summaries (e.g., Intuit ProConnect, Canopy). :contentReference[oaicite:9]{index=9}
- **Transcript automation platforms** — APIs or web services that fetch transcripts and sometimes summarize (e.g., PitBullTax). :contentReference[oaicite:10]{index=10}
- **Consumer/AI analysis tools** — Lower-tier “upload and explain” offerings, usually not pro-grade.

**Differentiator:** This product runs local browser parsing with **no server upload** and focuses solely on *accurate extraction & report output* for tax pros. :contentReference[oaicite:11]{index=11}

---

## 6) Differentiators that matter
### Core (alphabetical)
- **Branded outputs** — Add firm logo/colors into client reports. :contentReference[oaicite:12]{index=12}
- **Local privacy/security** — Runs entirely on the user’s machine. :contentReference[oaicite:13]{index=13}
- **Fast performance** — Seconds to parse typical IRS transcript PDFs. :contentReference[oaicite:14]{index=14}
- **Structured extraction** — Enables CSV/JSON output for downstream use. :contentReference[oaicite:15]{index=15}

Other tools often lock data behind server storage or bundle parsing into larger (and more expensive) suites.

---

## 7) Pricing model signals
### What the site suggests
- **One-off credits** unlock parsing workflows. :contentReference[oaicite:16]{index=16}

This model aligns with buyers who want **pay-per-use parsing** rather than subscription, which removes friction for low-volume practices.

Broad pricing models to consider (alphabetical):
- **Credit-based per parse**
- **Per-report one-time purchase**
- **Volume bundles for frequent users**

---

## 8) Go-to-market (aligned with buyer behavior)
### Channels (alphabetical)
- **Demo walkthrough pages** — Show raw PDF → parsed output in real time.
- **SEO content** — Transcript code guides, sample interpretations, help pages.
- **Referral partnerships** — Connect with practice software and tax community influencers.
- **Tax blogs / communities** — Use real Q&A from forums to educate and attract professionals.

### Messaging (alphabetical)
- **“Readable IRS reports in minutes.”**
- **“Stop rewriting the same codes.”**
- **“Built for tax pros who interpret transcripts.”**
- **“Local parsing, no data upload.”**

---

## 9) Risks & challenges
### Structural (alphabetical)
- **IRS variation:** Transcript formats change by year/type. Tools must stay updated. :contentReference[oaicite:17]{index=17}
- **Expectation creep:** Users may expect retrieval or monitoring features and ask for stuff you don’t provide.
- **File quality issues:** Scanned or low-quality transcripts may fail to parse.

### Competitive (alphabetical)
- Suite tools with integrated transcript access can bundle reports at no extra cost.
- Enterprise offerings could undercut simple parser pricing if they bundle more value.

---

## 10) Suggested content assets (alphabetical)
- **Before/after transcript samples** — shows raw vs. parsed.
- **IRS code glossary** — standalone SEO asset for traffic.
- **Tutorial videos** — walk through parsing workflow.
- **Security & privacy page** — emphasizes local parsing advantage.

---

## 11) Cited sources
- Public Transcript.Tax Monitor Pro homepage features and claims. :contentReference[oaicite:18]{index=18}  
- Competitive transcript tools like PitBullTax and built-into practice suites (Intuit). :contentReference[oaicite:19]{index=19}  
- Community discussion showing real transcript confusion (Reddit). :contentReference[oaicite:20]{index=20}
