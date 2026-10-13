import IsaQuestionPage from '@/components/IsaQuestionPage'
import { gbp } from '@/lib/goals'
import { EMPTY, isaExample } from '@/lib/isa-examples'
import { pageMetadata } from '@/lib/page-meta'
import type { FaqItem } from '@/lib/schemas'

const PATH = '/isa-calculator/max-isa-every-year'
const INPUTS = { ...EMPTY, sharesMonthly: 1666, years: 20 }
const base = isaExample(INPUTS)
const at = (growth: number, years = 20) => isaExample({ ...INPUTS, sharesGrowth: growth, years })

const DESCRIPTION = `Maxing out your ISA (£20,000 a year) in a stocks and shares ISA at 5% growth could build about ${gbp(base.total)} in 20 years. See what it could be worth for you.`
export const metadata = pageMetadata({ path: PATH, title: 'What If I Max Out My ISA Every Year? | bureau.money', description: DESCRIPTION })

const faqs: FaqItem[] = [
  {
    question: 'How much will I have if I max out my ISA every year?',
    answer: `Paying £1,666 a month (just under £20,000 a year) into a stocks and shares ISA growing at 5% a year after 0.5% fees could build about ${gbp(base.total)} after 20 years, from ${gbp(base.paidIn)} paid in. At 7% it would be about ${gbp(at(7).total)}. Returns aren't guaranteed.`,
  },
  {
    question: 'What about after 10 or 30 years?',
    answer: `At 5%, about ${gbp(at(5, 10).total)} after 10 years and ${gbp(at(5, 30).total)} after 30 years.`,
  },
  {
    question: 'Can I put all £20,000 in a cash ISA?',
    answer:
      'Until 5 April 2027, yes. From 6 April 2027, under-65s can only put £12,000 a year into cash ISAs, so the rest would need to go into a stocks and shares ISA to use the full allowance. Over-65s keep the full £20,000 cash limit.',
  },
  {
    question: 'Does unused allowance carry over?',
    answer: 'No. The £20,000 allowance resets every 6 April, and anything you don\'t use is lost.',
  },
]

export default function MaxIsaPage() {
  return <IsaQuestionPage path={PATH} question="How much will I have if I max out my ISA every year?" description={DESCRIPTION} inputs={INPUTS} faqs={faqs} />
}
