import Link from 'next/link'
import DoubleMoney from '@/components/DoubleMoney'
import Prose from '@/components/Prose'
import SiteShell from '@/components/SiteShell'
import { ruleOf72, yearsToDouble } from '@/lib/goals'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/double-your-money'
const DESCRIPTION =
  'How long does it take to double your money? Enter an interest rate to see exactly how many years it takes, and compare it with the Rule of 72.'

export const metadata = pageMetadata({
  path: PATH,
  title: 'How Long to Double Your Money? Rule of 72 Calculator | bureau',
  description: DESCRIPTION,
})

const RATES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]

const yrs = (n: number) => n.toFixed(1)

const faqs: FaqItem[] = [
  {
    question: 'How long does it take to double your money?',
    answer: `It depends on the rate. With interest compounded yearly, money doubles in about ${yrs(yearsToDouble(3))} years at 3%, ${yrs(yearsToDouble(5))} years at 5%, ${yrs(yearsToDouble(7))} years at 7% and ${yrs(yearsToDouble(10))} years at 10%.`,
  },
  {
    question: 'What is the Rule of 72?',
    answer:
      'The Rule of 72 is a quick way to estimate how long it takes to double your money: divide 72 by the annual interest rate. At 6%, 72 ÷ 6 = 12 years. It is most accurate for rates between about 6% and 10%.',
  },
  {
    question: 'How accurate is the Rule of 72?',
    answer: `Very close for typical rates. At 8% the rule gives ${yrs(ruleOf72(8))} years against an exact ${yrs(yearsToDouble(8))} years. It overestimates slightly at low rates (at 2% it says ${yrs(ruleOf72(2))} years; the exact figure is ${yrs(yearsToDouble(2))}) and underestimates at high rates.`,
  },
  {
    question: 'What is the exact formula for doubling time?',
    answer:
      'With interest compounded yearly, the exact doubling time is t = ln(2) ÷ ln(1 + r), where r is the annual interest rate as a decimal. At 7% that is ln(2) ÷ ln(1.07) ≈ 10.2 years.',
  },
  {
    question: 'Does inflation affect how long it takes to double?',
    answer:
      'Yes. To double your money in real terms (what it can buy), use the rate after inflation. If your savings earn 5% and inflation is 2.5%, the real rate is roughly 2.5%, so your purchasing power doubles in about 29 years rather than 14.',
  },
]

function Content() {
  return (
    <Prose>
      <h2>Years to double at each rate</h2>
      <table>
        <thead>
          <tr>
            <th>Interest rate</th>
            <th>Exact</th>
            <th>Rule of 72</th>
          </tr>
        </thead>
        <tbody>
          {RATES.map((r) => (
            <tr key={r}>
              <td>{r}%</td>
              <td>{yrs(yearsToDouble(r))} years</td>
              <td>{yrs(ruleOf72(r))} years</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Exact figures assume interest is compounded once a year.</p>

      <h3>Why compounding doubles your money</h3>
      <p>
        With compound interest, each year&apos;s interest is added to your balance and starts earning interest itself. The
        amount grows by the same percentage every year, so it doubles in the same number of years every time: £10,000 at
        7% becomes £20,000 in about 10 years, £40,000 in about 20, and £80,000 in about 30.
      </p>

      <h3>Doubling works against you on debt too</h3>
      <p>
        The same maths applies to borrowing. A credit card balance at 24% a year that you don&apos;t pay down doubles in
        about 3 years.
      </p>
      <p>
        Want to see a specific amount grow? Try <Link href="/how-much-will-10000-grow">how much £10,000 will grow</Link>.
      </p>
    </Prose>
  )
}

export default function DoubleYourMoneyPage() {
  return (
    <SiteShell
      title="How Long to Double Your Money?"
      intro="Enter an interest rate to see exactly how many years it takes to double your money, and how the Rule of 72 compares."
      currentHref={PATH}
      schemas={[
        buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'Double Your Money Calculator'),
        buildFaqSchema(faqs),
      ]}
    >
      <DoubleMoney content={<Content />} faqs={faqs} />
    </SiteShell>
  )
}
