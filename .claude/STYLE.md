# TTMP Style Guide — Claude Reference

## Stack
- CSS Modules per component (ComponentName.module.css)
- Global tokens in app/globals.css — always use var() references, never hardcode colors
- No Tailwind, no inline styles, no styled-components

## Design Tokens (from globals.css)
- --accent: #7C3AED (violet)
- --accent-hover: #6D28D9
- --bg: #0F0F1A
- --surface: #1A1A2E
- --surface-border: #2D2D44
- --text: #F1F1F5
- --text-muted: #9494B0
- --header-height: 60px
- --sidebar-width: 260px
- --max-content: 860px
- --radius: 8px

## Layout Patterns
- Max content width: 1200px, centered, padding: 0 1.5rem
- Section padding: 4rem 1.5rem (desktop), 2.5rem 1.5rem (mobile)
- Cards: background var(--surface), border 1px solid var(--surface-border),
  border-radius var(--radius), hover: border-color var(--accent) + translateY(-2px)
- Mobile breakpoint: 640px (simple), 768px (layout shifts)

## Button Patterns
- Primary: background var(--accent), color #fff, font-weight 700,
  padding 0.75rem 1.75rem, border-radius var(--radius)
  hover: background var(--accent-hover) + translateY(-1px)
- Secondary: background var(--surface), border 1px solid var(--surface-border),
  color var(--text), same padding
  hover: border-color var(--accent) + translateY(-1px)
- Small (sidebar/inline CTA): padding 0.6rem 1rem, font-size 0.875rem

## Typography Patterns
- Page title (h1): font-size clamp(2.2rem, 5vw, 3.5rem), font-weight 800,
  letter-spacing -0.03em
- Section title (h2): font-size 1.75rem, font-weight 800, letter-spacing -0.03em
- Body: font-size 1rem, line-height 1.7, color var(--text)
- Muted text: color var(--text-muted)
- Badge/label: font-size 0.8rem, font-weight 700, letter-spacing 0.08em,
  text-transform uppercase

## Existing Components (reuse, do not recreate)
- Header — app-wide, already in layout.tsx
- CTA — accepts type (CtaType) and variant (inline/post-content/sidebar)
- Sidebar — accepts resource prop, renders related links + CTA
- ResourceLayout — wraps all resource pages, handles grid + h1 + CTA positions

## Page File Pattern
Every new page needs two files:
1. app/[page]/page.tsx — imports styles from ./[page].module.css
2. app/[page]/page.module.css — uses only var() tokens from globals.css

## Self-check before delivering any styled page
- ✅ Only var() tokens used — no hardcoded hex values
- ✅ Mobile responsive (max-width: 640px or 768px breakpoint)
- ✅ CSS Module file matches component name
- ✅ No new globals added — extend globals.css only if a token is genuinely missing
- ✅ Reused existing components (Header, CTA, Sidebar) where applicable
