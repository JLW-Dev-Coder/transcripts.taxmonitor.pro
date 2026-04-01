'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

interface CodeEntry {
  slug: string
  code: string
  title: string
  description: string
}

export default function CodesClient({ codes }: { codes: CodeEntry[] }) {
  const [query, setQuery] = useState('')

  const filtered = query
    ? codes.filter(
        (c) =>
          c.code.includes(query) ||
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase())
      )
    : codes

  return (
    <>
      <input
        type="text"
        className={styles.search}
        placeholder="Search by code number, title, or keyword..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className={styles.grid}>
        {filtered.length === 0 && (
          <p className={styles.empty}>No codes match &ldquo;{query}&rdquo;</p>
        )}
        {filtered.map((c) => (
          <Link
            key={c.slug}
            href={`/resources/${c.slug}`}
            className={styles.card}
          >
            <span className={styles.codeNum}>Code {c.code}</span>
            <p className={styles.cardTitle}>{c.title}</p>
            <p className={styles.cardDesc}>{c.description}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
