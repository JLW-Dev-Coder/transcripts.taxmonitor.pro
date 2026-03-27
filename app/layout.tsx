import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: { default: 'Transcript Tax Monitor Pro', template: '%s | Transcript Tax Monitor Pro' },
  description: 'IRS transcript analysis tool for tax professionals.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
