import Link from 'next/link'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Transcript Tax Monitor Pro
        </Link>
        <nav className={styles.nav}>
          <Link href="/resources/how-to-read-irs-transcripts">Guides</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/demo">Book Demo</Link>
          <Link href="/login" className={styles.loginBtn}>Log In</Link>
        </nav>
      </div>
    </header>
  )
}
