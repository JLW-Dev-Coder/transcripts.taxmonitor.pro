'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import styles from './AppTopbar.module.css'

interface AppTopbarProps {
  title: string
  email?: string | null
  onSignOut?: () => void | Promise<void>
  rightExtra?: ReactNode
}

export default function AppTopbar({ title, email, onSignOut, rightExtra }: AppTopbarProps) {
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
    <header className={styles.topbar}>
      <div className={styles.left}>
        <span className={styles.brandMark}>TT</span>
        <span className={styles.brandText}>TTMP</span>
        <span className={styles.sep}>/</span>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.right}>
        {rightExtra}

        <button
          type="button"
          className={styles.bell}
          aria-label="Notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
            <path d="M9 17v1a3 3 0 006 0v-1" />
          </svg>
        </button>

        <div className={styles.account} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className={styles.avatarBtn}
            aria-label="Account menu"
          >
            {email && <span className={styles.avatarEmail}>{email}</span>}
            <span className={styles.avatar}>{initial}</span>
          </button>

          {open && (
            <div className={styles.dropdown}>
              {email && <div className={styles.dropdownEmail}>{email}</div>}
              <div className={styles.dropdownDivider} />
              <Link
                href="/app/account/"
                onClick={() => setOpen(false)}
                className={styles.dropdownItem}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 21a7 7 0 0114 0" />
                </svg>
                Account
              </Link>
              <Link
                href="/app/support/"
                onClick={() => setOpen(false)}
                className={styles.dropdownItem}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 4" />
                  <circle cx="12" cy="17" r="0.6" fill="currentColor" />
                </svg>
                Support
              </Link>
              {onSignOut && (
                <>
                  <div className={styles.dropdownDivider} />
                  <button
                    type="button"
                    onClick={() => { setOpen(false); onSignOut() }}
                    className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M17 16l4-4-4-4M21 12H9" />
                      <path d="M13 4H6a3 3 0 00-3 3v10a3 3 0 003 3h7" />
                    </svg>
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
