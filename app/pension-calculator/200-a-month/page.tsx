import { RULES_CHECKED } from '@/lib/how-it-works'
import PensionCalculator from '@/components/PensionCalculator'
import SiteShell from '@/components/SiteShell'
import { gbp } from '@/lib/goals'
import { calculatePension, PENSION_DEFAULTS, type PensionInputs } from '@/lib/pension'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/pension-calculator/200-a-month'

const DEFAULTS: PensionInputs = { ...PENSION_DEFAULTS, pot: 0, age: 30, personal: 200, employer: 0 }
const from = (age: number, extra: Partial<PensionInputs> = {}) => calculatePension({ ...DEFAULTS, age, ...extra })
const base = from(30)

const DESCRIPTION = `Paying £200 a month into a pension from 30 could grow to about ${gbp(base.pot)} by 67 in today's money. See what it's worth starting at other ages.`

export const metadata = pageMetadata({
  path: PATH,
  title: '£200 a Month Into a Pension: What Will I Have? | bureau.money',
  description: DESCRIPTION,
})

const faqs: FaqItem[] = [
  {
    question: 'Is £200 a month enough for retirement?',
    answer: `Started at 30, it could build a pot of about ${gbp(base.pot)} by 67 in today's money. Taking 4% a year from that would give roughly ${gbp(base.monthlyIncomeAt4)} a month before tax, on top of the State Pension. Whether that's enough depends on the income you want in retirement.`,
  },
  {
    question: 'What if my employer pays in too?',
    answer: `It makes a big difference. If your employer added £150 a month, the same £200 from age 30 could grow to about ${gbp(from(30, { employer: 150 }).pot)} by 67.`,
  },
  {
    question: 'Does £200 a month include tax relief?',
    answer: `In this example, £200 is what you pay, and basic-rate tax relief tops it up to £250 (relief at source). If your workplace scheme takes contributions before tax (net pay), turn tax relief off and enter the full amount. Without the top-up, £200 a month from 30 grows to about ${gbp(from(30, { taxRelief: false }).pot)}.`,
  },
  {
    question: 'What assumptions are used?',
    answer:
      'Contributions from now until 67, 5% investment growth a year, 0.5% annual fees and 2.5% inflation, with the result shown in today\'s money. Returns aren\'t guaranteed. Change any of them in the calculator.',
  },
  {
    question: 'What about £100 or £500 a month?',
    answer: `Starting at 30 with basic-rate tax relief, £100 a month could grow to about ${gbp(from(30, { personal: 100 }).pot)} by 67 in today's money, and £500 a month to about ${gbp(from(30, { personal: 500 }).pot)}.`,
  },
  {
    question: 'Pension or ISA for £200 a month?',
    answer:
      'A pension gets tax relief going in (so £200 becomes £250 for a basic-rate taxpayer) and often employer contributions, but you usually can\'t touch it until 55 (57 from April 2028), and most withdrawals are taxed. An ISA has no tax relief going in, but you can take the money out tax-free at any time. Many people use both.',
  },
]

export default function Pension200Page() {
  return (
    <SiteShell
      title="How much will I have if I pay £200 a month into a pension?"
      currentHref={PATH}
      headingInPage
      reviewed={RULES_CHECKED}
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'Pension Calculator'), buildFaqSchema(faqs)]}
    >
      <PensionCalculator defaults={DEFAULTS} faqs={faqs} heading="How much will I have if I pay £200 a month into a pension?" />
    </SiteShell>
  )
}
