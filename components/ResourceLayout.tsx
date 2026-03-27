import type { Resource } from '@/lib/types'
import Sidebar from './Sidebar'
import CTA from './CTA'

export default function ResourceLayout({
  resource,
  children,
}: {
  resource: Resource
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <main style={{ flex: 1 }}>
        <h1>{resource.title}</h1>
        <CTA type={resource.cta} variant="inline" />
        {children}
        <CTA type={resource.cta} variant="post-content" />
      </main>
      <Sidebar resource={resource} />
    </div>
  )
}
