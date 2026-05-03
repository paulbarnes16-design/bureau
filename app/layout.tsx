import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { appSchema, faqSchema } from '@/lib/schemas'
import './globals.css'

const ppWriter = localFont({
  src: [
    { path: '../fonts/PPWriter-UltraboldItalic.woff2' },
    { path: '../fonts/PPWriter-UltraboldItalic.woff' },
  ],
  variable: '--font-writer',
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pangram-sans',
  display: 'swap',
})

const ibmPlexSansCondensed = IBM_Plex_Sans_Condensed({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-pangram-condensed',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://bureau.money'),
  title: 'Compound Interest — bureau',
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
      { url: '/favicon_light.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/favicon_dark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon_light.png', type: 'image/png', sizes: '32x32', media: '(prefers-color-scheme: light)' },
      { url: '/favicon_dark.png', type: 'image/png', sizes: '32x32', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon_light.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  authors: [{ name: 'Bureau' }],
  verification: {
    google: 'reSQj501BxtbXf1YmfQFjz8F-PAJ1BiS0KZiTeEkx6c',
  },
  openGraph: {
    title: 'Compound Interest — bureau',
    description:
      'Free compound interest calculator. See exactly how your savings and investments grow over time.',
    type: 'website',
    locale: 'en_GB',
    url: 'https://bureau.money',
    siteName: 'Bureau',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compound Interest — bureau',
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
      className={`${ppWriter.variable} ${ibmPlexSans.variable} ${ibmPlexSansCondensed.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
        <Script id="posthog-init" strategy="afterInteractive">{`
          !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+" (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing opt_in_capturing has_opted_out_capturing has_opted_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
          posthog.init('phc_yH3VMPxxmynWHeF6fZwNmCZLo42cUGcJBBcWUqDV22xx',{api_host:'https://us.i.posthog.com',persistence:'memory',person_profiles:'never'});
        `}</Script>
      </body>
    </html>
  )
}
