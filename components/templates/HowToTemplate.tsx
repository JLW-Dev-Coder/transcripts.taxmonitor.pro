import type { Resource } from '@/lib/types'
import ResourceLayout from '../ResourceLayout'

export default function HowToTemplate({ data }: { data: Resource }) {
  return (
    <ResourceLayout resource={data} accentOverride="#f59e0b">
      <div dangerouslySetInnerHTML={{ __html: data.content }} />

      <h2 style={{ color: '#f9fafb', borderTopColor: '#f59e0b' }}>Automate This Process</h2>
      <p>
        Instead of following these steps manually for every client, use the
        Transcript Tax Monitor Pro parser to handle transcript interpretation
        automatically. Upload a PDF and get a complete plain-English report
        — including every transaction code explained — in under 10 seconds.
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        background: 'rgba(245,158,11,0.06)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 10,
        padding: '0.875rem 1rem',
        marginTop: '1.5rem',
      }}>
        <span style={{ fontSize: '0.875rem', color: '#f9fafb', fontWeight: 500 }}>
          Skip the manual steps — parse in seconds
        </span>
        <a href="/login" style={{
          background: '#f59e0b',
          color: '#000',
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '6px 14px',
          borderRadius: 9999,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          Start Free Trial →
        </a>
      </div>
    </ResourceLayout>
  )
}
