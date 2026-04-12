import type { ReactNode } from 'react'

interface ContentCardProps {
  children: ReactNode
  className?: string
  title?: string
  headerExtra?: ReactNode
}

export default function ContentCard({ children, className = '', title, headerExtra }: ContentCardProps) {
  return (
    <div className={`rounded-xl border border-[--member-border] bg-[--member-card] transition hover:bg-[--member-card-hover] ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-[--member-border] px-5 py-3.5">
          <h3 className="text-sm font-semibold text-white/80">{title}</h3>
          {headerExtra}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
