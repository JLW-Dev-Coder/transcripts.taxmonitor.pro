'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import styles from './Header.module.css'

const NAV_LINKS = [
  { label: 'About',        href: '/about' },
  { label: 'Features',     href: '/features/' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing',      href: '/pricing/' },
  { label: 'Contact',      href: '/contact' },
]

const MEGA_COLUMNS = [
  {
    title: 'Discover',
    links: [
      { label: 'About',                    desc: 'Why Transcript Tax Monitor Pro exists',                            href: '/about' },
      { label: 'Contact',                  desc: 'Talk to our team or start intake',                                 href: '/contact' },
      { label: 'Resource Guide',           desc: 'Guides, explainers, and comparisons for transcript-driven practices', href: '/resources/' },
      { label: 'Transcript Codes Database',desc: 'Every IRS transaction code decoded in plain English',              href: '/resources/transcript-codes/' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Features',                     desc: '', href: '/features/' },
      { label: 'How It Works',                 desc: '', href: '/#how-it-works' },
      { label: 'Pricing',                      desc: '', href: '/pricing/' },
      { label: 'Help Center',                  desc: '', href: '/app/support' },
      { label: 'How to Read IRS Transcripts',  desc: '', href: '/resources/how-to-read-irs-transcripts' },
    ],
  },
  {
    title: 'Tools & Extras',
    links: [
      { label: 'Transcript Types',                          desc: '', href: '/resources/transcript-types' },
      { label: 'Order Walkthrough',                         desc: '', href: '/resources/transcript-orders' },
      { label: 'IRS Phone Numbers',                         desc: '', href: '/resources/irs-phone-numbers' },
      { label: 'IRS Transaction Codes Guide',               desc: '', href: '/resources/irs-transcript-codes-explained-in-plain-english' },
      { label: 'Section 7216 AI Consent',                   desc: '', href: '/magnets/section-7216' },
    ],
  },
]

export default function Header() {
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileResOpen, setMobileResOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setResourcesOpen(false)
      }
    }
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setResourcesOpen(false)
        setMobileOpen(false)
        setMobileResOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  function closeMega() { setResourcesOpen(false) }
  function closeAll()  { setMobileOpen(false); setMobileResOpen(false) }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>TM</span>
          <span className={styles.logoText}>
            <span className={styles.logoName}>Transcript.Tax Monitor Pro</span>
            <span className={styles.logoSub}>Transcript automation</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav}>
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}

          {/* Resources dropdown trigger */}
          <div className={styles.dropdownWrap} ref={dropdownRef}>
            <button
              className={styles.dropdownTrigger}
              aria-expanded={resourcesOpen}
              aria-haspopup="true"
              onClick={() => setResourcesOpen(v => !v)}
            >
              Resources
              <svg
                className={`${styles.chevron} ${resourcesOpen ? styles.chevronOpen : ''}`}
                width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
              >
                <path d="M2.5 5L7 9.5L11.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Mega menu panel */}
            <div className={`${styles.dropdown} ${resourcesOpen ? styles.dropdownOpen : ''}`} role="menu">
              {MEGA_COLUMNS.map(col => (
                <div key={col.title} className={styles.megaCol}>
                  <div className={styles.megaColTitle}>{col.title}</div>
                  {col.links.map(link => (
                    <Link key={link.href} href={link.href} className={styles.megaLink} onClick={closeMega}>
                      <span className={styles.megaLinkLabel}>{link.label}</span>
                      {link.desc && <span className={styles.megaLinkDesc}>{link.desc}</span>}
                    </Link>
                  ))}
                </div>
              ))}

              {/* CTA section */}
              <div className={styles.megaCta}>
                <p className={styles.megaCtaText}>
                  Need human review before a transcript issue becomes a client fire drill?
                </p>
                <Link href="/magnets/guide" className={styles.btnPrimary} onClick={closeMega}>
                  Free Guide &rarr;
                </Link>
                <Link href="/login" className={styles.megaCtaLogin} onClick={closeMega}>
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Right actions */}
        <div className={styles.actions}>
          <Link href="/login" className={styles.loginLink}>Log In</Link>
          <Link href="/magnets/guide" className={styles.btnPrimary}>Free Guide &rarr;</Link>
        </div>

        {/* Hamburger */}
        <button
          className={styles.hamburger}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
        >
          <span className={`${styles.hamburgerBar} ${mobileOpen ? styles.hamburgerBarOpen1 : ''}`} />
          <span className={`${styles.hamburgerBar} ${mobileOpen ? styles.hamburgerBarOpen2 : ''}`} />
          <span className={`${styles.hamburgerBar} ${mobileOpen ? styles.hamburgerBarOpen3 : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`}>
        {NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href} className={styles.mobileLink} onClick={closeAll}>{link.label}</Link>
        ))}

        {/* Mobile resources accordion */}
        <button
          className={styles.mobileAccordionTrigger}
          onClick={() => setMobileResOpen(v => !v)}
          aria-expanded={mobileResOpen}
        >
          Resources
          <svg
            className={`${styles.chevron} ${mobileResOpen ? styles.chevronOpen : ''}`}
            width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
          >
            <path d="M2.5 5L7 9.5L11.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {mobileResOpen && (
          <div className={styles.mobileAccordionPanel}>
            {MEGA_COLUMNS.map(col => (
              <div key={col.title} className={styles.mobileAccordionSection}>
                <div className={styles.mobileAccordionTitle}>{col.title}</div>
                {col.links.map(link => (
                  <Link key={link.href} href={link.href} className={styles.mobileAccordionLink} onClick={closeAll}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className={styles.mobileDivider} />
        <Link href="/login" className={styles.mobileLink} onClick={closeAll}>Log In</Link>
        <Link href="/magnets/guide" className={styles.mobileCta} onClick={closeAll}>Free Guide &rarr;</Link>
      </div>
    </header>
  )
}
