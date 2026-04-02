import type { Metadata } from 'next'
import CtaBand from '@/components/CtaBand'
import ParserSection from './ParserSection'
import PricingSection from './PricingSection'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Transcript Tax Monitor Pro - IRS Transcript Automation',
  description:
    'The only automation tool tax professionals need to parse, interpret, and present IRS transcript data with branded client reports.',
  alternates: {
    canonical: 'https://transcript.taxmonitor.pro',
  },
  openGraph: {
    title: 'Transcript Tax Monitor Pro - IRS Transcript Automation',
    description:
      'The only automation tool tax professionals need to parse, interpret, and present IRS transcript data with branded client reports.',
    url: 'https://transcript.taxmonitor.pro',
    siteName: 'Transcript Tax Monitor Pro',
    type: 'website',
  },
}

const PAIN_CARDS = [
  {
    title: 'Clients are confused',
    body: "They send a transcript and ask, 'Is this bad?' You lose 20 minutes translating codes into plain English — for every single client.",
  },
  {
    title: 'You rewrite explanations',
    body: 'Same transcripts. Same codes. Same explanations — written from scratch every time. Your expertise deserves better than copy-paste.',
  },
  {
    title: 'Intimidating transcripts',
    body: "Even when nothing is wrong. A clean summary would eliminate client anxiety before it starts — but that takes time you don't have.",
  },
]

const FEATURE_CARDS = [
  {
    title: 'Smart PDF Parsing',
    body: 'Upload PDFs directly from SOAR or IRS accounts. The parser extracts every transaction code, date, and amount automatically.',
  },
  {
    title: 'IRS Code Interpretation',
    body: 'Automatic interpretation using official IRS publications. Every code explained in plain English, in context.',
  },
  {
    title: 'Branded Reports',
    body: 'Add your logo and firm colors. Deliver polished, professional reports your clients will actually read and trust.',
  },
  {
    title: 'Lightning Fast',
    body: 'Process transcripts in seconds, not hours. Handle more clients without hiring more staff.',
  },
  {
    title: 'Simple, One-Time Purchase',
    body: 'Purchase credits once and use them when you need them. No subscriptions, no monthly fees, no surprises.',
  },
  {
    title: 'Secure & Private',
    body: 'Runs locally on your computer. Client data never leaves your machine — full compliance, zero cloud risk.',
  },
]

const SOLVES_CARDS = [
  {
    title: 'Stop wasting billable time',
    bullets: [
      'No more manual code lookups',
      'Automated interpretation saves hours per client',
      'Focus on strategy, not decoding',
    ],
  },
  {
    title: 'Reduce client anxiety',
    bullets: [
      'Clear, plain-English summaries',
      'Branded reports clients can actually read',
      "Instant answers to 'Is this bad?'",
    ],
  },
  {
    title: "Make 'weird transcript stuff' understandable",
    bullets: [
      'Every code explained in context',
      'Visual timeline of IRS actions',
      'Shareable PDF summaries',
    ],
  },
]

const USE_CASES = [
  { label: '846 — Refund timing questions',       url: '/resources/irs-code-846-meaning/' },
  { label: '420 — Audit code explanation',         url: '/resources/irs-code-420-meaning/' },
  { label: '424 — Examination referral',           url: '/resources/irs-code-424-meaning/' },
  { label: '810 — Refund freeze analysis',         url: '/resources/irs-code-810-meaning/' },
  { label: '290 — Zero additional tax',            url: '/resources/irs-code-290-meaning/' },
  { label: '570 + 806 — Refund hold combination',  url: '/resources/irs-transcript-shows-570-what-next/' },
  { label: '150 + 806 — Basic return filed',       url: '/resources/irs-code-150-meaning/' },
  { label: '570 + 971 — Notice timeline',          url: '/resources/irs-code-971-meaning/' },
  { label: 'Transactions unreadable',              url: '/resources/how-to-read-irs-transcripts/' },
]

export default function HomePage() {
  return (
    <div className={styles.page}>

      {/* 1. HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>Built for 750,000+ U.S. Tax Professionals</div>
            <h1 className={styles.heroTitle}>
              Transform IRS Transcripts Into Professional Reports in Minutes
            </h1>
            <p className={styles.heroSub}>
              The only automation tool tax professionals need to parse, interpret, and present
              IRS transcript data with beautiful, branded reports your clients will love.
            </p>
            <div className={styles.heroCtas}>
              <a
                href="https://transcript.taxmonitor.pro/magnets/lead-magnet.html"
                className={styles.btnPrimary}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Your Free Guide →
              </a>
              <a href="#how-it-works" className={styles.btnSecondary}>
                See How It Works
              </a>
            </div>
            <div className={styles.trustBadges}>
              <span className={styles.trustBadge}>Free Sign-In</span>
              <span className={styles.trustDot} aria-hidden="true" />
              <span className={styles.trustBadge}>Instant Access</span>
            </div>
          </div>

          <div className={styles.heroCard} aria-hidden="true">
            <div className={styles.heroCardHeader}>
              <span className={styles.heroCardDot} />
              <span className={styles.heroCardDot} />
              <span className={styles.heroCardDot} />
              <span className={styles.heroCardTitle}>Report Generated</span>
            </div>
            <div className={styles.heroCardBody}>
              <div className={styles.heroCardRow}>
                <span className={styles.heroCardLabel}>Client</span>
                <span className={styles.heroCardValue}>Johnson Family Trust</span>
              </div>
              <div className={styles.heroCardRow}>
                <span className={styles.heroCardLabel}>Transcript Codes Found</span>
                <span className={styles.heroCardValue}>24</span>
              </div>
              <div className={styles.heroCardRow}>
                <span className={styles.heroCardLabel}>Interpretation Accuracy</span>
                <span className={`${styles.heroCardValue} ${styles.heroCardAccent}`}>100%</span>
              </div>
              <div className={styles.heroCardRow}>
                <span className={styles.heroCardLabel}>Processing Time</span>
                <span className={styles.heroCardValue}>8.3 sec</span>
              </div>
              <div className={styles.heroCardPreview}>
                <span className={styles.heroCardPreviewLabel}>Sample Output Preview</span>
                <div className={styles.heroCardPreviewLines}>
                  <span />
                  <span />
                  <span />
                  <span className={styles.heroCardPreviewShort} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SOUND FAMILIAR */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionBadge}>Sound Familiar?</div>
          <h2 className={styles.sectionTitle}>Every tax pro faces these daily</h2>
          <div className={styles.cardGrid}>
            {PAIN_CARDS.map((card) => (
              <div key={card.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardBody}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS — PARSER */}
      <section className={styles.parserSection} id="how-it-works">
        <div className={styles.sectionInner}>
          <div className={styles.sectionBadge}>How It Works</div>
          <h2 className={styles.sectionTitle}>See the parser in action</h2>
          <p className={styles.sectionSub}>
            Upload a transcript, get a professional report — in seconds.
          </p>
        </div>
        <ParserSection />
      </section>

      {/* 4. FEATURES */}
      <section className={styles.section} id="features">
        <div className={styles.sectionInner}>
          <div className={styles.sectionBadge}>Features</div>
          <h2 className={styles.sectionTitle}>Everything you need, nothing you don't</h2>
          <div className={styles.featureGrid}>
            {FEATURE_CARDS.map((card) => (
              <div key={card.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardBody}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHAT THIS TOOL SOLVES */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionBadge}>What This Solves</div>
          <h2 className={styles.sectionTitle}>Built to fix real workflow problems</h2>
          <div className={styles.cardGrid}>
            {SOLVES_CARDS.map((card) => (
              <div key={card.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <ul className={styles.bulletList}>
                  {card.bullets.map((b) => (
                    <li key={b} className={styles.bulletItem}>
                      <span className={styles.bulletDot} aria-hidden="true">→</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PRICING */}
      <PricingSection />

      {/* 7. USE CASES */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionBadge}>Use Cases</div>
          <h2 className={styles.sectionTitle}>Real scenarios, handled instantly</h2>
          <p className={styles.sectionSub}>
            Each scenario links to real-world community context.
          </p>
          <div className={styles.useCaseGrid}>
            {USE_CASES.map((uc) => (
              <a
                key={uc.label}
                href={uc.url}
                className={styles.useCaseCard}
              >
                <span className={styles.useCaseLabel}>{uc.label}</span>
                <span className={styles.useCaseArrow}>→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 8. BOTTOM CTA BAND */}
      <CtaBand
        title="Ready to transform your transcript workflow?"
        body="Upload a client's IRS transcript PDF and get a plain-English analysis report in seconds — with every transaction code explained and recommendations included."
        primaryLabel="Try the Parser Free"
        primaryHref="/app/dashboard/"
        secondaryLabel="Get the Free Guide"
        secondaryHref="/magnets/lead-magnet/"
      />

    </div>
  )
}
