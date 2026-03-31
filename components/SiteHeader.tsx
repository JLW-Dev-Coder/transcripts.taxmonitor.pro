"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          height: "var(--header-height, 68px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 var(--page-gutter, clamp(1.25rem, 5vw, 3rem))",
          maxWidth: "var(--max-width, 1280px)",
          margin: "0 auto",
          width: "100%",
          transition: "background var(--transition-normal, 250ms ease), box-shadow var(--transition-normal, 250ms ease)",
          background: scrolled
            ? "rgba(255, 255, 255, 0.8)"
            : "transparent",
          backdropFilter: scrolled ? "blur(12px) saturate(1.8)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px) saturate(1.8)" : "none",
          boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: "var(--radius-md, 8px)",
              background: "#14b8a6",
              color: "#fff",
              fontFamily: "var(--font-body, system-ui, sans-serif)",
              fontWeight: 700,
              fontSize: "0.875rem",
              letterSpacing: "-0.5px",
            }}
          >
            TT
          </span>
          <span
            style={{
              fontFamily: "var(--font-display, Georgia, serif)",
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--text, #111827)",
              letterSpacing: "-0.025em",
            }}
          >
            Transcript Tax Monitor
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-6, 1.5rem)",
          }}
          className="site-header-desktop-nav"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "var(--font-body, system-ui, sans-serif)",
                fontSize: "var(--text-sm, 0.875rem)",
                fontWeight: 500,
                color: "var(--text-secondary, #4b5563)",
                textDecoration: "none",
                transition: "color var(--transition-fast, 150ms ease)",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            style={{
              fontFamily: "var(--font-body, system-ui, sans-serif)",
              fontSize: "var(--text-sm, 0.875rem)",
              fontWeight: 500,
              color: "var(--text-secondary, #4b5563)",
              textDecoration: "none",
            }}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            style={{
              fontFamily: "var(--font-body, system-ui, sans-serif)",
              fontSize: "var(--text-sm, 0.875rem)",
              fontWeight: 600,
              color: "#fff",
              background: "#14b8a6",
              padding: "0.5rem 1.125rem",
              borderRadius: "var(--radius-full, 9999px)",
              textDecoration: "none",
              transition: "background var(--transition-fast, 150ms ease)",
            }}
          >
            Try Free &rarr;
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="site-header-mobile-toggle"
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "var(--space-2, 0.5rem)",
            color: "var(--text, #111827)",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1001,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          <nav
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "280px",
              maxWidth: "80vw",
              height: "100vh",
              background: "var(--surface, #fff)",
              padding: "var(--space-6, 1.5rem)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4, 1rem)",
              boxShadow: "var(--shadow-xl)",
              animation: "slideInRight 250ms ease",
            }}
          >
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              style={{
                alignSelf: "flex-end",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "var(--space-2, 0.5rem)",
                color: "var(--text, #111827)",
                fontSize: "1.5rem",
                lineHeight: 1,
              }}
            >
              &times;
            </button>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                style={{
                  fontFamily: "var(--font-body, system-ui, sans-serif)",
                  fontSize: "var(--text-base, 1rem)",
                  fontWeight: 500,
                  color: "var(--text, #111827)",
                  textDecoration: "none",
                  padding: "var(--space-2, 0.5rem) 0",
                  borderBottom: "1px solid var(--surface-border, #e5e7eb)",
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setDrawerOpen(false)}
              style={{
                fontFamily: "var(--font-body, system-ui, sans-serif)",
                fontSize: "var(--text-base, 1rem)",
                fontWeight: 500,
                color: "var(--text, #111827)",
                textDecoration: "none",
                padding: "var(--space-2, 0.5rem) 0",
              }}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={() => setDrawerOpen(false)}
              style={{
                fontFamily: "var(--font-body, system-ui, sans-serif)",
                fontSize: "var(--text-sm, 0.875rem)",
                fontWeight: 600,
                color: "#fff",
                background: "#14b8a6",
                padding: "0.75rem 1.25rem",
                borderRadius: "var(--radius-full, 9999px)",
                textDecoration: "none",
                textAlign: "center",
                marginTop: "var(--space-2, 0.5rem)",
              }}
            >
              Try Free &rarr;
            </Link>
          </nav>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @media (max-width: 768px) {
          .site-header-desktop-nav { display: none !important; }
          .site-header-mobile-toggle { display: block !important; }
        }
        @media (prefers-color-scheme: dark) {
          header {
            background: ${scrolled ? "rgba(3, 7, 18, 0.8)" : "transparent"} !important;
          }
        }
      `}</style>
    </>
  );
}
