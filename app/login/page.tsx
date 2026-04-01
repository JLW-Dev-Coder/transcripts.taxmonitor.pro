'use client'

// NOTE: Next.js App Router does not support `export const metadata` from client
// components. SEO for this route should be added to app/login/layout.tsx:
//   export const metadata = {
//     title: 'Sign In - Transcript Tax Monitor Pro',
//     description: 'Sign in to Transcript Tax Monitor Pro to access your IRS transcript analysis dashboard.',
//     alternates: { canonical: 'https://transcript.taxmonitor.pro/login' },
//     openGraph: { title: '...', description: '...' },
//   }

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './login.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [redirect, setRedirect] = useState('/app-dashboard.html')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const r = params.get('redirect')
    if (r && r.startsWith('/')) {
      setRedirect(r)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('https://api.virtuallaunch.pro/v1/auth/magic-link/request', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        let msg = `Request failed (${res.status})`
        try {
          const json = await res.json()
          if (json?.error || json?.message) msg = String(json.error || json.message)
        } catch {}
        setError(msg)
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Link href="/" className={styles.logoBox}>TM</Link>
          <span className={styles.appName}>Transcript.Tax Monitor Pro</span>
        </div>

        <h1 className={styles.headline}>Sign in to access your transcript app</h1>
        <p className={styles.sub}>
          We&apos;ll email you a one-time magic link. No passwords. No circus tricks.
        </p>

        {error && (
          <div className={`${styles.alert} ${styles.alertError}`} role="alert">
            <strong>Sign-in failed</strong>
            {error}
          </div>
        )}

        {success ? (
          <div className={`${styles.alert} ${styles.alertSuccess}`} role="status">
            <strong>Check your email</strong>
            We sent you a magic link to finish signing in.
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.inputWrap}>
              <label htmlFor="email" className={styles.label}>Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={styles.input}
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Sending…' : 'Send magic link'}
            </button>

            <p className={styles.terms}>
              By continuing, you agree to the{' '}
              <a href="/legal/terms.html">Terms</a> and{' '}
              <a href="/legal/privacy.html">Privacy Policy</a>.
            </p>

            <p className={styles.redirectNote}>
              After sign-in, you will be redirected to your{' '}
              <a href={redirect}>transcript dashboard</a>.
            </p>
          </form>
        )}

        <div className={styles.reminder}>
          <p className={styles.reminderTitle}>Reminder</p>
          <p className={styles.reminderBody}>
            Transcript.Tax Monitor Pro helps tax professionals parse transcripts and generate
            token-based reports. It does not provide tax advice.
          </p>
        </div>
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerCopy}>
          &copy; {new Date().getFullYear()} Transcript Tax Monitor Pro. All rights reserved.
        </p>
        <nav className={styles.footerLinks}>
          <a href="/legal/privacy.html">Privacy Policy</a>
          <a href="/legal/terms.html">Terms of Service</a>
          <Link href="/contact">Contact Support</Link>
        </nav>
      </footer>
    </div>
  )
}
