'use client'

import { useEffect, useState } from 'react'

interface AssetData {
  headline: string
  subheadline: string
  workflow_gaps: string[]
  time_savings_weekly: string
  time_savings_annual: string
  revenue_opportunity: string
  tool_preview_codes: string[]
  cta_pricing_url: string
  cta_booking_url: string
  cta_learn_more_url: string
}

interface ProspectData {
  slug: string
  name: string
  credential: string
  city: string
  state: string
  firm: string
  asset_page: AssetData
}

const CODE_LABELS: Record<string, string> = {
  '971': 'Notice issued',
  '846': 'Refund issued',
  '570': 'Additional account action pending',
}

export default function AssetClient() {
  const [data, setData] = useState<ProspectData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const parts = window.location.pathname.replace(/\/$/, '').split('/')
    const slug = parts[parts.length - 1]
    if (!slug || slug === '_') { setError(true); return }
    fetch(`https://api.virtuallaunch.pro/scale/asset-page/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(setData)
      .catch(() => setError(true))
  }, [])

  if (error) return <NotFound />
  if (!data) return <Loading />

  const a = data.asset_page

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1210', color: '#e8ede9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', borderBottom: '1px solid #1e2e28' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1a9e78', display: 'inline-block' }} />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>Transcript Tax Monitor Pro</span>
        </div>
        <span style={{ color: '#7a9688', fontSize: '14px' }}>transcript.taxmonitor.pro</span>
      </nav>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Hero */}
        <div style={{ marginBottom: '48px' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 14px',
            borderRadius: '4px',
            backgroundColor: '#111c17',
            border: '1px solid #1e2e28',
            color: '#1a9e78',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '20px',
          }}>
            Practice asset — {credentialLabel(data.credential)}
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.3, margin: '0 0 12px' }}>
            {a.headline}
          </h1>
          <p style={{ fontSize: '16px', color: '#7a9688', margin: 0, lineHeight: 1.5 }}>
            {a.subheadline}
          </p>
        </div>

        {/* Metric row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
          <MetricCard label="Time saved per week" value={a.time_savings_weekly} />
          <MetricCard label="Time saved per year" value={a.time_savings_annual} />
          <MetricCard label="Revenue opportunity" value={a.revenue_opportunity} />
        </div>

        {/* Workflow gaps */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#7a9688', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Workflow gaps identified
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {a.workflow_gaps.map((gap, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1a9e78', flexShrink: 0, marginTop: '7px' }} />
                <span style={{ fontSize: '15px', lineHeight: 1.5 }}>{gap}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid #1e2e28', margin: '0 0 48px' }} />

        {/* Code preview */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#7a9688', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Codes this tool handles instantly
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {a.tool_preview_codes.map((code) => (
              <span key={code} style={{
                display: 'inline-block',
                padding: '8px 14px',
                borderRadius: '6px',
                backgroundColor: '#111c17',
                border: '1px solid #1e2e28',
                fontSize: '14px',
                fontWeight: 500,
              }}>
                {code}{CODE_LABELS[code] ? ` — ${CODE_LABELS[code]}` : ''}
              </span>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '64px' }}>
          <a href={a.cta_pricing_url} style={{
            display: 'block',
            textAlign: 'center',
            padding: '14px 24px',
            borderRadius: '6px',
            backgroundColor: '#1a9e78',
            color: '#0d1210',
            fontWeight: 600,
            fontSize: '15px',
            textDecoration: 'none',
          }}>
            Add this to my practice
          </a>
          <a href={a.cta_booking_url} style={{
            display: 'block',
            textAlign: 'center',
            padding: '14px 24px',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            border: '1px solid #1a9e78',
            color: '#1a9e78',
            fontWeight: 600,
            fontSize: '15px',
            textDecoration: 'none',
          }}>
            Talk about my caseload — book 15 min
          </a>
          <a href={a.cta_learn_more_url} style={{
            display: 'block',
            textAlign: 'center',
            padding: '14px 24px',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            color: '#7a9688',
            fontWeight: 500,
            fontSize: '14px',
            textDecoration: 'none',
          }}>
            Learn more about the tool
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 32px',
        borderTop: '1px solid #1e2e28',
        color: '#7a9688',
        fontSize: '13px',
      }}>
        <span>Prepared for {data.firm} · {data.city}, {data.state}</span>
        <span>transcript.taxmonitor.pro</span>
      </footer>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      backgroundColor: '#111c17',
      border: '1px solid #1e2e28',
      borderRadius: '8px',
      padding: '20px',
    }}>
      <div style={{ fontSize: '13px', color: '#7a9688', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 700 }}>{value}</div>
    </div>
  )
}

function credentialLabel(c: string): string {
  switch (c) {
    case 'EA': return 'Enrolled Agents'
    case 'CPA': return 'Certified Public Accountants'
    case 'JD': return 'Tax Attorneys'
    default: return 'Tax Professionals'
  }
}

function Loading() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1210', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#7a9688', fontSize: '15px' }}>Loading...</span>
    </div>
  )
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1210', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
      <span style={{ color: '#e8ede9', fontSize: '20px', fontWeight: 600 }}>Page not found</span>
      <span style={{ color: '#7a9688', fontSize: '14px' }}>This practice analysis is not available.</span>
    </div>
  )
}
