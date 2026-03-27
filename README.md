# Transcript Tax Monitor Pro

**Repo:** transcript.taxmonitor.pro
**URL:** https://transcript.taxmonitor.pro
**Stack:** Next.js 14 (App Router) · TypeScript · Static Generation · Vercel

## What This Is

SEO acquisition engine built on 400+ statically generated resource pages.
Each page is driven by a JSON content file and rendered through one of 5 shared templates.

## Quick Start

```bash
npm install
npm run dev
```

## Content

All pages live under `/content/resources/*.json`.
Add a new JSON file → new page is automatically included in the static build and sitemap.

## Templates (exactly 5)

| Value | Component | Use |
|---|---|---|
| `irs-code` | IRSCodeTemplate | IRS transaction code pages |
| `explainer` | ExplainerTemplate | Concept explainers |
| `comparison` | ComparisonTemplate | Product comparisons |
| `how-to` | HowToTemplate | Step-by-step guides |
| `sales` | SalesTemplate | Conversion pages |

## Architecture

- `/app/resources/[slug]/page.tsx` — static route, all 400 pages
- `/lib/templateRouter.ts` — routes template string to component
- `/components/CTA.tsx` — CTA injected on every page (3 positions)
- `/app/sitemap.xml/route.ts` — auto-generated from content files

## Rules

- Static generation only — no runtime fetch, no CMS, no database
- Never add a 6th template
- Never rewrite content JSON
- CTA must appear on every page
- Canonical base: `https://transcript.taxmonitor.pro`

## Claude

Context and constraints: `.claude/CLAUDE.md`
File registry: `.claude/registry.json`
Session settings: `.claude/settings.local.json`
