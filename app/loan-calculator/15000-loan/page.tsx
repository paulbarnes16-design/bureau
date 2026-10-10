import MortgageCalculator from '@/components/MortgageCalculator'
import SiteShell from '@/components/SiteShell'
import { gbp } from '@/lib/goals'
import { calculateMortgage, MORTGAGE_DEFAULTS, type MortgageInputs } from '@/lib/mortgage'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/loan-calculator/15000-loan'

const DEFAULTS: MortgageInputs = {
  ...MORTGAGE_DEFAULTS,
  price: 15000,
  deposit: 0,
  rate: 7.9,
  termYears: 5,
  termMonths: 0,
  apr: true,
}
const at = (rate: number, termYears: number) => calculateMortgage({ ...DEFAULTS, rate, termYears })
const base = at(7.9, 5)

const DESCRIPTION = `A £15,000 loan at 7.9% APR over 5 years costs ${gbp(base.monthlyPayment, 2)} a month and ${gbp(base.totalInterest)} in interest. Compare other terms and rates.`

export const metadata = pageMetadata({
  path: PATH,
  title: '£15,000 Loan: Monthly Repayments | bureau',
  description: DESCRIPTION,
})

const APRS = [5.9, 7.9, 9.9, 12.9]

const faqs: FaqItem[] = [
  {
    question: 'How much does a £15,000 loan cost at different APRs?',
    answer: `Over 5 years: ${APRS.map((r) => `${r}% APR is about ${gbp(at(r, 5).monthlyPayment)} a month (${gbp(at(r, 5).totalInterest)} interest)`).join('; ')}.`,
  },
  {
    question: 'Is it cheaper to borrow £15,000 over a shorter term?',
    answer: `Yes. At 7.9% APR, 3 years costs ${gbp(at(7.9, 3).totalInterest)} in interest against ${gbp(base.totalInterest)} over 5 years, but the monthly payment rises from ${gbp(base.monthlyPayment)} to ${gbp(at(7.9, 3).monthlyPayment)}.`,
  },
  {
    question: 'What APR will I get on £15,000?',
    answer:
      'Lenders advertise a representative APR, which only has to be offered to 51% of successful applicants. Your rate depends on your credit history and income. Many lenders show a personalised rate with a soft search that doesn\'t affect your credit score.',
  },
]

export default function Loan15kPage() {
  return (
    <SiteShell
      title="What are the monthly repayments on a £15,000 loan?"
      currentHref={PATH}
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'Loan Calculator'), buildFaqSchema(faqs)]}
    >
      <MortgageCalculator defaults={DEFAULTS} faqs={faqs} variant="loan" />
    </SiteShell>
  )
}
