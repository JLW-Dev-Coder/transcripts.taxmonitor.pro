'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import AppTopbar from '@/components/AppTopbar'
import styles from '../dashboard/dashboard.module.css'

interface Session { email: string; tokenId: string; balance: number }

export default function AccountClient() {
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
          title="Account"
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
            <p className={styles.outputCardTitle} style={{ marginBottom: '1.5rem' }}>Account Information</p>
            <div className={styles.panelGrid}>
              <div>
                <span className={styles.sectionLabel}>Email Address</span>
                <div style={{ background: '#0a0f1e', border: '1px solid #1a2235', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#f9fafb', marginBottom: 16 }}>{session?.email}</div>
                <span className={styles.sectionLabel}>Account ID</span>
                <div style={{ background: '#0a0f1e', border: '1px solid #1a2235', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{session?.tokenId}</div>
              </div>
              <div>
                <span className={styles.sectionLabel}>Token Balance</span>
                <div style={{ background: '#0a0f1e', border: '1px solid #1a2235', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: session && session.balance > 0 ? '#34d399' : '#fbbf24' }}>{session?.balance ?? 0}</span>
                  <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 8 }}>transcript tokens remaining</span>
                </div>
                <span className={styles.sectionLabel}>Plan</span>
                <div style={{ background: '#0a0f1e', border: '1px solid #1a2235', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#f9fafb' }}>Token-based · No subscription</div>
              </div>
            </div>
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #1a2235' }}>
              <p className={styles.sectionLabel}>Authentication</p>
              <p className={styles.parserNote}>You are signed in via magic link or Google OAuth. No password is stored.</p>
              <button type="button" onClick={handleSignOut} className={styles.btnSecondary} style={{ marginTop: '1rem' }}>Sign Out</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
