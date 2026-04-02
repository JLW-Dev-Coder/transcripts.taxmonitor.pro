import type { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from './ContactForm'
import styles from './contact.module.css'
import CtaBand from '@/components/CtaBand'

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

      <CtaBand
        title="Need to analyze a transcript first?"
        body="While you wait for a response, use the parser to turn any IRS transcript into a plain-English report in seconds."
        primaryLabel="Try the Parser"
        primaryHref="/app/dashboard/"
        secondaryLabel="Browse Resources"
        secondaryHref="/resources/"
      />
    </div>
  )
}
