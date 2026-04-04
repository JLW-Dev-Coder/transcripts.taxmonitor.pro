import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Brand column */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>TM</span>
            <span className={styles.logoText}>
              <span className={styles.logoName}>Transcript.Tax Monitor Pro</span>
              <span className={styles.logoSub}>Transcript automation</span>
            </span>
          </Link>

          <p className={styles.brandDesc}>
            IRS transcript automation that turns raw codes into clear, client-ready insights.
          </p>

          <div className={styles.brandActions}>
            <Link href="/#how-it-works" className={styles.btnPrimary}>Generate a report &rarr;</Link>
            <Link href="/assets/report-preview.html" className={styles.btnSecondary}>View sample report</Link>
          </div>
        </div>

        {/* Links column */}
        <div>
          <div className={styles.colTitle}>Links</div>
          <ul className={styles.navList}>
            <li><Link href="/contact" className={styles.navLink}>Contact</Link></li>
            <li><Link href="/features/" className={styles.navLink}>Features</Link></li>
            <li><Link href="/#how-it-works" className={styles.navLink}>How It Works</Link></li>
            <li><Link href="/pricing/" className={styles.navLink}>Pricing</Link></li>
            <li><Link href="/login" className={styles.navLink}>Sign In</Link></li>
            <li><Link href="/#use-cases" className={styles.navLink}>Use Cases</Link></li>
          </ul>
        </div>

        {/* Resources column */}
        <div>
          <div className={styles.colTitle}>Resources</div>
          <ul className={styles.navList}>
            <li><Link href="/resources/transcript-types" className={styles.navLink}>Accepted Transcripts</Link></li>
            <li><Link href="/resources/" className={styles.navLink}>Resources Hub</Link></li>
            <li><Link href="/resources/how-to-read-irs-transcripts" className={styles.navLink}>How to Read IRS Transcripts</Link></li>
            <li><Link href="/resources/transcript-codes/" className={styles.navLink}>Transcript Codes Database</Link></li>
            <li><Link href="/resources/transcript-orders" className={styles.navLink}>Transcript Order Walkthrough</Link></li>
          </ul>
          <div className={styles.divider} />
          <ul className={styles.navList}>
            <li><Link href="/magnets/guide" className={styles.navLink}>Free Guide</Link></li>
            <li><Link href="/affiliate" className={styles.navLink}>Affiliate Program</Link></li>
            <li>
              <a href="https://taxmonitor.pro" className={styles.navLink} target="_blank" rel="noopener noreferrer">
                Tax Monitor Pro
              </a>
            </li>
            <li>
              <a href="https://taxtools.taxmonitor.pro" className={styles.navLink} target="_blank" rel="noopener noreferrer">
                TaxTools Arcade
              </a>
            </li>
          </ul>
        </div>

        {/* Legal column */}
        <div>
          <div className={styles.colTitle}>Legal</div>
          <ul className={styles.navList}>
            <li><Link href="/legal/privacy/" className={styles.navLink}>Privacy</Link></li>
            <li><Link href="/legal/refund/" className={styles.navLink}>Refund</Link></li>
            <li><Link href="/legal/terms/" className={styles.navLink}>Terms</Link></li>
          </ul>
          <p className={styles.copyright} suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Transcript.Tax Monitor Pro
          </p>
        </div>

      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <span className={styles.bottomText} suppressHydrationWarning>&copy; {new Date().getFullYear()} Lenore, Inc.</span>
        <span className={styles.bottomText}>
          Earn 20% on every referral &mdash;{' '}
          <Link href="/affiliate" className={styles.affiliateLink}>Join the Affiliate Program</Link>
        </span>
      </div>
    </footer>
  )
}
