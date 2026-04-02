import type { Metadata } from 'next'
import styles from './section-7216.module.css'
import { CopyBlock, ComplianceChecklist } from './Section7216Client'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

const CANONICAL_BASE = 'https://transcript.taxmonitor.pro'

export const metadata: Metadata = {
  title: 'AI + Tax Pro Consent - Transcript Tax Monitor Pro',
  description:
    'IRS Section 7216 AI consent templates and compliance checklist for tax professionals using AI tools.',
  alternates: { canonical: `${CANONICAL_BASE}/magnets/section-7216` },
  openGraph: {
    title: 'AI + Tax Pro Consent - Transcript Tax Monitor Pro',
    description:
      'IRS Section 7216 AI consent templates and compliance checklist for tax professionals using AI tools.',
    url: `${CANONICAL_BASE}/magnets/section-7216`,
    type: 'website',
  },
}

const CONSENT_USE = `I authorize [FIRM_NAME] to use artificial intelligence and machine learning tools to assist in the preparation and analysis of my tax return. I understand that my tax return information may be processed through AI systems to improve accuracy, efficiency, and research capabilities. This consent applies only to tools and vendors approved by the firm and does not authorize disclosure of my information to unauthorized third parties.`

const CONSENT_DISCLOSE = `I consent to [FIRM_NAME] disclosing my tax return information, including personally identifiable information (PII), to the following AI vendors for the limited purpose of assisting with tax return preparation and analysis: [INSERT VENDOR NAMES AND PURPOSES] I understand that these vendors are contractually obligated to: - Maintain the confidentiality and security of my information - Use my information only for the stated purpose - Comply with all applicable tax laws and regulations - Not retain my information beyond the stated engagement period I acknowledge that I am providing this consent voluntarily and that refusal to consent will not affect the quality of service I receive, except for services specifically requiring AI assistance.`

const IMPROPER_DISCLOSURE = `Under Treasury Regulation §301.7216-1, it is unlawful for any tax return preparer to disclose any tax return information without the taxpayer's consent, except as permitted by law or regulation. Any unauthorized disclosure or use of tax return information is prohibited and may result in civil and criminal penalties. If you believe your tax return information has been disclosed or used without authorization, you have the right to file a complaint with the Treasury Inspector General for Tax Administration (TIGTA).`

const SIGNATURE_REQUIREMENTS = `TAXPAYER ACKNOWLEDGMENT AND SIGNATURE I have read and understand the above disclosures regarding the use of AI tools in the preparation of my tax return. I consent to the use of AI tools as described above. I understand that I may revoke this consent at any time by providing written notice to [FIRM_NAME]. I further understand that: - My consent is voluntary and not a condition of service - I may receive tax preparation services without AI assistance if I choose - [FIRM_NAME] is responsible for all work performed, whether AI-assisted or not - I have the right to request that specific information not be processed through AI systems Taxpayer Signature: _________________________ Date: _________ Taxpayer Name (print): _____________________ TAX RETURN PREPARER ACKNOWLEDGMENT I have obtained the taxpayer's informed written consent before using AI tools to process their tax return information. I have maintained a copy of this signed consent in my client file. I certify that I have complied with all applicable Treasury Regulations and IRS guidance regarding the disclosure and use of tax return information. Preparer Signature: _________________________ Date: _________ Preparer Name (print): _____________________ [FIRM_NAME]: _____________________________`

export default function Section7216Page() {
  return (
    <>
    <SiteHeader />
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroH1}>How We Safeguard and Enhance Research with AI Tools</h1>
        <p className={styles.heroSub}>
          Understand consent, modern AI tools, and compliance for tax professionals.
        </p>
        <p className={styles.heroDesc}>
          Download a ready-to-use consent template and PDF guide to safely integrate AI into your tax workflow.
        </p>
      </section>

      <div className={styles.container}>

        {/* Card 1 — Understanding IRS Form 7216 Consent */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Understanding IRS Form 7216 Consent</h2>
          <p className={styles.cardText}>
            If no exception applies, the tax return preparer needs the taxpayer&apos;s consent under Treas. Reg. §301.7216-3. For Form 1040 filers, the practitioner must follow Rev. Proc. 2013-14 to obtain valid consent; for all other taxpayers, the format may vary, provided the tax return preparer meets all requirements. In the context of AI tools, obtaining consent presents some specific challenges.
          </p>
        </div>

        {/* Card 2 — Consent to USE AI Tools */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Consent to USE AI Tools</h2>
          <p className={styles.cardText}>
            Taxpayers must affirmatively consent before their information is processed through AI systems:
          </p>
          <CopyBlock text={CONSENT_USE} />
        </div>

        {/* Card 3 — Consent to DISCLOSE to AI Vendors */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Consent to DISCLOSE to AI Vendors</h2>
          <p className={styles.cardText}>
            When information is shared with third-party AI vendors, explicit consent is required:
          </p>
          <CopyBlock text={CONSENT_DISCLOSE} />
        </div>

        {/* Card 4 — Key Compliance Points */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Key Compliance Points</h2>
          <ul className={styles.complianceList}>
            <li className={styles.complianceItem}>
              <strong>Affirmative Consent Required:</strong> Consent must be obtained BEFORE processing information through AI systems. Pre-checked boxes are not acceptable.
            </li>
            <li className={styles.complianceItem}>
              <strong>Written Format:</strong> Consent must be in writing and signed by the taxpayer or authorized representative.
            </li>
            <li className={styles.complianceItem}>
              <strong>Specific Purpose:</strong> Consent must clearly state which AI tools, vendors, and purposes are authorized.
            </li>
            <li className={styles.complianceItem}>
              <strong>Consent Duration:</strong> Specify whether consent is valid for one tax year, multiple years, or until revoked.
            </li>
            <li className={styles.complianceItem}>
              <strong>Revocation Rights:</strong> Taxpayers must be informed they can revoke consent at any time in writing.
            </li>
            <li className={styles.complianceItem}>
              <strong>No Conditional Service:</strong> Consent cannot be a condition of service. Taxpayers must be able to receive service without AI use.
            </li>
            <li className={styles.complianceItem}>
              <strong>SSN Protection:</strong> Ensure AI vendors use encrypted, HIPAA-compliant infrastructure for data security.
            </li>
            <li className={styles.complianceItem}>
              <strong>Foreign Vendor Safeguards:</strong> If data is transferred to foreign-based AI vendors, additional safeguards may be required. Consult recent IRS guidance and Rev. Proc. 2024-XX.
            </li>
          </ul>
        </div>

        {/* Card 5 — Statement on Improper Disclosure */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Statement on Improper Disclosure</h2>
          <CopyBlock text={IMPROPER_DISCLOSURE} />
        </div>

        {/* Card 6 — Signature Requirements */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Signature Requirements</h2>
          <p className={styles.cardText}>
            The following signatures and acknowledgments must be obtained and retained:
          </p>
          <CopyBlock text={SIGNATURE_REQUIREMENTS} />
        </div>

        {/* Risk Scenario header */}
        <div className={styles.riskHeader}>
          <h2 className={styles.riskHeaderTitle}>
            What Other Tax Professionals Are Running Into with AI
          </h2>
          <p className={styles.riskHeaderSub}>
            Real-world scenarios that can unintentionally trigger IRS §7216 disclosure issues. Examples for educational purposes only.
          </p>
        </div>

        {/* Risk Scenario cards */}
        <div className={styles.riskGrid}>
          {/* Card: Foreign Account */}
          <div className={styles.riskCard}>
            <div className={styles.riskBadge}>
              <svg width="18" height="18" aria-hidden="true" fill="none" stroke="#ef4444" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className={styles.riskBadgeLabel}>COMPLIANCE RISK EXAMPLE</span>
            </div>
            <blockquote className={styles.riskQuote}>
              &ldquo;I started using AI to research a foreign account issue and didn&apos;t think twice about it. My first question was general, but then I added client specifics to get a better answer&hellip; name, income, account details, everything. It hit me later that I had basically disclosed the entire situation to a third party.&rdquo;
            </blockquote>
            <p className={styles.riskAuthor}>— Michael R.</p>
            <p className={styles.riskLocation}>Midland, TX</p>
            <p className={styles.riskNote}><strong>Risk:</strong> This scenario may constitute a disclosure under IRC §7216.</p>
          </div>

          {/* Card: Meeting Notes */}
          <div className={styles.riskCard}>
            <div className={styles.riskBadge}>
              <svg width="18" height="18" aria-hidden="true" fill="none" stroke="#ef4444" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className={styles.riskBadgeLabel}>COMPLIANCE RISK EXAMPLE</span>
            </div>
            <blockquote className={styles.riskQuote}>
              &ldquo;I copied my client meeting notes into an AI tool to summarize things faster. It included names, income estimates, rental properties, and their LLC. I thought I was just saving time, but I didn&apos;t realize I had shared identifiable tax return information.&rdquo;
            </blockquote>
            <p className={styles.riskAuthor}>— Danielle S.</p>
            <p className={styles.riskLocation}>Scottsdale, AZ</p>
            <p className={styles.riskNote}><strong>Risk:</strong> This scenario may constitute a disclosure under IRC §7216.</p>
          </div>
        </div>

        {/* AI Compliance Checklist */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>AI Compliance Checklist</h2>
          <ComplianceChecklist />
        </div>

        {/* References */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Official References &amp; Resources</h2>
          <p className={styles.cardText}><strong>Click below to access authoritative IRS guidance:</strong></p>
          <a
            href="https://www.tomtalkstaxes.com/p/ai-7216"
            className={styles.refLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            → Tom Talks Taxes – AI &amp; 7216 Compliance
          </a>
          <a
            href="https://www.irs.gov/pub/irs-drop/rp-13-14.pdf"
            className={styles.refLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            → IRS Rev. Proc. 2013-14 (Consent Requirements)
          </a>
          <a
            href="https://www.law.cornell.edu/cfr/text/26/301.7216-3"
            className={styles.refLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            → 26 CFR 301.7216-3 (Disclosure Regulations)
          </a>
        </div>

        {/* CTA section */}
        <div className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Turn transcripts into clear answers</h2>
          <p className={styles.ctaDesc}>
            Use this guidance to interpret client transcripts quickly, summarize findings clearly,
            and decide next steps. When you need a clean client-ready deliverable, generate a
            transcript analysis report in minutes.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <a href="/#how-it-works" className={styles.ctaBtn}>
              Start Generating Transcript Reports
            </a>
            <a href="/resources/transcript-codes/" className={styles.ctaBtnSecondary}
              style={{ display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderRadius: 10, border: '1px solid rgba(20,184,166,0.3)', color: '#14b8a6', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem' }}>
              Browse Code Database
            </a>
          </div>
        </div>

      </div>
    </div>
    <SiteFooter />
    </>
  )
}
