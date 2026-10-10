import PensionCalculator from '@/components/PensionCalculator'
import SiteShell from '@/components/SiteShell'
import { calculateDrawdown, type DrawdownInputs } from '@/lib/drawdown'
import { gbp } from '@/lib/goals'
import { PENSION_DEFAULTS, type PensionInputs } from '@/lib/pension'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/pension-calculator/500000-pot'

const DEFAULTS: PensionInputs = { ...PENSION_DEFAULTS, mode: 'income', incomePot: 500000, retirementAge: 67, untilAge: 95, growth: 4 }

const base: DrawdownInputs = {
  pot: 500000,
  takeLumpSum: false,
  startAge: 67,
  untilAge: 95,
  growth: 4,
  fee: 0.5,
  adjustForInflation: true,
  inflationRate: 2.5,
}
const d = (x: Partial<DrawdownInputs> = {}) => calculateDrawdown({ ...base, ...x })
const main = d()
const withCash = d({ takeLumpSum: true })
const to90 = d({ untilAge: 90 })
const to100 = d({ untilAge: 100 })
const level = d({ adjustForInflation: false })
const from60 = d({ startAge: 60 })

const DESCRIPTION = `A £500,000 pension pot could pay about ${gbp(main.monthlyIncome)} a month from 67 to 95, rising with inflation. See how taking tax-free cash, retiring earlier or living longer changes it.`

export const metadata = pageMetadata({
  path: PATH,
  title: 'How Much Will a £500k Pension Give Me? | bureau.money',
  description: DESCRIPTION,
})

const faqs: FaqItem[] = [
  {
    question: 'How much income will a £500,000 pension give me?',
    answer: `About ${gbp(main.monthlyIncome)} a month (${gbp(Math.round(main.monthlyIncome) * 12)} a year) from 67 to 95, rising with inflation, before tax. That assumes 4% investment growth, 0.5% fees and 2.5% inflation, and that the pot runs down to zero at 95. The State Pension would come on top.`,
  },
  {
    question: 'What if I take the 25% tax-free lump sum?',
    answer: `Taking 25% (${gbp(withCash.lumpSum)}) as cash leaves ${gbp(withCash.drawdownPot)} to draw from, which could pay about ${gbp(withCash.monthlyIncome)} a month on the same assumptions. You could also take the tax-free amount bit by bit, so that a quarter of each withdrawal is tax-free.`,
  },
  {
    question: 'How long will £500,000 last?',
    answer: `It depends how much you take. To make it last to 90 you could take about ${gbp(to90.monthlyIncome)} a month; to 100, about ${gbp(to100.monthlyIncome)} a month (rising with inflation). Starting at 60 instead of 67 and lasting to 95 gives about ${gbp(from60.monthlyIncome)} a month.`,
  },
  {
    question: 'What is the 4% rule?',
    answer: `A rule of thumb that taking 4% of your pot a year has historically tended to last around 30 years. On £500,000 that's ${gbp(main.monthlyAt4 * 12)} a year, or about ${gbp(main.monthlyAt4)} a month. It isn't guaranteed, and some suggest a lower rate for long UK retirements.`,
  },
  {
    question: 'What if I take the same amount every year?',
    answer: `If your income doesn't rise with inflation, you could start higher, at about ${gbp(level.monthlyIncome)} a month, but it would buy less each year as prices rise.`,
  },
  {
    question: 'Is pension income taxed?',
    answer:
      'Yes. Apart from the 25% tax-free part, pension withdrawals are taxed as income, together with your State Pension and any other income. The figures here are before tax. An annuity is an alternative that turns some or all of your pot into a guaranteed income for life.',
  },
]

export default function Pension500kPotPage() {
  return (
    <SiteShell
      title="How much income will a £500,000 pension pot give me?"
      currentHref={PATH}
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'Pension Income Calculator'), buildFaqSchema(faqs)]}
    >
      <PensionCalculator defaults={DEFAULTS} faqs={faqs} />
    </SiteShell>
  )
}
