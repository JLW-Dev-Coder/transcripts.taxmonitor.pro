import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './resources-hub.module.css'

export const metadata: Metadata = {
  title: 'IRS Transcript Resources for Tax Professionals',
  description:
    'Explore IRS transcript resources for taxpayers and tax professionals: guides, transcript types, workflows, comparisons, and problem-based explanations.',
  alternates: {
    canonical: 'https://transcript.taxmonitor.pro/resources',
  },
  openGraph: {
    title: 'IRS Transcript Resources for Tax Professionals',
    description:
      'Guides, transcript types, workflows, comparisons, and problem-based pages for understanding IRS transcripts.',
    type: 'website',
    url: 'https://transcript.taxmonitor.pro/resources',
  },
}

const transcriptTypeCards = [
  { title: 'Account Transcript Explained', href: '/resources/account-transcript-explained' },
  { title: 'Record of Account Transcript Explained', href: '/resources/record-of-account-transcript-explained' },
  { title: 'Return Transcript Explained', href: '/resources/return-transcript-explained' },
  { title: 'Tax Compliance Transcript Explained', href: '/resources/tax-compliance-transcript-explained' },
  { title: 'Tax Return Transcript vs Account Transcript', href: '/resources/tax-return-transcript-vs-account-transcript' },
  { title: 'Wage and Income Transcript Explained', href: '/resources/wage-and-income-transcript-explained' },
]

const workflowCards = [
  { title: 'How CPA Firms Use IRS Transcript Reports', href: '/resources/how-cpa-firms-use-irs-transcript-reports' },
  { title: 'How to Add a Paid Transcript Analysis to Your Firm', href: '/resources/how-to-add-a-paid-transcript-analysis-to-your-firm' },
  { title: 'How to Interpret IRS Transcripts Faster', href: '/resources/how-to-interpret-irs-transcripts-faster' },
  { title: 'How to Prepare for a Tax Resolution Consult Using Transcripts', href: '/resources/how-to-prepare-for-a-tax-resolution-consult-using-transcripts' },
  { title: 'How to Sell a Transcript Analysis as a Standalone Service', href: '/resources/how-to-sell-a-transcript-analysis-as-a-standalone-service' },
  { title: 'How to Standardize Transcript Interpretation Across Staff', href: '/resources/how-to-standardize-transcript-interpretation-across-staff' },
  { title: 'IRS Transcript Review Checklist for Tax Professionals', href: '/resources/irs-transcript-review-checklist-for-tax-professionals' },
  { title: 'Selling a $199 Transcript Review Product', href: '/resources/selling-a-199-transcript-review-product' },
  { title: 'Structuring a Transcript-Based Consultation', href: '/resources/structuring-a-transcript-based-consultation' },
  { title: 'Transcript Analysis as a Lead Qualification Tool', href: '/resources/transcript-analysis-as-a-lead-qualification-tool' },
  { title: 'Turning IRS Transcripts Into Billable Deliverables', href: '/resources/turning-irs-transcripts-into-billable-deliverables' },
  { title: 'Using Transcript Reports to Increase Close Rates', href: '/resources/using-transcript-reports-to-increase-close-rates' },
]

const comparisonCards = [
  { title: 'Canopy vs Manual Transcript Interpretation', href: '/resources/canopy-vs-manual-transcript-interpretation' },
  { title: 'Cloud Transcript Tools vs Local Parsing', href: '/resources/cloud-transcript-tools-vs-local-parsing' },
  { title: 'Intuit Transcript Feature vs Dedicated Parser', href: '/resources/intuit-transcript-feature-vs-dedicated-parser' },
  { title: 'IRS Transcript Automation Software Comparison', href: '/resources/irs-transcript-automation-software-comparison' },
  { title: 'Local IRS Transcript Parsing vs Upload-Based Tools', href: '/resources/local-irs-transcript-parsing-vs-upload-based-tools' },
  { title: 'Manual Transcript Reading vs Automated Reports', href: '/resources/manual-transcript-reading-vs-automated-reports' },
  { title: 'PitBullTax Transcript Reports vs Local Parsing', href: '/resources/pitbulltax-transcript-reports-vs-local-parsing' },
  { title: 'Why Local Transcript Parsing Matters for Data Privacy', href: '/resources/why-local-transcript-parsing-matters-for-data-privacy' },
]

const problemCards = [
  { title: 'How to Explain an IRS Transcript to a Client', href: '/resources/how-to-explain-an-irs-transcript-to-a-client' },
  { title: 'How to Read an IRS Account Transcript', href: '/resources/how-to-read-an-irs-account-transcript' },
  { title: 'How to Understand IRS Transaction Codes', href: '/resources/how-to-understand-irs-transaction-codes' },
  { title: 'IRS Transcript Codes Explained in Plain English', href: '/resources/irs-transcript-codes-explained-in-plain-english' },
  { title: 'IRS Transcript Shows 570 – What Next?', href: '/resources/irs-transcript-shows-570-what-next' },
  { title: 'IRS Transcript Shows 971 – What It Means', href: '/resources/irs-transcript-shows-971-what-it-means' },
  { title: 'What Does Code 150 Mean on IRS Transcript?', href: '/resources/what-does-irs-code-150-mean' },
  { title: 'What Does Code 806 Mean on IRS Transcript?', href: '/resources/what-does-irs-code-806-mean' },
  { title: 'What Does Code 971 Mean on IRS Transcript?', href: '/resources/what-does-irs-code-971-mean' },
  { title: 'Why Is My Refund Delayed Code 846?', href: '/resources/why-is-my-refund-delayed-code-846' },
]

function CardGrid({ cards }: { cards: { title: string; href: string }[] }) {
  return (
    <div className={styles.cardGrid}>
      {cards.map((card) => (
        <Link key={card.href} href={card.href} className={styles.card}>
          <span className={styles.cardTitle}>
            {card.title}
            <span className={styles.cardArrow}> →</span>
          </span>
        </Link>
      ))}
    </div>
  )
}

export default function ResourcesHubPage() {
  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>IRS Transcript Resources for Tax Professionals</h1>
          <p className={styles.subheadline}>
            Practical guides, transcript types, and code explanations for faster review and clearer client communication.
          </p>
          <p className={styles.introPara}>
            <strong>Use this hub to find what you need fast.</strong>
          </p>
          <p className={styles.introPara}>
            If you review transcripts for refunds, compliance, audits, collections, or resolution work, the fastest path
            is always the same:
          </p>
          <ul className={styles.introList}>
            <li>
              <Link href="#core-guide">
                <strong>Start with the guide</strong>
              </Link>{' '}
              to understand layout and sequencing
            </li>
            <li>
              <Link href="#transcript-types">
                <strong>Confirm transcript type</strong>
              </Link>{' '}
              so you are reading the right document
            </li>
            <li>
              <Link href="#problem-learning">
                <strong>Look up transaction codes</strong>
              </Link>{' '}
              to interpret dates, amounts, and next steps
            </li>
            <li>
              <Link href="#workflow-playbooks">
                <strong>Standardize your workflow</strong>
              </Link>{' '}
              so staff and clients get consistent answers
            </li>
          </ul>
          <p className={styles.introPara}>
            This page organizes our non-code resources (guides, transcript types, workflows, comparisons, and common
            problems) alongside the code database so you can move from &ldquo;What is this?&rdquo; to &ldquo;What do we
            do next?&rdquo; without hunting around.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/resources/transcript-codes" className={styles.btnPrimary}>
              Explore Transcript Code Database
            </Link>
            <Link href="/#how-it-works" className={styles.btnSecondary}>
              Generate Transcript Report
            </Link>
          </div>
        </div>
      </section>

      {/* Section 1 — Resources hub */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Resources hub</h2>
          <p className={styles.sectionIntro}>
            This page is the directory for our non-code resources. Use it to navigate by intent: learn the basics,
            confirm transcript types, improve your review workflow, compare approaches, or solve a specific transcript
            problem.
          </p>
          <p className={styles.sectionIntro} style={{ marginTop: '1rem' }}>
            For tax professionals, this hub is designed to support:
          </p>
          <ul className={styles.introList}>
            <li>Faster transcript review and issue spotting</li>
            <li>Clear, consistent client explanations</li>
            <li>Repeatable internal processes for staff</li>
          </ul>
          <div className={styles.diagram}>
            <div className={styles.diagramItem}>Resource</div>
            <div className={styles.diagramArrow}>→</div>
            <div className={styles.diagramItem}>Interpret</div>
            <div className={styles.diagramArrow}>→</div>
            <div className={styles.diagramItem}>Explain</div>
            <div className={styles.diagramArrow}>→</div>
            <div className={styles.diagramItem}>Next steps</div>
          </div>
        </div>
      </section>

      {/* Section 2 — Core Authority Guide */}
      <section id="core-guide" className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Core Authority Guide</h2>
          <p className={styles.sectionIntro}>
            Start with the guide if you want a reliable baseline for reading transcripts: what the sections mean, how
            transaction codes sequence over time, and how to summarize findings in plain English for a client.
          </p>
          <CardGrid
            cards={[
              {
                title: 'The Complete Guide to Reading IRS Transcripts',
                href: '/resources/how-to-read-irs-transcripts',
              },
            ]}
          />
        </div>
      </section>

      {/* Section 3 — Transcript Type Library */}
      <section id="transcript-types" className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Transcript Type Library</h2>
          <p className={styles.sectionIntro}>
            Transcript types are not interchangeable. This section helps you quickly choose the right transcript for the
            job, understand what it includes, and avoid common misreads that lead to bad conclusions.
          </p>
          <CardGrid cards={transcriptTypeCards} />
        </div>
      </section>

      {/* Section 4 — Workflow & Revenue Playbooks */}
      <section id="workflow-playbooks" className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Workflow &amp; Revenue Playbooks</h2>
          <p className={styles.sectionIntro}>
            Professional workflow pages focus on consistency: what to check, how to document findings, and how to
            communicate next steps. These are written for firms that want repeatable transcript review across staff and
            engagements.
          </p>
          <CardGrid cards={workflowCards} />
        </div>
      </section>

      {/* Section 5 — Software & Workflow Comparisons */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Software &amp; Workflow Comparisons</h2>
          <p className={styles.sectionIntro}>
            Comparison pages explain trade-offs without hype. If you are choosing between manual review and automated
            reporting, or local parsing versus cloud tools, this section makes the differences clear.
          </p>
          <CardGrid cards={comparisonCards} />
        </div>
      </section>

      {/* Section 6 — Problem-Based Learning */}
      <section id="problem-learning" className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Problem-Based Learning</h2>
          <p className={styles.sectionIntro}>
            Problem pages answer the questions that come up mid-review: refund timing, holds, notices, and what specific
            codes usually mean in sequence. These are written to help you decide what to check next and how to explain
            it.
          </p>
          <CardGrid cards={problemCards} />
        </div>
      </section>

      {/* Section 7 — Final CTA band */}
      <section className={styles.ctaBandSection}>
        <div className={styles.ctaBand}>
          <h2 className={styles.ctaBandTitle}>Turn transcripts into clear answers</h2>
          <p className={styles.ctaBandBody}>
            Use the resources above to interpret a transcript quickly, summarize findings clearly, and decide next steps.
            When you need a clean client-ready deliverable, generate a transcript report in minutes.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/#how-it-works" className={styles.ctaBtnPrimary}>
              Start Generating Transcript Reports
            </Link>
            <Link href="/resources/transcript-codes" className={styles.ctaBtnSecondary}>
              Browse Code Database
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
