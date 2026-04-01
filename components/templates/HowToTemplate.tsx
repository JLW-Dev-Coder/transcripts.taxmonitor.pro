import type { Resource } from '@/lib/types'
import ResourceLayout from '../ResourceLayout'

export default function HowToTemplate({ data }: { data: Resource }) {
  return (
    <ResourceLayout resource={data}>
      <div dangerouslySetInnerHTML={{ __html: data.content }} />

      <h2 style={{
        fontSize: '1.35rem',
        fontWeight: 700,
        color: '#f9fafb',
        margin: '2rem 0 0.75rem',
        paddingTop: '2rem',
        borderTop: '1px solid #f59e0b',
      }}>
        Automate This Process
      </h2>
      <p style={{ fontSize: '1rem', color: '#9ca3af', lineHeight: 1.75, marginBottom: '1rem' }}>
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
        background: 'rgba(245,158,11,0.07)',
        border: '1px solid rgba(245,158,11,0.25)',
        borderRadius: 10,
        padding: '0.875rem 1.125rem',
        marginTop: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.875rem', color: '#f9fafb', fontWeight: 500 }}>
          Skip the manual steps — parse in seconds
        </span>
        <a href="/login" style={{
          background: '#f59e0b',
          color: '#000',
          fontSize: '0.8125rem',
          fontWeight: 700,
          padding: '0.5rem 1.125rem',
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
