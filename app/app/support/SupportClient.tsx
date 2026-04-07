'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import styles from '../dashboard/dashboard.module.css'

interface Session { email: string; tokenId: string; balance: number }

export default function SupportClient() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading]  = useState(true)
  const [pathname, setPathname] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await api.createTicket({ subject: subject.trim(), message: message.trim() })
      setSubmitted(true)
      setSubject('')
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

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

  const handleSignOut = async () => {
    await api.logout()
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
              <p style={{ fontSize: 14, fontWeight: 600, color: '#f9fafb', marginBottom: '1rem' }}>Submit a Support Ticket</p>
              {submitted ? (
                <div style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.3)', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#5eead4' }}>
                  Your ticket has been submitted. We&apos;ll respond within 1 business day.{' '}
                  <button type="button" onClick={() => setSubmitted(false)} style={{ background: 'transparent', border: 0, color: '#5eead4', textDecoration: 'underline', cursor: 'pointer', fontSize: 13, padding: 0, marginLeft: 4 }}>Send another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#fca5a5', marginBottom: 10 }}>{error}</div>
                  )}
                  <input
                    type="text"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    style={{ width: '100%', background: '#111827', border: '1px solid #1a2235', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#f9fafb', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                  />
                  <textarea
                    placeholder="Describe your issue..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    style={{ width: '100%', background: '#111827', border: '1px solid #1a2235', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#f9fafb', fontFamily: 'inherit', minHeight: 100, resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                  />
                  <button type="submit" disabled={submitting} className={styles.btnPrimary} style={{ fontSize: 13 }}>
                    {submitting ? 'Submitting...' : 'Submit ticket'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
