'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const API = 'https://api.taxmonitor.pro'

function CallbackInner() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // With api.taxmonitor.pro, the Worker sets a .taxmonitor.pro cookie directly.
    // The callback redirect already has the cookie set — just go to dashboard.
    window.location.href = '/app/dashboard/'
  }, [searchParams])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0a0f1e', gap: '1rem', padding: '2rem', textAlign: 'center',
      }}>
        <p style={{ color: '#f87171', fontSize: '1rem', fontWeight: 600 }}>Sign-in failed</p>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{error}</p>
        <a href="/login/" style={{
          background: '#14b8a6', color: '#000',
          padding: '0.625rem 1.25rem', borderRadius: 9999,
          fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', marginTop: '0.5rem',
        }}>Back to Login</a>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0a0f1e', gap: '1rem',
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid #1f2937', borderTopColor: '#14b8a6',
        borderRadius: '50%', animation: 'spin 0.75s linear infinite',
      }} />
      <p style={{ color: '#9ca3af', fontSize: '0.9375rem' }}>Signing you in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0a0f1e',
      }}>
        <p style={{ color: '#9ca3af' }}>Loading…</p>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  )
}
