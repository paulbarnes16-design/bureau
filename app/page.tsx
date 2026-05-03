import type { Metadata } from 'next'
import { LOCALES } from '@/lib/locales'
import LocalePage from '@/components/LocalePage'

const locale = LOCALES.uk

export const metadata: Metadata = {
  ...locale.metadata,
  alternates: { canonical: 'https://bureau.money' },
}

export default function Home() {
  return <LocalePage locale={locale} />
}
