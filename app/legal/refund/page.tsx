import Link from 'next/link'
import type { Metadata } from 'next'
import styles from '../legal.module.css'

const CANONICAL_BASE = 'https://transcript.taxmonitor.pro'

export const metadata: Metadata = {
  title: 'Refund Policy - Transcript Tax Monitor Pro',
  description:
    'Refund policy for Transcript Tax Monitor Pro transcript credit packs and related purchases.',
  alternates: { canonical: `${CANONICAL_BASE}/legal/refund` },
  openGraph: {
    title: 'Refund Policy - Transcript Tax Monitor Pro',
    description:
      'Refund policy for Transcript Tax Monitor Pro transcript credit packs and related purchases.',
    url: `${CANONICAL_BASE}/legal/refund`,
    type: 'website',
  },
}

export default function RefundPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Refund Policy</h1>
          <p className={styles.lastUpdated}>Last updated: March 7, 2026</p>
        </div>

        <div className={styles.glassCard}>
          <section className={styles.section}>
            <p className={styles.body}>
              This Refund Policy applies to purchases made on Transcript.Tax Monitor Pro, including transcript credit packs and related digital access purchases. If you need help, use{' '}
              <Link href="/contact/" className={styles.accentLink}>Contact Support</Link>.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>A. What You&apos;re Buying</h2>
            <ul className={styles.list}>
              <li><span className={styles.strong}>Transcript credit packs</span> can be used to access transcript-related features and reports on the platform.</li>
              <li><span className={styles.strong}>Credits are digital-use balances</span>, not a bank account, stored value account, or cash equivalent.</li>
              <li>Purchased access is delivered <span className={styles.strong}>digitally through your account</span>. There are no shipped physical goods.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>B. General Rule</h2>
            <p className={styles.body}>
              Because transcript credits and related access are digital products that can be provisioned and used immediately, purchases are generally <span className={styles.strong}>non-refundable once credits or access are delivered</span> to your account.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>C. When We May Approve a Refund</h2>
            <p className={styles.bodySpaced}>We may approve a refund, credit, or adjustment in situations like:</p>
            <ul className={styles.list}>
              <li><span className={styles.strong}>Duplicate charge</span> for the same purchase.</li>
              <li><span className={styles.strong}>Unrecognized charge</span> that appears to be unauthorized, subject to verification and payment processor rules.</li>
              <li><span className={styles.strong}>Technical failure</span> where credits were purchased but never delivered to the account.</li>
              <li><span className={styles.strong}>Verified system error</span> that caused improper credit deduction or prevented reasonable access and cannot be resolved.</li>
            </ul>
            <p className={styles.bodySmall}>Approvals are case-by-case and may require supporting details.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>D. When We Don&apos;t Refund</h2>
            <p className={styles.bodySpaced}>Refunds are not typically provided for:</p>
            <ul className={styles.list}>
              <li><span className={styles.strong}>Change of mind</span> after credits or access are delivered.</li>
              <li><span className={styles.strong}>Used or partially used credits</span>.</li>
              <li><span className={styles.strong}>Failure to sign in</span> to the correct account email used for purchase.</li>
              <li><span className={styles.strong}>User-side device, browser, or extension issues</span> where the platform is otherwise functioning and support troubleshooting is available.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>E. How to Request a Refund</h2>
            <ol className={styles.listOrdered}>
              <li>Submit a request through <Link href="/contact/" className={styles.accentLink}>Contact Support</Link>.</li>
              <li>Include your account email and approximate purchase date and time.</li>
              <li>If available, include the receipt details and any relevant token, report, or transaction identifiers.</li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>F. Chargebacks</h2>
            <p className={styles.body}>
              Initiating a chargeback or payment dispute for a platform purchase may result in temporary restriction or suspension of access while the matter is investigated.
            </p>
          </section>

          <section className={styles.sectionLast}>
            <h2 className={styles.sectionTitle}>G. Policy Changes</h2>
            <p className={styles.body}>
              We may update this policy from time to time. The &ldquo;Last updated&rdquo; date will reflect the most recent revision.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
