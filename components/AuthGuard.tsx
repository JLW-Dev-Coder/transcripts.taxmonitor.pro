'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { api } from '@/lib/api'
import styles from './AuthGuard.module.css'

export interface SessionUser {
  account_id: string
  email: string
  plan: string
  transcript_tokens: number
}

interface AuthGuardProps {
  children: (session: { account: SessionUser }) => React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [account, setAccount] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    api
      .getSession()
      .then((res) => {
        if (res.ok && res.session) {
          setAccount({
            account_id: res.session.account_id,
            email: res.session.email,
            plan: res.session.membership || 'free',
            transcript_tokens: res.session.transcript_tokens ?? 0,
          })
        } else {
          window.location.href = `/login/?redirect=${encodeURIComponent(pathname)}`
        }
      })
      .catch(() => {
        window.location.href = `/login/?redirect=${encodeURIComponent(pathname)}`
      })
      .finally(() => setLoading(false))
  }, [pathname])

  if (loading || !account) {
    return (
      <div className={styles.loaderWrap}>
        <div className={styles.spinner} />
      </div>
    )
  }

  return <>{children({ account })}</>
}
