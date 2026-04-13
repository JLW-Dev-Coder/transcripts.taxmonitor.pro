'use client'

import FullCalendar from '@/components/member/FullCalendar'

export default function CalendarClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Calendar</h1>
        <p className="mt-1 text-sm text-white/50">
          Your schedule, bookings, and IRS deadlines in one place
        </p>
      </div>

      <FullCalendar brandColor="#14b8a6" />
    </div>
  )
}
