import MortgageCalculator from '@/components/MortgageCalculator'
import SiteShell from '@/components/SiteShell'
import { gbp } from '@/lib/goals'
import { calculateMortgage, MORTGAGE_DEFAULTS, type MortgageInputs } from '@/lib/mortgage'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/loan-calculator'
const DESCRIPTION =
  'Free UK loan and car finance calculator. Work out your monthly repayments, total interest and the full cost of borrowing at any APR.'

export const metadata = pageMetadata({
  path: PATH,
  title: 'Loan Calculator UK: Personal Loan & Car Finance | bureau',
  description: DESCRIPTION,
})

const DEFAULTS: MortgageInputs = {
  ...MORTGAGE_DEFAULTS,
  price: 15000,
  deposit: 0,
  rate: 7.9,
  termYears: 5,
  termMonths: 0,
  apr: true,
}

const loan = (price: number, rate: number, years: number, deposit = 0) =>
  calculateMortgage({ ...DEFAULTS, price, rate, termYears: years, deposit })

const ex = loan(15000, 7.9, 5)
const ex3 = loan(15000, 7.9, 3)
const car = loan(20000, 9.9, 4, 4000)

const faqs: FaqItem[] = [
  {
    question: 'How are loan repayments calculated?',
    answer: `Monthly repayments are M = L × r ÷ (1 − (1 + r)^−n), where L is the amount borrowed, r is the monthly interest rate and n is the number of months. UK lenders quote an APR, which is an annual rate, so the calculator converts it to the equivalent monthly rate. For example, £15,000 over 5 years at 7.9% APR costs about ${gbp(ex.monthlyPayment, 2)} a month and ${gbp(ex.totalInterest)} in interest.`,
  },
  {
    question: 'Is a shorter loan cheaper?',
    answer: `Yes, overall. Monthly payments are higher, but you pay interest for less time. £15,000 at 7.9% APR costs about ${gbp(ex3.monthlyPayment)} a month and ${gbp(ex3.totalInterest)} in interest over 3 years, against ${gbp(ex.monthlyPayment)} a month and ${gbp(ex.totalInterest)} over 5 years.`,
  },
  {
    question: 'How much will car finance cost me?',
    answer: `For hire purchase (HP), put the car's price in the first box and your deposit or part-exchange in the second. A £20,000 car with a £4,000 deposit over 4 years at 9.9% APR costs about ${gbp(car.monthlyPayment)} a month and ${gbp(car.totalInterest)} in interest.`,
  },
  {
    question: 'Does this work for PCP car finance?',
    answer:
      'Not exactly. With PCP, part of the price is deferred into a final "balloon" payment, so monthly payments are lower than HP and you choose at the end whether to pay it, hand the car back or part-exchange. This calculator works out HP and personal loans, where the full amount is repaid over the term.',
  },
  {
    question: 'What APR will I get?',
    answer:
      'The advertised "representative APR" only has to be offered to 51% of successful applicants, so the rate you\'re offered can be higher depending on your credit history. Many lenders show a personalised rate using a soft search, which doesn\'t affect your credit score.',
  },
]

export default function LoanCalculatorPage() {
  return (
    <SiteShell
      title="Loan Calculator"
      currentHref={PATH}
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'Loan and Car Finance Calculator'), buildFaqSchema(faqs)]}
    >
      <MortgageCalculator defaults={DEFAULTS} faqs={faqs} variant="loan" />
    </SiteShell>
  )
}
