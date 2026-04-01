'use client'

import styles from './product.module.css'

const PACKS = [
  {
    credits: 10,
    price: '$19',
    label: '10 Credits',
    featured: false,
    url: 'https://billing.taxmonitor.pro/b/4gM8wOaAe1oKcUEdTkaR203',
  },
  {
    credits: 25,
    price: '$29',
    label: '25 Credits',
    featured: true,
    url: 'https://billing.taxmonitor.pro/b/cNi14m5fU3wS1bW9D4aR204',
  },
  {
    credits: 100,
    price: '$129',
    label: '100 Credits',
    featured: false,
    url: 'https://billing.taxmonitor.pro/b/dRm8wO7o27N83k47uWaR205',
  },
]

// Sorted alphabetically
const PERKS = [
  'Client-ready report preview',
  'Credits applied instantly',
  'Local PDF parsing',
]

export default function PricingGrid() {
  return (
    <section className={styles.pricingSection} id="pricing">
      <div className={styles.sectionInner}>
        <div className={styles.sectionBadge}>Pricing</div>
        <h2 className={styles.sectionTitle}>Simple pricing. Buy credits. Move on.</h2>
        <p className={styles.sectionSub}>No subscriptions, no weird tiers, no drama.</p>

        <div className={styles.pricingGrid}>
          {PACKS.map((pack) => (
            <div
              key={pack.credits}
              className={`${styles.pricingCard} ${pack.featured ? styles.pricingCardFeatured : ''}`}
            >
              {pack.featured && (
                <div className={styles.pricingBadge}>Most popular</div>
              )}
              <div className={styles.pricingLabel}>{pack.label}</div>
              <div className={styles.pricingPrice}>{pack.price}</div>
              <ul className={styles.pricingPerks}>
                {PERKS.map((perk) => (
                  <li key={perk} className={styles.pricingPerk}>
                    <span className={styles.perkCheck}>&#10003;</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <a
                href={pack.url}
                className={pack.featured ? styles.btnPrimary : styles.btnSecondary}
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy Now &rarr;
              </a>
            </div>
          ))}
        </div>

        <p className={styles.pricingFootnote}>
          Payments are processed by Stripe. Credits apply instantly after checkout.
        </p>
      </div>
    </section>
  )
}
