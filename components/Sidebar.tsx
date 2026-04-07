import type { Resource } from '@/lib/types'
import Link from 'next/link'
import styles from './Sidebar.module.css'

export default function Sidebar({ resource }: { resource: Resource }) {
  const isTranscriptCode = resource.category === 'transaction-code'

  return (
    <aside className={styles.sidebar}>

      {/* Card 1 — Related links */}
      {resource.related?.length > 0 && (
        <div className={styles.card}>
          <p className={styles.cardHeading}>
            {isTranscriptCode ? 'Related Codes' : 'Related'}
          </p>
          <ul className={styles.links}>
            {resource.related.map(slug => (
              <li key={slug}>
                <Link href={`/resources/${slug}/`} className={styles.link}>
                  {slug
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, c => c.toUpperCase())
                    .replace(/\bIrs\b/g, 'IRS')}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Card 2 — Parser CTA */}
      <div className={styles.card}>
        <p className={styles.cardHeading}>Transcript Parser</p>
        <p className={styles.cardBody}>
          Upload a client PDF — get every code explained in plain English in seconds.
        </p>
        <Link href="/login" className={styles.parserBtn}>
          Try the Parser →
        </Link>
      </div>

      {/* Card 3 — Utility links */}
      <div className={styles.card}>
        <p className={styles.cardHeading}>More</p>
        <ul className={styles.links}>
          <li><Link href="/pricing/" className={styles.link}>Pricing</Link></li>
          <li><Link href="/demo/" className={styles.link}>Book a Demo</Link></li>
          <li><Link href="/resources/transcript-codes/" className={styles.link}>All IRS Codes</Link></li>
        </ul>
      </div>

    </aside>
  )
}
