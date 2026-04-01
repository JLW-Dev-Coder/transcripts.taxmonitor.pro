'use client'

import { useState, useRef } from 'react'
import styles from './page.module.css'

const API = 'https://api.virtuallaunch.pro'
type Status = 'idle' | 'uploading' | 'done' | 'error' | 'auth'

export default function ParserSection() {
  const [status, setStatus]     = useState<Status>('idle')
  const [report, setReport]     = useState<string | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [showGate, setShowGate] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileRef                 = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | null) {
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
      setReport(data?.html || data?.report || '')
      setStatus('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setStatus('error')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className={styles.parserWrapper}>

      {status === 'idle' && (
        <div
          className={styles.parserLoading}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0] ?? null) }}
          style={dragging ? { outline: '2px dashed #14b8a6', outlineOffset: -4, borderRadius: 12 } : {}}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: 'rgba(20,184,166,0.12)',
            border: '1px solid rgba(20,184,166,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '0.5rem',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <polyline points="9 15 12 12 15 15"/>
            </svg>
          </div>
          <p className={styles.parserLoadingText} style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
            Upload a Transcript — See It Parsed Instantly
          </p>
          <p className={styles.parserLoadingText}>
            Drop your IRS transcript PDF here or click to upload. See a real plain-English report free — no account needed for preview.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            onChange={e => handleFile(e.target.files?.[0] ?? null)}
            style={{ display: 'none' }}
            id="transcript-upload"
          />
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <label htmlFor="transcript-upload" className={styles.btnPrimary} style={{ cursor: 'pointer' }}>
              Upload Transcript PDF →
            </label>
            <a href="/login" className={styles.btnSecondary}>Sign In for Full Access</a>
          </div>
          <p className={styles.parserLoadingText} style={{ marginTop: '0.875rem', fontSize: '0.75rem' }}>
            Preview is free. Save, print, or email reports with a token purchase.
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
            Free account required to parse
          </p>
          <p className={styles.parserLoadingText}>
            Sign in with your email — no password, no credit card. Then upload your transcript.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/login" className={styles.btnPrimary}>Create Free Account →</a>
            <button className={styles.btnSecondary} onClick={() => setStatus('idle')}>Back</button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.parserLoading}>
          <p style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{error}</p>
          <button className={styles.btnSecondary} onClick={() => { setStatus('idle'); setError(null) }}>
            Try Again
          </button>
        </div>
      )}

      {status === 'done' && report && (
        <div style={{ width: '100%', position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.875rem 1.5rem',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--surface-border)',
            flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#14b8a6', display: 'inline-block' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                Report generated — preview mode
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className={styles.btnSecondary}
                style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem' }}
                onClick={() => { setStatus('idle'); setReport(null) }}
              >
                Upload Another
              </button>
              <button
                className={styles.btnPrimary}
                style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem' }}
                onClick={() => setShowGate(true)}
              >
                Save / Print / Email Report →
              </button>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              style={{ maxHeight: 480, overflow: 'hidden', pointerEvents: 'none', userSelect: 'none' }}
              dangerouslySetInnerHTML={{ __html: report }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 30%, var(--bg) 80%)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: '2rem',
            }}>
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                borderRadius: 12, padding: '1.5rem 2rem',
                textAlign: 'center', maxWidth: 420,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.375rem' }}>
                  Your report is ready
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Use one token to unlock the full report — save as PDF, print, or email directly to your client.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href="/pricing" className={styles.btnPrimary} style={{ fontSize: '0.875rem' }}>
                    Use a Token to Unlock →
                  </a>
                  <a href="/login" className={styles.btnSecondary} style={{ fontSize: '0.875rem' }}>
                    Sign In
                  </a>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.875rem' }}>
                  10 tokens — $19 &nbsp;·&nbsp; 25 tokens — $29 &nbsp;·&nbsp; 100 tokens — $129
                </p>
              </div>
            </div>
          </div>

          {showGate && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem',
            }}>
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                borderRadius: 16, padding: '2rem',
                maxWidth: 400, width: '100%', textAlign: 'center',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              }}>
                <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                  Unlock this report
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  One token unlocks the full report — save as PDF, print, or email to your client. Tokens never expire.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <a href="/pricing" className={styles.btnPrimary} style={{ justifyContent: 'center', fontSize: '0.9375rem' }}>
                    Purchase Tokens →
                  </a>
                  <a href="/login" className={styles.btnSecondary} style={{ justifyContent: 'center', fontSize: '0.875rem' }}>
                    Sign In (use existing tokens)
                  </a>
                  <button
                    onClick={() => setShowGate(false)}
                    style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                  >
                    Cancel
                  </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                  10 tokens — $19 &nbsp;·&nbsp; 25 tokens — $29 &nbsp;·&nbsp; 100 tokens — $129
                </p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
