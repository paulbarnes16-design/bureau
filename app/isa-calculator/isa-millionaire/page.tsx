import IsaQuestionPage from '@/components/IsaQuestionPage'
import { gbp } from '@/lib/goals'
import { EMPTY, isaExample } from '@/lib/isa-examples'
import { pageMetadata } from '@/lib/page-meta'
import type { FaqItem } from '@/lib/schemas'

const PATH = '/isa-calculator/isa-millionaire'

/** Years of maxing out the allowance until the pot passes £1m. */
function yearsToMillion(growth: number) {
  for (let y = 1; y <= 50; y++) if (isaExample({ ...EMPTY, sharesMonthly: 1666, sharesGrowth: growth, years: y }).total >= 1_000_000) return y
  return 50
}
const Y7 = yearsToMillion(7)
const Y5 = yearsToMillion(5)
const INPUTS = { ...EMPTY, sharesMonthly: 1666, sharesGrowth: 7, years: Y7 }
const base = isaExample(INPUTS)

const DESCRIPTION = `Maxing out your ISA every year at 7% growth could make you an ISA millionaire in about ${Y7} years. See how long it would take you.`
export const metadata = pageMetadata({ path: PATH, title: 'How Long to Become an ISA Millionaire? | bureau.money', description: DESCRIPTION })

/** Monthly saving (to the nearest £10) that passes £1m in 30 years. */
function monthlyFor30(growth: number) {
  for (let m = 10; m <= 1666; m += 10) if (isaExample({ ...EMPTY, sharesMonthly: m, sharesGrowth: growth, years: 30 }).total >= 1_000_000) return m
  return 1666
}
const MONTHLY_30 = monthlyFor30(7)
const MONTHLY_30_5 = monthlyFor30(5)
let Y_LUMP = 50
for (let y = 1; y <= 50; y++) if (isaExample({ ...EMPTY, sharesBalance: 100000, sharesMonthly: 1666, sharesGrowth: 7, years: y }).total >= 1_000_000) { Y_LUMP = y; break }

const faqs: FaqItem[] = [
  {
    question: 'How long does it take to become an ISA millionaire?',
    answer: `Paying in the full £20,000 a year (£1,666 a month) to a stocks and shares ISA growing at 7% a year after 0.5% fees, it takes about ${Y7} years to pass £1 million, reaching about ${gbp(base.total)}. At 5% growth it takes about ${Y5} years. Returns aren't guaranteed.`,
  },
  {
    question: 'How much would I have paid in?',
    answer: `About ${gbp(base.paidIn)} over ${Y7} years. The rest is tax-free investment growth.`,
  },
  {
    question: 'Can I become an ISA millionaire with cash ISAs?',
    answer:
      'It\'s much harder. Cash ISA rates are usually lower than long-term stock market returns, and from April 2027 under-65s can only put £12,000 a year into cash ISAs. Most ISA millionaires have built their wealth in stocks and shares ISAs over decades.',
  },
  {
    question: 'Is it realistic?',
    answer:
      'It takes discipline and time: paying in the maximum every year for over two decades, staying invested through market falls and keeping fees low. Starting earlier makes a big difference, because the growth compounds for longer.',
  },
  {
    question: 'How much would I need to save each month to get there in 30 years?',
    answer: `At 7% growth after 0.5% fees, about ${gbp(MONTHLY_30)} a month for 30 years, which is well within the £20,000 allowance. At 5% it would take about ${gbp(MONTHLY_30_5)} a month.`,
  },
  {
    question: 'Does starting with a lump sum help?',
    answer: `Yes. Starting with £100,000 already invested and then maxing out the allowance at 7%, you could pass £1 million in about ${Y_LUMP} years instead of ${Y7}.`,
  },
]

export default function IsaMillionairePage() {
  return <IsaQuestionPage path={PATH} question="How long does it take to become an ISA millionaire?" description={DESCRIPTION} inputs={INPUTS} faqs={faqs} />
}
