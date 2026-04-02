import type { Metadata } from 'next'
import Link from 'next/link'
import CtaBand from '@/components/CtaBand'

export const metadata: Metadata = {
  title: 'Features | Transcript Tax Monitor Pro',
  description: 'Everything Transcript Tax Monitor Pro does — local PDF parsing, plain-English reports, all four IRS transcript types, and a token-based system with no subscriptions.',
}

const FEATURES = [
  {
    id: 'local-parsing',
    number: '01',
    title: 'Local PDF parsing',
    sub: 'Your client data never leaves the browser.',
    description: 'Drop a transcript PDF into the dashboard and the parser runs entirely in your browser using PDF.js. No upload, no server, no data stored. The raw text extraction happens locally and the structured JSON is built client-side before anything touches the API.',
    tiers: [
      { label: 'All plans', value: 'Full local parsing on every transcript type' },
    ],
    whyMatters: [
      'Client data stays on your machine — no cloud exposure during extraction.',
      'Works without a network connection for the parsing step.',
      'Compliant with Section 7216 because no data is transmitted during parsing.',
    ],
    whatYouGet: [
      'Raw text view for inspection before parsing.',
      'Structured JSON output with all detected fields.',
      'Transcript type auto-detection (Account, Return, Record of Account, Wage & Income).',
    ],
  },
  {
    id: 'plain-english-reports',
    number: '02',
    title: 'Plain-English reports',
    sub: 'Client-ready output in seconds.',
    description: 'After parsing, save the report with one token. The report viewer renders a multi-page formatted document — taxpayer info, account status, transaction timeline, practitioner notes, and IRS code descriptions pulled from 400+ resource pages. Add your firm logo and email the link to your client.',
    tiers: [
      { label: '1 token', value: 'Per report saved' },
    ],
    whyMatters: [
      'Stops the 20-minute manual translation process per client.',
      'Reports are printable and client-shareable via link.',
      'IRS code descriptions are sourced from the TTMP resource library — not generic text.',
    ],
    whatYouGet: [
      'Multi-page report with section headings, transaction timeline, and balance summary.',
      'Practitioner notes section generated automatically from transcript data.',
      'Firm logo support — upload once, appears on every saved report.',
      'Email client link directly from the dashboard.',
    ],
  },
  {
    id: 'transcript-types',
    number: '03',
    title: 'All four transcript types',
    sub: 'Account, Return, Record of Account, Wage & Income.',
    description: 'The parser handles all four IRS transcript types with type-specific field extraction and report layouts. Each type produces a different structured JSON and a different report format — no generic one-size output.',
    tiers: [
      { label: 'Account Transcript', value: 'Balance, accruals, transaction timeline, return summary' },
      { label: 'Return Transcript', value: 'Income, deductions, Schedule C/SE, payments, balance due' },
      { label: 'Record of Account', value: 'Combined — account balance + full return detail' },
      { label: 'Wage & Income', value: 'W-2 detail, 1099-B transactions with gain/loss calculation' },
    ],
    whyMatters: [
      'One tool covers the full transcript workflow instead of four separate processes.',
      'Type-specific reports mean Account transcripts show timelines, Return transcripts show line items.',
      'IRS transaction code descriptions are fetched live from 400+ resource pages.',
    ],
    whatYouGet: [
      'Auto-detection of transcript type from PDF content.',
      'Separate report layouts per type — not a generic template.',
      'Transaction code impact descriptions sourced from the TTMP resource library.',
    ],
  },
  {
    id: 'token-system',
    number: '04',
    title: 'Token-based pricing',
    sub: 'No subscriptions. No surprises.',
    description: 'Tokens are purchased once and applied when you save a report. Parsing and viewing are always free. You only spend a token when you save a finished report. Packages start at $19 for 10 tokens.',
    tiers: [
      { label: '10 tokens', value: '$19' },
      { label: '25 tokens', value: '$29' },
      { label: '100 tokens', value: '$129' },
    ],
    whyMatters: [
      'Low-volume users are not penalized by a monthly subscription.',
      'Tokens do not expire — buy when you need them.',
      'Parsing is always free — you can test without spending.',
    ],
    whatYouGet: [
      'Buy once, use across all transcript types.',
      'Balance visible in the dashboard at all times.',
      'Refresh balance button — no need to reload.',
    ],
  },
]

const COMPARISON = [
  { feature: 'Local PDF parsing', free: true, paid: true },
  { feature: 'Raw text extraction', free: true, paid: true },
  { feature: 'Structured JSON output', free: true, paid: true },
  { feature: 'All 4 transcript types', free: true, paid: true },
  { feature: 'Save reports (1 token each)', free: false, paid: true },
  { feature: 'Email report link to client', free: false, paid: true },
  { feature: 'Firm logo on reports', free: true, paid: true },
  { feature: 'IRS code descriptions', free: true, paid: true },
  { feature: 'Token balance dashboard', free: true, paid: true },
]

export default function FeaturesPage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ padding: '5rem 1.5rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(20,184,166,0.12)',
            border: '1px solid rgba(20,184,166,0.35)',
            color: '#14b8a6',
            fontSize: '0.8rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '0.35rem 0.9rem', borderRadius: 100, marginBottom: '1.5rem',
          }}>Features</div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.15,
            marginBottom: '1.25rem', color: 'var(--text, #f9fafb)',
          }}>
            Everything the parser does
          </h1>
          <p style={{
            fontSize: '1.1rem', color: 'var(--text-muted, #9ca3af)',
            maxWidth: 580, margin: '0 auto 2rem', lineHeight: 1.7,
          }}>
            Local parsing, plain-English reports, all four IRS transcript types, and a token system with no subscriptions. Built for tax professionals who bill by the hour, not the month.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/pricing/" style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#14b8a6', color: '#000',
              fontWeight: 700, fontSize: '1rem',
              padding: '0.75rem 1.75rem', borderRadius: 10, textDecoration: 'none',
            }}>View Pricing</Link>
            <Link href="/app/dashboard/" style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'var(--surface, #111827)',
              border: '1px solid var(--surface-border, #1f2937)',
              color: 'var(--text, #f9fafb)',
              fontWeight: 600, fontSize: '1rem',
              padding: '0.75rem 1.75rem', borderRadius: 10, textDecoration: 'none',
            }}>Try the Parser</Link>
          </div>
        </div>
      </section>

      {/* Feature overview cards */}
      <section style={{
        padding: '3rem 1.5rem',
        borderTop: '1px solid var(--surface-border, #1f2937)',
        borderBottom: '1px solid var(--surface-border, #1f2937)',
        background: 'var(--surface, #111827)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text, #f9fafb)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
              The 4 core features
            </h2>
            <p style={{ color: 'var(--text-muted, #9ca3af)', fontSize: '1rem' }}>
              Everything the parser does, explained.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {FEATURES.map(f => (
              <a key={f.id} href={`#${f.id}`} style={{
                display: 'block', textDecoration: 'none',
                background: 'var(--bg, #0a0f1e)',
                border: '1px solid var(--surface-border, #1f2937)',
                borderRadius: 12, padding: '1.5rem',
                transition: 'border-color 150ms ease, transform 150ms ease',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: 'rgba(20,184,166,0.1)',
                  border: '1px solid rgba(20,184,166,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: '#14b8a6',
                  marginBottom: '1rem',
                }}>{f.number}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text, #f9fafb)', marginBottom: '0.375rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #9ca3af)', lineHeight: 1.5 }}>{f.sub}</p>
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: 600, color: '#14b8a6' }}>View details →</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Feature detail sections */}
      <section style={{ padding: '4rem 1.5rem', borderBottom: '1px solid var(--surface-border, #1f2937)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text, #f9fafb)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
              Feature details
            </h2>
            <p style={{ color: 'var(--text-muted, #9ca3af)', fontSize: '1rem' }}>
              How each piece of the parser works.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {FEATURES.map(f => (
              <div key={f.id} id={f.id} style={{
                background: 'var(--surface, #111827)',
                border: '1px solid var(--surface-border, #1f2937)',
                borderRadius: 16, overflow: 'hidden',
                scrollMarginTop: '6rem',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 260px) 1fr',
                  gap: 0,
                }}>
                  {/* Left sidebar */}
                  <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRight: '1px solid var(--surface-border, #1f2937)',
                    padding: '1.5rem',
                  }}>
                    <div style={{
                      display: 'inline-block',
                      background: 'rgba(20,184,166,0.1)',
                      border: '1px solid rgba(20,184,166,0.2)',
                      color: '#14b8a6',
                      fontSize: '0.7rem', fontWeight: 700,
                      padding: '0.25rem 0.6rem', borderRadius: 6,
                      marginBottom: '1rem',
                    }}>Feature {f.number}</div>
                    <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text, #f9fafb)', marginBottom: '0.5rem' }}>{f.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #9ca3af)', lineHeight: 1.6, marginBottom: '1.25rem' }}>{f.description}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {f.tiers.map(t => (
                        <div key={t.label} style={{
                          background: 'var(--bg, #0a0f1e)',
                          border: '1px solid var(--surface-border, #1f2937)',
                          borderRadius: 8, padding: '0.6rem 0.875rem',
                        }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted, #9ca3af)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{t.label}</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text, #f9fafb)' }}>{t.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Right content */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                      background: 'var(--bg, #0a0f1e)',
                      border: '1px solid var(--surface-border, #1f2937)',
                      borderRadius: 10, padding: '1.25rem',
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #9ca3af)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>What you get</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {f.whatYouGet.map(item => (
                          <div key={item} style={{
                            background: 'var(--surface, #111827)',
                            border: '1px solid var(--surface-border, #1f2937)',
                            borderRadius: 8, padding: '0.6rem 0.875rem',
                            fontSize: '0.875rem', color: 'var(--text-muted, #9ca3af)', lineHeight: 1.5,
                          }}>{item}</div>
                        ))}
                      </div>
                    </div>
                    <div style={{
                      background: 'var(--bg, #0a0f1e)',
                      border: '1px solid var(--surface-border, #1f2937)',
                      borderRadius: 10, padding: '1.25rem',
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #9ca3af)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>Why this matters</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {f.whyMatters.map(item => (
                          <div key={item} style={{
                            background: 'var(--surface, #111827)',
                            border: '1px solid var(--surface-border, #1f2937)',
                            borderRadius: 8, padding: '0.6rem 0.875rem',
                            fontSize: '0.875rem', color: 'var(--text-muted, #9ca3af)', lineHeight: 1.5,
                          }}>{item}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--surface, #111827)', borderBottom: '1px solid var(--surface-border, #1f2937)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text, #f9fafb)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
              Free vs paid
            </h2>
            <p style={{ color: 'var(--text-muted, #9ca3af)', fontSize: '1rem' }}>
              Parsing is always free. Tokens are only spent when you save a report.
            </p>
          </div>
          <div style={{ background: 'var(--bg, #0a0f1e)', border: '1px solid var(--surface-border, #1f2937)', borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface, #111827)' }}>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'var(--text-muted, #9ca3af)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Feature</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'center', color: 'var(--text-muted, #9ca3af)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Free</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'center', color: '#14b8a6', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>With tokens</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} style={{ borderTop: '1px solid var(--surface-border, #1f2937)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text, #f9fafb)', fontWeight: 500 }}>{row.feature}</td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center', fontSize: '1rem' }}>
                      {row.free ? <span style={{ color: '#14b8a6' }}>✓</span> : <span style={{ color: 'var(--text-muted, #9ca3af)', opacity: 0.4 }}>—</span>}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center', fontSize: '1rem' }}>
                      {row.paid ? <span style={{ color: '#14b8a6' }}>✓</span> : <span style={{ color: 'var(--text-muted, #9ca3af)', opacity: 0.4 }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <CtaBand
        title="Ready to clean up your transcript workflow?"
        body="Parse for free. Buy tokens when you need to save a client-ready report. No subscription required."
        primaryLabel="See Pricing"
        primaryHref="/pricing/"
        secondaryLabel="Try the Parser"
        secondaryHref="/app/dashboard/"
      />

    </div>
  )
}
