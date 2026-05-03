import type { Metadata } from 'next'
import { LOCALES } from '@/lib/locales'
import LocalePage from '@/components/LocalePage'

const locale = LOCALES.us

export const metadata: Metadata = {
  ...locale.metadata,
  alternates: { canonical: 'https://bureau.money/us' },
}

export default function USPage() {
  return <LocalePage locale={locale} />
}
