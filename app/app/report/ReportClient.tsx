'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const API = 'https://api.virtuallaunch.pro'
const ACCENT = '#14b8a6'

function ReportInner() {
  const searchParams               = useSearchParams()
  const reportId                   = searchParams.get('report_id')
  const [status, setStatus]        = useState<'loading' | 'done' | 'error'>('loading')
  const [report, setReport]        = useState<any>(null)
  const [error, setError]          = useState<string | null>(null)

  useEffect(() => {
    if (!reportId) {
      setError('No report ID provided.')
      setStatus('error')
      return
    }

    async function load() {
      try {
        const sessionId = sessionStorage.getItem('ttmp_session_id')
        const res = await fetch(`${API}/v1/transcripts/report/data?r=${reportId}`, {
          credentials: 'include',
          headers: sessionId ? { 'Authorization': `Bearer ${sessionId}` } : {},
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.message || `Failed to load report (${res.status})`)
        }

        const data = await res.json()
        setReport(data)
        setStatus('done')
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load report.')
        setStatus('error')
      }
    }

    load()
  }, [reportId])

  if (status === 'loading') {
    return (
      <div style={centered}>
        <div style={spinner} />
        <p style={mutedText}>Loading report…</p>
        <style>{spinnerCSS}</style>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{ ...centered, gap: '0.75rem' }}>
        <p style={{ color: '#f87171', fontWeight: 600 }}>Failed to load report</p>
        <p style={mutedText}>{error}</p>
        <a href="/app/dashboard/" style={btnStyle}>Back to Dashboard</a>
      </div>
    )
  }

  const rd = report?.report_data || report
  const transactions: any[] = rd?.transactions || []
  const taxpayer = rd?.taxpayer || {}
  const balances = rd?.balances || {}
  const filingInfo = rd?.filingInfo || {}

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ maxWidth: 860, margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#000' }}>TT</div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#f9fafb', margin: 0 }}>Transcript Tax Monitor Pro</p>
            <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>IRS Transcript Analysis Report</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button onClick={() => window.print()} style={btnStyle}>Print Report</button>
          <a href="/app/dashboard/" style={{ ...btnStyle, background: 'transparent', color: '#9ca3af', border: '1px solid #1f2937' }}>Back to Dashboard</a>
        </div>
      </div>

      {/* Report card */}
      <div style={{ maxWidth: 860, margin: '0 auto', background: '#111827', border: '1px solid #1a2235', borderRadius: 12, overflow: 'hidden' }}>

        {/* Report header bar */}
        <div style={{ background: ACCENT, padding: '16px 24px' }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#000', margin: '0 0 2px' }}>IRS Account Transcript Analysis</p>
          <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', margin: 0 }}>Report ID: {reportId} · Generated {new Date().toLocaleDateString()}</p>
        </div>

        <div style={{ padding: '24px' }}>

          {/* Summary grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Tax Year', value: taxpayer.taxYear || '—' },
              { label: 'Return Type', value: filingInfo.returnType || '—' },
              { label: 'Account Balance', value: balances.balance || '—' },
              { label: 'Transactions Found', value: transactions.length || 0 },
            ].map(item => (
              <div key={item.label} style={{ background: '#0a0f1e', border: '1px solid #1a2235', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#f9fafb', margin: 0 }}>{String(item.value)}</p>
              </div>
            ))}
          </div>

          {/* Transactions table */}
          {transactions.length > 0 ? (
            <>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#f9fafb', marginBottom: 10 }}>Transaction Codes</p>
              <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1a2235' }}>
                      {['Code', 'Date', 'Description', 'Amount'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1a2235', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td style={{ padding: '9px 12px', color: ACCENT, fontWeight: 700 }}>{tx.code}</td>
                        <td style={{ padding: '9px 12px', color: '#9ca3af' }}>{tx.date}</td>
                        <td style={{ padding: '9px 12px', color: '#f9fafb' }}>{tx.description}</td>
                        <td style={{ padding: '9px 12px', color: '#9ca3af', fontFamily: 'monospace' }}>{tx.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', background: '#0a0f1e', borderRadius: 8, marginBottom: 20 }}>
              <p style={{ color: '#6b7280', fontSize: 13 }}>No transaction codes were extracted from this transcript.</p>
              <p style={{ color: '#4b5563', fontSize: 12, marginTop: 4 }}>Try extracting raw text and parsing again from the dashboard.</p>
            </div>
          )}

          {/* Raw data section */}
          {rd?.rawText && (
            <>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#f9fafb', marginBottom: 10 }}>Raw Transcript Text</p>
              <pre style={{ background: '#0a0f1e', border: '1px solid #1a2235', borderRadius: 8, padding: '14px', fontSize: 11, color: '#6b7280', fontFamily: 'monospace', overflowX: 'auto', maxHeight: 300, whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 20 }}>
                {rd.rawText}
              </pre>
            </>
          )}

          {/* Footer */}
          <div style={{ borderTop: '1px solid #1a2235', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ fontSize: 11, color: '#4b5563', margin: 0 }}>© 2026 Lenore, Inc. · Transcript Tax Monitor Pro · transcript.taxmonitor.pro</p>
            <p style={{ fontSize: 11, color: '#4b5563', margin: 0 }}>This report is for informational purposes only and does not constitute tax advice.</p>
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          body { background: #fff !important; }
          button, a[href="/app/dashboard/"] { display: none !important; }
        }
        ${spinnerCSS}
      `}</style>
    </div>
  )
}

const centered: React.CSSProperties = {
  minHeight: '100vh', display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  background: '#0a0f1e', gap: '0.75rem', padding: '2rem',
}

const mutedText: React.CSSProperties = {
  fontSize: '0.875rem', color: '#9ca3af', margin: 0,
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  background: '#14b8a6', color: '#000',
  padding: '0.5rem 1rem', borderRadius: 8,
  fontSize: '0.8125rem', fontWeight: 600,
  textDecoration: 'none', border: 'none', cursor: 'pointer',
  fontFamily: 'inherit',
}

const spinner: React.CSSProperties = {
  width: 36, height: 36,
  border: '3px solid #1f2937',
  borderTopColor: '#14b8a6',
  borderRadius: '50%',
  animation: 'spin 0.75s linear infinite',
}

const spinnerCSS = `@keyframes spin { to { transform: rotate(360deg); } }`

export default function ReportClient() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1e' }}>
        <p style={{ color: '#9ca3af' }}>Loading…</p>
      </div>
    }>
      <ReportInner />
    </Suspense>
  )
}
