'use client'

import styles from './page.module.css'

export default function ParserSection() {
  return (
    <div className={styles.parserWrapper}>
      <div className={styles.parserLoading}>
        <p className={styles.parserLoadingText}>
          Parser coming soon — upload your IRS transcript PDF and get a plain-English report in seconds.
        </p>
      </div>
    </div>
  )
}
