'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const API = 'https://api.virtuallaunch.pro'

function buildReportHtml(rd: any, logoDataUrl: string | null): string {
  const transactions: any[] = rd?.transactions || []
  const taxpayer            = rd?.taxpayer || {}
  const balances            = rd?.balances || {}
  const filingInfo          = rd?.filingInfo || {}
  const reportDate          = new Date().toLocaleDateString()
  const taxYear             = taxpayer.taxYear || filingInfo.taxYear || '—'
  const balance             = balances.balance || '$0.00'
  const preparedBy          = rd?.preparedBy || 'Tax Professional'

  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" style="max-width:160px;height:auto;" />`
    : `<div style="width:160px;height:110px;background:#f3f4f6;border:2px dashed #d1d5db;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#9ca3af;font-size:12px;text-align:center;font-weight:800;padding:8px;"><div>Company Logo</div><div style="margin-top:6px;font-size:10px;font-weight:600;color:#6b7280;line-height:1.3;">Upload from dashboard</div></div>`

  const timelineHtml = transactions.map(tx => `
    <div class="timeline-item">
      <div>
        <div class="timeline-date">${tx.date || '—'}</div>
        <div class="timeline-code">TC ${tx.code || '—'}</div>
      </div>
      <div>
        <div class="timeline-description">${tx.description || '—'}</div>
        <div class="timeline-impact">${tx.impact || tx.amount || '—'}</div>
      </div>
    </div>
  `).join('')

  const tableRowsHtml = transactions.map(tx => `
    <tr>
      <td class="code-column">${tx.code || '—'}</td>
      <td>${tx.date || '—'}</td>
      <td>${tx.description || '—'}</td>
      <td>${tx.impact || tx.amount || '—'}</td>
    </tr>
  `).join('')

  const codeMeaningsHtml = transactions.map(tx => `
    <div style="margin-bottom:20px;padding-bottom:18px;border-bottom:1px solid #e5e7eb;">
      <div style="font-weight:800;color:#0b0a14;margin-bottom:8px;font-size:14px;">TC ${tx.code}: ${tx.description || '—'}</div>
      <div style="color:#6b7280;line-height:1.6;font-size:13px;">${tx.impact || tx.amount || 'See IRS Publication 1546 for full definition.'}</div>
    </div>
  `).join('')

  return `
    <div class="report-page">
      <div class="page-content">
        <div class="report-header">
          <div class="header-left">
            <h1>IRS Transcript Report</h1>
            <p>Client-Ready Account Analysis</p>
          </div>
          <div class="header-right">${logoHtml}</div>
        </div>

        <div class="section">
          <div class="section-title">Client Information</div>
          <div class="info-grid">
            <div class="info-block"><div class="info-label">Taxpayer Name</div><div class="info-value">${taxpayer.name || '—'}</div></div>
            <div class="info-block"><div class="info-label">Tax Period Ending</div><div class="info-value">${taxYear}</div></div>
            <div class="info-block"><div class="info-label">Report Date</div><div class="info-value">${reportDate}</div></div>
            <div class="info-block"><div class="info-label">Prepared By</div><div class="info-value">${preparedBy}</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Account Status</div>
          <div class="status-grid">
            <div class="status-card"><div class="status-value">${balance}</div><div class="status-label">Current Balance</div></div>
            <div class="status-card"><div class="status-value">${balances.refundStatus || '—'}</div><div class="status-label">Refund Status</div></div>
            <div class="status-card"><div class="status-value">${transactions.length}</div><div class="status-label">Codes Found</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">What This Means</div>
          <div class="summary-box">${rd?.summary || 'This transcript has been parsed and all transaction codes have been extracted. Review the timeline below for a chronological view of IRS actions on this account.'}</div>
        </div>

        ${transactions.length > 0 ? `
          <div class="section">
            <div class="section-title">Key Transcript Events</div>
            <div class="timeline">${timelineHtml}</div>
          </div>
        ` : '<p style="color:#6b7280;font-size:13px;">No transaction codes were extracted. Try re-parsing the transcript from the dashboard.</p>'}

        <div class="report-footer">
          <span>This report is confidential and for the named taxpayer and their representative only.</span>
          <span>Generated ${reportDate}</span>
        </div>
      </div>
    </div>

    ${transactions.length > 0 ? `
      <div class="report-page">
        <div class="page-content">
          <div class="report-header">
            <div class="header-left"><h1>Technical Analysis</h1><p>Transaction Code Breakdown</p></div>
            <div class="header-right">${logoDataUrl ? `<img src="${logoDataUrl}" style="max-width:160px;height:auto;" />` : ''}</div>
          </div>

          <div class="section">
            <div class="section-title">Transaction Code Details</div>
            <table class="transaction-table">
              <thead><tr><th>TC Code</th><th>Date</th><th>Description</th><th>Impact / Amount</th></tr></thead>
              <tbody>${tableRowsHtml}</tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Understanding These Codes</div>
            ${codeMeaningsHtml}
          </div>

          <div class="section">
            <div class="section-title">Balance Calculation</div>
            <div class="balance-box">
              <div class="balance-row"><div class="balance-label">Assessed Tax</div><div class="balance-desc">Tax liability per return filed</div><div class="balance-amount">${balances.assessedTax || '—'}</div></div>
              <div class="balance-row"><div class="balance-label">Withholding</div><div class="balance-desc">Federal tax withheld from income</div><div class="balance-amount">${balances.payments || '—'}</div></div>
              <div class="balance-row"><div class="balance-label">Credits</div><div class="balance-desc">Additional credits applied</div><div class="balance-amount">${balances.credits || '—'}</div></div>
              <div class="balance-row"><div class="balance-label">Current Balance</div><div></div><div class="balance-amount">${balance}</div></div>
            </div>
          </div>

          <div class="report-footer">
            <span>For IRS transaction code definitions, consult IRS Publication 1546.</span>
            <span>Generated ${reportDate}</span>
          </div>
        </div>
      </div>
    ` : ''}
  `
}

function ReportInner() {
  const searchParams            = useSearchParams()
  const reportId                = searchParams.get('report_id')
  const [status, setStatus]     = useState<'loading' | 'done' | 'error'>('loading')
  const [reportHtml, setReportHtml] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const containerRef            = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!reportId) { setError('No report ID provided.'); setStatus('error'); return }

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
        const rd   = data.report_data || data
        const logo = localStorage.getItem('tm_brand_logo') || null
        setReportHtml(buildReportHtml(rd, logo))
        setStatus('done')
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load report.')
        setStatus('error')
      }
    }
    load()
  }, [reportId])

  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', gap: '1rem' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #1f2937', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
      <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading report…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (status === 'error') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', gap: '0.75rem', padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: '#f87171', fontWeight: 600, fontSize: 16 }}>Failed to load report</p>
      <p style={{ color: '#9ca3af', fontSize: 14 }}>{error}</p>
      <a href="/app/dashboard/" style={{ background: '#7c3aed', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', marginTop: 8 }}>Back to Dashboard</a>
    </div>
  )

  return (
    <div style={{ background: '#020617', minHeight: '100vh' }}>
      {/* Toolbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(30,41,59,0.6)', background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(12px)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <a href="https://transcript.taxmonitor.pro/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: '#14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#000' }}>TT</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Transcript Tax Monitor Pro</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>IRS Transcript Analysis Report</div>
          </div>
        </a>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => window.print()} style={{ padding: '7px 14px', background: '#14b8a6', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#000', cursor: 'pointer', fontFamily: 'inherit' }}>
            Print / Save PDF
          </button>
          <a href="/app/dashboard/" style={{ padding: '7px 14px', background: 'transparent', border: '1px solid rgba(30,41,59,0.6)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            ← Back
          </a>
        </div>
      </div>

      {/* Report output */}
      <div style={{ padding: '32px 16px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <style>{REPORT_CSS}</style>
        <div ref={containerRef} dangerouslySetInnerHTML={{ __html: reportHtml }} />
      </div>

      <style>{`
  @media print {
    nav, [style*="position: sticky"], [style*="position:sticky"] { display: none !important; }
    body { background: #fff !important; margin: 0 !important; }
    html { background: #fff !important; }
  }
`}</style>
    </div>
  )
}

const REPORT_CSS = `
  .report-page{width:100%;max-width:8.5in;margin:0 auto 28px;background:#fff;box-shadow:0 18px 45px rgba(0,0,0,.35);border-radius:16px;overflow:hidden;page-break-after:always;font-family:'DM Sans',system-ui,sans-serif;color:#0b0a14;}
  .page-content{padding:56px;background:#fff;}
  .report-header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:44px;padding-bottom:18px;border-bottom:2px solid #0b0a14;}
  .header-left h1{font-size:32px;font-weight:800;color:#0b0a14;letter-spacing:-.5px;margin-bottom:6px;line-height:1.1;}
  .header-left p{font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:700;}
  .section{margin-bottom:34px;}
  .section-title{font-size:13px;font-weight:800;color:#0b0a14;text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;padding-left:10px;border-left:4px solid #7c3aed;}
  .info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:26px;}
  .info-block{background:#f9fafb;padding:14px;border-radius:10px;border-left:3px solid #7c3aed;}
  .info-label{font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}
  .info-value{font-size:16px;font-weight:700;color:#0b0a14;word-break:break-word;}
  .status-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px;}
  .status-card{background:linear-gradient(135deg,#f9fafb,#f3f4f6);padding:18px;border-radius:12px;border:1px solid #e5e7eb;text-align:center;}
  .status-value{font-size:20px;font-weight:800;color:#0b0a14;margin-bottom:6px;min-height:26px;line-height:1.1;}
  .status-label{font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;}
  .summary-box{background:rgba(124,58,237,.08);border-left:4px solid #7c3aed;padding:18px;border-radius:10px;line-height:1.7;color:#374151;font-size:14px;}
  .timeline{margin-top:14px;}
  .timeline-item{display:grid;grid-template-columns:140px 1fr;gap:24px;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #e5e7eb;}
  .timeline-item:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}
  .timeline-date{font-size:12px;font-weight:800;color:#7c3aed;text-transform:uppercase;letter-spacing:.5px;}
  .timeline-code{font-size:11px;color:#6b7280;margin-top:4px;font-weight:700;}
  .timeline-description{font-size:15px;font-weight:800;color:#0b0a14;margin-bottom:8px;}
  .timeline-impact{font-size:13px;color:#6b7280;line-height:1.6;}
  .transaction-table{width:100%;border-collapse:collapse;margin-top:14px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;}
  .transaction-table th{background:rgba(124,58,237,.10);color:#374151;padding:12px 14px;text-align:left;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #e5e7eb;}
  .transaction-table td{padding:12px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;vertical-align:top;}
  .transaction-table tr:hover{background:#f9fafb;}
  .transaction-table tr:last-child td{border-bottom:none;}
  .code-column{font-weight:800;color:#7c3aed;white-space:nowrap;}
  .balance-box{background:#f9fafb;padding:18px;border-radius:10px;margin-top:14px;border-left:4px solid #7c3aed;}
  .balance-row{display:grid;grid-template-columns:200px 1fr 120px;gap:16px;padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:13px;}
  .balance-row:last-child{border-bottom:none;padding-top:14px;padding-bottom:0;border-top:2px solid #7c3aed;margin-top:8px;}
  .balance-label{font-weight:800;color:#0b0a14;}
  .balance-desc{color:#6b7280;}
  .balance-amount{text-align:right;font-weight:800;color:#7c3aed;white-space:nowrap;}
  .balance-row:last-child .balance-amount{font-size:16px;color:#0b0a14;}
  .report-footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:11px;color:#9ca3af;}
  @media(max-width:640px){.page-content{padding:28px}.info-grid,.status-grid{grid-template-columns:1fr}.timeline-item{grid-template-columns:1fr;gap:10px}.balance-row{grid-template-columns:1fr}.balance-amount{text-align:left}}
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .report-page { margin: 0; box-shadow: none; border-radius: 0; page-break-after: always; break-after: page; }
    .page-content { padding: .75in; }
    .section { page-break-inside: avoid; break-inside: avoid; }
    .timeline-item { page-break-inside: avoid; break-inside: avoid; }
    .status-grid { page-break-inside: avoid; break-inside: avoid; }
    .info-grid { page-break-inside: avoid; break-inside: avoid; }
    .balance-box { page-break-inside: avoid; break-inside: avoid; }
    .report-header { page-break-inside: avoid; break-inside: avoid; }
    .summary-box { page-break-inside: avoid; break-inside: avoid; }
  }
`

export default function ReportClient() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617' }}>
        <p style={{ color: '#9ca3af' }}>Loading…</p>
      </div>
    }>
      <ReportInner />
    </Suspense>
  )
}
