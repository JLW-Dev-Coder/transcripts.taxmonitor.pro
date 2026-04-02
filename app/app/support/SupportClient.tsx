'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from '../dashboard/dashboard.module.css'

const API = 'https://api.virtuallaunch.pro'

interface Session { email: string; tokenId: string; balance: number }

export default function SupportClient() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading]  = useState(true)
  const [pathname, setPathname] = useState('')

  useEffect(() => { setPathname(window.location.pathname) }, [])

  useEffect(() => {
    ;(async () => {
      const sessionId = sessionStorage.getItem('ttmp_session_id')
      const email     = sessionStorage.getItem('ttmp_email')
      if (!sessionId) { window.location.href = '/login/'; return }
      try {
        const res  = await fetch(`${API}/v1/auth/session`, {
          headers: { 'Authorization': `Bearer ${sessionId}` }, credentials: 'include',
        })
        if (!res.ok) { window.location.href = '/login/'; return }
        const data = await res.json()
        const s    = data.session || data
        setSession({ email: s.email || email || '', tokenId: s.account_id || '', balance: s.transcript_tokens ?? 0 })
      } catch { window.location.href = '/login/' }
      finally  { setLoading(false) }
    })()
  }, [])

  const handleSignOut = async () => {
    const sessionId = sessionStorage.getItem('ttmp_session_id')
    await fetch(`${API}/v1/auth/logout`, { method: 'POST', credentials: 'include', headers: sessionId ? { 'Authorization': `Bearer ${sessionId}` } : {} })
    sessionStorage.removeItem('ttmp_session_id')
    sessionStorage.removeItem('ttmp_email')
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
            <span className={styles.topbarTitle}>Support</span>
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
            <p className={styles.outputCardTitle} style={{ marginBottom: '0.5rem' }}>Support</p>
            <p className={styles.parserNote} style={{ marginBottom: '1.5rem' }}>Need help? Book a call or send us a message.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1.5rem' }}>
              {[
                { label: 'Book a Support Call', desc: '15-minute session with our team', href: 'https://cal.com/tax-monitor-pro/tax-monitor-transcript-support', cta: 'Book Call' },
                { label: 'Documentation', desc: 'Guides and how-to articles', href: 'https://transcript.taxmonitor.pro/resources/', cta: 'Browse Docs' },
              ].map(item => (
                <div key={item.label} style={{ background: '#0a0f1e', border: '1px solid #1a2235', borderRadius: 10, padding: '1.25rem' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#f9fafb', marginBottom: 4 }}>{item.label}</p>
                  <p className={styles.parserNote} style={{ marginBottom: '1rem' }}>{item.desc}</p>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary} style={{ fontSize: 12, padding: '6px 14px', textDecoration: 'none', display: 'inline-flex' }}>{item.cta} →</a>
                </div>
              ))}
            </div>

            <div style={{ background: '#0a0f1e', border: '1px solid #1a2235', borderRadius: 10, padding: '1.5rem' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#f9fafb', marginBottom: '1rem' }}>Send a Message</p>
              <form onSubmit={async (e) => {
                e.preventDefault()
                const form = e.currentTarget
                const msg  = (form.elements.namedItem('message') as HTMLTextAreaElement).value
                const sessionId = sessionStorage.getItem('ttmp_session_id')
                await fetch(`${API}/v1/contact`, {
                  method: 'POST', credentials: 'include',
                  headers: { 'Content-Type': 'application/json', ...(sessionId ? { 'Authorization': `Bearer ${sessionId}` } : {}) },
                  body: JSON.stringify({ message: msg, email: session?.email, source: 'ttmp-dashboard' }),
                })
                alert('Message sent. We will respond within 1 business day.')
                form.reset()
              }}>
                <textarea name="message" placeholder="Describe your issue..." required
                  style={{ width: '100%', background: '#111827', border: '1px solid #1a2235', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#f9fafb', fontFamily: 'inherit', minHeight: 100, resize: 'vertical', outline: 'none', boxSizing: 'border-box' as const, marginBottom: 10 }} />
                <button type="submit" className={styles.btnPrimary} style={{ fontSize: 13 }}>Send Message</button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
