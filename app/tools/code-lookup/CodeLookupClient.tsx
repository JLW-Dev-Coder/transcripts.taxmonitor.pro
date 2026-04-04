'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CodeEntry } from '@/lib/getCodeIndex'
import styles from './page.module.css'

export default function CodeLookupClient({
  codes,
  popular,
}: {
  codes: CodeEntry[]
  popular: CodeEntry[]
}) {
  const [query, setQuery] = useState('')

  const trimmed = query.trim()
  const filtered = trimmed
    ? codes.filter(c => c.code.startsWith(trimmed))
    : null

  const display = filtered ?? popular
  const isSearch = filtered !== null

  return (
    <div className={styles.page}>
      <h1 className={styles.headline}>IRS Transaction Code Lookup</h1>
      <p className={styles.subheadline}>
        Enter any IRS transaction code and get a plain-English explanation
        &mdash; free, no account needed.
      </p>

      <div className={styles.inputWrap}>
        <input
          className={styles.input}
          type="text"
          inputMode="numeric"
          placeholder="Enter a code (e.g., 971)"
          value={query}
          onChange={e => setQuery(e.target.value.replace(/\D/g, ''))}
          autoFocus
        />
      </div>

      <p className={styles.label}>
        {isSearch
          ? `${display.length} result${display.length !== 1 ? 's' : ''}`
          : 'Popular codes'}
      </p>

      {display.length > 0 ? (
        <div className={styles.results}>
          {display.map(entry => (
            <Link
              key={entry.code}
              href={`/resources/${entry.slug}/`}
              className={styles.card}
            >
              <div className={styles.cardTop}>
                <span className={styles.codeNum}>{entry.code}</span>
                <span className={styles.codeTitle}>{entry.title}</span>
              </div>
              <p className={styles.codeDesc}>
                {entry.description.length > 160
                  ? entry.description.slice(0, 160) + '…'
                  : entry.description}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>
          No IRS code found for &ldquo;{trimmed}&rdquo;. Try a different number.
        </p>
      )}
    </div>
  )
}
