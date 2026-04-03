import { notFound } from 'next/navigation'
import AssetPageClient from './AssetClient'

interface Props {
  params: Promise<{ slug: string }>
}

async function getAssetData(slug: string) {
  const workerUrl = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.virtuallaunch.pro'
  const token = process.env.R2_CANONICAL_WRITE_TOKEN
  const key = `vlp-scale/asset-pages/${slug}.json`

  const res = await fetch(
    `${workerUrl}/v1/r2/${encodeURIComponent(key)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    }
  )

  if (!res.ok) return null
  return res.json()
}

export const dynamic = 'force-dynamic'

export default async function AssetPage({ params }: Props) {
  const { slug } = await params
  const data = await getAssetData(slug)
  if (!data) notFound()
  return <AssetPageClient data={data} slug={slug} />
}
