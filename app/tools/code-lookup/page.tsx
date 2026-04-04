import { getCodeIndex } from '@/lib/getCodeIndex'
import CodeLookupClient from './CodeLookupClient'

export const metadata = {
  title: 'IRS Transaction Code Lookup — Transcript Tax Monitor Pro',
  description:
    'Enter any IRS transaction code and get a plain-English explanation. Free, no account needed.',
}

const POPULAR = ['971', '846', '570', '150', '806', '766', '768', '420']

export default function CodeLookupPage() {
  const codes = getCodeIndex()
  const popular = POPULAR.map(c => codes.find(e => e.code === c)).filter(Boolean)

  return <CodeLookupClient codes={codes} popular={popular as typeof codes} />
}
