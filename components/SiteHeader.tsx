"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const RESOURCES_LINKS = [
  { label: "Help Center",                    href: "/resources/help-center/"                              },
  { label: "IRS Phone Numbers",              href: "/resources/irs-phone-numbers/"                        },
  { label: "IRS Transaction Codes Guide",    href: "/resources/how-to-understand-irs-transaction-codes/"  },
  { label: "Transcript Codes Database",      href: "/resources/transcript-codes/"                         },
  { label: "Section 7216 AI Consent",        href: "/magnets/section-7216/"                               },
  { label: "All Resources",                  href: "/resources/"                                          },
];

const NAV_LINKS = [
  { label: "About",        href: "/about/"        },
  { label: "Features",     href: "/features/"     },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing",      href: "/pricing/"      },
  { label: "Contact",      href: "/contact/"      },
];

const ACCENT = "#14b8a6";

export default function SiteHeader() {
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileResOpen, setMobileResOpen] = useState(false);
  const resourcesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openResources() {
    if (resourcesTimeout.current) clearTimeout(resourcesTimeout.current);
    setResourcesOpen(true);
  }

  function closeResources() {
    resourcesTimeout.current = setTimeout(() => setResourcesOpen(false), 150);
  }

  return (
    <>
      <header style={{
        position: "relative",
        zIndex: 1000,
        height: "var(--header-height, 68px)",
        width: "100%",
        background: "transparent",
      }}>
       <div style={{
         maxWidth: "var(--max-width, 1280px)",
         margin: "0 auto",
         width: "100%",
         padding: "0 var(--page-gutter, clamp(1.25rem, 5vw, 3rem))",
         display: "flex",
         alignItems: "center",
         justifyContent: "space-between",
         height: "100%",
       }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 34, height: 34, borderRadius: 8,
            background: ACCENT, color: "#000",
            fontWeight: 700, fontSize: "0.875rem", letterSpacing: "-0.5px",
          }}>TT</span>
          <span style={{
            fontSize: "1.125rem", fontWeight: 700,
            color: "var(--text, #f9fafb)", letterSpacing: "-0.025em",
          }}>Transcript Tax Monitor</span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "1.5rem" }} className="ttmp-desktop-nav">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} style={{
              fontSize: "0.875rem", fontWeight: 500,
              color: "var(--text-muted, #9ca3af)", textDecoration: "none",
            }}>{link.label}</Link>
          ))}

          {/* Resources dropdown */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={openResources}
            onMouseLeave={closeResources}
          >
            <button style={{
              display: "flex", alignItems: "center", gap: "0.25rem",
              fontSize: "0.875rem", fontWeight: 500,
              color: "var(--text-muted, #9ca3af)",
              background: "none", border: "none", cursor: "pointer",
              padding: 0,
            }}>
              Resources
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{ transform: resourcesOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {resourcesOpen && (
              <div
                onMouseEnter={openResources}
                onMouseLeave={closeResources}
                style={{
                  position: "absolute", top: "calc(100% + 4px)", left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--surface, #111827)",
                  border: "1px solid var(--surface-border, #1f2937)",
                  borderRadius: 12, minWidth: 240,
                  boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
                  overflow: "hidden",
                }}>
                {RESOURCES_LINKS.map(link => (
                  <Link key={link.href} href={link.href}
                    onClick={() => setResourcesOpen(false)}
                    style={{
                      display: "block", padding: "0.75rem 1.25rem",
                      fontSize: "0.875rem", fontWeight: 500,
                      color: "var(--text, #f9fafb)", textDecoration: "none",
                      borderBottom: "1px solid var(--surface-border, #1f2937)",
                      transition: "background 150ms ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(20,184,166,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >{link.label}</Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/login/" style={{
            fontSize: "0.875rem", fontWeight: 500,
            color: "var(--text-muted, #9ca3af)", textDecoration: "none",
          }}>Log In</Link>

          <Link href="/login/" style={{
            fontSize: "0.875rem", fontWeight: 600, color: "#000",
            background: ACCENT, padding: "0.5rem 1.125rem",
            borderRadius: 9999, textDecoration: "none",
          }}>Try Free →</Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="ttmp-mobile-toggle"
          style={{
            display: "none", background: "none", border: "none",
            cursor: "pointer", padding: "0.5rem",
            color: "var(--text, #f9fafb)",
          }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
       </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 1001,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        }}>
          <nav onClick={e => e.stopPropagation()} style={{
            position: "absolute", top: 0, right: 0,
            width: 280, maxWidth: "80vw", height: "100vh",
            background: "var(--surface, #111827)",
            padding: "1.5rem", display: "flex",
            flexDirection: "column", gap: "0.25rem",
            boxShadow: "var(--shadow-xl)",
          }}>
            <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" style={{
              alignSelf: "flex-end", background: "none", border: "none",
              cursor: "pointer", color: "var(--text, #f9fafb)",
              fontSize: "1.5rem", lineHeight: 1, marginBottom: "0.5rem",
            }}>&times;</button>

            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setDrawerOpen(false)} style={{
                fontSize: "1rem", fontWeight: 500,
                color: "var(--text, #f9fafb)", textDecoration: "none",
                padding: "0.625rem 0.75rem", borderRadius: 8,
              }}>{link.label}</Link>
            ))}

            {/* Mobile resources toggle */}
            <button onClick={() => setMobileResOpen(!mobileResOpen)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              fontSize: "1rem", fontWeight: 500,
              color: "var(--text, #f9fafb)",
              background: "none", border: "none", cursor: "pointer",
              padding: "0.625rem 0.75rem", borderRadius: 8, width: "100%",
            }}>
              Resources
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{ transform: mobileResOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {mobileResOpen && RESOURCES_LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setDrawerOpen(false)} style={{
                fontSize: "0.875rem", fontWeight: 500,
                color: "var(--text-muted, #9ca3af)", textDecoration: "none",
                padding: "0.5rem 0.75rem 0.5rem 1.5rem", borderRadius: 8,
              }}>{link.label}</Link>
            ))}

            <div style={{ height: 1, background: "var(--surface-border, #1f2937)", margin: "0.5rem 0" }} />

            <Link href="/login/" onClick={() => setDrawerOpen(false)} style={{
              fontSize: "1rem", fontWeight: 500,
              color: "var(--text-muted, #9ca3af)", textDecoration: "none",
              padding: "0.625rem 0.75rem",
            }}>Log In</Link>

            <Link href="/login/" onClick={() => setDrawerOpen(false)} style={{
              fontSize: "1rem", fontWeight: 600, color: "#000",
              background: ACCENT, padding: "0.75rem 1rem",
              borderRadius: 9999, textDecoration: "none", textAlign: "center",
              marginTop: "0.5rem",
            }}>Try Free →</Link>
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .ttmp-desktop-nav { display: none !important; }
          .ttmp-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}
