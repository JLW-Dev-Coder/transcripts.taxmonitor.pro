'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Calendar,
  ScrollText,
  Wrench,
  Coins,
  FileText,
  Link2,
  Settings,
  UserCircle,
  HelpCircle,
  Activity,
  ArrowLeft,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  children?: { href: string; label: string }[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { href: '/app/dashboard/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/app/calendar/', label: 'Calendar', icon: Calendar },
      { href: '/app/dashboard/', label: 'Transcripts', icon: ScrollText },
      { href: '/app/tools/', label: 'Tools', icon: Wrench },
      { href: '/app/token-usage/', label: 'Tokens', icon: Coins },
      { href: '/app/reports/', label: 'Reports', icon: FileText },
    ],
  },
  {
    title: 'Earnings',
    items: [
      { href: '/app/affiliate/', label: 'Affiliate', icon: Link2 },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        href: '/app/account/',
        label: 'Account',
        icon: Settings,
        children: [{ href: '/app/account/#payments', label: 'Payments' }],
      },
      { href: '/app/profile/', label: 'Profile', icon: UserCircle },
      { href: '/app/support/', label: 'Support', icon: HelpCircle },
      { href: '/app/token-usage/', label: 'Usage', icon: Activity },
    ],
  },
]

interface MemberSidebarProps {
  email?: string | null
  onSignOut?: () => void | Promise<void>
}

export default function MemberSidebar({ email, onSignOut }: MemberSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pathname, setPathname] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    setPathname(window.location.pathname)
  }, [])

  const isActive = (href: string) =>
    pathname === href || pathname === href.replace(/\/$/, '')

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(href)) next.delete(href)
      else next.add(href)
      return next
    })
  }

  const initial = email?.[0]?.toUpperCase() ?? 'U'

  const sidebarWidth = collapsed ? 'w-[68px]' : 'w-[240px]'

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile trigger (rendered via layout) */}

      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 flex flex-col
          border-r border-white/[0.08] bg-[#0a0f1e]
          transition-[width,transform] duration-200
          md:sticky md:h-screen
          ${sidebarWidth}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className="flex h-[60px] shrink-0 items-center gap-2.5 border-b border-white/[0.08] px-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-teal text-[13px] font-bold text-black">
            TT
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="truncate text-[13px] font-bold text-slate-200">Transcript Tax Monitor</div>
              <div className="text-[11px] text-slate-600">Pro Dashboard</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="member-scroll flex-1 overflow-y-auto overflow-x-hidden px-2 py-2.5">
          {NAV_SECTIONS.map(section => (
            <div key={section.title} className="mb-1">
              {!collapsed ? (
                <div className="px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.07em] text-white/20">
                  {section.title}
                </div>
              ) : (
                <div className="h-5" />
              )}

              {section.items.map(item => {
                const Icon = item.icon
                const active = isActive(item.href) || item.children?.some(c => isActive(c.href))
                const hasChildren = item.children && item.children.length > 0
                const isExpanded = expandedItems.has(item.href)

                return (
                  <div key={item.href}>
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`
                          flex flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2.5
                          text-[14px] font-medium transition-all duration-150
                          ${active
                            ? 'border-l-2 border-teal-500 bg-teal-500/10 text-teal-400'
                            : 'border-l-2 border-transparent text-slate-500 hover:bg-white/[0.03] hover:text-slate-400'
                          }
                        `}
                        onClick={() => mobileOpen && setMobileOpen(false)}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>

                      {hasChildren && !collapsed && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.href)}
                          className="mr-1 rounded p-1 text-slate-500 hover:text-slate-300"
                        >
                          {isExpanded
                            ? <ChevronDown className="h-3.5 w-3.5" />
                            : <ChevronRight className="h-3.5 w-3.5" />
                          }
                        </button>
                      )}
                    </div>

                    {/* Children */}
                    {hasChildren && isExpanded && !collapsed && (
                      <div className="ml-[30px] space-y-0.5 pb-1">
                        {item.children!.map(child => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`
                              block rounded-md px-2.5 py-1.5 text-[13px] transition-colors
                              ${isActive(child.href)
                                ? 'text-teal-400'
                                : 'text-slate-500 hover:text-slate-300'
                              }
                            `}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/[0.08] px-2 py-2.5">
          {/* User row */}
          {!collapsed && (
            <div className="mb-2 flex items-center gap-2.5 overflow-hidden rounded-lg px-2 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-[11px] font-bold text-slate-400">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-semibold text-slate-400">{email}</div>
              </div>
            </div>
          )}

          {/* Back to site */}
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-slate-500 transition-colors hover:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Back to site</span>}
          </Link>

          {/* Sign out */}
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-slate-500 transition-colors hover:text-red-400/80"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          )}

          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(c => !c)}
            className="hidden w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-slate-600 transition-colors hover:text-slate-400 md:flex"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <PanelLeftOpen className="h-4 w-4 shrink-0" />
              : <PanelLeftClose className="h-4 w-4 shrink-0" />
            }
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

/** Exported for the topbar mobile menu trigger */
export function useMobileSidebar() {
  const [open, setOpen] = useState(false)
  return { mobileOpen: open, setMobileOpen: setOpen }
}
