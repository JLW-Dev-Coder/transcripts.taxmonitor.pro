'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

const API = 'https://api.taxmonitor.pro'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API}/v1/auth/magic-link/request`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          redirectUri: 'https://transcript.taxmonitor.pro/app/dashboard/',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || `Request failed (${res.status})`)
      }

      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleSignIn() {
    const returnTo = encodeURIComponent('https://transcript.taxmonitor.pro/app/dashboard/')
    window.location.href = `https://api.taxmonitor.pro/v1/auth/google/start?return_to=${returnTo}`
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logoBlock}>
          <div className={styles.logoMark}>TT</div>
          <h1 className={styles.heading}>Sign in to your account</h1>
          <p className={styles.subheading}>No password required</p>
        </div>

        {submitted ? (
          <div className={styles.successBlock}>
            <div className={styles.successIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className={styles.successTitle}>Check your email</p>
            <p className={styles.successBody}>
              We sent a sign-in link to <strong>{email}</strong>. Check your inbox and click the link to continue.
            </p>
            <button
              onClick={() => { setSubmitted(false); setEmail('') }}
              className={styles.linkButton}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            {/* Google Sign In */}
            <button onClick={handleGoogleSignIn} className={styles.googleBtn}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>or sign in with email</span>
              <div className={styles.dividerLine} />
            </div>

            {/* Magic link form */}
            <form onSubmit={handleMagicLink}>
              <label className={styles.label}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={styles.input}
              />

              {error && <p className={styles.error}>{error}</p>}

              <button
                type="submit"
                disabled={loading || !email}
                className={`${styles.submitBtn} ${loading ? styles.submitBtnLoading : ''}`}
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          </>
        )}

        {/* Footer */}
        <div className={styles.cardFooter}>
          <p className={styles.legalText}>
            By signing in you agree to our{' '}
            <Link href="/legal/terms/">Terms</Link>
            {' '}and{' '}
            <Link href="/legal/privacy/">Privacy Policy</Link>.
          </p>
          <p className={styles.createAccount}>
            Don&apos;t have an account?{' '}
            <a href="https://virtuallaunch.pro/register">Create one free</a>
          </p>
        </div>

      </div>
    </div>
  )
}
