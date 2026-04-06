import type { Resource } from '@/lib/types'
import Link from 'next/link'
import Sidebar from './Sidebar'
import CTA from './CTA'
import TaxpayerCTA from './TaxpayerCTA'
import styles from './ResourceLayout.module.css'

export default function ResourceLayout({
  resource,
  children,
}: {
  resource: Resource
  children: React.ReactNode
}) {
  const categoryLabel = resource.category
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className={styles.wrapper}>
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.bcLink}>Home</Link>
          <span className={styles.bcSep}>/</span>
          <Link href="/resources/" className={styles.bcLink}>Resources</Link>
          <span className={styles.bcSep}>/</span>
          {resource.category === 'transaction-code' && (
            <>
              <Link href="/resources/transcript-codes/" className={styles.bcLink}>IRS Codes</Link>
              <span className={styles.bcSep}>/</span>
            </>
          )}
          <span className={styles.bcCurrent}>{resource.title}</span>
        </nav>
        {resource.category === 'transaction-code' && (
          <span className={styles.heroBadge}>
            <span className={styles.heroBadgeBold}>IRS Transcript Codes</span>
            <span className={styles.heroBadgeSep}>&middot;</span>
            Built for 750,000+ U.S. Tax Professionals
          </span>
        )}
        <span className={styles.category}>{categoryLabel}</span>
        <h1 className={styles.title}>{resource.title}</h1>
        {resource.description && (
          <p className={styles.description}>{resource.description}</p>
        )}
        {resource.category === 'transaction-code' ? (
          <div className={styles.ctaRow}>
            <button type="button" data-open-sample className={styles.ctaPrimary}>
              Try the parser (requires credits)
            </button>
            <a href="/demo" className={styles.ctaSecondary}>
              View sample report
            </a>
          </div>
        ) : (
          <CTA type={resource.cta} variant="inline" />
        )}
        <div className={styles.content}>{children}</div>
        <TaxpayerCTA />
        <CTA type={resource.cta} variant="post-content" />
      </main>
      <Sidebar resource={resource} />
    </div>
  )
}
