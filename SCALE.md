# SCALE.md — VLP Client Acquisition System

Last updated: 2026-04-13

---

## Objective

Send first outreach emails today. Convert first TTMP token sale this week. Use the next 3 months to grow the pipeline, enrich assets, and collect social proof.

- **Analytics** — track every touchpoint from email send to Stripe payment
- **Magnets** — free IRS code lookup tool + personalized asset pages
- **Outreach** — email first, social second, proof compounds over time
- **Tech** — $100/mo (Claude Max $100)
- **Workflow** — Clay sources and validates, operator uploads, Worker generates + sends via Gmail, you close

---

## Platform Focus: TTMP

**Domain:** transcript.taxmonitor.pro
**Product:** IRS transcript parsing → plain-English analysis reports
**Pricing:** Token-based — 10 tokens for $19, 25 for $29, 100 for $129
**Target:** 750,000+ U.S. tax professionals (CPAs, EAs, tax attorneys)

**Why TTMP leads:**

- CPAs and EAs translate IRS transcript codes manually, every day — a recurring 20-minute task per client.
- This audience already pays for software (Drake, UltraTax, e-Services). They buy tools.
- The entry ask is zero-friction: "Here's a free code lookup tool." No credit card, no onboarding.
- The conversion path is short: free tool → see value → 10 tokens for $19 is trivial for someone billing $150–400/hr.
- The audience is searchable: NAEA public directory, state CPA society lists, LinkedIn title filters.

---

## Tech Stack

| Tool | Plan | Cost | Purpose |
|---|---|---|---|
| Claude | Max | $100/mo | Batch asset generation from CSV/JSON uploads — asset page data + email copy per prospect. Also platform dev/design. |
| Gmail + VLP Worker | — | $0 | Email delivery via VLP Worker cron (reads R2 queue, sends via Gmail API). |
| Cal.com | Free | $0 | Booking links for discovery and demo calls. |
| Google Meet | Free | $0 | Video calls for booked prospects. |
| LinkedIn | Free | $0 | Manual outreach — comments, DMs, prospecting. |
| Facebook | Free | $0 | Group engagement — pain point posts, DM conversations. |
| Stripe | Free | $0 | Payment processing for TTMP token purchases. Already integrated. |

| Clay.com | Free tier | $0 | Primary prospect source — pre-validated emails, 1,000+ daily |
| Reoon | $9/mo (cancel after 5/11/2026) | $9/mo | Optional second-pass validation — non-blocking |

**Not used:** ChatGPT (consolidated into Claude), Zoom (Google Meet covers it).

**Total: ~$109/mo**

---

## Pipeline

| Step | Owner | Action | Output |
|---|---|---|---|
| 1. Source | Operator | Download Clay CSV export | Pre-validated prospect CSV |
| 2. Upload | Operator | Upload via VLP dashboard Upload tab | CSV stored in R2 |
| 3. Process | VLP Worker (12:00 UTC) | Parse CSV, generate emails + asset pages from templates | R2 send queue + asset pages |
| 4. Send | VLP Worker (14:00 UTC) | Deliver Email 1 via Gmail API | Tracked sends |
| 5. Track | VLP Worker | Log asset page views, CTA clicks | D1 analytics |
| 6. Follow up | VLP Worker (12:00 UTC + 3 days) | Auto-promote Email 2 to send queue | Tracked sends |
| 7. Close | Operator | Take booked calls, demo TTMP, close | Stripe payment |

---

## Daily Workflow

### Prerequisites (all in place)

1. **Gmail sender configured** — VLP Worker has Gmail API credentials, domain verified
2. **Clay.com account** — free tier, exports pre-validated prospect CSVs
3. **VLP dashboard upload** — `virtuallaunch.pro/scale/workflow` Upload tab
4. **Asset pages live** — Worker serves `/asset/{slug}` from R2
5. **Free IRS code lookup tool** — public page on TTMP
6. **Cal.com booking link** — "TTMP Discovery Call" event created

### Daily sequence

1. Operator downloads Clay CSV export (pre-validated emails)
2. Operator uploads via VLP dashboard Upload tab
3. 12:00 UTC — Worker campaign processor generates emails + asset pages
4. 14:00 UTC — Worker sends Email 1 via Gmail API
5. 3 days later — Worker auto-sends Email 2

---

## Engines

### Engine 1 — Email (starts today)

**Email 1 — Offer value**
- Personalized subject line referencing their credential and city
- Body: pain point → free tool offer → CTA
- CTA: "See your practice analysis" → `/asset/{slug}` (or TTMP site if asset pages aren't live yet)
- Worker logs CTA click

**Asset Page — Personalized asset (Worker-served)**
- URL: `transcript.taxmonitor.pro/asset/{slug}`
- Content: workflow gaps, time savings estimate, revenue opportunity, embedded tool preview
- CTA 1: "Add this to my practice" → pricing page
- CTA 2: "Let's talk about your caseload" → Cal.com booking
- CTA 3: "Learn more" → TTMP marketing page
- Worker logs all CTA clicks per slug

**Email 2 — Follow-up (VLP Worker cron, 3–5 day delay)**
- References asset page
- Adds urgency or new angle
- CTA 1: asset page link
- CTA 2: Cal.com booking link

### Engine 2 — Social (starts this week, parallel to email)

1. **Comment** — like or reply to pain point posts (IRS frustrations, transcript questions, tax season burnout)
2. **DM 1** — if they respond: discover pain points
3. **DM 2** — if they respond: qualify tool match
4. **DM 3** — if qualified: request email → add to next CSV batch → enters email flow

### Engine 3 — Bookings (you close)

1. **Discovery call** — discover pain, qualify tool match, schedule demo if qualified
2. **Demo call** — live TTMP transcript analysis, walk through first token purchase

---

## Magnets

### Free Tool — IRS Code Lookup

Public page on TTMP, no login required. Enter a transaction code, get a plain-English explanation. Referenced in email signatures, social bios, DM conversations, and asset pages.

### Personalized Asset Page

Hosted at `transcript.taxmonitor.pro/asset/{slug}`. Generated by Claude from CSV input:

| Input | Used for |
|---|---|
| name | Page headline, email personalization |
| credential (CPA/EA) | Tailor workflow gaps and estimates to credential type |
| city, state | Local practice context, client volume estimates |
| email | Gmail delivery target |
| website (optional) | Reference their existing online presence |

Asset page shows: practice workflow gaps, estimated weekly/annual time savings, revenue opportunity (time saved x billing rate range), interactive tool preview, and 3 CTAs (pricing, booking, learn more).

---

## Batch Generation (VLP Worker)

**Claude is no longer in the email generation loop.** The VLP Worker campaign processor handles all batch generation from Clay CSV uploads using templates. The Worker applies the same personalization rules (credential-based time savings, firm_bucket subject lines, slug generation) that were previously documented in SKILL.md.

### Processing Rules (applied by Worker templates)

- Slug: `{first}-{last}-{city}-{state}` lowercase, hyphens only
- Time savings: CPA ~15 transcript reviews/week x 20 min = 5 hrs/week. EA ~20/week x 20 min = 6.7 hrs/week.
- Revenue opportunity: time saved x billing rate range ($150–400/hr CPA, $100–300/hr EA)
- Tone: direct, professional, no emoji, problem-first (per MARKET.md)
- All URLs use existing TTMP routes only

---

## Analytics

**Email (Gmail via VLP Worker):** sends, opens, CTA clicks, bounces, unsubscribes, complaints, inbound replies

**Engagement (Worker):** asset page views per slug, CTA clicks per slug (which CTA), landing page views

**Bookings (Cal.com):** bookings created, cancellations, reschedules, attended calls

**Sales (Stripe):** payment succeeded, token pack tier, revenue per prospect (slug → account → purchase)

**Proof (Worker):** review form submissions, testimonial form submissions (text + optional video)

---

## 3-Month Growth Window

First emails go out today. Everything below is about compounding results.

### Weeks 1–4: Establish the loop

- Send to initial 20–30 prospects, iterate on copy from real open/click data
- Build and deploy asset page Worker route + R2 storage if not ready day 1
- First booked calls and conversions
- Begin FB/LinkedIn engagement
- Scrape next 50–100 prospects from public directories

### Weeks 5–8: Scale and prove

- Send to 100+ new prospects per batch
- Document first 1–2 case studies from converted customers
- Build review/testimonial collection form
- A/B test Email 2 delay timing (3 vs 5 vs 7 days)
- Refine asset page content based on CTA click patterns

### Weeks 9–12: Compound

- Publish case studies on TTMP, reference in email copy
- Scale to 200+ prospects per batch
- Request testimonials from satisfied customers
- Test affiliate referral with converted customers
- Target: monthly revenue exceeds $118 stack cost (breakeven = 7 token packs at $19)

---

## Tone and Voice (from MARKET.md)

- **Direct** — no fluff, state the benefit immediately
- **Professional but accessible** — written for tax professionals, assume intelligence
- **Specific** — real numbers (token counts, prices, timeframes), vague claims undermine trust
- **Problem-first** — lead with the pain point, follow with the solution
- **No emoji in body copy** — professional audience

---

## Platforms

| Code | Domain | Description |
|---|---|---|
| VLP | virtuallaunch.pro | Core hub — auth, billing, tokens, affiliates |
| TMP | taxmonitor.pro | Tax professional directory + taxpayer memberships |
| TTMP | transcript.taxmonitor.pro | IRS transcript parsing + plain-English reports |
| TTTMP | taxtools.taxmonitor.pro | Tax education games + IRS form tools |
| DVLP | developers.virtuallaunch.pro | Freelancer/client matching marketplace |
| GVLP | games.virtuallaunch.pro | Gamified subscription platform |
| TCVLP | taxclaim.virtuallaunch.pro | Auto Form 843 generator + tax claim management |
| WLVLP | websitelotto.virtuallaunch.pro | Canva-site marketplace with voting/bidding/buy-now |

---

## Affiliate Program (after first conversions)

- 20% flat commission on all purchases, every platform, for life
- Lifetime attribution — every purchase a referred account ever makes
- Payout via Stripe Connect Express
- Every VLP account gets a unique referral code at signup
- Ask converted customers to refer colleagues via post-purchase email