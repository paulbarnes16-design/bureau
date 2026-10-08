import Calculator from './Calculator'
import type { LocaleConfig } from '@/lib/locales'

export default function LocalePage({ locale }: { locale: LocaleConfig }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(locale.appSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(locale.faqSchema) }} />
      <div className="min-h-screen bg-background px-4 lg:px-10 pt-6 pb-12">
        <div className="space-y-6 lg:space-y-6">

          <div>
            <div className="flex items-center justify-between">
              <span className="font-mamoth text-[24px] leading-none text-black">bureau</span>
              <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-sans font-bold uppercase rounded-[2px] leading-none">
                Beta
              </span>
            </div>
            <h1 className="font-sans text-[15px] font-normal text-black">Compound Interest Calculator</h1>
          </div>

          <Calculator defaultInputs={{ currency: locale.currency }} faqs={locale.faqs} />

          <div className="pt-4 pb-2 lg:grid lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-start-5 lg:col-span-8">
              <p className="text-sm font-sans text-black leading-relaxed">
                Bureau is for informational purposes only and is not financial advice. We may earn a commission from partner links.
                <br />
                <a href="/privacy" className="underline hover:text-black transition-colors">Privacy Policy</a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
