import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import styles from './page.module.css'

const CANONICAL_BASE = 'https://transcript.taxmonitor.pro'

export const metadata: Metadata = {
  title: 'About - Transcript Tax Monitor Pro',
  description:
    'Why Transcript Tax Monitor Pro exists: to help tax professionals turn confusing IRS transcripts into clear, branded, client-ready reports in minutes.',
  alternates: { canonical: `${CANONICAL_BASE}/about` },
  openGraph: {
    title: 'About - Transcript Tax Monitor Pro',
    description:
      'Why Transcript Tax Monitor Pro exists: to help tax professionals turn confusing IRS transcripts into clear, branded, client-ready reports in minutes.',
    url: `${CANONICAL_BASE}/about`,
    type: 'website',
  },
}

const REDDIT_CARDS = [
  {
    user: 'u/AuditPanic',
    sub: 'r/IRS',
    quote: 'I saw code 420 and assumed my life was over.',
    href: 'https://www.reddit.com/r/IRS/comments/1v70k4u/',
    solved: 'calm, contextual explanation',
  },
  {
    user: 'u/ClientTranslator',
    sub: 'r/taxpros',
    quote: 'I spend too much time translating transcript language into something a client can read.',
    href: 'https://www.reddit.com/r/taxpros/comments/1j2r6o8/',
    solved: 'branded report output',
  },
  {
    user: 'u/CodeConfused',
    sub: 'r/IRS',
    quote: 'I have a 570 code, an 806 code, and no idea if I\'m in trouble.',
    href: 'https://www.reddit.com/r/IRS/comments/1jn67nh/',
    solved: 'plain-English interpretation',
  },
  {
    user: 'u/RefundTimeline',
    sub: 'r/IRS',
    quote: 'My transcript shows 846 with a date, but my refund still isn\'t here. What does that actually mean?',
    href: 'https://www.reddit.com/r/IRS/comments/1r9uyfz/',
    solved: 'clearer sequence and timing summary',
  },
  {
    user: 'u/TransactionLost',
    sub: 'r/tax',
    quote: 'I\'m really just confused by the transactions section.',
    href: 'https://www.reddit.com/r/tax/comments/1q40o5h/',
    solved: 'readable summaries instead of raw transcript rows',
  },
  {
    user: 'u/WorkflowTired',
    sub: 'r/taxpros',
    quote: 'I keep rewriting the same explanation for the same transcript patterns.',
    href: 'https://www.reddit.com/r/taxpros/comments/1j3q9pk/',
    solved: 'repeatable report generation',
  },
  {
    user: 'u/FreezeConfused',
    sub: 'r/IRS',
    quote: '810 showed up and suddenly it feels like everything is frozen.',
    href: 'https://www.reddit.com/r/IRS/comments/1c3k6sy/',
    solved: 'refund freeze explanation',
  },
  {
    user: 'u/NoticeTimeline',
    sub: 'r/IRS',
    quote: 'My 570 and 971 codes have the same date and I still do not know what happens next.',
    href: 'https://www.reddit.com/r/IRS/comments/1ike0nw/',
    solved: 'sequence and notice timing',
  },
  {
    user: 'u/ZeroBalancePanic',
    sub: 'r/IRS',
    quote: 'It says additional tax assessed, but the amount is zero. Why does this sound so dramatic?',
    href: 'https://www.reddit.com/r/IRS/comments/1jpoiws/',
    solved: 'plain-English code context',
  },
]

export default function AboutPage() {
  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.badge}>About</div>
          <h1 className={styles.heroTitle}>
            Built to turn IRS transcript chaos into client-ready clarity
          </h1>
          <p className={styles.heroSub}>
            Transcript.Tax Monitor Pro helps tax professionals parse, interpret, and present IRS
            transcript data in a format clients can actually understand.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/pricing" className={styles.btnPrimary}>View Pricing</Link>
            <a
              href="/magnets/lead-magnet.html"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnSecondary}
            >
              Get the Free Guide
            </a>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className={styles.founder}>
        <div className={styles.founderInner}>
          <div className={styles.founderPhoto}>
            <Image
              src="https://20896460.fs1.hubspotusercontent-na1.net/hubfs/20896460/Development%20Materials/Miscellaneous/Pic_JLW_Left-removebg-preview.png"
              alt="Jamie L. Williams — Founder"
              width={160}
              height={160}
              className={styles.founderImg}
              unoptimized
            />
            <p className={styles.founderName}>Jamie L. Williams</p>
            <p className={styles.founderTitle}>Founder • Systems builder</p>
            <a
              href="https://www.linkedin.com/in/virtuallaunchpro/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkedIn}
            >
              LinkedIn →
            </a>
          </div>

          <div className={styles.founderContent}>
            <h2 className={styles.missionHeadline}>
              Make transcript interpretation faster, clearer, and easier to deliver
            </h2>
            <p className={styles.missionBody}>
              IRS transcripts are full of codes, dates, and sequences that make sense to systems
              and specialists, but not to stressed clients. We built Transcript.Tax Monitor Pro to
              close that gap. It parses the transcript, organizes the signal, and turns it into a
              clean summary you can confidently send under your own brand.
            </p>
            <div className={styles.founderStats}>
              <div className={styles.founderStat}>
                <span className={styles.founderStatValue}>Client-ready</span>
                <span className={styles.founderStatLabel}>Clear branded reports</span>
              </div>
              <div className={styles.founderStat}>
                <span className={styles.founderStatValue}>Local-first</span>
                <span className={styles.founderStatLabel}>Private PDF processing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reddit Pain Points */}
      <section className={styles.painPoints}>
        <div className={styles.sectionInner}>
          <div className={styles.badge}>Real frustrations, solved</div>
          <h2 className={styles.sectionTitle}>What tax professionals say online</h2>
          <p className={styles.sectionSub}>
            These aren&apos;t made-up scenarios. They&apos;re real posts from Reddit threads about IRS transcripts.
          </p>
          <div className={styles.redditGrid}>
            {REDDIT_CARDS.map((card) => (
              <div key={card.href} className={styles.redditCard}>
                <div className={styles.redditMeta}>
                  <span className={styles.redditUser}>{card.user}</span>
                  <span className={styles.redditSub}>{card.sub}</span>
                </div>
                <blockquote className={styles.redditQuote}>&ldquo;{card.quote}&rdquo;</blockquote>
                <div className={styles.redditSolved}>
                  <span className={styles.solvedLabel}>Solved with:</span> {card.solved}
                </div>
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.redditLink}
                >
                  View thread →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className={styles.ctaBand}>
        <div className={styles.ctaBandInner}>
          <h2 className={styles.ctaBandTitle}>Ready to clean up your transcript workflow?</h2>
          <p className={styles.ctaBandSub}>
            Use Transcript.Tax Monitor Pro to turn raw IRS transcript data into polished
            explanations your clients can actually follow.
          </p>
          <div className={styles.ctaBandActions}>
            <Link href="/pricing" className={styles.btnPrimary}>See Pricing</Link>
            <a
              href="/magnets/lead-magnet.html"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnSecondary}
            >
              Get the Free Guide
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
