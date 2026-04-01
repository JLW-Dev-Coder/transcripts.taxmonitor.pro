'use client'

import { useState } from 'react'
import Link from 'next/link'

const API = 'https://api.virtuallaunch.pro'

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
    window.location.href = `https://api.virtuallaunch.pro/v1/auth/google/start?return_to=${returnTo}`
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0f1e',
      padding: '2rem 1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: 16,
        padding: '2.5rem 2rem',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#14b8a6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.875rem',
            fontSize: 16, fontWeight: 700, color: '#000',
          }}>TT</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f9fafb', margin: '0 0 0.25rem' }}>
            Sign in to Transcript Tax Monitor
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            No password required
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(20,184,166,0.12)',
              border: '1px solid rgba(20,184,166,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#f9fafb', marginBottom: '0.5rem' }}>
              Check your email
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              We sent a sign-in link to <strong style={{ color: '#f9fafb' }}>{email}</strong>. Check your inbox and click the link to continue.
            </p>
            <button
              onClick={() => { setSubmitted(false); setEmail('') }}
              style={{
                fontSize: '0.875rem', color: '#14b8a6',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                background: '#ffffff', color: '#111827',
                border: '1px solid #e5e7eb', borderRadius: 10,
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem', fontWeight: 600,
                cursor: 'pointer', marginBottom: '1.25rem',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, height: 1, background: '#1f2937' }} />
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>or sign in with email</span>
              <div style={{ flex: 1, height: 1, background: '#1f2937' }} />
            </div>

            {/* Magic link form */}
            <form onSubmit={handleMagicLink}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d1d5db', marginBottom: '0.5rem' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%', marginBottom: '0.75rem',
                  background: '#0a0f1e', border: '1px solid #1f2937',
                  borderRadius: 10, color: '#f9fafb',
                  fontSize: '0.9375rem', padding: '0.75rem 1rem',
                  outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#14b8a6')}
                onBlur={e => (e.currentTarget.style.borderColor = '#1f2937')}
              />

              {error && (
                <p style={{ fontSize: '0.8125rem', color: '#f87171', marginBottom: '0.75rem' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                style={{
                  width: '100%',
                  background: loading || !email ? '#0f766e' : '#14b8a6',
                  color: '#000', fontWeight: 700,
                  fontSize: '0.9375rem', padding: '0.75rem 1rem',
                  border: 'none', borderRadius: 10, cursor: loading ? 'wait' : 'pointer',
                  opacity: !email ? 0.6 : 1,
                  transition: 'background 150ms ease',
                  fontFamily: 'inherit',
                }}
              >
                {loading ? 'Sending…' : 'Send Magic Link'}
              </button>
            </form>
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.6 }}>
            By signing in you agree to our{' '}
            <Link href="/legal/terms/" style={{ color: '#6b7280', textDecoration: 'underline' }}>Terms</Link>
            {' '}and{' '}
            <Link href="/legal/privacy/" style={{ color: '#6b7280', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>

      </div>
    </div>
  )
}
