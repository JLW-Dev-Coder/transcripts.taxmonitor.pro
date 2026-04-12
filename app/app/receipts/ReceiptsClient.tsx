'use client'

import Link from 'next/link'
import { Receipt } from 'lucide-react'
import { useAppSession } from '../SessionContext'
import ContentCard from '@/components/member/ContentCard'

export default function ReceiptsClient() {
  const session = useAppSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Receipts</h1>
        <p className="mt-1 text-sm text-white/50">View your purchase receipts and invoices</p>
      </div>

      <ContentCard>
        <div className="py-12 text-center">
          <Receipt className="mx-auto mb-3 h-10 w-10 text-white/15" />
          <p className="text-sm text-white/40">No receipts yet</p>
          <p className="mt-1 text-xs text-white/25">Purchase tokens to see your receipts here</p>
          <Link
            href="/pricing/"
            className="mt-4 inline-block rounded-lg border border-teal-500/30 px-4 py-2 text-sm font-semibold text-teal-400 transition hover:bg-teal-500/10"
          >
            View Pricing
          </Link>
        </div>
      </ContentCard>
    </div>
  )
}
