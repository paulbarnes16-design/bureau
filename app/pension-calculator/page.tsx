import PensionCalculator from '@/components/PensionCalculator'
import SiteShell from '@/components/SiteShell'
import { gbp } from '@/lib/goals'
import { calculatePension, LUMP_SUM_ALLOWANCE, PENSION_DEFAULTS as D } from '@/lib/pension'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/pension-calculator'
const DESCRIPTION =
  'Free UK pension calculator. See how big your pension pot could be at retirement, including employer contributions, tax relief, fees and inflation.'

export const metadata = pageMetadata({
  path: PATH,
  title: 'Pension Calculator UK: How Much Will I Have? | bureau.money',
  description: DESCRIPTION,
})

const base = calculatePension(D)
const later = calculatePension({ ...D, age: 45 })
const highFee = calculatePension({ ...D, fee: 1.5 })

const faqs: FaqItem[] = [
  {
    question: 'How much will my pension be worth when I retire?',
    answer: `It depends on what you have now, how much goes in each month, investment growth, fees and time. For example, a 35-year-old with a £25,000 pot, paying in £200 a month (£250 with tax relief) plus £150 from their employer, could have about ${gbp(base.pot)} at 67 in today's money, assuming 5% growth, 0.5% fees and 2.5% inflation. Returns aren't guaranteed.`,
  },
  {
    question: 'How does pension tax relief work?',
    answer:
      'The government tops up your personal contributions at your income tax rate. In most personal pensions and many workplace schemes (relief at source), every £80 you pay becomes £100. Higher and additional-rate taxpayers can claim extra relief through their tax return. Some workplace schemes take contributions before tax instead (net pay), so turn off the tax relief toggle and enter the full amount.',
  },
  {
    question: 'How much of my pension can I take tax-free?',
    answer: `Usually 25% of your pension, up to a lifetime limit of £${LUMP_SUM_ALLOWANCE.toLocaleString('en-GB')} (the Lump Sum Allowance). The rest is taxed as income when you take it. You can currently access a personal or workplace pension from age 55, rising to 57 from 6 April 2028.`,
  },
  {
    question: 'How much does starting later cost?',
    answer: `A lot, because your money has less time to grow. Starting the same contributions at 45 instead of 35 gives about ${gbp(later.pot)} at 67 instead of ${gbp(base.pot)} (today's money), even though the starting pot is the same.`,
  },
  {
    question: 'Do pension fees really matter?',
    answer: `Yes. Over decades a small difference adds up. In the example above, paying 1.5% a year in fees instead of 0.5% cuts the pot from about ${gbp(base.pot)} to ${gbp(highFee.pot)}.`,
  },
  {
    question: 'What does "income at 4% a year" mean?',
    answer:
      'It\'s a rough guide to how much income a pot might support if you take 4% of it each year in drawdown. It isn\'t guaranteed, ignores tax, and is in addition to any State Pension. An annuity gives a guaranteed income instead, at rates that vary with your age and the market.',
  },
  {
    question: 'How much can I pay into a pension each year?',
    answer:
      'You can usually get tax relief on contributions up to 100% of your earnings, and total contributions (yours, your employer\'s and tax relief) are limited by the £60,000 annual allowance. Unused allowance from the previous three tax years can often be carried forward.',
  },
]

export default function PensionCalculatorPage() {
  return (
    <SiteShell
      title="Pension Calculator"
      currentHref={PATH}
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'Pension Calculator'), buildFaqSchema(faqs)]}
    >
      <PensionCalculator defaults={D} faqs={faqs} />
    </SiteShell>
  )
}
