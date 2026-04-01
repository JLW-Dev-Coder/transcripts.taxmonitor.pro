import { getAllResources } from '@/lib/getAllResources'

export const dynamic = 'force-static'

const CANONICAL_BASE = 'https://transcript.taxmonitor.pro'

export async function GET() {
  const resources = getAllResources()
  const urls = resources.map(r => `
  <url>
    <loc>${CANONICAL_BASE}/resources/${r.slug}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${CANONICAL_BASE}/</loc><priority>1.0</priority></url>
  <url><loc>${CANONICAL_BASE}/pricing/</loc><priority>0.9</priority></url>
  <url><loc>${CANONICAL_BASE}/demo/</loc><priority>0.9</priority></url>
  ${urls}
</urlset>`

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
