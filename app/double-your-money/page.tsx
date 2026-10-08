import DoubleMoney from '@/components/DoubleMoney'
import SiteShell from '@/components/SiteShell'
import { ruleOf72, yearsToDouble } from '@/lib/goals'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/double-your-money'
const DESCRIPTION =
  'How long does it take to double your money? Enter an interest rate to see exactly how many years, and how the Rule of 72 compares.'

export const metadata = pageMetadata({
  path: PATH,
  title: 'How Long to Double Your Money? Rule of 72 Calculator | bureau',
  description: DESCRIPTION,
})

const y = (n: number) => n.toFixed(1)

const faqs: FaqItem[] = [
  {
    question: 'How long does it take to double your money?',
    answer: `With interest added once a year: about ${y(yearsToDouble(3))} years at 3%, ${y(yearsToDouble(5))} years at 5%, ${y(yearsToDouble(7))} years at 7% and ${y(yearsToDouble(10))} years at 10%.`,
  },
  {
    question: 'What is the Rule of 72?',
    answer:
      'A quick way to estimate doubling time: divide 72 by the interest rate. At 6%, that\'s 72 ÷ 6 = 12 years.',
  },
  {
    question: 'How accurate is the Rule of 72?',
    answer: `Close for rates between about 6% and 10%. At 8% it says ${y(ruleOf72(8))} years and the exact answer is ${y(yearsToDouble(8))}. At 2% it says ${y(ruleOf72(2))} years against an exact ${y(yearsToDouble(2))}.`,
  },
  {
    question: 'What is the exact formula?',
    answer:
      'Years to double = ln(2) ÷ ln(1 + r), where r is the yearly interest rate as a decimal. At 7%, that\'s ln(2) ÷ ln(1.07), or about 10.2 years.',
  },
  {
    question: 'What about inflation?',
    answer:
      'To double what your money can buy, use the rate after inflation. Earning 5% with 2.5% inflation is a real return of about 2.5%, so it takes around 29 years rather than 14.',
  },
]

export default function DoubleYourMoneyPage() {
  return (
    <SiteShell
      title="How Long to Double Your Money?"
      currentHref={PATH}
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'Double Your Money Calculator'), buildFaqSchema(faqs)]}
    >
      <DoubleMoney faqs={faqs} />
    </SiteShell>
  )
}
