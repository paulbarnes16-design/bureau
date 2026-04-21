import type { Metadata } from 'next'
import { JetBrains_Mono, DM_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const ppWoodland = localFont({
  src: [
    { path: './fonts/PPWoodland-Heavy.woff2' },
    { path: './fonts/PPWoodland-Heavy.woff' },
  ],
  weight: '900',
  variable: '--font-woodland',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Compound Interest Calculator UK — Bureau',
  description:
    'Calculate compound interest for UK savings and investments. See how your money grows over time with our free compound interest calculator, including ISA and FIRE planning.',
  keywords: [
    'compound interest calculator UK',
    'savings calculator UK',
    'ISA calculator UK',
    'FIRE calculator UK',
    'investment calculator UK',
  ],
  authors: [{ name: 'Bureau' }],
  openGraph: {
    title: 'Compound Interest Calculator UK — Bureau',
    description:
      'See exactly how your savings and investments could grow. Free compound interest calculator built for UK investors.',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compound Interest Calculator UK — Bureau',
    description: 'See exactly how your savings and investments could grow.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${ppWoodland.variable} ${jetbrainsMono.variable} ${dmSans.variable}`}
    >
      <body className="font-sans antialiased">{children}<Analytics /></body>
    </html>
  )
}
