'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Coins, FileText, BarChart3, Zap, Upload, FolderOpen } from 'lucide-react'

import { useAppSession } from '../SessionContext'
import KPICard from '@/components/member/KPICard'
import HeroCard from '@/components/member/HeroCard'
import ContentCard from '@/components/member/ContentCard'

const WORKER_BASE = 'https://api.taxmonitor.pro'

interface ReportEntry {
  report_id: string
  event_id?: string
  created_at?: string
  taxpayer_name?: string
  tax_year?: string
  transcript_type?: string
}

export default function DashboardClient() {
  const session = useAppSession()
  const [balance, setBalance] = useState(session.balance)
  const [reports, setReports] = useState<ReportEntry[]>([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [totalReports, setTotalReports] = useState(0)

  useEffect(() => {
    // Fetch token balance
    if (session.accountId) {
      fetch(`${WORKER_BASE}/v1/tokens/balance/${session.accountId}`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            const bal = data.balance?.transcriptTokens ?? data.transcript_tokens ?? data.balance ?? 0
            setBalance(bal)
          }
        })
        .catch(() => {})
    }

    // Fetch reports
    fetch(`${WORKER_BASE}/v1/transcripts/reports`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.reports) {
          setReports(data.reports)
          setTotalReports(data.reports.length)
        } else if (Array.isArray(data)) {
          setReports(data)
          setTotalReports(data.length)
        }
      })
      .catch(() => {})
      .finally(() => setReportsLoading(false))
  }, [session.accountId])

  // Derive monthly stats from reports
  const now = new Date()
  const currentMonthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const reportsThisMonth = reports.filter(r => {
    if (!r.created_at) return false
    const d = new Date(r.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  // Format member-since date from session (fallback to current month if not available)
  const memberSince = currentMonthName

  const recentReports = reports.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <HeroCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-400">Welcome back</span>
            <h1 className="mt-1 text-2xl font-bold text-white">{session.email.split('@')[0]}</h1>
            <p className="mt-1 text-sm text-white/50">{session.plan.charAt(0).toUpperCase() + session.plan.slice(1)} Plan</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/30">Member since</span>
            <p className="mt-0.5 text-sm text-white/60">{memberSince}</p>
          </div>
        </div>
      </HeroCard>

      {/* KPI Grid — 2x2 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KPICard
          label="Token Balance"
          value={String(balance)}
          change={balance === 0 ? 'Buy tokens to parse transcripts' : undefined}
          trend="neutral"
          icon={Coins}
        />
        <KPICard
          label="Reports Saved"
          value={reportsLoading ? '...' : String(totalReports)}
          change="All time"
          trend="neutral"
          icon={FileText}
        />
        <KPICard
          label="Reports This Month"
          value={reportsLoading ? '...' : String(reportsThisMonth)}
          change={currentMonthName}
          trend="neutral"
          icon={BarChart3}
        />
        <KPICard
          label="Tokens Used This Month"
          value={reportsLoading ? '...' : String(reportsThisMonth)}
          change={currentMonthName}
          trend="neutral"
          icon={Zap}
        />
        {/* TODO: add monthly stats endpoint for accurate tokens-used count */}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/40">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/app/tools/" className="group">
            <ContentCard>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 transition group-hover:bg-teal-500/20">
                  <Upload className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90">Parse a Transcript</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-400">Upload an IRS transcript PDF and generate a client report</p>
                </div>
              </div>
            </ContentCard>
          </Link>
          <Link href="/app/reports/" className="group">
            <ContentCard>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 transition group-hover:bg-teal-500/20">
                  <FolderOpen className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90">View Reports</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-400">Browse and resend saved reports</p>
                </div>
              </div>
            </ContentCard>
          </Link>
        </div>
      </div>

      {/* Recent Reports */}
      <ContentCard title="Recent Reports">
        {reportsLoading ? (
          <p className="text-sm text-slate-500">Loading reports...</p>
        ) : recentReports.length === 0 ? (
          <p className="text-sm text-slate-500">No reports yet. Parse your first transcript to get started.</p>
        ) : (
          <div className="divide-y divide-[--member-border]">
            {recentReports.map((report) => {
              const date = report.created_at
                ? new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Unknown date'
              const label = [
                report.taxpayer_name,
                report.transcript_type,
                report.tax_year,
              ].filter(Boolean).join(' \u2014 ') || report.report_id

              return (
                <div key={report.report_id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white/80">{label}</p>
                    <p className="text-xs text-slate-500">{date}</p>
                  </div>
                  <Link
                    href={`/app/report/?report_id=${report.report_id}`}
                    className="ml-4 shrink-0 text-[13px] font-medium text-teal-400 hover:text-teal-300"
                  >
                    View
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </ContentCard>
    </div>
  )
}
