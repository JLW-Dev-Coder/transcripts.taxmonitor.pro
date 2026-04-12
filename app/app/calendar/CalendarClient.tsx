'use client'

import { Calendar, Clock, ExternalLink } from 'lucide-react'
import { useAppSession } from '../SessionContext'

const BOOKINGS = [
  {
    label: 'Support Call',
    description: 'Quick troubleshooting or account help',
    duration: '10 min',
    url: 'https://cal.com/tax-monitor-pro/support',
  },
  {
    label: 'Service Intro',
    description: 'Learn how TTMP saves your practice time',
    duration: '15 min',
    url: 'https://cal.com/tax-monitor-pro/ttmp-discovery',
  },
]

export default function CalendarClient() {
  const session = useAppSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Calendar</h1>
        <p className="mt-1 text-sm text-white/50">Book a call with our team</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {BOOKINGS.map(b => (
          <div key={b.label} className="rounded-xl border border-[--member-border] bg-[--member-card] p-5 transition hover:bg-[--member-card-hover]">
            <div className="mb-3 flex items-start justify-between">
              <Calendar className="h-5 w-5 text-teal-400" />
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-400">
                <Clock className="h-3 w-3" /> {b.duration}
              </span>
            </div>
            <h3 className="text-base font-semibold text-white/90">{b.label}</h3>
            <p className="mt-1 text-sm text-white/40">{b.description}</p>
            <a
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-2 text-sm font-bold text-black transition hover:opacity-90"
            >
              Book <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
