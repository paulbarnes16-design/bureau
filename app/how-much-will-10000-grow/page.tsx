import Calculator from '@/components/Calculator'
import SiteShell from '@/components/SiteShell'
import { calculate, DEFAULT_INPUTS, type CalcInputs } from '@/lib/calculate'
import { gbp } from '@/lib/goals'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/how-much-will-10000-grow'
const DESCRIPTION =
  'How much will £10,000 grow in 5, 10, 20 or 30 years? See £10,000 with compound interest at any rate, with or without monthly top-ups.'

export const metadata = pageMetadata({ path: PATH, title: 'How Much Will £10,000 Grow? | bureau.money', description: DESCRIPTION })

const DEFAULTS: Partial<CalcInputs> = { initialInvestment: 10000, interestRate: 5, durationYears: 10 }

const grow = (rate: number, years: number, monthly = 0) =>
  gbp(calculate({ ...DEFAULT_INPUTS, ...DEFAULTS, interestRate: rate, durationYears: years, additionalPayments: monthly }).futureValue)

const faqs: FaqItem[] = [
  {
    question: 'How much will £10,000 be worth in 10 years?',
    answer: `With interest added monthly and nothing else paid in, about ${grow(3, 10)} at 3%, ${grow(5, 10)} at 5% and ${grow(7, 10)} at 7%. That's before tax, fees and inflation.`,
  },
  {
    question: 'How much will £10,000 be worth in 20 or 30 years?',
    answer: `At 5%, about ${grow(5, 20)} after 20 years and ${grow(5, 30)} after 30. At 7%, about ${grow(7, 20)} and ${grow(7, 30)}.`,
  },
  {
    question: 'How long does it take £10,000 to double?',
    answer:
      'About 14 years at 5%, 10 years at 7% and 7 years at 10%. A quick estimate is the Rule of 72: divide 72 by the interest rate.',
  },
  {
    question: 'What difference does adding money each month make?',
    answer: `A big one. £10,000 left for 20 years at 7% grows to about ${grow(7, 20)}. Adding £100 a month takes it to about ${grow(7, 20, 100)}.`,
  },
  {
    question: 'Where can I put £10,000 to grow?',
    answer:
      'Usually a savings account, a cash ISA or a stocks and shares ISA. Cash is safer but tends to grow more slowly. Investments can fall, but have historically grown faster over 10 years or more. An ISA keeps the growth tax-free.',
  },
]

export default function TenThousandPage() {
  return (
    <SiteShell
      title="How much will £10,000 grow?"
      currentHref={PATH}
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', '£10,000 Growth Calculator'), buildFaqSchema(faqs)]}
    >
      <Calculator defaultInputs={DEFAULTS} faqs={faqs} />
    </SiteShell>
  )
}
