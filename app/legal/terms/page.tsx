import Link from 'next/link'
import type { Metadata } from 'next'
import styles from '../legal.module.css'

const CANONICAL_BASE = 'https://transcript.taxmonitor.pro'

export const metadata: Metadata = {
  title: 'Terms - Transcript Tax Monitor Pro',
  description:
    'Terms for Transcript Tax Monitor Pro transcript credit packs and platform use.',
  alternates: { canonical: `${CANONICAL_BASE}/legal/terms` },
  openGraph: {
    title: 'Terms - Transcript Tax Monitor Pro',
    description:
      'Terms for Transcript Tax Monitor Pro transcript credit packs and platform use.',
    url: `${CANONICAL_BASE}/legal/terms`,
    type: 'website',
  },
}

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.closeBtn} aria-label="Close">
            <svg
              width="32"
              height="32"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.brand}>
          <Link href="/" className={styles.brandLink} aria-label="Transcript.Tax Monitor Pro">
            <div className={styles.brandLogo}>
              <span className={styles.brandLogoText}>TM</span>
            </div>
            <div className={styles.brandInfo}>
              <p className={styles.brandName}>Transcript.Tax Monitor Pro</p>
              <p className={styles.brandOwner}>Owned by Lenore, Inc.</p>
            </div>
          </Link>
        </div>

        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Terms</h1>
          <p className={styles.pageSubtitle}>Transcript Credit Access &amp; Platform Use Agreement</p>
          <p className={styles.lastUpdated}>Last updated: March 7, 2026</p>
        </div>

        <div className={styles.glassCard}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Service Agreement</h2>
            <p className={styles.body}>
              Transcript Credit Access &amp; Platform Use Agreement
            </p>
          </section>

          <section className={styles.section}>
            <p className={styles.body}>
              This Transcript Credit Access &amp; Platform Use Agreement (&ldquo;Agreement&rdquo;) is entered into by and between
              Lenore, Inc. (&ldquo;Provider&rdquo;) and the individual or entity using or purchasing access to Transcript.Tax Monitor Pro (&ldquo;Client&rdquo;).
              Provider and Client may be referred to individually as a &ldquo;Party&rdquo; and collectively as the &ldquo;Parties.&rdquo;
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 1. Covered Services &amp; Scope of Use</h2>
            <p className={styles.bodySpaced}>
              This Agreement applies to Client purchases and use of Transcript.Tax Monitor Pro, including:
            </p>
            <ul className={styles.list}>
              <li>Account-based transcript credit packs</li>
              <li>Report unlocks, transcript-related access, and associated digital features</li>
              <li>Related platform access delivered through the website</li>
            </ul>
            <p className={styles.bodyMt}>
              Provider makes available a fixed-scope digital platform that allows Client to purchase credits, unlock eligible transcript-related functionality, and access associated outputs and support features made available through the service.
            </p>
            <p className={styles.bodyMt}>
              Access may include account tools, transcript-related reports, token or credit balances, and related technical enablement required for the service to function.
            </p>
            <p className={styles.bodyMt}>
              Provider&apos;s services are limited to the platform and its stated features. No legal, tax, accounting, compliance, or professional advisory services are included unless expressly stated in writing.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 2. No Professional or Regulated Services</h2>
            <p className={styles.body}>
              Client acknowledges that Provider does not provide tax, legal, accounting, financial, compliance, employment, or regulated professional services under this Agreement.
            </p>
            <p className={styles.bodyMt}>
              Any platform wording, examples, summaries, flags, labels, reports, or workflow outputs are informational and structural only and do not constitute advice, representation, filing authority, or a professional engagement.
            </p>
            <p className={styles.bodyMt}>
              Client remains solely responsible for how Client interprets, uses, shares, or acts on any information made available through the platform.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 3. Client Responsibilities</h2>
            <ul className={styles.list}>
              <li>Provide accurate account, billing, and access information.</li>
              <li>Maintain the confidentiality of login credentials and account access.</li>
              <li>Review all outputs before relying on them for any internal or external purpose.</li>
              <li>Ensure all use of the platform complies with Client&apos;s policies, contracts, permissions, and applicable law.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 4. Account Access &amp; Control</h2>
            <p className={styles.body}>
              Client is responsible for maintaining control of the account used to access Transcript.Tax Monitor Pro.
            </p>
            <p className={styles.bodyMt}>
              Provider may rely on account credentials, login status, purchase records, and account-linked identifiers to determine authorized access to credits, reports, and platform features.
            </p>
            <ul className={styles.listMt}>
              <li>Client is responsible for activity occurring under Client&apos;s account.</li>
              <li>Client must use the correct account email associated with purchase and access rights.</li>
              <li>Provider is not responsible for loss caused by Client&apos;s failure to secure account credentials or use the correct login identity.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 5. Third-Party Providers, Billing, and Availability</h2>
            <p className={styles.body}>
              The platform may rely on third-party providers for hosting, payments, email delivery, infrastructure, analytics, or related technical services.
            </p>
            <p className={styles.bodyMt}>
              Client understands that payment processing, browser access, third-party integrations, and other external systems may affect availability, delivery, timing, or display of platform features.
            </p>
            <p className={styles.bodyMt}>
              Provider is not responsible for pricing changes, outages, billing disputes, account holds, service interruptions, or feature changes caused by third-party providers.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 6. Acceptance of Deliverables</h2>
            <p className={styles.bodySpaced}>
              Digital delivery under this Agreement is deemed accepted upon the earlier of:
            </p>
            <ul className={styles.list}>
              <li>Credits, access, or reports being successfully provisioned to Client&apos;s account, or</li>
              <li>Client using the platform, credits, reports, or account-based features.</li>
            </ul>
            <p className={styles.bodyMt}>
              Any request for changes outside the available platform functionality is outside scope unless separately agreed to in writing.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 7. Fees and Payment</h2>
            <p className={styles.body}>
              Client agrees to pay the fees presented at checkout for transcript credits, access, or related digital features purchased through the platform.
            </p>
            <p className={styles.bodyMt}>
              Fees are due at the time of purchase unless otherwise stated in writing.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 8. Privacy Policy (Data Handling)</h2>
            <p className={styles.body}>
              This section describes how Provider may access and handle Client information in connection with platform operation and support.
            </p>
            <div className={styles.subsectionGroup}>
              <div>
                <h3 className={styles.subsectionTitle}>A. Information Provider May Receive</h3>
                <p className={styles.body}>
                  Provider may receive or have access to Client-provided information such as account details, billing contact information, report identifiers, support submissions, transaction references, and platform usage records. Depending on Client&apos;s use of the platform, Provider may also incidentally process data required to render reports, account state, or support diagnostics.
                </p>
              </div>
              <div>
                <h3 className={styles.subsectionTitle}>B. Purpose of Access</h3>
                <p className={styles.body}>
                  Provider will access and use information only as reasonably necessary to operate the platform, deliver purchased access, troubleshoot issues, verify purchases, respond to support requests, and maintain service integrity.
                </p>
              </div>
              <div>
                <h3 className={styles.subsectionTitle}>C. Data Minimization</h3>
                <p className={styles.body}>
                  Provider will make reasonable efforts to minimize access to information not required for service delivery, troubleshooting, fraud prevention, or recordkeeping.
                </p>
              </div>
              <div>
                <h3 className={styles.subsectionTitle}>D. Confidentiality &amp; Security</h3>
                <p className={styles.body}>
                  Provider will maintain commercially reasonable administrative, technical, and organizational safeguards to protect information accessed in connection with the platform. Client remains responsible for secure account practices and device-level security.
                </p>
              </div>
              <div>
                <h3 className={styles.subsectionTitle}>E. Credential Handling</h3>
                <p className={styles.body}>
                  Client is responsible for safeguarding account credentials and using the correct account identity for purchases and access. Client should promptly update passwords and notify Provider of suspected unauthorized use.
                </p>
              </div>
              <div>
                <h3 className={styles.subsectionTitle}>F. Third-Party Platforms</h3>
                <p className={styles.body}>
                  The platform may depend on third-party services. Provider does not control and is not responsible for those third parties&apos; privacy practices, security controls, hosting, retention, or data processing terms.
                </p>
              </div>
              <div>
                <h3 className={styles.subsectionTitle}>G. Data Retention</h3>
                <p className={styles.body}>
                  Provider may retain limited records related to purchases, support activity, technical diagnostics, and delivery verification for business, security, legal, tax, accounting, dispute-resolution, or compliance purposes.
                </p>
              </div>
              <div>
                <h3 className={styles.subsectionTitle}>H. Client Requests</h3>
                <p className={styles.body}>
                  Client may request deletion of Provider-held information to the extent Provider is not required to retain that information for legal, tax, accounting, security, dispute, or operational recordkeeping obligations.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 9. No Guarantees</h2>
            <p className={styles.body}>
              Provider does not guarantee uninterrupted availability, specific tax outcomes, legal outcomes, financial outcomes, filing results, compliance results, or suitability for any specific use case.
            </p>
            <p className={styles.bodyMt}>
              Provider&apos;s obligation is limited solely to making the platform and purchased digital access available as described under this Agreement.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 10. Limitation of Liability</h2>
            <p className={styles.body}>
              To the maximum extent permitted by law, Provider will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, including loss of profits, revenue, data, goodwill, business interruption, or reliance-based harm arising out of or related to this Agreement, the platform, or Client&apos;s use of the service.
            </p>
            <p className={styles.bodyMt}>
              Provider&apos;s total aggregate liability under this Agreement will not exceed the amount actually paid by Client to Provider for the specific purchase giving rise to the claim.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 11. Indemnification</h2>
            <p className={styles.bodySpaced}>
              Client agrees to indemnify and hold harmless Provider from and against any claims, damages, liabilities, costs, and expenses, including reasonable attorneys&apos; fees, arising out of or related to:
            </p>
            <ul className={styles.list}>
              <li>Client&apos;s misuse of the platform,</li>
              <li>Client&apos;s breach of this Agreement,</li>
              <li>Client&apos;s violation of applicable law, or</li>
              <li>Client&apos;s violation of third-party rights.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 12. Confidentiality</h2>
            <p className={styles.body}>
              Each Party agrees to keep confidential any non-public business, technical, operational, or account information disclosed in connection with the platform and to use such information solely as permitted under this Agreement.
            </p>
            <p className={styles.bodyMt}>
              This obligation does not apply to information that is public, independently developed, or rightfully obtained without restriction.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 13. Intellectual Property &amp; License</h2>
            <p className={styles.body}>
              Provider retains all rights in the platform, design, workflows, systems, branding, software logic, documentation, and related materials.
            </p>
            <p className={styles.bodyMt}>
              Client receives a limited, non-exclusive, non-transferable right to use the platform for Client&apos;s internal lawful use in accordance with this Agreement. Client may not resell, sublicense, reverse engineer beyond applicable law, or redistribute Provider&apos;s proprietary materials without written authorization.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 14. Suspension or Termination</h2>
            <p className={styles.body}>
              Provider may suspend or terminate access if Client materially breaches this Agreement, engages in misuse, initiates fraudulent or abusive activity, or creates risk to the platform, Provider, or other users.
            </p>
            <p className={styles.bodyMt}>
              Client remains responsible for charges validly incurred before suspension or termination.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 15. Governing Law &amp; Venue</h2>
            <p className={styles.body}>
              This Agreement is governed by the laws of the jurisdiction in which Provider operates, without regard to conflict-of-law principles.
            </p>
            <p className={styles.bodyMt}>
              Any dispute will be resolved in the courts located in Provider&apos;s local jurisdiction unless the Parties agree in writing to binding arbitration.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 16. Entire Agreement</h2>
            <p className={styles.body}>
              This Agreement constitutes the entire agreement between the Parties regarding Client&apos;s purchase and use of Transcript.Tax Monitor Pro and supersedes all prior discussions or representations on the same subject.
            </p>
            <p className={styles.bodyMt}>
              Any amendment must be in writing and accepted by both Parties.
            </p>
          </section>

          <section className={styles.sectionLast}>
            <h2 className={styles.sectionTitle}>Electronic Acceptance</h2>
            <p className={styles.body}>
              By completing checkout, creating an account, purchasing credits, or electronically accepting this Agreement, Client acknowledges that they have read, understood, and agreed to be bound by these terms.
            </p>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerCopy}>
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Transcript.Tax Monitor Pro. All rights reserved.
          </p>
          <div className={styles.footerLinks}>
            <Link href="/legal/privacy" className={styles.footerLink}>Privacy Policy</Link>
            <Link href="/legal/refund" className={styles.footerLink}>Refund Policy</Link>
            <Link href="/legal/terms" className={styles.footerLink}>Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
