import type { CtaType } from '@/lib/types'
import Link from 'next/link'
import styles from './CTA.module.css'

const CTA_CONFIG: Record<CtaType, { label: string; href: string }> = {
  'transcript-analysis': { label: 'Transcript Analysis Tool →', href: '/demo' },
  'free-trial':          { label: 'Start Free Trial →',         href: '/pricing' },
  'demo':                { label: 'Book a Demo →',              href: '/demo' },
  'buy':                 { label: 'Buy Now →',                  href: '/pricing' },
}

export default function CTA({ type, variant = 'inline' }: {
  type: CtaType
  variant?: 'inline' | 'post-content' | 'sidebar'
}) {
  const { label, href } = CTA_CONFIG[type]
  const wrapperClass = variant === 'inline' ? styles.inline
    : variant === 'post-content' ? styles.postContent
    : styles.sidebar

  return (
    <div className={wrapperClass}>
      <Link href={href} className={styles.btn}>{label}</Link>
    </div>
  )
}
