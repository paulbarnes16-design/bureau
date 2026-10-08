import Link from 'next/link'
import Calculator from '@/components/Calculator'
import Prose from '@/components/Prose'
import SiteShell from '@/components/SiteShell'
import { calculate, DEFAULT_INPUTS, type CalcInputs } from '@/lib/calculate'
import { gbp } from '@/lib/goals'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/isa-calculator'
const DESCRIPTION =
  'Free ISA calculator for 2026/27. See how much your cash or stocks and shares ISA could grow, tax-free, with regular monthly contributions.'

export const metadata = pageMetadata({
  path: PATH,
  title: 'ISA Calculator UK 2026/27 | bureau',
  description: DESCRIPTION,
})

// £20,000 a year, paid monthly
const MONTHLY_MAX = 1666

const DEFAULTS: Partial<CalcInputs> = {
  initialInvestment: 0,
  additionalPayments: MONTHLY_MAX,
  interestRate: 5,
  durationYears: 10,
}

function growth(rate: number, years: number) {
  return calculate({ ...DEFAULT_INPUTS, ...DEFAULTS, interestRate: rate, durationYears: years }).futureValue
}

const YEARS = [5, 10, 20, 30]

const faqs: FaqItem[] = [
  {
    question: 'How much can I put in an ISA in 2026/27?',
    answer:
      'You can pay up to £20,000 into ISAs in the 2026/27 tax year, which runs from 6 April 2026 to 5 April 2027. You can put it all in one ISA or split it between cash, stocks and shares, Innovative Finance and Lifetime ISAs. Any allowance you don\'t use is lost at the end of the tax year — it can\'t be carried forward.',
  },
  {
    question: 'What is changing with cash ISAs in April 2027?',
    answer:
      'From 6 April 2027, savers under 65 will only be able to put £12,000 a year into cash ISAs. The overall allowance stays at £20,000, so to use all of it the remaining £8,000 would need to go into a stocks and shares ISA. Savers aged 65 and over keep the full £20,000 cash limit.',
  },
  {
    question: 'Is ISA growth really tax-free?',
    answer:
      'Yes. Interest, dividends and capital gains earned inside an ISA are free of UK tax, and you pay no tax when you take money out. Outside an ISA, interest above your Personal Savings Allowance (£1,000 for basic-rate taxpayers, £500 for higher-rate, £0 for additional-rate) is taxed at your income tax rate.',
  },
  {
    question: 'What growth rate should I use for my ISA?',
    answer:
      'For a cash ISA, use the interest rate your account pays. For a stocks and shares ISA, many people plan with 5–7% a year, which is below the long-run average for global shares but allows for weaker periods. Returns are not guaranteed, and investments can fall as well as rise. Remember to allow for platform and fund fees, which you can add in the Advanced tab.',
  },
  {
    question: 'Can I have more than one ISA?',
    answer:
      'Yes. You can hold as many ISAs as you like, and since April 2024 you can pay into more than one ISA of the same type in the same tax year. The total you pay in across all of them must stay within your £20,000 allowance.',
  },
]

function Content() {
  return (
    <Prose>
      <h2>How an ISA grows</h2>
      <p>
        An ISA (Individual Savings Account) is a tax-free wrapper for your savings or investments. Interest, dividends and
        gains inside it are never taxed, so all of your growth stays invested and keeps compounding. Over long periods that
        makes a real difference to the final pot.
      </p>

      <h3>ISA allowance for 2026/27</h3>
      <ul>
        <li>You can pay in up to <strong>£20,000</strong> per tax year (6 April to 5 April), across all your ISAs.</li>
        <li>Unused allowance can&apos;t be carried forward to the next tax year.</li>
        <li>From 6 April 2027, under-65s can put at most <strong>£12,000</strong> a year into cash ISAs. The rest of the £20,000 can go into stocks and shares.</li>
        <li>Junior ISAs have a separate limit of <strong>£9,000</strong> per child.</li>
      </ul>

      <h3>What filling your ISA every year adds up to</h3>
      <p>
        Paying in {gbp(MONTHLY_MAX)} a month (just under the £20,000 yearly allowance), with interest compounded monthly:
      </p>
      <table>
        <thead>
          <tr>
            <th>After</th>
            <th>Paid in</th>
            <th>At 4%</th>
            <th>At 7%</th>
          </tr>
        </thead>
        <tbody>
          {YEARS.map((y) => (
            <tr key={y}>
              <td>{y} years</td>
              <td>{gbp(MONTHLY_MAX * 12 * y)}</td>
              <td>{gbp(growth(4, y))}</td>
              <td>{gbp(growth(7, y))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        4% is roughly what a competitive cash ISA might pay; 7% is a long-term planning figure some investors use for a
        stocks and shares ISA. Neither is guaranteed.
      </p>

      <h3>Cash ISA or stocks and shares ISA?</h3>
      <p>
        A cash ISA pays interest and your balance can&apos;t fall, which suits money you&apos;ll need within a few years.
        A stocks and shares ISA invests in funds or shares. It can fall in value, but over 10 years or more it has
        historically grown faster than cash. Many people use both: cash for short-term goals, investments for the long term.
      </p>
      <p>
        Want to see the total for a specific target instead? Try the <Link href="/savings-goal-calculator">savings goal calculator</Link>.
      </p>
    </Prose>
  )
}

export default function IsaCalculatorPage() {
  return (
    <SiteShell
      title="ISA Calculator"
      intro="See how your ISA could grow, tax-free. Adjust your monthly payments, growth rate and timeframe."
      currentHref={PATH}
      schemas={[
        buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'ISA Calculator'),
        buildFaqSchema(faqs),
      ]}
    >
      <Calculator defaultInputs={DEFAULTS} faqs={faqs} content={<Content />} />
    </SiteShell>
  )
}
