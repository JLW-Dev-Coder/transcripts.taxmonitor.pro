import type { CtaType } from '@/lib/types'
import Link from 'next/link'

const CTA_CONFIG: Record<CtaType, { label: string; href: string }> = {
  'transcript-analysis': { label: 'Transcript Analysis Tool', href: '/demo' },
  'free-trial':          { label: 'Start Free Trial',         href: '/pricing' },
  'demo':                { label: 'Book Demo',                href: '/demo' },
  'buy':                 { label: 'Buy Now',                  href: '/pricing' },
}

export default function CTA({ type, variant = 'inline' }: {
  type: CtaType
  variant?: 'inline' | 'post-content' | 'sidebar'
}) {
  const { label, href } = CTA_CONFIG[type]
  return (
    <div data-cta-variant={variant} style={{ margin: '1.5rem 0' }}>
      <Link href={href}>
        <button>{label} →</button>
      </Link>
    </div>
  )
}
