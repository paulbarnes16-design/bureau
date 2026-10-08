import Link from 'next/link'
import Calculator from '@/components/Calculator'
import Prose from '@/components/Prose'
import SiteShell from '@/components/SiteShell'
import { calculate, DEFAULT_INPUTS, type CalcInputs } from '@/lib/calculate'
import { gbp } from '@/lib/goals'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/how-much-will-10000-grow'
const DESCRIPTION =
  'How much will £10,000 grow in 5, 10, 20 or 30 years? See £10,000 at 3%, 5%, 7% and 10% with compound interest, and calculate your own figures.'

export const metadata = pageMetadata({
  path: PATH,
  title: 'How Much Will £10,000 Grow? | bureau',
  description: DESCRIPTION,
})

const DEFAULTS: Partial<CalcInputs> = {
  initialInvestment: 10000,
  interestRate: 5,
  durationYears: 10,
}

const RATES = [3, 5, 7, 10]
const YEARS = [5, 10, 20, 30]

function grow(rate: number, years: number, monthly = 0) {
  return calculate({ ...DEFAULT_INPUTS, ...DEFAULTS, interestRate: rate, durationYears: years, additionalPayments: monthly }).futureValue
}

const tenYears5 = grow(5, 10)
const tenYears7 = grow(7, 10)
const twentyYears7 = grow(7, 20)
const withMonthly = grow(7, 20, 100)

const faqs: FaqItem[] = [
  {
    question: 'How much will £10,000 be worth in 10 years?',
    answer: `With interest compounded monthly and no further deposits, £10,000 grows to about ${gbp(tenYears5)} at 5% and ${gbp(tenYears7)} at 7% after 10 years. These figures are before tax, fees and inflation.`,
  },
  {
    question: 'How long does it take £10,000 to double?',
    answer:
      'At 5% a year it takes about 14 years; at 7%, about 10 years; at 10%, about 7 years. A quick way to estimate it is the Rule of 72: divide 72 by the interest rate. See the double your money calculator for any rate.',
  },
  {
    question: 'Where can I put £10,000 to grow?',
    answer:
      'Common options in the UK are an easy-access or fixed-rate savings account, a cash ISA, or a stocks and shares ISA. Cash is safer but usually grows more slowly; investments can fall in value but have historically grown faster over 10 years or more. An ISA keeps the growth free of tax.',
  },
  {
    question: 'How much difference does adding money each month make?',
    answer: `A lot. £10,000 left for 20 years at 7% grows to about ${gbp(twentyYears7)}. Adding £100 a month on top takes it to about ${gbp(withMonthly)}. Add a monthly amount in the "Additional contributions" field to see your own figures.`,
  },
]

function Content() {
  return (
    <Prose>
      <h2>£10,000 at different rates</h2>
      <p>What a one-off £10,000 grows to, with interest compounded monthly and nothing else added:</p>
      <table>
        <thead>
          <tr>
            <th>Rate</th>
            {YEARS.map((y) => (
              <th key={y}>{y} years</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RATES.map((r) => (
            <tr key={r}>
              <td>{r}%</td>
              {YEARS.map((y) => (
                <td key={y}>{gbp(grow(r, y))}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Why the rate matters so much</h3>
      <p>
        Over 30 years, the gap between 3% and 7% turns into tens of thousands of pounds, because each year&apos;s interest
        earns interest of its own. The longer you leave the money, the more the rate dominates the result.
      </p>

      <h3>What these rates look like in practice</h3>
      <ul>
        <li><strong>3–5%:</strong> typical of savings accounts and cash ISAs, depending on interest rates at the time.</li>
        <li><strong>5–7%:</strong> a planning range many people use for a diversified stocks and shares ISA or pension.</li>
        <li><strong>10%:</strong> close to the long-run average for US shares before inflation, but far from guaranteed.</li>
      </ul>
      <p>
        These figures ignore tax, fees and inflation. Turn on &ldquo;Adjust for inflation&rdquo; in the calculator to see
        what your money would be worth in today&apos;s pounds, or see <Link href="/double-your-money">how long it takes to double</Link>.
      </p>
    </Prose>
  )
}

export default function TenThousandPage() {
  return (
    <SiteShell
      title="How Much Will £10,000 Grow?"
      intro="See what £10,000 could grow to with compound interest. Change the amount, rate and timeframe to match your plans."
      currentHref={PATH}
      schemas={[
        buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', '£10,000 Growth Calculator'),
        buildFaqSchema(faqs),
      ]}
    >
      <Calculator defaultInputs={DEFAULTS} faqs={faqs} content={<Content />} />
    </SiteShell>
  )
}
