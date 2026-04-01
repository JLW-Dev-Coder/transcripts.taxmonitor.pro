import type { Metadata } from 'next'
import { getAllResources } from '@/lib/getAllResources'
import CodesClient from './CodesClient'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'IRS Transcript Codes — Complete List',
  description:
    'Browse every IRS transcript transaction code. Search by number or keyword and get plain-English explanations built for tax professionals.',
}

function extractCode(slug: string): string {
  const match = slug.match(/irs-code-(\d+)/)
  return match ? match[1] : slug
}

export default function TranscriptCodesPage() {
  const all = getAllResources()
  const codes = all
    .filter((r) => r.slug.startsWith('irs-code-'))
    .map((r) => ({
      slug: r.slug,
      code: extractCode(r.slug),
      title: r.title,
      description: r.description,
    }))
    .sort((a, b) => Number(a.code) - Number(b.code))

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>IRS Transcript Codes</h1>
        <p className={styles.subtitle}>
          Every IRS transaction code explained in plain English. Search by code
          number or keyword to find what you need.
        </p>
        <CodesClient codes={codes} />
      </div>
    </main>
  )
}
