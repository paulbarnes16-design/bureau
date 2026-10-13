import IsaQuestionPage from '@/components/IsaQuestionPage'
import { gbp } from '@/lib/goals'
import { EMPTY, isaExample } from '@/lib/isa-examples'
import { pageMetadata } from '@/lib/page-meta'
import type { FaqItem } from '@/lib/schemas'

const PATH = '/isa-calculator/cash-isa-limit-2027'
const INPUTS = { ...EMPTY, cashBalance: 10000, cashMonthly: 1500, years: 10 }
const base = isaExample(INPUTS)
const noCap = isaExample({ ...INPUTS, applyCashLimit: false })

const DESCRIPTION =
  'From April 2027, under-65s can only put £12,000 a year into a cash ISA. See how much of your saving would need to go elsewhere, and what it means for your total.'
export const metadata = pageMetadata({ path: PATH, title: '£12,000 Cash ISA Limit: How It Affects You | bureau.money', description: DESCRIPTION })

const faqs: FaqItem[] = [
  {
    question: 'What is changing with cash ISAs in April 2027?',
    answer:
      'From 6 April 2027, under-65s will only be able to put £12,000 a year into cash ISAs, down from £20,000. The overall ISA allowance stays at £20,000, so the other £8,000 can go into a stocks and shares ISA. Savers aged 65 and over keep the full £20,000 cash limit. GOV.UK doesn\'t yet say exactly how the age test works, so check the latest guidance.',
  },
  {
    question: 'How does the £12,000 limit affect me?',
    answer: `Only if you put more than £1,000 a month (£12,000 a year) into cash ISAs. For example, saving £1,500 a month means ${gbp(base.movedPerYear)} a year would need to go somewhere else from April 2027. The calculator moves it into a stocks and shares ISA so you can see the effect.`,
  },
  {
    question: 'Will I be worse off?',
    answer: `Not necessarily. In this example, with £10,000 already saved and £1,500 a month, moving ${gbp(base.movedPerYear)} a year into stocks and shares at 5% growth gives about ${gbp(base.total)} after 10 years, against ${gbp(noCap.total)} if it could all stay in cash at 4%. But stocks and shares can fall in value, so they suit money you won't need for at least five years.`,
  },
  {
    question: 'What happens to cash I already have in an ISA?',
    answer:
      'GOV.UK describes the £12,000 as an annual subscription limit, which points to it applying to new money paid in each tax year from April 2027 rather than to savings you already hold. It doesn\'t yet say this outright, so check the final rules.',
  },
  {
    question: 'Are there other ISA changes in April 2027?',
    answer:
      'Alongside the £12,000 cash limit for under-65s, from 6 April 2027 interest paid on uninvested cash held inside a stocks and shares or Innovative Finance ISA will face a flat 22% charge, and there will be restrictions on transferring money from those ISAs into cash ISAs. The overall £20,000 allowance stays the same. This calculator assumes money in your stocks and shares ISA is invested, so keeping large amounts of cash in one would earn less than shown.',
  },

]

export default function CashIsaLimitPage() {
  return <IsaQuestionPage path={PATH} question="How does the £12,000 cash ISA limit affect me?" description={DESCRIPTION} inputs={INPUTS} faqs={faqs} />
}
