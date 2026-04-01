import { getAllResources } from '@/lib/getAllResources'
import { getResource } from '@/lib/getResource'
import { getTemplate } from '@/lib/templateRouter'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const CANONICAL_BASE = 'https://transcript.taxmonitor.pro'

export async function generateStaticParams() {
  return getAllResources().map(r => ({ slug: r.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const resource = getResource(slug)
  if (!resource) return {}
  const url = `${CANONICAL_BASE}/resources/${resource.slug}`
  return {
    title: resource.title,
    description: resource.description,
    alternates: { canonical: url },
    openGraph: { title: resource.title, description: resource.description, url, type: 'article' },
  }
}

export default async function ResourcePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const resource = getResource(slug)
  if (!resource) notFound()
  const Template = getTemplate(resource.template)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: resource.title,
          description: resource.description,
          url: `${CANONICAL_BASE}/resources/${resource.slug}`,
        })}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Resources', item: 'https://transcript.taxmonitor.pro/resources/' },
            resource.category === 'transaction-code'
              ? { '@type': 'ListItem', position: 2, name: 'IRS Codes', item: 'https://transcript.taxmonitor.pro/resources/transcript-codes/' }
              : { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://transcript.taxmonitor.pro/resources/' },
            { '@type': 'ListItem', position: 3, name: resource.title, item: `https://transcript.taxmonitor.pro/resources/${resource.slug}/` },
          ]
        })}}
      />
      <Template data={resource} />
    </>
  )
}
