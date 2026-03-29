import type { Metadata } from 'next'
import Link from 'next/link'
import PricingGrid from './PricingGrid'
import styles from './product.module.css'

export const metadata: Metadata = {
  title: 'Transcript Tax Monitor Pro - Product',
  description:
    'Turn IRS transcript chaos into a client-ready report. Parse PDFs locally, interpret TC patterns, and generate clean summaries for tax professionals.',
  alternates: {
    canonical: 'https://transcript.taxmonitor.pro/product',
  },
  openGraph: {
    title: 'Transcript Tax Monitor Pro - Product',
    description:
      'Turn IRS transcript chaos into a client-ready report. Parse PDFs locally, interpret TC patterns, and generate clean summaries for tax professionals.',
    url: 'https://transcript.taxmonitor.pro/product',
    siteName: 'Transcript Tax Monitor Pro',
    type: 'website',
  },
}

const FEATURE_CARDS = [
  {
    title: 'Local PDF parsing',
    body: 'Parse on-device so client transcript data does not get uploaded to random servers.',
  },
  {
    title: 'Plain-English summary',
    body: "Turn 'what does this mean?' into a clean explanation you can send as a deliverable.",
  },
  {
    title: 'Client-ready report format',
    body: 'A polished layout so the transcript never has to be shown to the client again.',
  },
  {
    title: 'Branded output',
    body: 'Add your logo so your deliverable looks like your firm made it (because it did).',
  },
  {
    title: 'Fast turnaround',
    body: 'Generate a consistent summary in minutes, not a 30-minute copy/paste spiral.',
  },
  {
    title: 'Private by design',
    body: 'You keep control of the PDF. The tool does not need to \u201cphone home\u201d to be useful.',
  },
]

export default function ProductPage() {
  return (
    <div className={styles.page}>

      {/* Product-specific sticky nav */}
      <nav className={styles.productNav}>
        <div className={styles.productNavInner}>
          <Link href="/" className={styles.productNavLogo}>
            <span className={styles.logoMark}>TM</span>
            <span className={styles.logoText}>About product</span>
          </Link>
          <div className={styles.productNavActions}>
            <Link href="/" className={styles.productNavBack}>&#8592; Back</Link>
            <a href="#pricing" className={styles.btnPrimary}>Buy Credits</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.badge}>Transcript automation for tax pros</div>
          <h1 className={styles.heroTitle}>
            Turn IRS transcript chaos into a client-ready report
          </h1>
          <p className={styles.heroSub}>
            Parse PDFs locally (no uploads), interpret common TC patterns, and generate a clean
            summary you can send without writing the same explanation 50 times.
          </p>
          <div className={styles.heroCtas}>
            <a href="/#how-it-works" className={styles.btnSecondary}>Try the parser</a>
            <a href="#pricing" className={styles.btnPrimary}>Buy credits &rarr;</a>
          </div>
          <div className={styles.trustBadges}>
            <span className={styles.trustBadge}>Runs locally</span>
            <span className={styles.trustDot} aria-hidden="true" />
            <span className={styles.trustBadge}>No subscriptions</span>
            <span className={styles.trustDot} aria-hidden="true" />
            <span className={styles.trustBadge}>Credits apply instantly</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionBadge}>What you get</div>
          <h2 className={styles.sectionTitle}>Built for the boring, repetitive part of your job</h2>
          <p className={styles.sectionSub}>
            You still do the thinking. This handles the transcript grunt work.
          </p>
          <div className={styles.featureGrid}>
            {FEATURE_CARDS.map((card) => (
              <div key={card.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardBody}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingGrid />

      {/* CTA Band */}
      <section className={styles.ctaBand}>
        <div className={styles.ctaBandInner}>
          <h2 className={styles.ctaBandTitle}>Want to see the report layout first?</h2>
          <p className={styles.ctaBandSub}>
            Preview the client-facing format, then buy credits when you are ready.
          </p>
          <div className={styles.ctaBandActions}>
            <a href="/assets/report-preview.html" className={styles.btnSecondary}>Preview report</a>
            <a href="#pricing" className={styles.btnPrimary}>Buy credits &rarr;</a>
          </div>
        </div>
      </section>

    </div>
  )
}
