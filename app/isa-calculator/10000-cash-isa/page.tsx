import IsaQuestionPage from '@/components/IsaQuestionPage'
import { gbp } from '@/lib/goals'
import { EMPTY, isaExample } from '@/lib/isa-examples'
import { pageMetadata } from '@/lib/page-meta'
import type { FaqItem } from '@/lib/schemas'

const PATH = '/isa-calculator/10000-cash-isa'
const INPUTS = { ...EMPTY, cashBalance: 10000, years: 5 }
const at = (rate: number, years: number) => isaExample({ ...INPUTS, cashRate: rate, years })
const year1 = at(4, 1)

const DESCRIPTION = `£10,000 in a cash ISA at 4% earns about ${gbp(year1.total - 10000)} in the first year, tax-free. See how it grows over 5 years and compare rates.`
export const metadata = pageMetadata({ path: PATH, title: 'How Much Interest Will £10,000 Earn in a Cash ISA? | bureau.money', description: DESCRIPTION })

const faqs: FaqItem[] = [
  {
    question: 'How much interest will £10,000 earn in a cash ISA?',
    answer: `At 4% AER, about ${gbp(year1.total - 10000)} in the first year. Left for 5 years with the interest added, it grows to about ${gbp(at(4, 5).total)}. All of it is tax-free.`,
  },
  {
    question: 'What about at other rates?',
    answer: `After 5 years: about ${gbp(at(3, 5).total)} at 3%, ${gbp(at(4, 5).total)} at 4% and ${gbp(at(5, 5).total)} at 5%.`,
  },
  {
    question: 'Would I pay tax on it outside an ISA?',
    answer:
      'Possibly. Outside an ISA, interest above your Personal Savings Allowance (£1,000 for basic-rate taxpayers, £500 for higher-rate) is taxed, at 20% or 40% now and 24% or 44% from April 2027. £10,000 at 4% earns about £400 a year, so it matters most if you have other savings or pay higher-rate tax.',
  },
  {
    question: 'Fixed or easy access?',
    answer:
      'Fixed-rate cash ISAs usually pay more but lock your money away for a set time. Easy-access ISAs let you withdraw any time, but their rate can change. Enter the rate you\'re offered to compare.',
  },
  {
    question: 'How much would £20,000 earn?',
    answer: `At 4%, about ${gbp(isaExample({ ...INPUTS, cashBalance: 20000, years: 1 }).total - 20000)} in the first year, and about ${gbp(isaExample({ ...INPUTS, cashBalance: 20000, years: 5 }).total)} after 5 years with the interest left in.`,
  },
  {
    question: 'What does AER mean?',
    answer:
      'AER (annual equivalent rate) shows what you\'d earn in a year if interest is added and left in the account, so you can compare accounts that pay interest monthly or yearly on the same basis. Enter the AER in the calculator.',
  },
]

export default function Cash10kPage() {
  return <IsaQuestionPage path={PATH} question="How much interest will £10,000 earn in a cash ISA?" description={DESCRIPTION} inputs={INPUTS} faqs={faqs} />
}
