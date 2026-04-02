import type { Metadata } from 'next'
import Link from 'next/link'
import CtaBand from '@/components/CtaBand'

export const metadata: Metadata = {
  title: 'Pricing | Transcript Tax Monitor Pro',
  description: 'Simple token-based pricing. Buy once, no subscriptions. Parse any IRS transcript and save a client-ready report for 1 token.',
}

const PACKS = [
  {
    tokens: 10, price: '$19', perToken: '$1.90',
    label: '10 Tokens', featured: false,
    url: 'https://billing.taxmonitor.pro/b/4gM8wOaAe1oKcUEdTkaR203',
    note: 'Great for occasional use',
  },
  {
    tokens: 25, price: '$29', perToken: '$1.16',
    label: '25 Tokens', featured: true,
    url: 'https://billing.taxmonitor.pro/b/cNi14m5fU3wS1bW9D4aR204',
    note: 'Best value for regular use',
  },
  {
    tokens: 100, price: '$129', perToken: '$1.29',
    label: '100 Tokens', featured: false,
    url: 'https://billing.taxmonitor.pro/b/dRm8wO7o27N83k47uWaR205',
    note: 'Best for high-volume practices',
  },
]

const PERKS = [
  'Local PDF parsing — always free',
  'Plain-English report with IRS code explanations',
  'Firm logo on every saved report',
  'Email report link directly to client',
  'All 4 transcript types supported',
  'Token balance never expires',
]

const FAQS = [
  { q: 'Does parsing cost tokens?', a: 'No. Parsing, raw text extraction, and JSON output are always free. You only spend a token when you save a finished report.' },
  { q: 'Do tokens expire?', a: 'No. Tokens never expire. Buy when you need them and use them at your own pace.' },
  { q: 'What transcript types are supported?', a: 'All four: Account Transcript, Return Transcript, Record of Account, and Wage & Income Transcript. Each produces a type-specific report.' },
  { q: 'Can I add my firm logo?', a: 'Yes. Upload your logo once from the dashboard and it appears on every saved report automatically.' },
  { q: 'How does the email feature work?', a: 'After saving a report, enter your client\'s email address and send them a direct link to the report viewer. No login required for the client.' },
  { q: 'Is my client data stored or uploaded?', a: 'The PDF parsing runs entirely in your browser — no data is uploaded during extraction. Report data is stored only when you explicitly save using a token.' },
]

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Trust badge + hero */}
      <section style={{ padding: '4rem 1.5rem 3rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--surface, #111827)',
            border: '1px solid var(--surface-border, #1f2937)',
            borderRadius: 100, padding: '0.375rem 1rem',
            fontSize: '0.8rem', color: 'var(--text-muted, #9ca3af)',
            marginBottom: '1.75rem',
          }}>
            <span style={{ color: '#14b8a6' }}>✓</span>
            Buy once. No subscriptions. Tokens never expire.
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.15,
            color: 'var(--text, #f9fafb)', marginBottom: '1rem',
          }}>
            Simple pricing.{' '}
            <span style={{ color: '#14b8a6' }}>One token per report.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted, #9ca3af)', lineHeight: 1.7 }}>
            Parse any IRS transcript for free. Spend one token to save a client-ready report. No monthly fees, no seat licenses.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section style={{ padding: '0 1.5rem 4rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'stretch' }}>
            {PACKS.map(pack => (
              <div key={pack.tokens} style={{
                background: 'var(--surface, #111827)',
                border: pack.featured ? '2px solid #14b8a6' : '1px solid var(--surface-border, #1f2937)',
                borderRadius: 16, padding: '1.75rem',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
              }}>
                {pack.featured && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#14b8a6', color: '#000',
                    fontSize: '0.7rem', fontWeight: 700,
                    padding: '0.2rem 0.875rem', borderRadius: 100, whiteSpace: 'nowrap',
                  }}>Most popular</div>
                )}
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted, #9ca3af)', marginBottom: '0.75rem' }}>{pack.label}</div>
                <div style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--text, #f9fafb)', lineHeight: 1, marginBottom: '0.25rem' }}>{pack.price}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #9ca3af)', marginBottom: '1.25rem' }}>{pack.perToken} per report</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  {PERKS.map(perk => (
                    <li key={perk} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--text-muted, #9ca3af)' }}>
                      <span style={{ color: '#14b8a6', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <a href={pack.url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0.75rem 1.25rem', borderRadius: 10, fontWeight: 700,
                  fontSize: '0.9375rem', textDecoration: 'none',
                  background: pack.featured ? '#14b8a6' : 'transparent',
                  color: pack.featured ? '#000' : 'var(--text, #f9fafb)',
                  border: pack.featured ? 'none' : '1px solid var(--surface-border, #1f2937)',
                  marginBottom: '0.625rem',
                }}>Buy {pack.label} →</a>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #9ca3af)', textAlign: 'center', margin: 0 }}>{pack.note}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted, #9ca3af)', marginTop: '1.5rem' }}>
            Payments processed by Stripe. Tokens applied instantly after checkout.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--surface, #111827)', borderTop: '1px solid var(--surface-border, #1f2937)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text, #f9fafb)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
              Pricing <span style={{ color: '#14b8a6' }}>FAQ</span>
            </h2>
            <p style={{ color: 'var(--text-muted, #9ca3af)' }}>Clear expectations, no surprises.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQS.map(faq => (
              <details key={faq.q} style={{
                background: 'var(--bg, #0a0f1e)',
                border: '1px solid var(--surface-border, #1f2937)',
                borderRadius: 12, padding: '1.125rem 1.25rem',
              }}>
                <summary style={{
                  cursor: 'pointer', listStyle: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '1rem',
                  fontWeight: 600, color: 'var(--text, #f9fafb)', fontSize: '0.9375rem',
                }}>
                  {faq.q}
                  <span style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(20,184,166,0.1)',
                    border: '1px solid rgba(20,184,166,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 5l5 5 5-5"/>
                    </svg>
                  </span>
                </summary>
                <p style={{ marginTop: '0.875rem', fontSize: '0.9rem', color: 'var(--text-muted, #9ca3af)', lineHeight: 1.7 }}>{faq.a}</p>
              </details>
            ))}
          </div>
          <style>{`
            details[open] summary span svg {
              transform: rotate(180deg);
            }
            details summary span svg {
              transition: transform 200ms ease;
            }
            details summary::-webkit-details-marker { display: none; }
            details summary::marker { display: none; }
          `}</style>
        </div>
      </section>

      <CtaBand
        title="Ready to start?"
        body="Parse for free, then buy tokens when you need client-ready reports. No account required to begin."
        primaryLabel="Try the Parser"
        primaryHref="/app/dashboard/"
        secondaryLabel="View Pricing"
        secondaryHref="/pricing/"
      />

    </div>
  )
}
