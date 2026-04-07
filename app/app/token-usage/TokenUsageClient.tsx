'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import AppTopbar from '@/components/AppTopbar'
import styles from '../dashboard/dashboard.module.css'

interface Session { email: string; tokenId: string; balance: number }

export default function TokenUsageClient() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading]  = useState(true)
  const [pathname, setPathname] = useState('')

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
        <AppTopbar
          title="Token Usage"
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
            <p className={styles.outputCardTitle} style={{ marginBottom: '1.5rem' }}>Token Usage</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: '1.5rem' }}>
              {[
                { label: 'Available', value: String(session?.balance ?? 0), color: '#34d399' },
                { label: 'Used This Month', value: '—', color: '#f9fafb' },
                { label: 'Total Purchased', value: '—', color: '#f9fafb' },
              ].map(item => (
                <div key={item.label} style={{ background: '#0a0f1e', border: '1px solid #1a2235', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.value}</p>
                  <p className={styles.sectionLabel}>{item.label}</p>
                </div>
              ))}
            </div>
            <div style={{ background: '#0a0f1e', border: '1px solid #1a2235', borderRadius: 10, padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#f9fafb', marginBottom: 8 }}>Usage history coming soon</p>
              <p className={styles.parserNote}>Detailed per-report token usage tracking will appear here.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
