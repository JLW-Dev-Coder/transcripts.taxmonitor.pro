# Transcript Tax Monitor Pro — Claude Context

## Role
Frontend only. No backend logic. All API calls go to https://api.virtuallaunch.pro

## Stack
- Next.js 15 (App Router) + TypeScript
- CSS Modules only — no Tailwind, no inline styles
- Font: Raleway via next/font/google (variable: --font-raleway)
- Hosting: Cloudflare Pages via OpenNext
- Build output: .open-next/assets

## Build Commands
```bash
npm run dev          # Local dev
npm run build        # Next.js build
npm run cf:build     # OpenNext Cloudflare build
npm run deploy       # Deploy to Cloudflare Pages
npm run preview      # Preview deployment
```

## Deploy Config
- wrangler.toml: pages_build_output_dir = ".open-next/assets"
- open-next.config.ts: defineCloudflareConfig({})
- pages:build script: opennextjs-cloudflare build (no manual cp commands)

## VLP API
Base URL: https://api.virtuallaunch.pro
Auth: vlp_session HttpOnly cookie (credentials: 'include' on all fetch calls)

## Key Route Mappings
/v1/auth/magic-link/request
/v1/auth/magic-link/verify
/v1/auth/session
/v1/auth/logout
/v1/transcripts/preview
/v1/transcripts/reports
/v1/transcripts/report
/v1/transcripts/report-email
/v1/transcripts/report-link
/v1/transcripts/report-data
/v1/checkout/sessions
/v1/checkout/status
/v1/tokens/balance/{account_id}
/v1/tokens/consume
/v1/pricing/transcripts
/v1/support/tickets

## File Structure
```
app/
  page.tsx                        → / (homepage with parser)
  layout.tsx                      → root layout (SiteHeader + SiteFooter)
  globals.css                     → CSS variables + base styles
  ParserSection.tsx               → PDF upload → VLP API → report
  PricingSection.tsx              → Pricing cards
  page.module.css                 → Homepage styles
  about/page.tsx
  contact/page.tsx
  demo/page.tsx
  login/page.tsx
  pricing/page.tsx
  product/page.tsx
  resources/page.tsx
  resources/[slug]/page.tsx       → Dynamic resource pages
  app/dashboard/page.tsx
  app/affiliate/page.tsx
  legal/privacy/page.tsx
  legal/refund/page.tsx
  legal/terms/page.tsx
  magnets/lead-magnet/page.tsx
  magnets/section-7216/page.tsx
  magnets/guide/page.tsx

components/
  SiteHeader.tsx                  → Sticky nav, mobile drawer
  SiteFooter.tsx + module.css     → Dark footer, 4 columns
  SupportModal.tsx                → Cal.com popup embed
  LegalPage.tsx                   → Privacy/Terms/Refunds renderer
  CTA.tsx + module.css
  ResourceLayout.tsx + module.css
  Sidebar.tsx + module.css
  templates/
    IRSCodeTemplate.tsx
    ExplainerTemplate.tsx
    ComparisonTemplate.tsx
    HowToTemplate.tsx
    SalesTemplate.tsx

content/resources/                → JSON files for resource pages
public/
  favicon.svg                     → TT mark, teal #14b8a6
  design-tokens.css               → CSS variable reference
```

## CSS Variables (set in globals.css)
```css
--accent:        #14b8a6
--accent-light:  #f0fdfa
--accent-dark:   #0f766e
--accent-hover:  #0f766e
--accent-text:   #0d6e66
--accent-border: #99f6e4
--bg:            #0a0f1e      (dark default)
--surface:       #111827
--surface-border:#1f2937
--text:          #f9fafb
--text-muted:    #9ca3af
--radius:        10px
--max-width:     1280px
--header-height: 68px
--font-raleway:  set via next/font/google
```

## Platform Identity
- Name: Transcript Tax Monitor
- Short: TTMP
- Logo mark: TT
- Accent: #14b8a6 (teal)
- Cal.com support: tax-monitor-pro/tax-monitor-transcript-support (10m)
- Legal entity: Lenore, Inc
- Legal email: legal@taxmonitor.pro

## Resource Pages
- Content lives in /content/resources/*.json
- 5 template types only: irs-code, explainer, comparison, how-to, sales
- generateStaticParams() required — no runtime fetches
- No "use client" on resource pages
- CTA injected after intro, after content, in sidebar

## Hard Rules
- Never create a Worker in this repo
- Never add backend logic
- All fetch() calls → https://api.virtuallaunch.pro with credentials: 'include'
- CSS Modules only — no Tailwind
- No .html files in /app
- No 6th template type
- No markdown conversion of HTML content
- No CMS or database
