import type { Metadata } from "next";

const PLATFORM = {
  name: "Transcript Tax Monitor",
  domain: "transcript.taxmonitor.pro",
  email: "legal@taxmonitor.pro",
  accent: "#14b8a6",
  entity: "Lenore, Inc.",
  effectiveDate: "March 31, 2026",
};

type LegalType = "privacy" | "terms" | "refunds";

const TITLES: Record<LegalType, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  refunds: "Refund Policy",
};

function PrivacyContent() {
  return (
    <>
      <p>
        <strong>Effective Date:</strong> {PLATFORM.effectiveDate}
      </p>
      <p>
        {PLATFORM.entity} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates{" "}
        <strong>{PLATFORM.name}</strong> at{" "}
        <a href={`https://${PLATFORM.domain}`} style={{ color: PLATFORM.accent }}>
          {PLATFORM.domain}
        </a>
        . This Privacy Policy explains how we collect, use, and protect your information.
      </p>

      <h2>Information We Collect</h2>
      <p>We collect the following information when you use our platform:</p>
      <ul>
        <li><strong>Account information:</strong> Name, email address, and authentication credentials provided during sign-up or magic link login.</li>
        <li><strong>Payment information:</strong> Processed securely by <strong>Stripe</strong>. We do not store your credit card number, CVV, or full card details on our servers.</li>
        <li><strong>Usage data:</strong> Pages visited, features used, token consumption, and session metadata.</li>
        <li><strong>Uploaded documents:</strong> IRS transcripts and related files you upload for analysis. These are processed and stored securely.</li>
        <li><strong>Device and browser data:</strong> IP address, browser type, operating system, and referring URLs collected automatically via server logs and Cloudflare analytics.</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To provide and improve our transcript analysis services.</li>
        <li>To process payments and manage your account.</li>
        <li>To send transactional emails (receipts, magic links, report delivery).</li>
        <li>To respond to support requests.</li>
        <li>To comply with legal obligations.</li>
      </ul>

      <h2>Third-Party Services</h2>
      <p>We use the following third-party services to operate the platform:</p>
      <ul>
        <li><strong>Stripe</strong> &mdash; Payment processing</li>
        <li><strong>Cloudflare</strong> &mdash; Hosting, CDN, and security</li>
        <li><strong>Cal.com</strong> &mdash; Support scheduling</li>
      </ul>
      <p>Each third-party service operates under its own privacy policy. We do not sell your personal data to third parties.</p>

      <h2>Data Retention</h2>
      <p>We retain your account and usage data for as long as your account is active. Uploaded transcripts are retained for the duration necessary to deliver reports. You may request deletion of your data by contacting <a href={`mailto:${PLATFORM.email}`} style={{ color: PLATFORM.accent }}>{PLATFORM.email}</a>.</p>

      <h2>Cookies</h2>
      <p>We use essential cookies for authentication and session management. We do not use advertising or third-party tracking cookies.</p>

      <h2>Your Rights</h2>
      <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data. To exercise these rights, contact <a href={`mailto:${PLATFORM.email}`} style={{ color: PLATFORM.accent }}>{PLATFORM.email}</a>.</p>

      <h2>Changes to This Policy</h2>
      <p>We may update this policy from time to time. Changes will be posted on this page with a revised effective date.</p>

      <h2>Contact</h2>
      <p>
        {PLATFORM.entity}<br />
        Email: <a href={`mailto:${PLATFORM.email}`} style={{ color: PLATFORM.accent }}>{PLATFORM.email}</a>
      </p>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <p>
        <strong>Effective Date:</strong> {PLATFORM.effectiveDate}
      </p>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your use of <strong>{PLATFORM.name}</strong> operated by {PLATFORM.entity} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) at{" "}
        <a href={`https://${PLATFORM.domain}`} style={{ color: PLATFORM.accent }}>{PLATFORM.domain}</a>.
        By using the platform, you agree to these Terms.
      </p>

      <h2>Service Description</h2>
      <p>{PLATFORM.name} provides IRS transcript analysis tools for tax professionals. The platform operates on a token-based system where users purchase tokens to access analysis features and generate reports.</p>

      <h2>Account Registration</h2>
      <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>

      <h2>Tokens and Purchases</h2>
      <ul>
        <li>Tokens are purchased through Stripe and are non-refundable once issued to your account.</li>
        <li>Tokens do not expire but are tied to your account and are non-transferable.</li>
        <li>We reserve the right to modify token pricing with reasonable notice.</li>
      </ul>

      <h2>Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the platform for any unlawful purpose.</li>
        <li>Attempt to reverse-engineer, scrape, or exploit the platform.</li>
        <li>Upload content that infringes on third-party rights.</li>
        <li>Share account credentials with unauthorized users.</li>
        <li>Interfere with the operation or security of the platform.</li>
      </ul>

      <h2>Intellectual Property</h2>
      <p>All platform content, design, and functionality are owned by {PLATFORM.entity}. You retain ownership of the data you upload. By uploading content, you grant us a limited license to process it for the purpose of delivering our services.</p>

      <h2>Limitation of Liability</h2>
      <p>{PLATFORM.name} is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>

      <h2>Dispute Resolution</h2>
      <p>These Terms are governed by the laws of the State of Delaware. Any disputes arising under these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, conducted in Delaware.</p>

      <h2>Termination</h2>
      <p>We may suspend or terminate your account at our discretion for violations of these Terms. Upon termination, your right to use the platform ceases immediately. Unused tokens are forfeited upon account termination for cause.</p>

      <h2>Changes to These Terms</h2>
      <p>We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the revised Terms.</p>

      <h2>Contact</h2>
      <p>
        {PLATFORM.entity}<br />
        Email: <a href={`mailto:${PLATFORM.email}`} style={{ color: PLATFORM.accent }}>{PLATFORM.email}</a>
      </p>
    </>
  );
}

function RefundsContent() {
  return (
    <>
      <p>
        <strong>Effective Date:</strong> {PLATFORM.effectiveDate}
      </p>
      <p>
        This Refund Policy applies to all purchases made on <strong>{PLATFORM.name}</strong> operated by {PLATFORM.entity} at{" "}
        <a href={`https://${PLATFORM.domain}`} style={{ color: PLATFORM.accent }}>{PLATFORM.domain}</a>.
      </p>

      <h2>Token Purchases</h2>
      <p><strong>Tokens are non-refundable once issued to your account.</strong> Because tokens grant immediate access to platform features and analysis tools, we cannot reverse token issuance after purchase.</p>

      <h2>When Refunds May Be Issued</h2>
      <p>We may issue refunds at our sole discretion in the following cases:</p>
      <ul>
        <li><strong>Duplicate charges:</strong> If you were charged more than once for the same purchase.</li>
        <li><strong>Technical failure:</strong> If a payment was processed but tokens were not delivered due to a platform error.</li>
        <li><strong>Unauthorized transaction:</strong> If you can demonstrate the purchase was made without your authorization.</li>
      </ul>

      <h2>How to Request a Refund</h2>
      <p>To request a refund, contact us within 7 days of the transaction at <a href={`mailto:${PLATFORM.email}`} style={{ color: PLATFORM.accent }}>{PLATFORM.email}</a>. Include your account email and a description of the issue. We will review your request within 5 business days.</p>

      <h2>Payment Processor</h2>
      <p>All payments are processed by <strong>Stripe</strong>. Approved refunds will be returned to your original payment method. Processing time depends on your bank or card issuer (typically 5-10 business days).</p>

      <h2>Chargebacks</h2>
      <p>If you initiate a chargeback through your bank without first contacting us, your account may be suspended pending investigation. We encourage you to reach out to us directly to resolve any payment concerns.</p>

      <h2>Contact</h2>
      <p>
        {PLATFORM.entity}<br />
        Email: <a href={`mailto:${PLATFORM.email}`} style={{ color: PLATFORM.accent }}>{PLATFORM.email}</a>
      </p>
    </>
  );
}

const CONTENT_MAP: Record<LegalType, () => React.JSX.Element> = {
  privacy: PrivacyContent,
  terms: TermsContent,
  refunds: RefundsContent,
};

export default function LegalPage({ type }: { type: LegalType }) {
  const title = TITLES[type];
  const Content = CONTENT_MAP[type];

  return (
    <main
      style={{
        maxWidth: "var(--content-width, 860px)",
        margin: "0 auto",
        padding: "var(--space-16, 4rem) var(--page-gutter, clamp(1.25rem, 5vw, 3rem))",
        fontFamily: "var(--font-body, system-ui, sans-serif)",
        color: "var(--text, #111827)",
        lineHeight: "var(--leading-relaxed, 1.75)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display, Georgia, serif)",
          fontSize: "var(--text-4xl, 2.25rem)",
          fontWeight: 700,
          color: "var(--text, #111827)",
          marginBottom: "var(--space-2, 0.5rem)",
          letterSpacing: "-0.025em",
        }}
      >
        {title}
      </h1>
      <div
        style={{
          width: 48,
          height: 3,
          background: PLATFORM.accent,
          borderRadius: 2,
          marginBottom: "var(--space-10, 2.5rem)",
        }}
      />
      <article className="legal-content">
        <Content />
      </article>
      <style>{`
        .legal-content h2 {
          font-family: var(--font-display, Georgia, serif);
          font-size: var(--text-xl, 1.25rem);
          font-weight: 700;
          margin-top: var(--space-10, 2.5rem);
          margin-bottom: var(--space-4, 1rem);
          color: var(--text, #111827);
        }
        .legal-content p {
          margin-bottom: var(--space-4, 1rem);
        }
        .legal-content ul {
          margin-bottom: var(--space-4, 1rem);
          padding-left: var(--space-6, 1.5rem);
        }
        .legal-content li {
          margin-bottom: var(--space-2, 0.5rem);
        }
        .legal-content a:hover {
          text-decoration: underline;
        }
      `}</style>
    </main>
  );
}

export function generateLegalMetadata(type: LegalType): Metadata {
  const title = TITLES[type];
  return {
    title,
    description: `${title} for ${PLATFORM.name} by ${PLATFORM.entity}.`,
    alternates: {
      canonical: `https://${PLATFORM.domain}/${type === "refunds" ? "refunds" : type}`,
    },
  };
}
