import Link from 'next/link'
import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import styles from './lead-magnet.module.css'
import LeadMagnetForm from './LeadMagnetForm'

const CANONICAL_BASE = 'https://transcript.taxmonitor.pro'

export const metadata: Metadata = {
  title: 'Free IRS Transcript Code Guide - Transcript Tax Monitor Pro',
  description:
    'Download the free IRS transcript code guide. All 150+ transaction codes explained with real examples and action steps.',
  alternates: { canonical: `${CANONICAL_BASE}/magnets/lead-magnet` },
  openGraph: {
    title: 'Free IRS Transcript Code Guide - Transcript Tax Monitor Pro',
    description:
      'Download the free IRS transcript code guide. All 150+ transaction codes explained with real examples and action steps.',
    url: `${CANONICAL_BASE}/magnets/lead-magnet`,
    type: 'website',
  },
}

const CHECKS = [
  {
    label: 'Complete Code Reference',
    sub: 'All 150+ IRS transcript codes explained in plain English',
  },
  {
    label: 'Quick Reference Chart',
    sub: 'Printable cheat sheet for your desk',
  },
  {
    label: 'Real Client Scenarios',
    sub: 'See how codes appear in actual transcripts with annotations',
  },
  {
    label: 'Red Flag Alerts',
    sub: 'Codes that require immediate attention highlighted',
  },
]

export default function LeadMagnetPage() {
  return (
    <div className={styles.page}>
      <SiteHeader />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          {/* Left */}
          <div className={styles.left}>
            <div className={styles.badge}>
              <svg
                width="16"
                height="16"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19a2 2 0 0 0 2 2h12" />
                <path d="M6 2h12a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
                <path d="M8 6h8" />
                <path d="M8 10h8" />
                <path d="M8 14h6" />
              </svg>
              FREE DOWNLOAD
            </div>

            <h1 className={styles.h1}>
              The Ultimate Guide to IRS Transcript Codes
            </h1>

            <p className={styles.body}>
              Stop guessing what those cryptic codes mean. Our comprehensive
              32-page guide breaks down every transcript code you&apos;ll encounter,
              complete with real-world examples and action steps.
            </p>

            <div className={styles.checks}>
              {CHECKS.map((item) => (
                <div key={item.label} className={styles.checkItem}>
                  <div className={styles.checkIcon} aria-hidden="true">✓</div>
                  <div>
                    <p className={styles.checkLabel}>{item.label}</p>
                    <p className={styles.checkSub}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form (client component) */}
          <LeadMagnetForm />
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
