'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, ExternalLink } from 'lucide-react'
import { useAppSession } from '../SessionContext'
import ContentCard from '@/components/member/ContentCard'
import DataTable from '@/components/member/DataTable'

const WORKER_BASE = 'https://api.taxmonitor.pro'

interface Report {
  report_id: string
  created_at: string
  status?: string
}

export default function ReportsClient() {
  const session = useAppSession()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${WORKER_BASE}/v1/transcripts/reports`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.ok && Array.isArray(data.reports)) setReports(data.reports)
        else setError(data.message || 'Failed to load reports.')
      })
      .catch(() => setError('Failed to load reports.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Reports</h1>
        <p className="mt-1 text-sm text-white/50">View your saved transcript analysis reports</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-teal-500" />
        </div>
      ) : error ? (
        <ContentCard>
          <p className="text-sm text-red-300">{error}</p>
        </ContentCard>
      ) : reports.length === 0 ? (
        <ContentCard>
          <div className="py-8 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-white/15" />
            <p className="text-sm text-white/40">No reports yet</p>
            <p className="mt-1 text-xs text-white/25">Parse a transcript from the Dashboard to generate your first report</p>
            <Link href="/app/dashboard/" className="mt-4 inline-block rounded-lg bg-teal-500 px-4 py-2 text-sm font-bold text-black transition hover:opacity-90">
              Go to Dashboard
            </Link>
          </div>
        </ContentCard>
      ) : (
        <DataTable
          columns={[
            { key: 'id', label: 'Report ID' },
            { key: 'date', label: 'Created' },
            { key: 'status', label: 'Status' },
            { key: 'action', label: '', className: 'text-right' },
          ]}
          rows={reports.map(r => ({
            id: <span className="font-mono text-xs">{r.report_id.slice(0, 12)}...</span>,
            date: new Date(r.created_at).toLocaleDateString(),
            status: (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-400">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {r.status || 'saved'}
              </span>
            ),
            action: (
              <Link href={`/app/report/?report_id=${r.report_id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 transition hover:text-teal-300">
                Open <ExternalLink className="h-3 w-3" />
              </Link>
            ),
          }))}
        />
      )}
    </div>
  )
}
