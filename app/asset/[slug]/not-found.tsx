export default function AssetNotFound() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1210', color: '#e8ede9', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Page not found</h1>
        <p style={{ color: '#7a9688', fontSize: '15px', marginBottom: '24px' }}>This asset page doesn't exist or has been removed.</p>
        <a href="https://transcript.taxmonitor.pro" style={{ color: '#1a9e78', fontSize: '15px', textDecoration: 'none', fontWeight: 500 }}>
          Go to Transcript Tax Monitor Pro
        </a>
      </div>
    </div>
  )
}
