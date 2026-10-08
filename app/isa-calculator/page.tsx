import Calculator from '@/components/Calculator'
import SiteShell from '@/components/SiteShell'
import { calculate, DEFAULT_INPUTS, type CalcInputs } from '@/lib/calculate'
import { gbp } from '@/lib/goals'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/isa-calculator'
const DESCRIPTION =
  'Free ISA calculator for 2026/27. See how much your cash or stocks and shares ISA could grow, tax-free, with monthly contributions.'

export const metadata = pageMetadata({ path: PATH, title: 'ISA Calculator UK 2026/27 | bureau', description: DESCRIPTION })

// £20,000 a year, paid monthly
const DEFAULTS: Partial<CalcInputs> = { initialInvestment: 0, additionalPayments: 1666, interestRate: 5, durationYears: 10 }

const full = (rate: number, years: number) =>
  gbp(calculate({ ...DEFAULT_INPUTS, ...DEFAULTS, interestRate: rate, durationYears: years }).futureValue)

const faqs: FaqItem[] = [
  {
    question: 'How much can I put in an ISA in 2026/27?',
    answer:
      'Up to £20,000 between 6 April 2026 and 5 April 2027. You can put it all in one ISA or split it across cash, stocks and shares, Lifetime and Innovative Finance ISAs. Anything you don\'t use is lost at the end of the tax year.',
  },
  {
    question: 'What changes for cash ISAs in April 2027?',
    answer:
      'From 6 April 2027, under-65s can only put £12,000 a year into cash ISAs. The overall allowance stays at £20,000, so the other £8,000 would need to go into a stocks and shares ISA. Over-65s keep the full £20,000 cash limit.',
  },
  {
    question: 'How much will my ISA be worth if I max it out?',
    answer: `Paying in £1,666 a month, a full ISA could grow to about ${full(4, 10)} after 10 years at 4%, or ${full(7, 10)} at 7%. After 20 years that becomes ${full(4, 20)} at 4% or ${full(7, 20)} at 7%. Investment returns aren't guaranteed.`,
  },
  {
    question: 'Is ISA growth really tax-free?',
    answer:
      'Yes. You pay no tax on interest, dividends or gains inside an ISA, or when you take money out. Outside an ISA, interest above your Personal Savings Allowance (£1,000 for basic-rate taxpayers, £500 for higher-rate) is taxed.',
  },
  {
    question: 'What growth rate should I use?',
    answer:
      'For a cash ISA, use your account\'s interest rate. For a stocks and shares ISA, 5 to 7% a year is a common planning figure, but returns aren\'t guaranteed and can be negative. You can add platform fees in the Advanced tab.',
  },
  {
    question: 'Can I have more than one ISA?',
    answer:
      'Yes. Since April 2024 you can pay into more than one ISA of the same type in a tax year, as long as the total stays within £20,000.',
  },
]

export default function IsaCalculatorPage() {
  return (
    <SiteShell
      title="ISA Calculator"
      currentHref={PATH}
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'ISA Calculator'), buildFaqSchema(faqs)]}
    >
      <Calculator defaultInputs={DEFAULTS} faqs={faqs} />
    </SiteShell>
  )
}
