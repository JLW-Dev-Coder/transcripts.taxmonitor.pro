'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import styles from './Header.module.css'

export default function Header() {
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
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
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [])

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
          <Link href="/about">About</Link>
          <Link href="/#features">Features</Link>
          <Link href="/#how-it-works">How It Works</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/contact">Contact</Link>

          {/* Resources dropdown trigger */}
          <div className={styles.dropdownWrap} ref={dropdownRef}>
            <button
              className={styles.dropdownTrigger}
              aria-expanded={resourcesOpen}
              aria-haspopup="true"
              onClick={() => setResourcesOpen((v) => !v)}
            >
              Resources
              <svg
                className={`${styles.chevron} ${resourcesOpen ? styles.chevronOpen : ''}`}
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path d="M2.5 5L7 9.5L11.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Mega menu panel */}
            <div className={`${styles.dropdown} ${resourcesOpen ? styles.dropdownOpen : ''}`} role="menu">
              {/* DISCOVER */}
              <div className={styles.megaCol}>
                <div className={styles.megaColTitle}>Discover</div>
                <Link href="/about" className={styles.megaLink} onClick={() => setResourcesOpen(false)}>
                  <span className={styles.megaLinkLabel}>About</span>
                  <span className={styles.megaLinkDesc}>Why Transcript Tax Monitor Pro exists</span>
                </Link>
                <Link href="/contact" className={styles.megaLink} onClick={() => setResourcesOpen(false)}>
                  <span className={styles.megaLinkLabel}>Contact</span>
                  <span className={styles.megaLinkDesc}>Talk to our team or get help</span>
                </Link>
                <Link href="/magnets/section-7216-dislcosure.html" className={styles.megaLink} onClick={() => setResourcesOpen(false)}>
                  <span className={styles.megaLinkLabel}>AI + Tax Pro Consent</span>
                  <span className={styles.megaLinkDesc}>AI language for practice and compliance</span>
                </Link>
                <Link href="/resources/irs-code-150-meaning" className={styles.megaLink} onClick={() => setResourcesOpen(false)}>
                  <span className={styles.megaLinkLabel}>Resources Hub</span>
                  <span className={styles.megaLinkDesc}>Guides, workflows, comparisons</span>
                </Link>
              </div>

              {/* LEARN */}
              <div className={styles.megaCol}>
                <div className={styles.megaColTitle}>Learn</div>
                <Link href="/#features" className={styles.megaLink} onClick={() => setResourcesOpen(false)}>
                  <span className={styles.megaLinkLabel}>Features</span>
                </Link>
                <Link href="/#how-it-works" className={styles.megaLink} onClick={() => setResourcesOpen(false)}>
                  <span className={styles.megaLinkLabel}>How It Works</span>
                </Link>
                <Link href="/pricing" className={styles.megaLink} onClick={() => setResourcesOpen(false)}>
                  <span className={styles.megaLinkLabel}>Pricing</span>
                </Link>
                <Link href="/resources/how-to-read-irs-transcripts" className={styles.megaLink} onClick={() => setResourcesOpen(false)}>
                  <span className={styles.megaLinkLabel}>How to Read IRS Transcripts</span>
                </Link>
                <Link href="/resources/transcript-types" className={styles.megaLink} onClick={() => setResourcesOpen(false)}>
                  <span className={styles.megaLinkLabel}>Transcript Types</span>
                </Link>
              </div>

              {/* TOOLS & EXTRAS */}
              <div className={styles.megaCol}>
                <div className={styles.megaColTitle}>Tools &amp; Extras</div>
                <Link href="/resources/irs-phone-numbers" className={styles.megaLink} onClick={() => setResourcesOpen(false)}>
                  <span className={styles.megaLinkLabel}>IRS Phone Numbers</span>
                </Link>
                <Link href="/resources/transcript-codes" className={styles.megaLink} onClick={() => setResourcesOpen(false)}>
                  <span className={styles.megaLinkLabel}>Transcript Codes Database</span>
                </Link>
                <Link href="/resources/transcript-orders" className={styles.megaLink} onClick={() => setResourcesOpen(false)}>
                  <span className={styles.megaLinkLabel}>Order Walkthrough</span>
                </Link>
                <a
                  href="https://taxtools.taxmonitor.pro"
                  className={styles.megaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setResourcesOpen(false)}
                >
                  <span className={styles.megaLinkLabel}>TaxTools Arcade ↗</span>
                </a>

                {/* Mini CTA */}
                <div className={styles.megaMiniCta}>
                  <p className={styles.megaMiniCtaText}>Get the guide with actionable client insights</p>
                  <div className={styles.megaMiniCtaActions}>
                    <Link href="/magnets/lead-magnet.html" className={styles.btnPrimary} onClick={() => setResourcesOpen(false)}>
                      Get the guide →
                    </Link>
                    <Link href="/login" className={styles.btnSecondary} onClick={() => setResourcesOpen(false)}>
                      Log In
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Right actions */}
        <div className={styles.actions}>
          <Link href="/login" className={styles.loginLink}>Log In</Link>
          <Link href="/magnets/lead-magnet.html" className={styles.btnPrimary}>Get the guide →</Link>
        </div>

        {/* Hamburger */}
        <button
          className={styles.hamburger}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className={`${styles.hamburgerBar} ${mobileOpen ? styles.hamburgerBarOpen1 : ''}`} />
          <span className={`${styles.hamburgerBar} ${mobileOpen ? styles.hamburgerBarOpen2 : ''}`} />
          <span className={`${styles.hamburgerBar} ${mobileOpen ? styles.hamburgerBarOpen3 : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`}>
        <Link href="/about" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>About</Link>
        <Link href="/#features" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Features</Link>
        <Link href="/#how-it-works" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>How It Works</Link>
        <Link href="/pricing" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Pricing</Link>
        <Link href="/contact" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Contact</Link>
        <div className={styles.mobileDivider} />
        <Link href="/login" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Sign In</Link>
      </div>
    </header>
  )
}
