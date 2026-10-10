import MortgageCalculator from '@/components/MortgageCalculator'
import SiteShell from '@/components/SiteShell'
import { gbp } from '@/lib/goals'
import { calculateMortgage, MORTGAGE_DEFAULTS as D } from '@/lib/mortgage'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/mortgage-calculator'
const DESCRIPTION =
  'Free UK mortgage calculator. Work out your monthly repayments, total interest and loan to value, and see how much overpaying could save you.'

export const metadata = pageMetadata({
  path: PATH,
  title: 'Mortgage Calculator UK: Monthly Repayments | bureau.money',
  description: DESCRIPTION,
})

const base = calculateMortgage(D)
const overpaid = calculateMortgage({ ...D, overpayment: 100 })
const interestOnly = calculateMortgage({ ...D, type: 'interest-only' })
const shorter = calculateMortgage({ ...D, termYears: 20 })
const loan = gbp(base.loan)

const faqs: FaqItem[] = [
  {
    question: 'How are monthly mortgage repayments worked out?',
    answer: `For a repayment mortgage, the monthly payment is M = L × r ÷ (1 − (1 + r)^−n), where L is the loan, r is the monthly interest rate and n is the number of months. For example, ${loan} over 25 years at 4.5% costs about ${gbp(base.monthlyPayment, 2)} a month.`,
  },
  {
    question: 'What is the difference between repayment and interest-only?',
    answer: `With a repayment mortgage, each payment covers interest and part of the loan, so you owe nothing at the end. With interest-only, you only pay the interest, so payments are lower but the full loan is still owed at the end. On ${loan} at 4.5%, that's about ${gbp(interestOnly.monthlyPayment)} a month instead of ${gbp(base.monthlyPayment)}, with ${loan} left to repay after 25 years.`,
  },
  {
    question: 'How much does overpaying my mortgage save?',
    answer: `Overpaying cuts the loan faster, so you pay less interest. On ${loan} over 25 years at 4.5%, an extra £100 a month clears it about ${Math.round((base.months - overpaid.months) / 12)} years early and saves around ${gbp(base.totalInterest - overpaid.totalInterest)} in interest. Many lenders limit overpayments to 10% of the balance a year during a fixed deal, so check before overpaying.`,
  },
  {
    question: 'What is loan to value (LTV)?',
    answer:
      'Loan to value is the size of your mortgage as a percentage of the property price. A £240,000 loan on a £300,000 home is 80% LTV. Lenders usually offer better rates at lower LTVs, often in bands such as 60%, 75%, 85%, 90% and 95%.',
  },
  {
    question: 'Should I choose a shorter mortgage term?',
    answer: `A shorter term means higher monthly payments but much less interest overall. ${loan} at 4.5% over 20 years costs about ${gbp(shorter.monthlyPayment)} a month and ${gbp(shorter.totalInterest)} in interest, against ${gbp(base.monthlyPayment)} a month and ${gbp(base.totalInterest)} over 25 years.`,
  },
  {
    question: 'What does this calculator not include?',
    answer:
      'It assumes one interest rate for the whole term. In practice most UK mortgages start on a fixed or tracker deal and move to the lender\'s standard variable rate afterwards, unless you remortgage. It also leaves out arrangement fees, stamp duty, legal costs and insurance.',
  },
]

export default function MortgageCalculatorPage() {
  return (
    <SiteShell
      title="Mortgage Calculator"
      currentHref={PATH}
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'Mortgage Calculator'), buildFaqSchema(faqs)]}
    >
      <MortgageCalculator defaults={D} faqs={faqs} />
    </SiteShell>
  )
}
