import type { Metadata } from 'next'
import { Raleway } from 'next/font/google'
import './globals.css'

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-raleway',
})

export const metadata: Metadata = {
  title: { default: 'Transcript Tax Monitor Pro', template: '%s | Transcript Tax Monitor Pro' },
  description: 'IRS transcript analysis tool for tax professionals.',
  icons: [
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={raleway.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </head>
      <body>
        <div id="page-loader" className="page-loader" aria-hidden="true" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener('load',function(){var l=document.getElementById('page-loader');if(l)l.classList.add('loaded')})`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
