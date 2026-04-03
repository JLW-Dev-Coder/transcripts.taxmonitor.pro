import AssetPageClient from './AssetClient'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return [{ slug: '_' }]
}

export default async function AssetPage({ params }: Props) {
  const { slug } = await params
  return <AssetPageClient slug={slug} />
}
