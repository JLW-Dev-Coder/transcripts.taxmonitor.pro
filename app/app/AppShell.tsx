'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import MemberSidebar from '@/components/member/MemberSidebar'
import MemberTopbar from '@/components/member/MemberTopbar'
import { SessionProvider, type AppSession } from './SessionContext'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AppSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    api.getSession()
      .then(res => {
        if (res.ok && res.session) {
          setSession({
            email: res.session.email,
            accountId: res.session.account_id,
            balance: res.session.transcript_tokens ?? 0,
            plan: res.session.membership || 'free',
          })
        } else {
          window.location.href = `/login/?redirect=${encodeURIComponent(window.location.pathname)}`
        }
      })
      .catch(() => {
        window.location.href = `/login/?redirect=${encodeURIComponent(window.location.pathname)}`
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSignOut = useCallback(async () => {
    await api.logout()
    window.location.href = '/login/'
  }, [])

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-teal-500" />
      </div>
    )
  }

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen overflow-hidden bg-[#0a0f1e] font-sans text-white/90">
        <div className="member-shell-sidebar">
          <MemberSidebar email={session.email} onSignOut={handleSignOut} />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="member-shell-topbar">
            <MemberTopbar
            title="TTMP"
            email={session.email}
            onSignOut={handleSignOut}
            onMenuClick={() => setMobileOpen(!mobileOpen)}
            rightExtra={
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold ${
                session.balance > 0
                  ? 'border border-teal-500/20 bg-teal-500/10 text-teal-400'
                  : 'border border-amber-500/20 bg-amber-500/10 text-amber-400'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {session.balance} token{session.balance !== 1 ? 's' : ''}
              </div>
            }
            />
          </div>
          <main className="member-scroll member-shell-main flex-1 overflow-y-auto px-8 py-8">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
