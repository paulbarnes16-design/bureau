import IsaQuestionPage from '@/components/IsaQuestionPage'
import { gbp } from '@/lib/goals'
import { EMPTY, isaExample } from '@/lib/isa-examples'
import { pageMetadata } from '@/lib/page-meta'
import type { FaqItem } from '@/lib/schemas'

const PATH = '/isa-calculator/cash-isa-limit-2027'
const INPUTS = { ...EMPTY, cashBalance: 10000, cashMonthly: 1500, years: 10 }
const base = isaExample(INPUTS)
const higher = isaExample({ ...INPUTS, taxBand: 'higher' })

const DESCRIPTION =
  'The planned £12,000 cash ISA limit from April 2027 has been scrapped in Budget 2026. You can still put £20,000 a year into cash ISAs. See what your cash ISA could grow to and the tax it saves.'
export const metadata = pageMetadata({
  path: PATH,
  title: 'Cash ISA Limit 2027: £12,000 Cut Scrapped, Still £20,000 | bureau.money',
  description: DESCRIPTION,
})

const faqs: FaqItem[] = [
  {
    question: 'Is the cash ISA limit being cut to £12,000 in April 2027?',
    answer:
      'No. Budget 2025 announced that from 6 April 2027 under-65s could only put £12,000 a year into cash ISAs. Budget 2026, on 28 October 2026, reversed that decision, so the cash ISA limit stays at £20,000 a year for everyone.',
  },
  {
    question: 'How much can I put in a cash ISA in 2027/28?',
    answer:
      'Up to £20,000, the same as the overall ISA allowance. You can put all of it in cash, all of it in stocks and shares, or split it however you like.',
  },
  {
    question: 'How much could my cash ISA grow to?',
    answer: `With £10,000 already saved and £1,500 a month paid in at 4%, a cash ISA could grow to about ${gbp(base.total)} after 10 years, all of it in cash. Under the cancelled plan, £6,000 a year of that would have had to go into stocks and shares or a normal savings account.`,
  },
  {
    question: 'Does a cash ISA save more tax now?',
    answer: `Yes. The government is raising tax on savings interest outside an ISA to 24%, 44% and 49% from 6 April 2027. In this example, the cash ISA saves a basic-rate taxpayer about ${gbp(base.taxSavedOnCash)} of tax over 10 years, and a higher-rate taxpayer about ${gbp(higher.taxSavedOnCash)}.`,
  },
  {
    question: 'What happened to the 22% charge and the transfer ban?',
    answer:
      'They were planned alongside the £12,000 limit: a 22% charge on interest from uninvested cash in stocks and shares ISAs, and limits on moving money from stocks and shares ISAs into cash ISAs. Which? reports both are dropped with the limit, but the Budget documents don\'t mention them, so check GOV.UK for HMRC\'s confirmation.',
  },
  {
    question: 'Why was the cut scrapped?',
    answer:
      'The government said it wants to keep generous support for savers. Instead of pushing people out of cash, it will work with the investment industry on a new incentive for people opening a stocks and shares ISA for the first time.',
  },
]

export default function CashIsaLimitPage() {
  return (
    <IsaQuestionPage
      path={PATH}
      question="Is the cash ISA limit still being cut to £12,000?"
      description={DESCRIPTION}
      inputs={INPUTS}
      faqs={faqs}
    />
  )
}
