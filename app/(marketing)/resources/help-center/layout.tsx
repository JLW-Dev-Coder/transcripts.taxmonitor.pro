import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center | Transcript Tax Monitor Pro',
  description: 'Get help using Transcript Tax Monitor Pro. Guides, FAQs, and support for tax professionals.',
}

export default function HelpCenterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
