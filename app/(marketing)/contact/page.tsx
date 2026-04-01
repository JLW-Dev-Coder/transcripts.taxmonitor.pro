import type { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from './ContactForm'
import styles from './contact.module.css'

const CANONICAL_BASE = 'https://transcript.taxmonitor.pro'

export const metadata: Metadata = {
  title: 'Contact Support - Transcript Tax Monitor Pro',
  description:
    'Contact Transcript Tax Monitor Pro support for help with transcript parsing, reports, credits, and product questions.',
  alternates: { canonical: `${CANONICAL_BASE}/contact` },
  openGraph: {
    title: 'Contact Support - Transcript Tax Monitor Pro',
    description:
      'Contact Transcript Tax Monitor Pro support for help with transcript parsing, reports, credits, and product questions.',
    url: `${CANONICAL_BASE}/contact`,
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <ContactForm />

      {/* CTA Band */}
      <section className={styles.ctaBand}>
        <div className={styles.ctaBandInner}>
          <h2 className={styles.ctaBandTitle}>Want answers before opening a ticket?</h2>
          <p className={styles.ctaBandSub}>
            Many transcript workflow questions are solved faster by checking the product flow first.
            If the issue is still blocking you, send the ticket and we&apos;ll handle it.
          </p>
          <div className={styles.ctaBandActions}>
            <Link href="/#how-it-works" className={styles.btnPrimary}>
              See How It Works
            </Link>
            <Link href="/pricing" className={styles.btnSecondary}>
              View Pricing
            </Link>
          </div>
          <p className={styles.ctaNote}>
            Credits available instantly • Support replies by email • Transcript-focused help
          </p>
        </div>
      </section>
    </div>
  )
}
