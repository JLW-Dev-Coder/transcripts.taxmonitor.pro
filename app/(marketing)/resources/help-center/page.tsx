'use client'

import { useEffect } from 'react'
import Link from 'next/link'

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
  useEffect(() => {
    const script = document.createElement('script')
    script.innerHTML = `
      (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
      Cal("init", "tax-monitor-transcript-support", {origin:"https://app.cal.com"});
      Cal.ns["tax-monitor-transcript-support"]("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
    `
    document.head.appendChild(script)
  }, [])

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: '2.5rem' }}>

        {/* Book a support call — Cal.com popup */}
        <button
          data-cal-link="tax-monitor-pro/tax-monitor-transcript-support"
          data-cal-namespace="tax-monitor-transcript-support"
          data-cal-config='{"layout":"month_view"}'
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            padding: '1.25rem 1.5rem', cursor: 'pointer',
            background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.25)',
            borderRadius: 12, textAlign: 'left', fontFamily: 'inherit',
            transition: 'background 150ms ease',
          }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(20,184,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#f9fafb', marginBottom: 4 }}>Book a support call</p>
          <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>10-min session with our team</p>
        </button>

        {/* Browse code database */}
        <a href="/resources/transcript-codes/" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
          padding: '1.25rem 1.5rem', textDecoration: 'none',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, transition: 'background 150ms ease',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(20,184,166,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#f9fafb', marginBottom: 4 }}>Browse code database</p>
          <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>All 400+ IRS transaction codes</p>
        </a>

        {/* Try the parser */}
        <a href="/app/dashboard/" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
          padding: '1.25rem 1.5rem', textDecoration: 'none',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, transition: 'background 150ms ease',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(20,184,166,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg>
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#f9fafb', marginBottom: 4 }}>Try the parser</p>
          <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>Upload a transcript, get a report</p>
        </a>

        {/* View pricing */}
        <a href="/pricing/" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
          padding: '1.25rem 1.5rem', textDecoration: 'none',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, transition: 'background 150ms ease',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(20,184,166,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#f9fafb', marginBottom: 4 }}>View pricing</p>
          <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>Token packages — no subscription</p>
        </a>

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
          <button
            data-cal-link="tax-monitor-pro/tax-monitor-transcript-support"
            data-cal-namespace="tax-monitor-transcript-support"
            data-cal-config='{"layout":"month_view"}'
            style={{ background: '#14b8a6', color: '#000', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 700, fontSize: '0.9375rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Book a Support Call
          </button>
          <Link href="/app/support/"
            style={{ border: '1px solid rgba(20,184,166,0.3)', color: '#14b8a6', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 600, fontSize: '0.9375rem', textDecoration: 'none' }}>
            Send a Message
          </Link>
        </div>
      </div>

    </div>
  )
}
