import type { Metadata } from 'next'
import styles from '../legal.module.css'

const CANONICAL_BASE = 'https://transcript.taxmonitor.pro'

export const metadata: Metadata = {
  title: 'Privacy Policy - Transcript Tax Monitor Pro',
  description:
    'Privacy policy for Transcript Tax Monitor Pro covering install data handling, confidentiality, and client data practices.',
  alternates: { canonical: `${CANONICAL_BASE}/legal/privacy` },
  openGraph: {
    title: 'Privacy Policy - Transcript Tax Monitor Pro',
    description:
      'Privacy policy for Transcript Tax Monitor Pro covering install data handling, confidentiality, and client data practices.',
    url: `${CANONICAL_BASE}/legal/privacy`,
    type: 'website',
  },
}

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Privacy Policy</h1>
          <p className={styles.pageSubtitle}>Install Data Handling</p>
          <p className={styles.lastUpdated}>Last updated: February 10, 2026</p>
        </div>

        <div className={styles.glassCard}>
          <section className={styles.section}>
            <p className={styles.body}>
              This Privacy Policy explains how Lenore, Inc. (&ldquo;Provider&rdquo;) may access and handle Client information during platform installs.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Install Data Handling</h2>
            <p className={styles.body}>
              Provider may access Client information only as reasonably necessary to complete installation, configuration, troubleshooting, verification of deliverables, and administrative transfer.
              Provider does not sell Client data.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>A. Information Provider May Receive</h2>
            <p className={styles.body}>
              Provider may receive or have access to Client-provided information such as administrative credentials, user lists, business contact information, workflows, templates, messages, portal content, files, and configuration data. Depending on Client&apos;s use of the platform, Provider may also incidentally view information uploaded by Client or Client&apos;s end users.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>B. Purpose of Access</h2>
            <p className={styles.body}>
              Provider will access and use information only as reasonably necessary to complete the Install, perform troubleshooting, verify deliverables, and transfer administrative control back to Client.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>C. Data Minimization</h2>
            <p className={styles.body}>
              Provider will make reasonable efforts to minimize access to content not required for installation. Client is encouraged to avoid uploading sensitive information into the platform during the Install unless it is necessary for testing or configuration.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>D. Confidentiality &amp; Security</h2>
            <p className={styles.body}>
              Provider will maintain commercially reasonable administrative, technical, and organizational safeguards to protect information accessed during the Install. Client remains responsible for selecting secure credentials, enabling platform security settings, and managing user permissions after transfer.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>E. Credential Handling</h2>
            <p className={styles.body}>
              Client may provide credentials or temporary access links to enable installation. Client may revoke Provider access at any time; however, doing so may pause or prevent completion. After completion, Client should rotate any temporary passwords, revoke temporary invites, and confirm Super Admin ownership.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>F. Third-Party Platforms</h2>
            <p className={styles.body}>
              The platform is a third-party service. Provider does not control and is not responsible for the platform provider&apos;s privacy practices, security controls, data processing, retention, or hosting. Client is responsible for reviewing and accepting the third-party platform&apos;s privacy policy and terms.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>G. Data Retention</h2>
            <p className={styles.body}>
              Provider does not intend to store Client data outside the platform except as necessary for installation documentation, support records, invoicing, or proof of delivery. Any retained information will be limited and kept only for as long as reasonably necessary for business and legal purposes.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>H. Client Requests</h2>
            <p className={styles.body}>
              Client may request deletion of Provider-held installation artifacts or documentation that contain Client information, to the extent Provider is not required to retain the information for legal, tax, accounting, dispute, or recordkeeping obligations.
            </p>
          </section>

          <section className={styles.sectionLast}>
            <h2 className={styles.sectionTitle}>Contact</h2>
            <p className={styles.body}>
              For questions regarding this Privacy Policy or Provider&apos;s data handling practices, contact Lenore, Inc. through official business channels.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
