import Link from 'next/link'
import styles from './page.module.css'

const FEATURED_RESOURCES = [
  { slug: 'irs-code-150-meaning', label: 'IRS Code 150' },
  { slug: 'irs-code-570-meaning', label: 'IRS Code 570' },
  { slug: 'how-to-read-irs-transcripts', label: 'How to Read IRS Transcripts' },
  { slug: 'canopy-vs-transcript-tax-monitor-pro', label: 'Canopy vs TTMP' },
]

const STATS = [
  { value: '400+', label: 'IRS Code Pages' },
  { value: '100%', label: 'Static & Fast' },
  { value: '455', label: 'Resource Guides' },
]

export default function HomePage() {
  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.badge}>IRS Transcript Automation</div>
          <h1 className={styles.heroTitle}>
            Read IRS Transcripts<br />
            <span className={styles.accent}>In Seconds, Not Hours</span>
          </h1>
          <p className={styles.heroSub}>
            Transcript Tax Monitor Pro decodes IRS transaction codes, flags issues,
            and generates plain-English summaries for tax professionals.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/demo" className={styles.btnPrimary}>Book a Demo →</Link>
            <Link href="/pricing" className={styles.btnSecondary}>See Pricing</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        {STATS.map(s => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* Featured Resources */}
      <section className={styles.resources}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>IRS Transcript Resources</h2>
          <p className={styles.sectionSub}>
            Free guides for tax professionals — no login required.
          </p>
          <div className={styles.resourceGrid}>
            {FEATURED_RESOURCES.map(r => (
              <Link key={r.slug} href={`/resources/${r.slug}`} className={styles.resourceCard}>
                <span className={styles.resourceLabel}>{r.label}</span>
                <span className={styles.resourceArrow}>→</span>
              </Link>
            ))}
            <Link href="/resources/account-transcript-explained" className={styles.resourceCard}>
              <span className={styles.resourceLabel}>Account Transcript Explained</span>
              <span className={styles.resourceArrow}>→</span>
            </Link>
            <Link href="/resources/how-to-understand-irs-transaction-codes" className={styles.resourceCard}>
              <span className={styles.resourceLabel}>IRS Transaction Codes Guide</span>
              <span className={styles.resourceArrow}>→</span>
            </Link>
          </div>
          <div className={styles.allResources}>
            <Link href="/resources/irs-code-150-meaning" className={styles.btnSecondary}>
              Browse All Resources →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className={styles.ctaBand}>
        <div className={styles.ctaBandInner}>
          <h2 className={styles.ctaBandTitle}>Stop Reading Transcripts Manually</h2>
          <p className={styles.ctaBandSub}>
            Let TTMP decode codes, flag holds, and summarize transcripts instantly.
          </p>
          <Link href="/demo" className={styles.btnPrimary}>Book a Demo →</Link>
        </div>
      </section>

    </div>
  )
}
