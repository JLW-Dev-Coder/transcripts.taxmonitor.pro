import type { Resource } from '@/lib/types'
import Link from 'next/link'
import CTA from './CTA'
import styles from './Sidebar.module.css'

export default function Sidebar({ resource }: { resource: Resource }) {
  return (
    <aside className={styles.sidebar}>
      <CTA type={resource.cta} variant="sidebar" />
      {resource.related?.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Related</p>
          <ul className={styles.links}>
            {resource.related.map(slug => (
              <li key={slug}>
                <Link href={`/resources/${slug}`}>
                  {slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className={styles.utilLinks}>
        <Link href="/pricing">Pricing</Link>
        <Link href="/demo">Book Demo</Link>
      </div>
    </aside>
  )
}
