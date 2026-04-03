'use client'

import { useEffect, useState } from 'react'

interface Props {
  slug: string
}

const CODE_LABELS: Record<string, string> = {
  '971': 'Notice issued',
  '846': 'Refund issued',
  '570': 'Additional account action pending',
}

export default function AssetPageClient({ slug }: Props) {
  const [d, setD] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`https://api.virtuallaunch.pro/v1/scale/asset/${encodeURIComponent(slug)}`)
      .then(res => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then(setD)
      .catch(() => setError(true))
  }, [slug])

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0d1210', color: '#e8ede9', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Page not found</h1>
          <p style={{ color: '#7a9688', fontSize: '15px', marginBottom: '24px' }}>This asset page does not exist or has been removed.</p>
          <a href="https://transcript.taxmonitor.pro" style={{ color: '#1a9e78', fontSize: '15px', textDecoration: 'none', fontWeight: 500 }}>
            Go to Transcript Tax Monitor Pro
          </a>
        </div>
      </div>
    )
  }

  if (!d) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0d1210', color: '#e8ede9', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #1e2e28', borderTopColor: '#1a9e78', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#7a9688', fontSize: '14px' }}>Loading practice asset...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1210', color: '#e8ede9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #1e2e28' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1a9e78', display: 'inline-block' }} />
            <span style={{ fontWeight: 600, fontSize: '16px' }}>Transcript Tax Monitor Pro</span>
          </div>
          <span style={{ color: '#7a9688', fontSize: '14px' }}>transcript.taxmonitor.pro</span>
        </div>
      </nav>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px 80px' }}>
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
            Practice asset — {d.firm || 'Tax Professional'}
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.3, margin: '0 0 12px' }}>
            {d.headline}
          </h1>
          <p style={{ fontSize: '16px', color: '#7a9688', margin: 0, lineHeight: 1.5 }}>
            {d.subheadline}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
          <MetricCard label="Time saved per week" value={d.time_savings_weekly} />
          <MetricCard label="Time saved per year" value={d.time_savings_annual} />
          <MetricCard label="Revenue opportunity" value={d.revenue_opportunity} />
        </div>

        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#7a9688', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Workflow gaps identified
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {d.workflow_gaps.map((gap: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1a9e78', flexShrink: 0, marginTop: '7px' }} />
                <span style={{ fontSize: '15px', lineHeight: 1.5 }}>{gap}</span>
              </div>
            ))}
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #1e2e28', margin: '0 0 48px' }} />

        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#7a9688', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Codes this tool handles instantly
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {d.tool_preview_codes.map((code: string) => (
              <span key={code} style={{
                display: 'inline-block',
                padding: '8px 14px',
                borderRadius: '6px',
                backgroundColor: '#111c17',
                border: '1px solid #1e2e28',
                fontSize: '14px',
                fontWeight: 500,
              }}>
                {code}{CODE_LABELS[code] ? ` —  ${CODE_LABELS[code]}` : ''}
              </span>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '64px' }}>
          <a href={d.cta_pricing_url} style={{
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
          <a href={d.cta_booking_url} style={{
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
          <a href={d.cta_learn_more_url} style={{
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

      <footer style={{ borderTop: '1px solid #1e2e28' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#7a9688', fontSize: '13px' }}>
          <span>Prepared for {d.firm} · {d.city}, {d.state}</span>
          <span>transcript.taxmonitor.pro</span>
        </div>
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