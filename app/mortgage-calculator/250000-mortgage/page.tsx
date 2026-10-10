import MortgageCalculator from '@/components/MortgageCalculator'
import SiteShell from '@/components/SiteShell'
import { gbp } from '@/lib/goals'
import { calculateMortgage, MORTGAGE_DEFAULTS, type MortgageInputs } from '@/lib/mortgage'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/mortgage-calculator/250000-mortgage'
const LOAN = 250000

// £250,000 borrowed with a 20% deposit
const DEFAULTS: MortgageInputs = { ...MORTGAGE_DEFAULTS, price: 312500, deposit: 62500 }
const at = (rate: number, termYears: number) => calculateMortgage({ ...DEFAULTS, rate, termYears })
const base = at(4.5, 25)
const rise = at(5.5, 25)
const io = calculateMortgage({ ...DEFAULTS, type: 'interest-only' })

const DESCRIPTION = `A £250,000 repayment mortgage at 4.5% over 25 years costs ${gbp(base.monthlyPayment, 2)} a month. See monthly payments at other rates and terms, and calculate your own.`

export const metadata = pageMetadata({
  path: PATH,
  title: '£250,000 Mortgage: Monthly Repayments | bureau.money',
  description: DESCRIPTION,
})

const faqs: FaqItem[] = [
  {
    question: 'How much do I need to earn for a £250,000 mortgage?',
    answer: `Many UK lenders lend around 4 to 4.5 times income, so a £250,000 mortgage usually needs a household income of roughly ${gbp(LOAN / 4.5)} to ${gbp(LOAN / 4)}. Some lenders go higher for certain professions or larger deposits, and your outgoings and credit history also count.`,
  },
  {
    question: 'How much would a 1% rate rise add?',
    answer: `Over 25 years, moving from 4.5% to 5.5% takes the payment on £250,000 from ${gbp(base.monthlyPayment)} to ${gbp(rise.monthlyPayment)} a month, about ${gbp(Math.round(rise.monthlyPayment) - Math.round(base.monthlyPayment))} more, and adds around ${gbp(rise.totalInterest - base.totalInterest)} in interest over the term.`,
  },
  {
    question: 'What would interest-only cost on £250,000?',
    answer: `At 4.5%, about ${gbp(io.monthlyPayment, 2)} a month. You'd still owe the full £250,000 at the end of the term, so lenders want a credible plan to repay it.`,
  },
  {
    question: 'What deposit do I need?',
    answer:
      'It depends on the property price. Borrowing £250,000 with a 10% deposit means buying at about £277,800; with a 20% deposit, about £312,500. A bigger deposit usually gets you a lower rate.',
  },
]

export default function Mortgage250kPage() {
  return (
    <SiteShell
      title="What are the monthly repayments on a £250,000 mortgage?"
      currentHref={PATH}
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'Mortgage Calculator'), buildFaqSchema(faqs)]}
    >
      <MortgageCalculator defaults={DEFAULTS} faqs={faqs} />
    </SiteShell>
  )
}
