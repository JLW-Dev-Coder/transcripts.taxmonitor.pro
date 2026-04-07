'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import AppTopbar from '@/components/AppTopbar'
import styles from '../dashboard/dashboard.module.css'

const API_BASE = 'https://api.taxmonitor.pro'

interface Session { email: string; tokenId: string; balance: number }
interface SavedReport {
  report_id: string
  created_at: string
  status: string
  report_url: string
}

export default function ReportsClient() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading]  = useState(true)
  const [pathname, setPathname] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [reports, setReports] = useState<SavedReport[]>([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [reportsError, setReportsError] = useState<string | null>(null)

  useEffect(() => { setPathname(window.location.pathname) }, [])

  useEffect(() => {
    api.getSession()
      .then((res) => {
        if (res.ok && res.session) {
          setSession({ email: res.session.email, tokenId: res.session.account_id, balance: res.session.transcript_tokens ?? 0 })
        } else {
          window.location.href = '/login/'
        }
      })
      .catch(() => { window.location.href = '/login/' })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!session) return
    let cancelled = false
    setReportsLoading(true)
    setReportsError(null)
    fetch(`${API_BASE}/v1/transcripts/reports`, { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (res.ok && data?.ok) {
          setReports(Array.isArray(data.reports) ? data.reports : [])
        } else {
          setReportsError(data?.message || `Failed to load reports (${res.status})`)
        }
      })
      .catch((err) => {
        if (!cancelled) setReportsError(err instanceof Error ? err.message : 'Failed to load reports')
      })
      .finally(() => { if (!cancelled) setReportsLoading(false) })
    return () => { cancelled = true }
  }, [session])

  const handleSignOut = async () => {
    await api.logout()
    window.location.href = '/login/'
  }

  if (loading) return <div className={styles.loadingState}>Loading...</div>

  return (
    <div className={styles.appShell}>
      {mobileNavOpen && <div className={styles.sidebarOverlay} onClick={() => setMobileNavOpen(false)} />}
      <aside className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarMobileOpen : ''}`}>
        <div className={styles.sidebarBrand}>
          <span className={styles.brandMark}>TT</span>
          <div><div className={styles.brandName}>Transcript Tax Monitor</div><div className={styles.brandSub}>Dashboard</div></div>
        </div>
        <nav className={styles.sidebarNav}>
          {[['Dashboard','/app/dashboard/'],['Account','/app/account/'],['Reports','/app/reports/'],['Receipts','/app/receipts/'],['Support','/app/support/'],['Token Usage','/app/token-usage/'],['Calendar','/app/calendar/'],['Affiliate','/app/affiliate/']].map(([label, href]) => (
            <Link key={href} href={href} className={`${styles.navLink} ${pathname === href ? styles.navLinkActive : ''}`}>
              <span className={styles.navDot} />{label}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button type="button" onClick={handleSignOut} className={styles.signOutBtn}>Sign Out</button>
        </div>
      </aside>
      <div className={styles.mainShell}>
        <AppTopbar
          title="Reports"
          onMenuClick={() => setMobileNavOpen(true)}
          email={session?.email}
          onSignOut={handleSignOut}
          rightExtra={
            <span className={`${styles.tokenBadge} ${session && session.balance > 0 ? styles.tokenBadgeGreen : styles.tokenBadgeAmber}`}>
              {session?.balance ?? 0} tokens
            </span>
          }
        />
        <main className={styles.workspaceContent}>
          <div className={styles.parserCard} style={{ padding: '2rem' }}>
            <p className={styles.outputCardTitle} style={{ marginBottom: '0.5rem' }}>Reports</p>
            <p className={styles.parserNote} style={{ marginBottom: '1.5rem' }}>Your saved transcript analysis reports appear here.</p>

            {reportsLoading && (
              <div style={{ background: '#0a0f1e', border: '1px solid #1a2235', borderRadius: 10, padding: '2rem', textAlign: 'center' }}>
                <p className={styles.parserNote}>Loading reports…</p>
              </div>
            )}

            {!reportsLoading && reportsError && (
              <div style={{ background: '#0a0f1e', border: '1px solid #3b1f2b', borderRadius: 10, padding: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#f87171', marginBottom: 8 }}>Failed to load reports</p>
                <p className={styles.parserNote}>{reportsError}</p>
              </div>
            )}

            {!reportsLoading && !reportsError && reports.length === 0 && (
              <div style={{ background: '#0a0f1e', border: '1px solid #1a2235', borderRadius: 10, padding: '3rem', textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#f9fafb', marginBottom: 8 }}>No reports yet</p>
                <p className={styles.parserNote} style={{ marginBottom: '1.5rem' }}>Upload and parse a transcript from the dashboard to generate your first report.</p>
                <Link href="/app/dashboard/" className={styles.btnPrimary} style={{ textDecoration: 'none', display: 'inline-flex', fontSize: 13 }}>Go to Dashboard →</Link>
              </div>
            )}

            {!reportsLoading && !reportsError && reports.length > 0 && (
              <div style={{ background: '#0a0f1e', border: '1px solid #1a2235', borderRadius: 10, overflow: 'hidden' }}>
                {reports.map((r, idx) => {
                  const created = (() => {
                    try { return new Date(r.created_at).toLocaleString() } catch { return r.created_at }
                  })()
                  return (
                    <div
                      key={r.report_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        borderBottom: idx === reports.length - 1 ? 'none' : '1px solid #1a2235',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#f9fafb', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.report_id}
                        </p>
                        <p className={styles.parserNote} style={{ fontSize: 12 }}>
                          {created} · {r.status}
                        </p>
                      </div>
                      <Link
                        href={`/app/report/?report_id=${encodeURIComponent(r.report_id)}`}
                        className={styles.btnPrimary}
                        style={{ textDecoration: 'none', display: 'inline-flex', fontSize: 12, padding: '8px 14px', flexShrink: 0 }}
                      >
                        Open →
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
