'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './affiliate.module.css'
import {
  getAffiliate,
  getAffiliateEvents,
  startAffiliateOnboarding,
  requestPayout,
  type AffiliateData,
  type AffiliateEvent,
} from '@/lib/api'

const API_BASE = 'https://api.virtuallaunch.pro'

interface Session {
  email: string
  account_id: string
}

export default function AffiliateClient() {
  const router = useRouter()

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null)
  const [events, setEvents] = useState<AffiliateEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [affiliateError, setAffiliateError] = useState('')
  const [copyLabel, setCopyLabel] = useState('Copy')
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [payoutResult, setPayoutResult] = useState<{ payout_id: string; amount: number; status: string } | null>(null)
  const [payoutError, setPayoutError] = useState('')
  const [onboardLoading, setOnboardLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/auth/session`, { credentials: 'include' })
        const data = await res.json()
        if (res.ok && (data.ok || data.user)) {
          const user = data.user ?? data
          const account_id = user.account_id ?? user.tokenId ?? user.id ?? ''
          setSession({ email: user.email, account_id })

          setEventsLoading(true)
          const [affiliateData, eventsData] = await Promise.all([
            getAffiliate(account_id).catch(() => null),
            getAffiliateEvents(account_id).catch(() => []),
          ])

          if (!affiliateData) {
            setAffiliateError('Could not load affiliate data.')
          } else {
            setAffiliate(affiliateData)
          }
          setEvents(Array.isArray(eventsData) ? eventsData : [])
          setEventsLoading(false)
        } else {
          router.replace('/login')
        }
      } catch {
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  const handleCopy = () => {
    if (!affiliate) return
    navigator.clipboard.writeText(affiliate.referral_url)
    setCopyLabel('Copied!')
    setTimeout(() => setCopyLabel('Copy'), 2000)
  }

  const handlePayout = async () => {
    if (!affiliate) return
    setPayoutLoading(true)
    setPayoutError('')
    setPayoutResult(null)
    try {
      const result = await requestPayout(affiliate.balance_pending)
      setPayoutResult(result)
      setAffiliate(prev => prev ? { ...prev, balance_pending: 0 } : prev)
    } catch {
      setPayoutError('Payout request failed. Please try again.')
    } finally {
      setPayoutLoading(false)
    }
  }

  const handleOnboard = async () => {
    setOnboardLoading(true)
    try {
      const data = await startAffiliateOnboarding()
      window.location.href = data.onboard_url
    } catch {
      setOnboardLoading(false)
    }
  }

  const handleSignOut = async () => {
    await fetch(`${API_BASE}/v1/auth/logout`, { method: 'POST', credentials: 'include' })
    router.replace('/login')
  }

  const payoutDisabledBalance = !affiliate || affiliate.balance_pending < 1000
  const payoutDisabledConnect = !affiliate || affiliate.connect_status !== 'active'
  const payoutDisabled = payoutDisabledBalance || payoutDisabledConnect
  const payoutTooltip = payoutDisabledConnect
    ? 'Connect your bank account to withdraw'
    : 'Minimum payout is $10'

  const fmtUSD = (cents: number) =>
    '$' + (cents / 100).toFixed(2)

  if (loading) {
    return <div className={styles.loadingState}>Loading...</div>
  }

  return (
    <div className={styles.appShell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <span className={styles.brandMark}>TM</span>
          <div>
            <div className={styles.brandName}>Transcript.Tax Monitor Pro</div>
            <div className={styles.brandSub}>Dashboard</div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/app/dashboard" className={styles.navLink}>Dashboard</Link>
          <Link href="/app/account" className={styles.navLink}>Account</Link>
          <Link href="/app/reports" className={styles.navLink}>Reports</Link>
          <Link href="/app/receipts" className={styles.navLink}>Receipts</Link>
          <Link href="/app/support" className={styles.navLink}>Support</Link>
          <Link href="/app/token-usage" className={styles.navLink}>Token Usage</Link>
          <Link href="/app/calendar" className={styles.navLink}>Calendar</Link>
          <Link href="/app/affiliate" className={`${styles.navLink} ${styles.navLinkActive}`}>Affiliate</Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <button type="button" onClick={handleSignOut} className={styles.signOutBtn}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main shell */}
      <div className={styles.mainShell}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.topbarTitle}>Affiliate</span>
            {session && <span className={styles.topbarEmail}>{session.email}</span>}
          </div>
        </header>

        <main className={styles.content}>
          {affiliateError && (
            <p style={{ color: '#fca5a5', fontSize: '0.875rem' }}>{affiliateError}</p>
          )}

          {/* Section 1 — Referral Link */}
          <div className={styles.card}>
            <h2 className={styles.cardHeading}>Your Referral Link</h2>
            <div className={styles.referralRow}>
              <input
                className={styles.referralInput}
                type="text"
                readOnly
                value={affiliate?.referral_url ?? `https://virtuallaunch.pro/ref/${affiliate?.referral_code ?? '...'}`}
              />
              <button type="button" className={styles.btnSecondary} onClick={handleCopy}>
                {copyLabel}
              </button>
            </div>
            <p className={styles.referralSubtext}>
              Share this link. Earn 20% commission on every purchase your referrals make, for life.
            </p>
          </div>

          {/* Section 2 — Earnings Summary */}
          <div className={styles.card}>
            <h2 className={styles.cardHeading}>Earnings</h2>
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={styles.statAmount}>
                  {affiliate ? fmtUSD(affiliate.balance_pending) : '—'}
                </div>
                <p className={styles.statLabel}>Available to withdraw</p>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statAmount}>
                  {affiliate ? fmtUSD(affiliate.balance_paid) : '—'}
                </div>
                <p className={styles.statLabel}>Total earned and paid</p>
              </div>
            </div>

            <div
              className={styles.payoutWrapper}
              onMouseEnter={() => payoutDisabled && setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {showTooltip && payoutDisabled && (
                <div className={styles.tooltip}>{payoutTooltip}</div>
              )}
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={payoutDisabled || payoutLoading}
                onClick={handlePayout}
              >
                {payoutLoading ? 'Requesting...' : 'Request Payout'}
              </button>
            </div>

            {payoutResult && (
              <p className={styles.payoutSuccess}>
                Payout requested — ID: {payoutResult.payout_id} · {fmtUSD(payoutResult.amount)} · {payoutResult.status}
              </p>
            )}
            {payoutError && (
              <p style={{ marginTop: 10, color: '#fca5a5', fontSize: '0.8125rem' }}>{payoutError}</p>
            )}
          </div>

          {/* Section 3 — Stripe Connect */}
          <div className={styles.card}>
            <h2 className={styles.cardHeading}>Bank Account</h2>
            {affiliate?.connect_status === 'active' ? (
              <div className={styles.connectBadge}>
                ✓ Bank account connected
              </div>
            ) : (
              <>
                <p className={styles.connectBody}>
                  Connect via Stripe to receive commission payouts directly to your bank.
                </p>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  disabled={onboardLoading}
                  onClick={handleOnboard}
                >
                  {onboardLoading ? 'Redirecting...' : 'Connect Bank Account'}
                </button>
              </>
            )}
          </div>

          {/* Section 4 — Commission History */}
          <div className={styles.card}>
            <h2 className={styles.cardHeading}>Commission History</h2>
            {eventsLoading ? (
              <div>
                {[1, 2, 3].map(i => (
                  <div key={i} className={styles.skeletonRow}>
                    <div className={styles.skeletonCell} style={{ width: '15%' }} />
                    <div className={styles.skeletonCell} style={{ width: '20%' }} />
                    <div className={styles.skeletonCell} style={{ width: '18%' }} />
                    <div className={styles.skeletonCell} style={{ width: '18%' }} />
                    <div className={styles.skeletonCell} style={{ width: '12%' }} />
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <p className={styles.emptyState}>
                No commissions yet. Share your referral link to start earning.
              </p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Platform</th>
                      <th>Sale Amount</th>
                      <th>Your Commission</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev, i) => (
                      <tr key={i}>
                        <td>{new Date(ev.created_at).toLocaleDateString()}</td>
                        <td>{ev.platform}</td>
                        <td>{fmtUSD(ev.gross_amount)}</td>
                        <td>{fmtUSD(ev.commission_amount)}</td>
                        <td>
                          {ev.status === 'paid' ? (
                            <span className={styles.badgePaid}>Paid</span>
                          ) : (
                            <span className={styles.badgePending}>Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
