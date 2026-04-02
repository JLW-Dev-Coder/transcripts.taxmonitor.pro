import Link from 'next/link';
import styles from './SiteFooter.module.css';

const PLATFORM_LINKS = [
  { label: 'About',        href: '/about/'        },
  { label: 'Contact',      href: '/contact/'      },
  { label: 'Features',     href: '/features/'     },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing',      href: '/pricing/'      },
  { label: 'Resources',    href: '/resources/'    },
];

const RESOURCE_LINKS = [
  { label: 'Affiliates',      href: '/affiliates/',                            external: false },
  { label: 'Developers VLP',  href: 'https://developers.virtuallaunch.pro',    external: true  },
  { label: 'Games VLP',       href: 'https://games.virtuallaunch.pro',         external: true  },
  { label: 'Support',         href: '/contact/',                               external: false },
  { label: 'Tax Monitor Pro', href: 'https://taxmonitor.pro',                  external: true  },
  { label: 'Tax Tools Arcade',href: 'https://taxtools.taxmonitor.pro',         external: true  },
  { label: 'Virtual Launch Pro', href: 'https://virtuallaunch.pro',            external: true  },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy',   href: '/legal/privacy/' },
  { label: 'Refund Policy',    href: '/legal/refund/'  },
  { label: 'Terms of Service', href: '/legal/terms/'   },
];

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* Brand */}
        <div className={styles.brandCol}>
          <div className={styles.logoRow}>
            <span className={styles.logoMark}>TT</span>
            <span className={styles.brandName}>Transcript Tax Monitor</span>
          </div>
          <p className={styles.tagline}>Transcript automation for tax professionals</p>
          <p className={styles.description}>
            Upload a client's IRS transcript PDF and get a plain-English analysis report
            in seconds — with every transaction code explained and recommendations included.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/login/" className={styles.btnPrimary}>Try Free</Link>
            <Link href="/pricing/" className={styles.btnSecondary}>View Pricing</Link>
          </div>
        </div>

        {/* Platform */}
        <div className={styles.col}>
          <p className={styles.colHeading}>Platform</p>
          {PLATFORM_LINKS.map(l => (
            <Link key={l.label} href={l.href} className={styles.colLink}>{l.label}</Link>
          ))}
        </div>

        {/* Resources */}
        <div className={styles.col}>
          <p className={styles.colHeading}>Resources</p>
          {RESOURCE_LINKS.map(l => (
            l.external
              ? <a key={l.label} href={l.href} className={styles.colLink} target="_blank" rel="noopener noreferrer">{l.label}</a>
              : <Link key={l.label} href={l.href} className={styles.colLink}>{l.label}</Link>
          ))}
        </div>

        {/* Legal */}
        <div className={styles.col}>
          <p className={styles.colHeading}>Legal</p>
          {LEGAL_LINKS.map(l => (
            <Link key={l.label} href={l.href} className={styles.colLink}>{l.label}</Link>
          ))}
          <p className={styles.copyright}>© 2026 Lenore, Inc. All rights reserved.</p>
        </div>

      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <span className={styles.bottomLeft}>© 2026 Lenore, Inc.</span>
        <span className={styles.bottomLeft}>
          Earn 20% on every referral —{' '}
          <a href="/affiliates/" className={styles.affiliateLink}>Join the Affiliate Program</a>
        </span>
      </div>
    </footer>
  );
}
