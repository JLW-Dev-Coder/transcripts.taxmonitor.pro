import AssetClient from './AssetClient'

export function generateStaticParams() {
  return [{ slug: '_' }]
}

export const dynamicParams = false

export default async function AssetPage() {
  return <AssetClient />
}
