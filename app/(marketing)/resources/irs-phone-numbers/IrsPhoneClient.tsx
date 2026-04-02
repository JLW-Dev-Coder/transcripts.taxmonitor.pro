'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

const IRS_NUMBERS = [
  { dept: 'Individual Taxpayer Line', number: '1-800-829-1040', hours: 'Mon–Fri 7am–7pm local', notes: 'General tax questions, transcripts, account issues' },
  { dept: 'Business & Specialty Tax Line', number: '1-800-829-4933', hours: 'Mon–Fri 7am–7pm local', notes: 'Business account questions, EIN issues' },
  { dept: 'Refund Hotline', number: '1-800-829-1954', hours: '24 hours automated', notes: 'Check refund status — have SSN and filing info ready' },
  { dept: 'Practitioner Priority Service (PPS)', number: '1-866-860-4259', hours: 'Mon–Fri 8am–8pm ET', notes: 'Dedicated line for tax professionals with POA/CAF on file' },
  { dept: 'Automated Transcript Line', number: '1-800-908-9946', hours: '24 hours automated', notes: 'Order account or return transcripts by phone' },
  { dept: 'IRS e-file Help Desk', number: '1-866-255-0654', hours: 'Mon–Fri 6:30am–6pm CT', notes: 'Electronic filing issues for tax professionals' },
  { dept: 'Tax Exempt & Government Entities', number: '1-877-829-5500', hours: 'Mon–Fri 8am–5pm local', notes: 'Nonprofits, charities, government entities' },
  { dept: 'Estate & Gift Tax', number: '1-866-699-4083', hours: 'Mon–Fri 8am–4pm ET', notes: 'Form 706, Form 709 questions' },
  { dept: 'Excise Tax', number: '1-866-699-4096', hours: 'Mon–Fri 8am–4pm ET', notes: 'Excise tax returns and payments' },
  { dept: 'International Taxpayer Service', number: '1-267-941-1000', hours: 'Mon–Fri 6am–11pm ET', notes: 'US citizens abroad, foreign nationals, ITIN questions' },
  { dept: 'ITIN Application', number: '1-800-829-1040', hours: 'Mon–Fri 7am–7pm local', notes: 'Individual Taxpayer Identification Number (Form W-7)' },
  { dept: 'Innocent Spouse Relief', number: '1-855-851-2009', hours: 'Mon–Fri 8am–8pm ET', notes: 'Form 8857 questions and status' },
  { dept: 'Collections — ACS', number: '1-800-829-7650', hours: 'Mon–Fri 8am–8pm local', notes: 'Automated Collection System — balance due accounts' },
  { dept: 'Collections — Field', number: '1-800-829-3903', hours: 'Mon–Fri 8am–8pm local', notes: 'Revenue officer cases and field collection' },
  { dept: 'Installment Agreements', number: '1-800-829-0922', hours: 'Mon–Fri 7am–7pm local', notes: 'Set up or modify payment plans' },
  { dept: 'Offer in Compromise', number: '1-800-829-1040', hours: 'Mon–Fri 7am–7pm local', notes: 'OIC status and questions — request Specialty Collection' },
  { dept: 'Currently Not Collectible (CNC)', number: '1-800-829-7650', hours: 'Mon–Fri 8am–8pm local', notes: 'Hardship status requests through ACS' },
  { dept: 'Lien Unit (CEASO)', number: '1-800-913-6050', hours: 'Mon–Fri 8am–4pm local', notes: 'Federal tax lien releases, discharges, subordinations' },
  { dept: 'Appeals', number: '1-559-233-1267', hours: 'Mon–Fri 8am–4pm local', notes: 'Independent Office of Appeals — dispute resolution' },
  { dept: 'Taxpayer Advocate Service (TAS)', number: '1-877-777-4778', hours: 'Mon–Fri 7am–7pm local', notes: 'Hardship cases, systemic issues, rights violations' },
  { dept: 'Identity Protection Specialized Unit', number: '1-800-908-4490', hours: 'Mon–Fri 7am–7pm local', notes: 'Identity theft, IP PINs, fraudulent returns' },
  { dept: 'Amended Return Status', number: '1-866-464-2050', hours: '24 hours automated', notes: 'Check Form 1040-X status — wait 3 weeks after filing' },
  { dept: 'Disaster Relief', number: '1-866-562-5227', hours: 'Mon–Fri 7am–10pm ET', notes: 'Tax relief for federally declared disaster areas' },
  { dept: 'Whistleblower Office', number: '1-202-317-6832', hours: 'Mon–Fri 8am–4pm ET', notes: 'Report tax fraud and claim rewards' },
  { dept: 'Criminal Investigation', number: '1-800-829-0433', hours: 'Mon–Fri 8am–4:30pm local', notes: 'Report suspected tax fraud' },
  { dept: 'EIN Verification (Tele-TIN)', number: '1-800-829-4933', hours: 'Mon–Fri 7am–7pm local', notes: 'Verify or obtain employer identification numbers' },
  { dept: 'Health Coverage Tax Credit', number: '1-844-853-7210', hours: 'Mon–Fri 7:30am–4:30pm ET', notes: 'HCTC eligibility and enrollment' },
  { dept: 'Affordable Care Act', number: '1-844-545-5640', hours: 'Mon–Fri 7am–7pm local', notes: 'ACA-related tax questions and penalties' },
  { dept: 'EFTPS (Tax Payments)', number: '1-800-555-4477', hours: '24 hours', notes: 'Electronic Federal Tax Payment System — enrollment and payments' },
  { dept: 'Transcript by Mail', number: '1-800-908-9946', hours: '24 hours automated', notes: 'Order mailed transcripts — delivered in 5–10 days' },
]

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Transcripts', value: 'transcript' },
  { label: 'Collections', value: 'collection' },
  { label: 'Professional', value: 'professional' },
  { label: 'Identity', value: 'identity' },
  { label: 'Appeals', value: 'appeals' },
]

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  transcript: ['transcript', 'amended', 'tele-tin'],
  collection: ['collection', 'installment', 'offer', 'lien', 'levy', 'cnc', 'hardship', 'acs', 'balance'],
  professional: ['practitioner', 'pps', 'e-file', 'ein', 'eftps', 'payment'],
  identity: ['identity', 'itin', 'ip pin', 'fraud', 'whistleblower', 'criminal'],
  appeals: ['appeals', 'advocate', 'tas', 'disaster', 'relief', 'innocent'],
}

export default function IrsPhoneClient() {
  const [query, setQuery]   = useState('')
  const [cat, setCat]       = useState('all')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return IRS_NUMBERS.filter(item => {
      const text = `${item.dept} ${item.number} ${item.notes}`.toLowerCase()
      const matchesQuery = !q || text.includes(q)
      const matchesCat   = cat === 'all' || (CATEGORY_KEYWORDS[cat] || []).some(kw => text.includes(kw))
      return matchesQuery && matchesCat
    })
  }, [query, cat])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem' }}>
        <Link href="/resources/" style={{ color: '#14b8a6', textDecoration: 'none' }}>Resources</Link>
        <span style={{ margin: '0 6px' }}>/</span>
        <span>IRS Department Phone Numbers</span>
      </nav>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#f9fafb', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          IRS Department Phone Numbers
        </h1>
        <p style={{ fontSize: '1.0625rem', color: '#9ca3af', lineHeight: 1.7, maxWidth: 640 }}>
          A searchable directory of IRS department phone numbers for tax professionals.
          Find the right IRS office for transcripts, appeals, and collections.
        </p>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search departments or numbers..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            flex: 1, minWidth: 220,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '0.625rem 1rem',
            fontSize: 14, color: '#f9fafb', fontFamily: 'inherit', outline: 'none',
          }}
          onFocus={e => e.currentTarget.style.borderColor = '#14b8a6'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCat(c.value)}
              style={{
                padding: '0.5rem 1rem', borderRadius: 8, fontFamily: 'inherit',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
                background: cat === c.value ? '#14b8a6' : 'rgba(255,255,255,0.05)',
                border: cat === c.value ? '1px solid #14b8a6' : '1px solid rgba(255,255,255,0.1)',
                color: cat === c.value ? '#000' : '#9ca3af',
              }}
            >{c.label}</button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1rem' }}>
        Showing {filtered.length} of {IRS_NUMBERS.length} departments
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <p style={{ fontSize: 15, marginBottom: 8 }}>No results found</p>
          <button onClick={() => { setQuery(''); setCat('all') }}
            style={{ background: 'none', border: 'none', color: '#14b8a6', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((item, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, padding: '1rem 1.25rem',
              display: 'grid', gridTemplateColumns: '1fr auto',
              gap: '0.5rem', alignItems: 'start',
            }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#f9fafb', marginBottom: 3 }}>{item.dept}</p>
                <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 3 }}>{item.notes}</p>
                <p style={{ fontSize: 12, color: '#6b7280' }}>{item.hours}</p>
              </div>
              <a href={`tel:${item.number.replace(/[^0-9+]/g, '')}`}
                style={{ fontSize: 16, fontWeight: 700, color: '#14b8a6', textDecoration: 'none', whiteSpace: 'nowrap', paddingTop: 2 }}>
                {item.number}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{
        marginTop: '3rem', padding: '2rem', borderRadius: 14,
        background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#f9fafb', marginBottom: '0.5rem' }}>
          Turn transcripts into clear answers
        </h2>
        <p style={{ fontSize: '0.9375rem', color: '#9ca3af', lineHeight: 1.7, marginBottom: '1.25rem', maxWidth: 520, margin: '0 auto 1.25rem' }}>
          After you reach the right IRS department, use the parser to generate a plain-English
          transcript analysis report for your client in under 10 seconds.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/#how-it-works" style={{ background: '#14b8a6', color: '#000', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none' }}>
            Start Generating Reports
          </Link>
          <Link href="/resources/transcript-codes/" style={{ border: '1px solid rgba(20,184,166,0.3)', color: '#14b8a6', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 600, fontSize: '0.9375rem', textDecoration: 'none' }}>
            Browse Code Database
          </Link>
        </div>
      </div>

    </div>
  )
}
