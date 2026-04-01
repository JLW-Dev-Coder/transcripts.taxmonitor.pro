import { getAllResources } from '@/lib/getAllResources'
import CodesClient from './CodesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IRS Transcript Codes — Complete List | Transcript Tax Monitor',
  description: 'Search and filter all IRS transaction codes. Plain-English explanations for every code that appears on IRS account transcripts.',
}

function extractCode(slug: string): string {
  const match = slug.match(/irs-code-(\d+[a-zA-Z]?)-meaning/)
  return match ? match[1].toUpperCase() : slug
}

export default function TranscriptCodesPage() {
  const all = getAllResources()
  const codes = all
    .filter(r => r.slug.startsWith('irs-code-') && r.slug.endsWith('-meaning'))
    .map(r => ({
      slug: r.slug,
      title: r.title,
      description: r.description || '',
      code: extractCode(r.slug),
    }))
    .sort((a, b) => {
      const numA = parseInt(a.code.replace(/\D/g, '')) || 0
      const numB = parseInt(b.code.replace(/\D/g, '')) || 0
      return numA - numB
    })

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <a href="/resources/" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>Resources</a>
          <span style={{ fontSize: '0.75rem', color: 'var(--surface-border)' }}>/</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IRS Codes</span>
        </nav>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: '0.75rem' }}>
          IRS Transcript Codes
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 600 }}>
          Search all {codes.length} IRS transaction codes. Click any code for a plain-English explanation, practitioner workflow, and client script.
        </p>
      </div>
      <CodesClient items={codes} />
    </main>
  )
}
