import { notFound } from 'next/navigation'
import AssetPageClient from './AssetClient'

interface Props {
  params: Promise<{ slug: string }>
}

async function getAssetData(slug: string) {
  const res = await fetch(
    `https://api.virtuallaunch.pro/v1/scale/asset/${encodeURIComponent(slug)}`,
    { cache: 'no-store' }
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
