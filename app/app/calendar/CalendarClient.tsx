'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from '../dashboard/dashboard.module.css'

const API = 'https://api.taxmonitor.pro'

interface Session { email: string; tokenId: string; balance: number }

export default function CalendarClient() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading]  = useState(true)
  const [pathname, setPathname] = useState('')

  useEffect(() => { setPathname(window.location.pathname) }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const res  = await fetch(`${API}/v1/auth/session`, { credentials: 'include' })
        if (!res.ok) { window.location.href = '/login/'; return }
        const data = await res.json()
        const s    = data.session || data
        setSession({ email: s.email || '', tokenId: s.account_id || '', balance: s.transcript_tokens ?? 0 })
      } catch { window.location.href = '/login/' }
      finally  { setLoading(false) }
    })()
  }, [])

  const handleSignOut = async () => {
    await fetch(`${API}/v1/auth/logout`, { method: 'POST', credentials: 'include' })
    window.location.href = '/login/'
  }

  if (loading) return <div className={styles.loadingState}>Loading...</div>

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
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
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.topbarTitle}>Calendar</span>
            {session && <span className={styles.topbarEmail}>{session.email}</span>}
          </div>
          <div className={styles.topbarRight}>
            <span className={`${styles.tokenBadge} ${session && session.balance > 0 ? styles.tokenBadgeGreen : styles.tokenBadgeAmber}`}>
              {session?.balance ?? 0} tokens
            </span>
          </div>
        </header>
        <main className={styles.workspaceContent}>
          <div className={styles.parserCard} style={{ padding: '2rem' }}>
            <p className={styles.outputCardTitle} style={{ marginBottom: '0.5rem' }}>Calendar</p>
            <p className={styles.parserNote} style={{ marginBottom: '1.5rem' }}>Book a call with our team or view your scheduled appointments.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Support Call', desc: 'Get help with a transcript or report', href: 'https://cal.com/tax-monitor-pro/tax-monitor-transcript-support', duration: '10 min' },
                { label: 'Service Intro', desc: 'Learn how TTMP works for your practice', href: 'https://cal.com/tax-monitor-pro/tax-monitor-service-intro', duration: '15 min' },
              ].map(item => (
                <div key={item.label} style={{ background: '#0a0f1e', border: '1px solid #1a2235', borderRadius: 10, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#f9fafb' }}>{item.label}</p>
                    <span style={{ fontSize: 11, color: '#14b8a6', background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 100, padding: '2px 8px' }}>{item.duration}</span>
                  </div>
                  <p className={styles.parserNote} style={{ marginBottom: '1.25rem' }}>{item.desc}</p>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary} style={{ fontSize: 12, padding: '6px 14px', textDecoration: 'none', display: 'inline-flex' }}>Book →</a>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
