import Image from 'next/image'
import Calculator from '@/components/Calculator'
import { faqs } from '@/lib/faq-data'

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-background px-4 lg:px-10 pt-4 lg:pt-10 pb-12">
        <div className="space-y-3 lg:space-y-10">

          {/* Header card */}
          <div className="bg-elevated rounded-2xl shadow-card ring-2 ring-inset ring-white px-10 py-6">
            <Image src="/logo.png" alt="bureau" height={28} width={120} className="h-7 w-auto" />
            <p className="font-sans text-xs text-subdued mt-1">Compound Interest Calculator</p>
          </div>

          {/* Calculator */}
          <h1 className="sr-only">Compound Interest Calculator</h1>
          <Calculator />

          {/* Footer */}
          <div className="pt-4 pb-2">
            <p className="text-xs font-sans text-subdued text-center leading-relaxed">
              Bureau is for informational purposes only and is not financial advice. We may earn a commission from partner links.{' '}
              <a href="/privacy" className="underline hover:text-black transition-colors">Privacy Policy</a>
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
