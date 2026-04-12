import { ArrowUp, ArrowDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: LucideIcon
}

export default function KPICard({ label, value, change, trend, icon: Icon }: KPICardProps) {
  return (
    <div className="rounded-xl border border-[--member-border] bg-[--member-card] p-5 transition hover:bg-[--member-card-hover]">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-white/20" />}
      </div>
      <p className="mt-3 text-3xl font-semibold text-teal-400">{value}</p>
      {change && (
        <div className="mt-2 flex items-center gap-1">
          {trend === 'up' && <ArrowUp className="h-3 w-3 text-emerald-400" />}
          {trend === 'down' && <ArrowDown className="h-3 w-3 text-red-400" />}
          <span className={`text-xs ${
            trend === 'up' ? 'text-emerald-400' :
            trend === 'down' ? 'text-red-400' :
            'text-white/40'
          }`}>
            {change}
          </span>
        </div>
      )}
    </div>
  )
}
