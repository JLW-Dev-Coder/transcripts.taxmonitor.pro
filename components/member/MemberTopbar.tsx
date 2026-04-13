'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Search, Bell, HelpCircle, Settings, UserCircle, LogOut, Menu, User } from 'lucide-react'

interface MemberTopbarProps {
  title: string
  email?: string | null
  onSignOut?: () => void | Promise<void>
  onMenuClick?: () => void
  rightExtra?: ReactNode
}

export default function MemberTopbar({ title, email, onSignOut, onMenuClick, rightExtra }: MemberTopbarProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const initial = email?.[0]?.toUpperCase() ?? 'U'

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#0a0f1e]/80 px-6 backdrop-blur">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-700 text-slate-400 hover:border-teal-500/40 hover:text-teal-400 transition md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search..."
            className="w-56 rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white/80 placeholder-white/30 outline-none transition focus:border-teal-500/40 focus:bg-white/[0.06]"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5">
        {rightExtra}

        {/* Notifications */}
        <button
          type="button"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-transparent text-slate-500 transition hover:bg-teal-500/[0.08] hover:border-teal-500/20 hover:text-teal-400"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>

        {/* Help */}
        <Link
          href="/app/support/"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-transparent text-slate-500 transition hover:bg-teal-500/[0.08] hover:border-teal-500/20 hover:text-teal-400"
          aria-label="Help Center"
        >
          <HelpCircle className="h-[18px] w-[18px]" />
        </Link>

        {/* Avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 py-1 pl-2.5 pr-1 transition hover:border-teal-500/40 hover:bg-teal-500/5"
            aria-label="Account menu"
          >
            <span className="hidden text-xs font-medium text-slate-400 sm:block max-w-[160px] truncate">
              {email}
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-[11px] font-extrabold text-black">
              {initial}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[220px] rounded-xl border border-white/[0.08] bg-[#0f1333] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
              {email && (
                <div className="px-3 pb-1.5 pt-2 text-[11px] uppercase tracking-[0.5px] text-slate-500">
                  {email}
                </div>
              )}
              <div className="my-1.5 h-px bg-white/[0.08]" />
              <Link
                href="/app/account/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-300 transition hover:bg-teal-500/[0.08] hover:text-teal-400"
              >
                <Settings className="h-3.5 w-3.5" />
                Account
              </Link>
              <Link
                href="/app/profile/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-300 transition hover:bg-teal-500/[0.08] hover:text-teal-400"
              >
                <User className="h-3.5 w-3.5" />
                Profile
              </Link>
              <Link
                href="/app/support/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-300 transition hover:bg-teal-500/[0.08] hover:text-teal-400"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Support
              </Link>
              {onSignOut && (
                <>
                  <div className="my-1.5 h-px bg-white/[0.08]" />
                  <button
                    type="button"
                    onClick={() => { setOpen(false); onSignOut() }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-300 transition hover:bg-red-900/20 hover:text-red-400"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
