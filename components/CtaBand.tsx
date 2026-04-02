import Link from 'next/link'

interface CtaBandProps {
  title: string
  body: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
}

export default function CtaBand({
  title, body,
  primaryLabel, primaryHref,
  secondaryLabel, secondaryHref,
}: CtaBandProps) {
  return (
    <section style={{ padding: '4rem 1.5rem' }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        textAlign: 'center',
        borderRadius: 'var(--radius, 12px)',
        padding: '3rem 2rem',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        position: 'relative',
        background: `
          radial-gradient(1200px 220px at 50% 0%, rgba(94,234,212,0.28), transparent 60%),
          linear-gradient(180deg, rgba(20,184,166,0.34) 0%, rgba(20,184,166,0.18) 45%, rgba(15,15,26,0.12) 100%)
        `,
      }}>
        {/* Bottom glow */}
        <div style={{
          position: 'absolute', left: '-10%', right: '-10%',
          bottom: -70, height: 180, borderRadius: 999,
          background: 'rgba(20,184,166,0.25)',
          filter: 'blur(26px)', opacity: 0.9,
          pointerEvents: 'none',
        }} />

        <h2 style={{
          fontSize: '2rem', fontWeight: 800,
          letterSpacing: '-0.03em', marginBottom: '0.75rem',
          color: 'var(--text, #f9fafb)', position: 'relative', zIndex: 1,
        }}>{title}</h2>

        <p style={{
          fontSize: '1.05rem', color: 'rgba(255,255,255,0.82)',
          maxWidth: '52rem', margin: '0 auto',
          lineHeight: 1.8, position: 'relative', zIndex: 1,
        }}>{body}</p>

        <div style={{
          display: 'flex', gap: '1rem',
          justifyContent: 'center', flexWrap: 'wrap',
          marginTop: '2rem', position: 'relative', zIndex: 1,
        }}>
          <Link href={primaryHref} style={{
            background: '#14b8a6', color: '#0b1220',
            fontWeight: 800, padding: '0.875rem 1.75rem',
            borderRadius: 'var(--radius, 12px)',
            textDecoration: 'none', display: 'inline-block',
            transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          }}>{primaryLabel}</Link>

          <Link href={secondaryHref} style={{
            background: 'transparent', color: '#14b8a6',
            border: '1px solid rgba(20,184,166,0.4)',
            fontWeight: 800, padding: '0.875rem 1.75rem',
            borderRadius: 'var(--radius, 12px)',
            textDecoration: 'none', display: 'inline-block',
            transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
          }}>{secondaryLabel}</Link>
        </div>
      </div>
    </section>
  )
}
