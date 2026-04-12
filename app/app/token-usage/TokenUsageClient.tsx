'use client'

import { Coins, TrendingUp, ShoppingCart } from 'lucide-react'
import { useAppSession } from '../SessionContext'
import KPICard from '@/components/member/KPICard'
import ContentCard from '@/components/member/ContentCard'

export default function TokenUsageClient() {
  const session = useAppSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Token Usage</h1>
        <p className="mt-1 text-sm text-white/50">Track your token balance and consumption</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Available" value={String(session.balance)} icon={Coins} />
        <KPICard label="Used This Month" value="—" icon={TrendingUp} />
        <KPICard label="Total Purchased" value="—" icon={ShoppingCart} />
      </div>

      <ContentCard title="Usage History">
        <div className="py-8 text-center">
          <p className="text-sm text-white/40">Usage history coming soon</p>
          <p className="mt-1 text-xs text-white/25">Individual token transactions will appear here</p>
        </div>
      </ContentCard>
    </div>
  )
}
