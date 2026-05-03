import type { Metadata } from 'next'
import { LOCALES } from '@/lib/locales'
import LocalePage from '@/components/LocalePage'

const locale = LOCALES.us

export const metadata: Metadata = {
  ...locale.metadata,
  alternates: {
    canonical: 'https://bureau.money/us',
    languages: {
      'en-GB': 'https://bureau.money',
      'en-US': 'https://bureau.money/us',
      'x-default': 'https://bureau.money',
    },
  },
}

export default function USPage() {
  return <LocalePage locale={locale} />
}
