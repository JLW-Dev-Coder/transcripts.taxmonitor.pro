# Transcript Tax Monitor Pro — Claude Context

## Stack
- Next.js 14 (App Router) + TypeScript
- Static generation only (`generateStaticParams`)
- Content: JSON files under `/content/resources/`
- Hosting: Vercel (later Cloudflare Pages)
- Repo: transcript.taxmonitor.pro

## Repo Structure (confirmed before every task)

```
/app
  /resources/[slug]/page.tsx
  /pricing/page.tsx
  /demo/page.tsx
  /login/page.tsx
  /sitemap.xml/route.ts

/components
  ResourceLayout.tsx
  CTA.tsx
  Sidebar.tsx
  /templates
    IRSCodeTemplate.tsx
    ExplainerTemplate.tsx
    ComparisonTemplate.tsx
    HowToTemplate.tsx
    SalesTemplate.tsx

/content
  /resources
    irs-code-150.json
    irs-code-570.json
    how-to-read-transcript.json
    canopy-vs-ttmp.json

/lib
  getResource.ts
  getAllResources.ts
  templateRouter.ts

/public
  /images
  /logos
```

## Content JSON Schema

```json
{
  "slug": "irs-code-150-meaning",
  "title": "IRS Code 150 Meaning",
  "template": "irs-code",
  "category": "transaction-code",
  "cta": "transcript-analysis",
  "description": "IRS code 150 explained...",
  "content": "<p>HTML content here</p>",
  "related": ["irs-code-570-meaning", "how-to-read-irs-transcripts"]
}
```

## Template Types — EXACTLY 5, never add more

| `template` value | Component |
|---|---|
| `irs-code` | IRSCodeTemplate |
| `explainer` | ExplainerTemplate |
| `comparison` | ComparisonTemplate |
| `how-to` | HowToTemplate |
| `sales` | SalesTemplate |

## Page Route

All resources render at `/resources/[slug]`. Flow:
1. `generateStaticParams()` reads all JSON from `/content/resources/`
2. `getResource(slug)` loads matching JSON
3. `templateRouter` selects component
4. Template renders with `dangerouslySetInnerHTML` — do not convert to markdown
5. `CTA` injected after intro, after content, and in sidebar
6. SEO metadata generated from JSON fields

## CTA Rules

Every page must include CTA. Never omit. Positions: after intro, after content, sidebar.

- `transcript-analysis` → "Transcript Analysis Tool"
- `free-trial` → "Start Free Trial"
- `demo` → "Book Demo"
- `buy` → "Buy Now"

## SEO — Every Page Must Have

- `<title>` from `title`
- `<meta name="description">` from `description`
- Canonical URL: `https://transcript.taxmonitor.pro/resources/[slug]`
- Open Graph tags
- JSON-LD Article structured data

## Internal Linking

Each page links programmatically to items in `related[]`, `/pricing`, and `/demo`.
No hardcoded links.

## Static Build Requirements

- `generateStaticParams()` required in `[slug]/page.tsx`
- No `fetch()` at runtime
- No `"use client"` on resource pages
- No API routes for content
- No CMS, no database

## HTML Migration Rules

When converting `/resources/*.html` → `/content/resources/*.json`:
1. Extract `<title>` → `title`
2. Extract body HTML → `content` verbatim
3. Determine `template` from content type
4. Preserve slug exactly
5. Write JSON file

Never rewrite, summarize, or shorten content.

## Self-Check Before Every Change

1. ✅ Only 5 template types exist
2. ✅ Slug unchanged
3. ✅ Content not rewritten
4. ✅ Page uses `generateStaticParams`
5. ✅ CTA present

If any fail → stop and report.

## Hard Constraints — Never Do

- ❌ Create a 6th template type
- ❌ Add a database or CMS
- ❌ Create API routes for content
- ❌ Convert HTML content to markdown
- ❌ Rewrite or summarize SEO content
- ❌ Change slugs
- ❌ Add `"use client"` to resource pages

## Success Criteria

- [ ] All JSON files in `/content/resources/` load and render
- [ ] `generateStaticParams` covers all slugs
- [ ] Every page has CTA (3 positions)
- [ ] Sitemap auto-generates from content files
- [ ] Internal links generated from `related[]` field
- [ ] Build completes with zero runtime fetches
