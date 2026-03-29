import type { Metadata } from 'next'
import GuideClient from './GuideClient'

const CANONICAL_BASE = 'https://transcript.taxmonitor.pro'

export const metadata: Metadata = {
  title: 'The Ultimate Guide to IRS Transcript Codes',
  description:
    'A comprehensive reference guide for tax professionals. Every IRS transcript code explained with plain English, real-world scenarios, and action steps.',
  alternates: { canonical: `${CANONICAL_BASE}/magnets/guide` },
  openGraph: {
    title: 'The Ultimate Guide to IRS Transcript Codes',
    description:
      'A comprehensive reference guide for tax professionals. Every IRS transcript code explained with plain English, real-world scenarios, and action steps.',
    url: `${CANONICAL_BASE}/magnets/guide`,
    type: 'website',
  },
}

export default function GuidePage() {
  return <GuideClient />
}
