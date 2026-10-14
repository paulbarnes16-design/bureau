import type { Metadata } from 'next'
import Link from 'next/link'
import Card from '@/components/Card'
import SiteShell from '@/components/SiteShell'
import { ORGANIZATION_SCHEMA } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'About bureau.money',
  description:
    'bureau.money is a set of free, independent UK money calculators. How they work, how the figures are checked, and what they do and don\'t do.',
  alternates: { canonical: 'https://bureau.money/about' },
}

export default function AboutPage() {
  return (
    <SiteShell title="About bureau.money" currentHref="/about" schemas={[ORGANIZATION_SCHEMA]} headingInPage>
      <div className="lg:grid lg:grid-cols-12 lg:gap-10">
        <Card className="p-5 lg:col-start-5 lg:col-span-8 space-y-4 font-sans text-[15px] text-black leading-relaxed">
          <h1 className="font-bold text-[20px]">About bureau.money</h1>
          <p>
            bureau.money is a set of free UK money calculators for savings, ISAs, mortgages, loans and pensions. There&apos;s
            no sign-up, no download and no adverts, and every calculation can be shared as a link.
          </p>
          <h3 className="font-bold pt-2">How the calculations work</h3>
          <p>
            Each calculator works month by month using standard formulas, which are explained in the &ldquo;How it works&rdquo;
            section on its page. UK rules such as ISA allowances, the cash ISA limit, pension tax relief and the Lump Sum
            Allowance are taken from GOV.UK and re-checked when they change.
          </p>
          <h3 className="font-bold pt-2">How the figures are checked</h3>
          <p>
            The calculators are tested against independent calculations, including every worked example quoted in the FAQs, and
            with extreme inputs to make sure they never give nonsense results.
          </p>
          <h3 className="font-bold pt-2">What bureau isn&apos;t</h3>
          <p>
            bureau is for information only and isn&apos;t financial advice. Results are illustrations based on the numbers you
            enter, and real returns, rates and rules change. For advice about your own situation, speak to a regulated
            financial adviser, or use the free guidance at{' '}
            <a href="https://www.moneyhelper.org.uk" className="underline hover:text-irn">MoneyHelper</a>.
          </p>
          <p>
            <Link href="/" className="underline hover:text-irn">Back to the calculators</Link>
          </p>
        </Card>
      </div>
    </SiteShell>
  )
}
