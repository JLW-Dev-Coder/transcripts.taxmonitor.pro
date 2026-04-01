'use client'

import styles from './page.module.css'

export default function ParserSection() {
  return (
    <div className={styles.parserWrapper}>
      <div className={styles.parserLoading}>
        <p className={styles.parserLoadingText} style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          IRS Transcript Parser
        </p>
        <p className={styles.parserLoadingText}>
          Sign in to upload a transcript and get a plain-English report in seconds.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/login" className={styles.btnPrimary}>
            Sign In to Use Parser →
          </a>
          <a href="/app/dashboard" className={styles.btnSecondary}>
            Go to Dashboard
          </a>
        </div>
        <p className={styles.parserLoadingText} style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
          New? Sign in with your email — no password required.
        </p>
      </div>
    </div>
  )
}
