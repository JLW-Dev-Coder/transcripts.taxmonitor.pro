'use client'

import { useState, useRef } from 'react'
import styles from './page.module.css'

const API = 'https://api.virtuallaunch.pro'

type Status = 'idle' | 'uploading' | 'done' | 'error' | 'auth'

export default function ParserSection() {
  const [status, setStatus]   = useState<Status>('idle')
  const [report, setReport]   = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [hasToken, setHasToken] = useState<boolean | null>(null)
  const fileRef               = useRef<HTMLInputElement>(null)

  async function checkToken() {
    try {
      const res = await fetch(`${API}/v1/tokens/balance/me`, { credentials: 'include' })
      if (!res.ok) return false
      const data = await res.json()
      return (data?.balance ?? 0) > 0
    } catch {
      return false
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      setStatus('error')
      return
    }

    setStatus('uploading')
    setError(null)
    setReport(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API}/v1/transcripts/preview`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (res.status === 401 || res.status === 403) {
        setStatus('auth')
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || `Upload failed (${res.status})`)
      }

      const data = await res.json()
      const html = data?.html || data?.report || ''
      setReport(html)
      const tokenCheck = await checkToken()
      setHasToken(tokenCheck)
      setStatus('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setStatus('error')
    }

    if (fileRef.current) fileRef.current.value = ''
  }

  function handlePrint() {
    if (!hasToken) return
    window.print()
  }

  return (
    <div className={styles.parserWrapper}>

      {status === 'idle' && (
        <div className={styles.parserLoading}>
          <p className={styles.parserLoadingText} style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
            Upload a Transcript — Get a Plain-English Report
          </p>
          <p className={styles.parserLoadingText}>
            No account needed for a preview. Upload your IRS transcript PDF and see it parsed instantly.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            style={{ display: 'none' }}
            id="transcript-upload"
          />
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <label htmlFor="transcript-upload" className={styles.btnPrimary} style={{ cursor: 'pointer' }}>
              Upload Transcript PDF →
            </label>
            <a href="/login" className={styles.btnSecondary}>
              Sign In for Full Reports
            </a>
          </div>
          <p className={styles.parserLoadingText} style={{ marginTop: '0.875rem', fontSize: '0.75rem' }}>
            PDF processed securely. Transcript data is never stored without your consent.
          </p>
        </div>
      )}

      {status === 'uploading' && (
        <div className={styles.parserLoading}>
          <span className={styles.spinner} aria-hidden="true" />
          <p className={styles.parserLoadingText}>Parsing transcript…</p>
        </div>
      )}

      {status === 'auth' && (
        <div className={styles.parserLoading}>
          <p className={styles.parserLoadingText} style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>
            Sign in to use the parser
          </p>
          <p className={styles.parserLoadingText}>
            Create a free account to upload transcripts and generate plain-English reports.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/login" className={styles.btnPrimary}>Sign In Free →</a>
            <button className={styles.btnSecondary} onClick={() => setStatus('idle')}>Try Again</button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.parserLoading}>
          <p style={{ color: '#f87171', fontSize: '0.9rem' }}>{error}</p>
          <button
            className={styles.btnSecondary}
            onClick={() => { setStatus('idle'); setError(null) }}
            style={{ marginTop: '1rem' }}
          >
            Try Again
          </button>
        </div>
      )}

      {status === 'done' && report && (
        <div style={{ width: '100%' }}>
          {/* Report action bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 1.5rem',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--surface-border)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
              Report generated
            </span>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className={styles.btnSecondary}
                style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem' }}
                onClick={() => { setStatus('idle'); setReport(null) }}
              >
                Upload Another
              </button>
              {hasToken ? (
                <button
                  className={styles.btnPrimary}
                  style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem' }}
                  onClick={handlePrint}
                >
                  Print Report
                </button>
              ) : (
                <a
                  href="/pricing"
                  className={styles.btnPrimary}
                  style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem' }}
                >
                  Purchase Tokens to Save & Print →
                </a>
              )}
            </div>
          </div>
          {/* Report output */}
          <div
            className={styles.parserRoot}
            dangerouslySetInnerHTML={{ __html: report }}
          />
        </div>
      )}

    </div>
  )
}
