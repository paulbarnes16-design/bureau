import Calculator from './Calculator'
import SiteShell from './SiteShell'
import type { LocaleConfig } from '@/lib/locales'

export default function LocalePage({ locale }: { locale: LocaleConfig }) {
  const isUK = locale.currency.code === 'GBP'
  return (
    <SiteShell
      title="Compound Interest Calculator"
      schemas={[locale.appSchema, locale.faqSchema]}
      currentHref="/"
      showTools={isUK}
    >
      <Calculator defaultInputs={{ currency: locale.currency }} faqs={locale.faqs} />
    </SiteShell>
  )
}
