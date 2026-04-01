'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

interface CodeItem {
  slug: string
  title: string
  description: string
  code: string
}

export default function CodesClient({ items }: { items: CodeItem[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return items
    return items.filter(item =>
      item.code.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    )
  }, [query, items])

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchRow}>
        <input
          type="text"
          placeholder="Search by code number or keyword..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className={styles.searchInput}
          autoFocus
        />
        <span className={styles.count}>
          {filtered.length} of {items.length} codes
        </span>
      </div>

      <div className={styles.grid}>
        {filtered.map(item => (
          <Link
            key={item.slug}
            href={'/resources/' + item.slug + '/'}
            className={styles.card}
          >
            <span className={styles.codeNum}>{item.code}</span>
            <span className={styles.codeTitle}>{item.title}</span>
            {item.description && (
              <span className={styles.codeDesc}>{item.description}</span>
            )}
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>
          <p>No codes found for &ldquo;{query}&rdquo;</p>
          <button
            onClick={() => setQuery('')}
            className={styles.clearBtn}
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  )
}
