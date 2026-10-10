import type { Metadata } from 'next'
import { CURRENCIES, type Currency } from './calculate'
import { faqsUK } from './faq-data'
import { faqsUS } from './faq-data-us'
import { buildAppSchema, buildFaqSchema, type FaqItem } from './schemas'

export type { FaqItem }

export interface LocaleConfig {
  currency: Currency
  faqs: FaqItem[]
  metadata: Metadata
  appSchema: object
  faqSchema: object
}

const GBP = CURRENCIES[0]
const USD = CURRENCIES[1]

export const LOCALES: Record<string, LocaleConfig> = {
  uk: {
    currency: GBP,
    faqs: faqsUK,
    metadata: {
      metadataBase: new URL('https://bureau.money'),
      title: 'Compound Interest Calculator UK | bureau.money',
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
      authors: [{ name: 'Bureau' }],
      verification: { google: 'reSQj501BxtbXf1YmfQFjz8F-PAJ1BiS0KZiTeEkx6c' },
      openGraph: {
        title: 'Compound Interest Calculator UK | bureau.money',
        description:
          'Free compound interest calculator. See exactly how your savings and investments grow over time.',
        type: 'website',
        locale: 'en_GB',
        url: 'https://bureau.money',
        siteName: 'Bureau',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Compound Interest Calculator UK | bureau.money',
        description: 'Free compound interest calculator. See how your money grows over time.',
      },
      robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
      icons: {
        icon: [{ url: '/favicon.png', type: 'image/png', sizes: '96x96' }],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
      },
    },
    appSchema: buildAppSchema('https://bureau.money', 'Free compound interest calculator. Enter your starting balance, interest rate, and monthly contributions to see exactly how your savings or investments grow over time.', 'GBP'),
    faqSchema: buildFaqSchema(faqsUK),
  },
  us: {
    currency: USD,
    faqs: faqsUS,
    metadata: {
      metadataBase: new URL('https://bureau.money'),
      title: 'Compound Interest Calculator US | bureau.money',
      description:
        'Free compound interest calculator. Enter your starting balance, interest rate, and monthly contributions to see exactly how your savings or investments grow over time.',
      keywords: [
        'compound interest calculator',
        'compound interest calculator USA',
        'savings calculator',
        'investment growth calculator',
        '401k calculator',
        'Roth IRA calculator',
        'FIRE calculator',
      ],
      authors: [{ name: 'Bureau' }],
      openGraph: {
        title: 'Compound Interest Calculator US | bureau.money',
        description:
          'Free compound interest calculator. See exactly how your savings and investments grow over time.',
        type: 'website',
        locale: 'en_US',
        url: 'https://bureau.money/us',
        siteName: 'Bureau',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Compound Interest Calculator US | bureau.money',
        description: 'Free compound interest calculator. See how your money grows over time.',
      },
      robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
      icons: {
        icon: [{ url: '/favicon.png', type: 'image/png', sizes: '96x96' }],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
      },
    },
    appSchema: buildAppSchema('https://bureau.money/us', 'Free compound interest calculator. Enter your starting balance, interest rate, and monthly contributions to see exactly how your savings or investments grow over time.', 'USD'),
    faqSchema: buildFaqSchema(faqsUS),
  },
}
