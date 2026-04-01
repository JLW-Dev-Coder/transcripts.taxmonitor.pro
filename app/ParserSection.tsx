'use client'

import { useState, useRef } from 'react'
import styles from './page.module.css'

export default function ParserSection() {
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File | null) {
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.')
      return
    }
    sessionStorage.setItem('pending_transcript_name', file.name)
    window.location.href = '/login?redirect=/app/dashboard&action=parse'
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] ?? null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0] ?? null)
  }

  return (
    <div className={styles.parserWrapper}>
      <div
        className={styles.parserLoading}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={dragging ? { borderColor: 'var(--accent)', background: 'rgba(20,184,166,0.04)' } : {}}
      >
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: 'rgba(20,184,166,0.12)',
          border: '1px solid rgba(20,184,166,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.5rem',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <polyline points="9 15 12 12 15 15"/>
          </svg>
        </div>

        <p className={styles.parserLoadingText} style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Upload a Transcript — Get a Plain-English Report
        </p>
        <p className={styles.parserLoadingText}>
          Drop your IRS transcript PDF here or click to upload. Sign in to parse and save reports.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          onChange={handleChange}
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
          Free account required. No credit card needed. Transcript data never stored without consent.
        </p>
      </div>
    </div>
  )
}
