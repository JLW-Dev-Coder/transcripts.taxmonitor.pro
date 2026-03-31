import Link from "next/link";

const PLATFORM_LINKS = [
  { label: "About", href: "/about" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

const RESOURCE_LINKS = [
  { label: "Resources", href: "/resources" },
  { label: "Demo", href: "/demo" },
  { label: "Help Center", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Refund Policy", href: "/refunds" },
];

const VLP_ECOSYSTEM = [
  { label: "VirtualLaunch Pro", href: "https://virtuallaunch.pro" },
  { label: "Tax Monitor Pro", href: "https://taxmonitor.pro" },
  { label: "Tax Monitor Transcript", href: "https://transcript.taxmonitor.pro" },
  { label: "Business Builder Pro", href: "https://businessbuilder.pro" },
  { label: "Business Monitor Pro", href: "https://businessmonitor.pro" },
  { label: "Compliance Monitor Pro", href: "https://compliancemonitor.pro" },
  { label: "Notary Monitor Pro", href: "https://notarymonitor.pro" },
  { label: "HR Monitor Pro", href: "https://hrmonitor.pro" },
];

const columnHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-display, Georgia, serif)",
  fontSize: "var(--text-sm, 0.875rem)",
  fontWeight: 700,
  color: "#fff",
  marginBottom: "var(--space-4, 1rem)",
  letterSpacing: "0.025em",
  textTransform: "uppercase" as const,
};

const linkStyle: React.CSSProperties = {
  fontFamily: "var(--font-body, system-ui, sans-serif)",
  fontSize: "var(--text-sm, 0.875rem)",
  color: "#9ca3af",
  textDecoration: "none",
  lineHeight: 2,
  display: "block",
  transition: "color 150ms ease",
};

export default function SiteFooter() {
  return (
    <footer
      style={{
        background: "#030712",
        borderTop: "3px solid #14b8a6",
        color: "#9ca3af",
        fontFamily: "var(--font-body, system-ui, sans-serif)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--max-width, 1280px)",
          margin: "0 auto",
          padding: "var(--space-16, 4rem) var(--page-gutter, clamp(1.25rem, 5vw, 3rem)) var(--space-8, 2rem)",
        }}
      >
        {/* Columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "var(--space-10, 2.5rem)",
            marginBottom: "var(--space-12, 3rem)",
          }}
        >
          {/* Platform */}
          <div>
            <h4 style={columnHeadingStyle}>Platform</h4>
            {PLATFORM_LINKS.map((l) => (
              <Link key={l.href + l.label} href={l.href} style={linkStyle}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Resources */}
          <div>
            <h4 style={columnHeadingStyle}>Resources</h4>
            {RESOURCE_LINKS.map((l) => (
              <Link key={l.href + l.label} href={l.href} style={linkStyle}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <h4 style={columnHeadingStyle}>Legal</h4>
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href + l.label} href={l.href} style={linkStyle}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* VLP Ecosystem */}
          <div>
            <h4 style={columnHeadingStyle}>VLP Ecosystem</h4>
            {VLP_ECOSYSTEM.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Affiliate Callout */}
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-6, 1.5rem)",
            marginBottom: "var(--space-8, 2rem)",
            background: "rgba(20, 184, 166, 0.08)",
            borderRadius: "var(--radius-lg, 12px)",
            border: "1px solid rgba(20, 184, 166, 0.2)",
          }}
        >
          <span style={{ fontSize: "var(--text-sm, 0.875rem)", color: "#d1d5db" }}>
            Earn 20% &mdash;{" "}
            <Link
              href="/contact"
              style={{
                color: "#14b8a6",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Affiliate Program
            </Link>
          </span>
        </div>

        {/* Bottom */}
        <div
          style={{
            borderTop: "1px solid #1f2937",
            paddingTop: "var(--space-6, 1.5rem)",
            textAlign: "center",
            fontSize: "var(--text-xs, 0.75rem)",
            color: "#6b7280",
          }}
        >
          &copy; 2026 Lenore, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
