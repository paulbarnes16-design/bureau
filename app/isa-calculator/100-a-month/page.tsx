import IsaQuestionPage from '@/components/IsaQuestionPage'
import { gbp } from '@/lib/goals'
import { EMPTY, isaExample } from '@/lib/isa-examples'
import { pageMetadata } from '@/lib/page-meta'
import type { FaqItem } from '@/lib/schemas'

const PATH = '/isa-calculator/100-a-month'
const INPUTS = { ...EMPTY, sharesMonthly: 100, years: 20 }
const base = isaExample(INPUTS)
const at = (x: object) => isaExample({ ...INPUTS, ...x })

const DESCRIPTION = `£100 a month in a stocks and shares ISA at 5% growth could grow to about ${gbp(base.total)} in 20 years. See how it grows over time and change the numbers.`
export const metadata = pageMetadata({ path: PATH, title: '£100 a Month in a Stocks and Shares ISA | bureau.money', description: DESCRIPTION })

const faqs: FaqItem[] = [
  {
    question: 'How much will £100 a month in a stocks and shares ISA grow?',
    answer: `At 5% growth a year after 0.5% fees, about ${gbp(at({ years: 10 }).total)} after 10 years, ${gbp(base.total)} after 20 and ${gbp(at({ years: 30 }).total)} after 30. You'd have paid in £12,000, £24,000 and £36,000. Returns aren't guaranteed.`,
  },
  {
    question: 'What if it grows at 7%?',
    answer: `About ${gbp(at({ sharesGrowth: 7 }).total)} after 20 years, and ${gbp(at({ sharesGrowth: 7, years: 30 }).total)} after 30.`,
  },
  {
    question: 'Is £100 a month worth investing?',
    answer:
      'Yes. Small regular amounts add up because growth compounds over time, and many platforms let you start from as little as £25 a month. A cash ISA is usually better for money you\'ll need within about five years.',
  },
]

export default function Isa100Page() {
  return <IsaQuestionPage path={PATH} question="How much will £100 a month in a stocks and shares ISA grow?" description={DESCRIPTION} inputs={INPUTS} faqs={faqs} />
}
