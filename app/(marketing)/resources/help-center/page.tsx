import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Help Center | Transcript Tax Monitor Pro',
  description: 'Get help using Transcript Tax Monitor Pro. Guides, FAQs, and support for tax professionals.',
}

const ARTICLES = [
  {
    category: 'Getting Started',
    items: [
      { title: 'How to upload your first transcript', href: '/resources/how-to-read-irs-transcripts/' },
      { title: 'Understanding transcript types', href: '/resources/how-to-understand-irs-transaction-codes/' },
      { title: 'How tokens work', href: '/pricing/' },
      { title: 'Signing in with magic link or Google', href: '/login/' },
    ],
  },
  {
    category: 'Using the Parser',
    items: [
      { title: 'Supported transcript types', href: '/resources/how-to-read-irs-transcripts/' },
      { title: 'How to save and share a report', href: '/app/dashboard/' },
      { title: 'Adding your firm logo to reports', href: '/app/dashboard/' },
      { title: 'Emailing a report link to your client', href: '/app/dashboard/' },
    ],
  },
  {
    category: 'IRS Transcript Codes',
    items: [
      { title: 'Full IRS transaction code database', href: '/resources/transcript-codes/' },
      { title: 'IRS codes explained in plain English', href: '/resources/irs-transcript-codes-explained-in-plain-english/' },
      { title: 'What does code 150 mean?', href: '/resources/irs-code-150-meaning/' },
      { title: 'What does code 570 mean?', href: '/resources/irs-code-570-meaning/' },
      { title: 'What does code 846 mean?', href: '/resources/irs-code-846-meaning/' },
      { title: 'What does code 971 mean?', href: '/resources/irs-code-971-meaning/' },
    ],
  },
  {
    category: 'Account & Billing',
    items: [
      { title: 'Purchasing tokens', href: '/pricing/' },
      { title: 'Viewing your receipts', href: '/app/receipts/' },
      { title: 'Token usage history', href: '/app/token-usage/' },
      { title: 'Affiliate program and referrals', href: '/app/affiliate/' },
    ],
  },
  {
    category: 'Compliance',
    items: [
      { title: 'Section 7216 AI consent guide', href: '/magnets/section-7216/' },
      { title: 'Privacy policy', href: '/legal/privacy/' },
      { title: 'Terms of service', href: '/legal/terms/' },
    ],
  },
]

export default function HelpCenterPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem' }}>
        <Link href="/resources/" style={{ color: '#14b8a6', textDecoration: 'none' }}>Resources</Link>
        <span style={{ margin: '0 6px' }}>/</span>
        <span>Help Center</span>
      </nav>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#f9fafb', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          Help Center
        </h1>
        <p style={{ fontSize: '1.0625rem', color: '#9ca3af', lineHeight: 1.7, maxWidth: 580 }}>
          Everything you need to get the most out of Transcript Tax Monitor Pro.
          Browse guides by topic or search the code database.
        </p>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: '2.5rem' }}>
        {[
          { label: 'Book a support call', href: 'https://cal.com/tax-monitor-pro/tax-monitor-transcript-support', external: true },
          { label: 'Browse code database', href: '/resources/transcript-codes/' },
          { label: 'Try the parser', href: '/app/dashboard/' },
          { label: 'View pricing', href: '/pricing/' },
        ].map(item => (
          <a key={item.label} href={item.href}
            target={(item as { external?: boolean }).external ? '_blank' : undefined}
            rel={(item as { external?: boolean }).external ? 'noopener noreferrer' : undefined}
            style={{
              display: 'block', padding: '1rem 1.25rem',
              background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)',
              borderRadius: 10, textDecoration: 'none',
              fontSize: 14, fontWeight: 600, color: '#14b8a6',
              transition: 'background 150ms ease',
            }}>
            {item.label} →
          </a>
        ))}
      </div>

      {/* Article sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {ARTICLES.map(section => (
          <div key={section.category}>
            <h2 style={{ fontWeight: 700, color: '#14b8a6', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 12 }}>
              {section.category}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {section.items.map(item => (
                <Link key={item.title} href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 8, textDecoration: 'none',
                    fontSize: 14, color: '#e2e8f0', transition: 'background 150ms ease',
                  }}>
                  {item.title}
                  <span style={{ color: '#4b5563', fontSize: 16 }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div style={{
        marginTop: '3rem', padding: '2rem', borderRadius: 14,
        background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f9fafb', marginBottom: '0.5rem' }}>
          Still need help?
        </h2>
        <p style={{ fontSize: '0.9375rem', color: '#9ca3af', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          Book a 10-minute support call or send us a message from your dashboard.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://cal.com/tax-monitor-pro/tax-monitor-transcript-support"
            target="_blank" rel="noopener noreferrer"
            style={{ background: '#14b8a6', color: '#000', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none' }}>
            Book a Support Call
          </a>
          <Link href="/app/support/"
            style={{ border: '1px solid rgba(20,184,166,0.3)', color: '#14b8a6', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 600, fontSize: '0.9375rem', textDecoration: 'none' }}>
            Send a Message
          </Link>
        </div>
      </div>

    </div>
  )
}
