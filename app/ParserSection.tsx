'use client'

import { useState, useRef } from 'react'
import styles from './page.module.css'

const API_BASE = 'https://api.virtuallaunch.pro'

export default function ParserSection() {
  const [status, setStatus]   = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [report, setReport]   = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const fileRef               = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      return
    }

    setStatus('uploading')
    setError(null)
    setReport(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/v1/transcripts/preview`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || `Error ${res.status}`)
      }

      const data = await res.json()
      setReport(data?.html || data?.report || JSON.stringify(data, null, 2))
      setStatus('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className={styles.parserWrapper}>
      {status === 'idle' && (
        <div className={styles.parserLoading}>
          <p className={styles.parserLoadingText}>
            Upload an IRS transcript PDF to generate a plain-English report instantly.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            style={{ display: 'none' }}
            id="transcript-upload"
          />
          <label
            htmlFor="transcript-upload"
            className={styles.btnPrimary}
            style={{ cursor: 'pointer', marginTop: '1rem' }}
          >
            Upload Transcript PDF →
          </label>
          <p className={styles.parserLoadingText} style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
            Sign in required. Transcript data never leaves your session.
          </p>
        </div>
      )}

      {status === 'uploading' && (
        <div className={styles.parserLoading}>
          <span className={styles.spinner} aria-hidden="true" />
          <p className={styles.parserLoadingText}>Parsing transcript…</p>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.parserLoading}>
          <p className={styles.parserLoadingText} style={{ color: '#f87171' }}>{error}</p>
          <button
            className={styles.btnSecondary}
            onClick={() => { setStatus('idle'); setError(null); }}
            style={{ marginTop: '1rem' }}
          >
            Try Again
          </button>
        </div>
      )}

      {status === 'done' && report && (
        <div
          className={styles.parserRoot}
          dangerouslySetInnerHTML={{ __html: report }}
        />
      )}
    </div>
  )
}
