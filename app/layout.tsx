import type { Metadata } from 'next'
import { JetBrains_Mono, DM_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
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
  metadataBase: new URL('https://bureau.money'),
  title: 'Compound Interest Calculator — Bureau',
  description:
    'Free compound interest calculator. Enter your starting balance, interest rate, and monthly contributions to see exactly how your savings or investments grow over time.',
  keywords: [
    'compound interest calculator',
    'compound interest calculator UK',
    'savings calculator',
    'investment growth calculator',
    'ISA calculator UK',
    'FIRE calculator',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  authors: [{ name: 'Bureau' }],
  verification: {
    google: 'reSQj501BxtbXf1YmfQFjz8F-PAJ1BiS0KZiTeEkx6c',
  },
  openGraph: {
    title: 'Compound Interest Calculator — Bureau',
    description:
      'Free compound interest calculator. See exactly how your savings and investments grow over time.',
    type: 'website',
    locale: 'en_GB',
    url: 'https://bureau.money',
    siteName: 'Bureau',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compound Interest Calculator — Bureau',
    description: 'Free compound interest calculator. See how your money grows over time.',
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
      <body className="font-sans antialiased">{children}<Analytics /><SpeedInsights /></body>
    </html>
  )
}
