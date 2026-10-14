import Calculator from './Calculator'
import SiteShell from './SiteShell'
import { HOW_IT_WORKS, RELATED } from '@/lib/how-it-works'
import type { LocaleConfig } from '@/lib/locales'
import { ORGANIZATION_SCHEMA, WEBSITE_SCHEMA } from '@/lib/schemas'

export default function LocalePage({ locale }: { locale: LocaleConfig }) {
  const isUK = locale.currency.code === 'GBP'
  return (
    <SiteShell
      title="Compound Interest Calculator"
      schemas={isUK ? [WEBSITE_SCHEMA, ORGANIZATION_SCHEMA, locale.appSchema, locale.faqSchema] : [locale.appSchema, locale.faqSchema]}
      currentHref="/"
      showTools={isUK}
    >
      <Calculator
        defaultInputs={{ currency: locale.currency }}
        faqs={locale.faqs}
        howItWorks={HOW_IT_WORKS.compound}
        related={isUK ? RELATED['/'] : undefined}
      />
    </SiteShell>
  )
}
