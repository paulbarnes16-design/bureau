import type { Metadata } from 'next'
import Image from 'next/image'
import Calculator from '@/components/Calculator'

export const metadata: Metadata = {
  alternates: { canonical: 'https://bureau.money' },
}

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Compound Interest Calculator',
  url: 'https://bureau.money',
  description:
    'Free compound interest calculator. Enter your starting balance, interest rate, and monthly contributions to see exactly how your savings or investments grow over time.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'GBP',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Bureau',
    url: 'https://bureau.money',
  },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />

      <div className="min-h-screen bg-background px-4 lg:px-10 pt-4 lg:pt-10 pb-12">
        <div className="space-y-3 lg:space-y-10">

          {/* Header */}
          <div>
            <span className="font-writer text-[40px] leading-none text-black">bureau</span>
            <p className="font-sans text-[15px] text-black mt-1">Compound Interest Calculator</p>
          </div>

          <h1 className="sr-only">Compound Interest Calculator</h1>
          <Calculator />

          {/* Footer */}
          <div className="pt-4 pb-2 lg:grid lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-start-5 lg:col-span-8">
              <p className="text-sm font-sans text-black leading-relaxed">
                Bureau is for informational purposes only and is not financial advice. We may earn a commission from partner links.{' '}
                <a href="/privacy" className="underline hover:text-black transition-colors">Privacy Policy</a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
