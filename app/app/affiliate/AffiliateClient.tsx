'use client'

import { useEffect, useState } from 'react'
import { Link2, Wallet, CreditCard, CheckCircle, Copy } from 'lucide-react'
import { useAppSession } from '../SessionContext'
import {
  api,
  getAffiliate,
  getAffiliateEvents,
  startAffiliateOnboarding,
  requestPayout,
  type AffiliateData,
  type AffiliateEvent,
} from '@/lib/api'
import KPICard from '@/components/member/KPICard'
import ContentCard from '@/components/member/ContentCard'
import DataTable from '@/components/member/DataTable'

export default function AffiliateClient() {
  const session = useAppSession()
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
        const [affiliateData, eventsData] = await Promise.all([
          getAffiliate(session.accountId).catch(() => null),
          getAffiliateEvents(session.accountId).catch(() => []),
        ])
        if (!affiliateData) setAffiliateError('Could not load affiliate data.')
        else setAffiliate(affiliateData)
        setEvents(Array.isArray(eventsData) ? eventsData : [])
      } catch {
        setAffiliateError('Failed to load affiliate data.')
      } finally {
        setEventsLoading(false)
      }
    })()
  }, [session.accountId])

  const handleCopy = () => {
    if (!affiliate) return
    navigator.clipboard.writeText(affiliate.referral_url)
    setCopyLabel('Copied!')
    setTimeout(() => setCopyLabel('Copy'), 2000)
  }

  const handlePayout = async () => {
    if (!affiliate) return
    setPayoutLoading(true); setPayoutError(''); setPayoutResult(null)
    try {
      const result = await requestPayout(affiliate.balance_pending)
      setPayoutResult(result)
      setAffiliate(prev => prev ? { ...prev, balance_pending: 0 } : prev)
    } catch { setPayoutError('Payout request failed. Please try again.') }
    finally { setPayoutLoading(false) }
  }

  const handleOnboard = async () => {
    setOnboardLoading(true)
    try {
      const data = await startAffiliateOnboarding()
      window.location.href = data.onboard_url
    } catch { setOnboardLoading(false) }
  }

  const payoutDisabledBalance = !affiliate || affiliate.balance_pending < 1000
  const payoutDisabledConnect = !affiliate || affiliate.connect_status !== 'active'
  const payoutDisabled = payoutDisabledBalance || payoutDisabledConnect
  const payoutTooltip = payoutDisabledConnect ? 'Connect your bank account to withdraw' : 'Minimum payout is $10'

  const fmtUSD = (cents: number) => '$' + (cents / 100).toFixed(2)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Affiliate</h1>
        <p className="mt-1 text-sm text-white/50">Earn 20% commission on every referral purchase</p>
      </div>

      {affiliateError && <p className="text-sm text-red-300">{affiliateError}</p>}

      {/* Referral link */}
      <ContentCard title="Your Referral Link" headerExtra={<Link2 className="h-4 w-4 text-white/20" />}>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={affiliate?.referral_url ?? `https://virtuallaunch.pro/ref/${affiliate?.referral_code ?? '...'}`}
            className="flex-1 rounded-lg border border-[--member-border] bg-[#07090f] px-3.5 py-2.5 text-sm text-white/80 outline-none"
          />
          <button type="button" onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3.5 py-2.5 text-[13px] font-semibold text-slate-400 transition hover:border-white/20 hover:text-white">
            <Copy className="h-3.5 w-3.5" /> {copyLabel}
          </button>
        </div>
        <p className="mt-2 text-xs text-white/40">Share this link. Earn 20% commission on every purchase your referrals make, for life.</p>
      </ContentCard>

      {/* Earnings KPIs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KPICard label="Available to Withdraw" value={affiliate ? fmtUSD(affiliate.balance_pending) : '—'} icon={Wallet} />
        <KPICard label="Total Earned & Paid" value={affiliate ? fmtUSD(affiliate.balance_paid) : '—'} icon={CreditCard} />
      </div>

      {/* Payout */}
      <ContentCard title="Payout">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative"
            onMouseEnter={() => payoutDisabled && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {showTooltip && payoutDisabled && (
              <div className="absolute -top-8 left-0 rounded bg-slate-800 px-2 py-1 text-[11px] text-white/80 whitespace-nowrap">
                {payoutTooltip}
              </div>
            )}
            <button type="button" disabled={payoutDisabled || payoutLoading} onClick={handlePayout}
              className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35">
              {payoutLoading ? 'Requesting...' : 'Request Payout'}
            </button>
          </div>
          {payoutResult && <p className="text-xs text-teal-400">Payout requested — ID: {payoutResult.payout_id} &middot; {fmtUSD(payoutResult.amount)} &middot; {payoutResult.status}</p>}
          {payoutError && <p className="text-xs text-red-300">{payoutError}</p>}
        </div>
      </ContentCard>

      {/* Bank account */}
      <ContentCard title="Bank Account">
        {affiliate?.connect_status === 'active' ? (
          <div className="flex items-center gap-2 text-sm text-teal-400">
            <CheckCircle className="h-4 w-4" /> Bank account connected
          </div>
        ) : (
          <div>
            <p className="mb-3 text-sm text-white/50">Connect via Stripe to receive commission payouts directly to your bank.</p>
            <button type="button" disabled={onboardLoading} onClick={handleOnboard}
              className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35">
              {onboardLoading ? 'Redirecting...' : 'Connect Bank Account'}
            </button>
          </div>
        )}
      </ContentCard>

      {/* Commission history */}
      {eventsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-teal-500" />
        </div>
      ) : events.length === 0 ? (
        <ContentCard title="Commission History">
          <p className="text-sm text-white/40">No commissions yet. Share your referral link to start earning.</p>
        </ContentCard>
      ) : (
        <DataTable
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'platform', label: 'Platform' },
            { key: 'sale', label: 'Sale Amount' },
            { key: 'commission', label: 'Your Commission' },
            { key: 'status', label: 'Status' },
          ]}
          rows={events.map(ev => ({
            date: new Date(ev.created_at).toLocaleDateString(),
            platform: ev.platform,
            sale: fmtUSD(ev.gross_amount),
            commission: fmtUSD(ev.commission_amount),
            status: ev.status === 'paid' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-400">Paid</span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">Pending</span>
            ),
          }))}
        />
      )}
    </div>
  )
}
