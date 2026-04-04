import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'

const CANONICAL_BASE = 'https://transcript.taxmonitor.pro'

export const metadata: Metadata = {
  title: 'Affiliate Program - Earn 20% on Every Referral',
  description:
    'Join the VLP affiliate program: earn 20% flat commission on every purchase your referrals make, for life. Cash payouts via Stripe Connect.',
  alternates: { canonical: `${CANONICAL_BASE}/affiliate` },
  openGraph: {
    title: 'Affiliate Program - Earn 20% on Every Referral',
    description:
      'Join the VLP affiliate program: earn 20% flat commission on every purchase your referrals make, for life.',
    url: `${CANONICAL_BASE}/affiliate`,
    type: 'website',
  },
}

const STEPS = [
  {
    number: '1',
    title: 'Create your free account',
    body: 'Sign up for a VLP account. No credit card required, no minimum purchase to become an affiliate.',
  },
  {
    number: '2',
    title: 'Get your referral code',
    body: 'Your unique referral link is generated automatically. Share it on your site, in emails, or with colleagues.',
  },
  {
    number: '3',
    title: 'Earn on every purchase',
    body: 'When someone signs up through your link and buys anything on any VLP platform, you earn 20% — every time, forever.',
  },
]

const DETAILS = [
  { title: '20% flat commission', body: 'On all purchases across every VLP platform — no caps, no tiers, no fine print.' },
  { title: 'Lifetime attribution', body: 'Once a referral is yours, every future purchase they make earns you commission.' },
  { title: 'All products included', body: 'Transcript Tax Monitor Pro, TaxTools, and any future VLP products.' },
  { title: 'Cash payouts', body: 'Withdraw earnings directly to your bank via Stripe Connect Express.' },
  { title: 'Real-time dashboard', body: 'Track clicks, signups, purchases, and earnings from your VLP account.' },
  { title: 'No minimum payout', body: 'Request a payout whenever your balance is ready — no thresholds to clear.' },
]

function CheckIcon() {
  return (
    <svg className={styles.detailIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function AffiliatePage() {
  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.badge}>Affiliate Program</div>
          <h1 className={styles.heroTitle}>Earn 20% on Every Referral — For Life</h1>
          <p className={styles.heroSub}>
            Share Transcript Tax Monitor Pro with tax professionals in your network
            and earn 20% flat commission on every purchase they ever make. Lifetime
            attribution. Cash payouts via Stripe.
          </p>
          <div className={styles.heroCtas}>
            <a href="https://virtuallaunch.pro/register" className={styles.btnPrimary}>
              Create Your Free Account
            </a>
            <Link href="/" className={styles.btnSecondary}>
              Learn More About TTMP
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSub}>
            Three steps. No approvals, no waiting periods, no minimum audience size.
          </p>
          <div className={styles.stepsGrid}>
            {STEPS.map((step) => (
              <div key={step.number} className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.number}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program details */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Program Details</h2>
          <p className={styles.sectionSub}>
            Designed to be simple, transparent, and worth your time.
          </p>
          <ul className={styles.detailsList}>
            {DETAILS.map((d) => (
              <li key={d.title} className={styles.detailItem}>
                <CheckIcon />
                <p className={styles.detailText}>
                  <strong>{d.title}.</strong> {d.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className={styles.ctaBand}>
        <div className={styles.ctaBandInner}>
          <h2 className={styles.ctaBandTitle}>Ready to start earning?</h2>
          <p className={styles.ctaBandBody}>
            Create a free VLP account, grab your referral link, and start earning
            20% on every purchase your referrals make — no caps, no expiration.
          </p>
          <div className={styles.ctaCtas}>
            <a href="https://virtuallaunch.pro/register" className={styles.btnPrimary}>
              Create Your Free Account
            </a>
            <Link href="/" className={styles.btnSecondary}>
              Learn More About TTMP
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
