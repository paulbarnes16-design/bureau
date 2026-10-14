import MortgageCalculator from '@/components/MortgageCalculator'
import SiteShell from '@/components/SiteShell'
import { gbp } from '@/lib/goals'
import { calculateMortgage, MORTGAGE_DEFAULTS, type MortgageInputs } from '@/lib/mortgage'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/mortgage-overpayment-calculator'
const DESCRIPTION =
  'Free UK mortgage overpayment calculator. See how much interest you could save and how many years earlier you could be mortgage-free by overpaying.'

export const metadata = pageMetadata({
  path: PATH,
  title: 'Mortgage Overpayment Calculator UK | bureau.money',
  description: DESCRIPTION,
})

const DEFAULTS: MortgageInputs = { ...MORTGAGE_DEFAULTS, overpayment: 200 }

const base = calculateMortgage({ ...DEFAULTS, overpayment: 0 })
const saving = (over: number) => {
  const r = calculateMortgage({ ...DEFAULTS, overpayment: over })
  const early = base.months - r.months
  const y = Math.floor(early / 12)
  const m = early % 12
  return { saved: gbp(base.totalInterest - r.totalInterest), years: m === 0 ? `${y} years` : `${y} years ${m} months` }
}
const s100 = saving(100)
const s200 = saving(200)
const s500 = saving(500)

const faqs: FaqItem[] = [
  {
    question: 'How much will I save by overpaying my mortgage?',
    answer: `On a £240,000 repayment mortgage over 25 years at 4.5%, overpaying £100 a month saves about ${s100.saved} in interest and clears it ${s100.years} early. £200 a month saves about ${s200.saved} (${s200.years} early), and £500 a month about ${s500.saved} (${s500.years} early).`,
  },
  {
    question: 'How much can I overpay without a penalty?',
    answer:
      'Many UK lenders let you overpay up to 10% of the outstanding balance each year during a fixed or tracker deal. Paying more than your allowance can trigger an early repayment charge, often 1 to 5% of the excess. Once your deal ends and you move to the standard variable rate, you can usually overpay as much as you like. Check your mortgage terms.',
  },
  {
    question: 'Should I overpay my mortgage or save the money?',
    answer:
      'Overpaying gives you a guaranteed return equal to your mortgage rate. Saving or investing makes more sense if you can earn more than that after tax, or if you don\'t yet have an emergency fund. Money used to overpay usually can\'t be taken back out.',
  },
  {
    question: 'Should I shorten my term or lower my payments?',
    answer:
      'When you overpay, lenders usually either keep your payment the same and shorten the term, or recalculate a lower monthly payment over the same term. Shortening the term saves more interest. This calculator shows the shorter-term option.',
  },
  {
    question: 'Is a lump sum better than monthly overpayments?',
    answer:
      'Paying a lump sum earlier saves more interest than spreading the same amount over the year, because the balance falls sooner. This calculator models regular monthly overpayments.',
  },
]

export default function MortgageOverpaymentPage() {
  return (
    <SiteShell
      title="How much could overpaying my mortgage save?"
      currentHref={PATH}
      headingInPage
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'Mortgage Overpayment Calculator'), buildFaqSchema(faqs)]}
    >
      <MortgageCalculator defaults={DEFAULTS} faqs={faqs} heading="How much could overpaying my mortgage save?" />
    </SiteShell>
  )
}
