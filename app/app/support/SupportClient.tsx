'use client'

import { useState } from 'react'
import { HelpCircle, Calendar, Book, Send, CheckCircle } from 'lucide-react'
import { useAppSession } from '../SessionContext'
import { api } from '@/lib/api'
import ContentCard from '@/components/member/ContentCard'

export default function SupportClient() {
  const session = useAppSession()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await api.createTicket({ subject, message })
      setSubmitted(true)
    } catch {
      setError('Failed to submit ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Support</h1>
        <p className="mt-1 text-sm text-white/50">Get help with your account or the platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[--member-border] bg-[--member-card] p-5 transition hover:bg-[--member-card-hover]">
          <Calendar className="mb-3 h-5 w-5 text-teal-400" />
          <h3 className="text-base font-semibold text-white/90">Book a Call</h3>
          <p className="mt-1 text-sm text-white/40">10-minute support call with our team</p>
          <a
            href="https://cal.com/tax-monitor-pro/support"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-lg border border-teal-500/30 px-3.5 py-1.5 text-[13px] font-semibold text-teal-400 transition hover:bg-teal-500/10"
          >
            Schedule
          </a>
        </div>
        <div className="rounded-xl border border-[--member-border] bg-[--member-card] p-5 transition hover:bg-[--member-card-hover]">
          <Book className="mb-3 h-5 w-5 text-teal-400" />
          <h3 className="text-base font-semibold text-white/90">Documentation</h3>
          <p className="mt-1 text-sm text-white/40">Guides and resources for TTMP</p>
          <a
            href="https://transcript.taxmonitor.pro/tools/code-lookup"
            className="mt-3 inline-block rounded-lg border border-teal-500/30 px-3.5 py-1.5 text-[13px] font-semibold text-teal-400 transition hover:bg-teal-500/10"
          >
            Browse
          </a>
        </div>
      </div>

      <ContentCard title="Submit a Ticket" headerExtra={<HelpCircle className="h-4 w-4 text-white/20" />}>
        {submitted ? (
          <div className="py-6 text-center">
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-teal-400" />
            <p className="text-sm font-semibold text-white/80">Ticket submitted</p>
            <p className="mt-1 text-xs text-white/40">We&apos;ll get back to you at {session.email}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-slate-600">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full rounded-lg border border-[--member-border] bg-[#07090f] px-3.5 py-2.5 text-sm text-white/90 outline-none transition placeholder:text-slate-600 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-slate-600">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={5}
                className="w-full resize-none rounded-lg border border-[--member-border] bg-[#07090f] px-3.5 py-2.5 text-sm text-white/90 outline-none transition placeholder:text-slate-600 focus:border-teal-500"
              />
            </div>
            {error && <p className="text-[13px] text-red-300">{error}</p>}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !subject.trim() || !message.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        )}
      </ContentCard>
    </div>
  )
}
