import type { Resource } from '@/lib/types'
import Link from 'next/link'
import CTA from './CTA'

export default function Sidebar({ resource }: { resource: Resource }) {
  return (
    <aside>
      <CTA type={resource.cta} variant="sidebar" />
      {resource.related?.length > 0 && (
        <nav>
          <p><strong>Related</strong></p>
          <ul>
            {resource.related.map(slug => (
              <li key={slug}>
                <Link href={`/resources/${slug}`}>{slug.replace(/-/g, ' ')}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <p><Link href="/pricing">Pricing</Link></p>
      <p><Link href="/demo">Book Demo</Link></p>
    </aside>
  )
}
