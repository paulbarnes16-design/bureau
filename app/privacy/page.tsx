import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Bureau',
  alternates: { canonical: 'https://www.bureau.money/privacy' },
  robots: { index: false },
}

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background px-4 lg:px-10 pt-6 pb-12">
      <div className="max-w-2xl">

        <div className="mb-8">
          <Link href="/" className="font-writer text-[32px] leading-none text-black">bureau</Link>
        </div>

        <h1 className="font-sans font-bold text-[28px] text-black mb-1">Privacy Policy</h1>
        <p className="text-sm font-sans text-subdued mb-8">Last updated: April 2026</p>

        <p className="font-sans text-[15px] text-black leading-relaxed mb-8">
          Bureau is a UK-based personal finance tool operated as a sole trader business.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="font-sans font-bold text-[17px] text-black mb-3">What we collect</h2>
            <p className="font-sans text-[15px] text-black leading-relaxed">
              Bureau does not use cookies and does not track you across other websites. We use PostHog Analytics to understand how people use Bureau — it is configured in memory-only mode, meaning no data is written to your device and no cookie consent is required. You can read about how PostHog works at{' '}
              <a href="https://posthog.com/privacy" className="underline">posthog.com/privacy</a>.
            </p>
            <p className="font-sans text-[15px] text-black leading-relaxed mt-3">
              When you use the calculator, the numbers you enter stay entirely in your browser. We do not store, transmit, or have access to any figures you input.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-[17px] text-black mb-3">Affiliate links</h2>
            <p className="font-sans text-[15px] text-black leading-relaxed">
              Some links on Bureau are affiliate links. If you click one and open an account with a partner, we may earn a commission. This is at no cost to you. We only link to products we consider genuinely relevant and useful.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-[17px] text-black mb-3">Your rights</h2>
            <p className="font-sans text-[15px] text-black leading-relaxed">
              Under UK GDPR you have the right to access, correct, or request deletion of any personal data we hold about you. As Bureau currently collects no personal data, there is nothing to access or delete.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-[17px] text-black mb-3">Changes to this policy</h2>
            <p className="font-sans text-[15px] text-black leading-relaxed">
              We may update this policy from time to time. The date at the top of this page will always reflect the most recent version.
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}
