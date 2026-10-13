import IsaCalculator from '@/components/IsaCalculator'
import SiteShell from '@/components/SiteShell'
import { gbp } from '@/lib/goals'
import { calculateIsa, ISA_DEFAULTS, type IsaInputs } from '@/lib/isa'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/isa-calculator'
const DESCRIPTION =
  'Free UK ISA calculator for 2026/27. Project your cash and stocks and shares ISAs, see how the £12,000 cash ISA limit from April 2027 affects you, and how much tax you save.'

export const metadata = pageMetadata({ path: PATH, title: 'ISA Calculator UK 2026/27 | bureau.money', description: DESCRIPTION })

// Worked examples use a fixed start date so the FAQ text matches the explanation
const EXAMPLE_START = new Date(2026, 9, 1)
const example = (x: Partial<IsaInputs>) => calculateIsa({ ...ISA_DEFAULTS, ...x }, EXAMPLE_START)
const maxCash = example({ cashBalance: 0, sharesBalance: 0, cashMonthly: 1666, sharesMonthly: 0, years: 10 })
const maxCashNoCap = example({ cashBalance: 0, sharesBalance: 0, cashMonthly: 1666, sharesMonthly: 0, years: 10, applyCashLimit: false })

const faqs: FaqItem[] = [
  {
    question: 'How much can I put in an ISA in 2026/27?',
    answer:
      'Up to £20,000 between 6 April 2026 and 5 April 2027. You can put it all in one ISA or split it across cash, stocks and shares, Lifetime and Innovative Finance ISAs. Anything you don\'t use is lost at the end of the tax year.',
  },
  {
    question: 'What is the £12,000 cash ISA limit?',
    answer:
      'From 6 April 2027, under-65s will only be able to put £12,000 a year into cash ISAs. The overall allowance stays at £20,000, so to use all of it the other £8,000 would need to go into a stocks and shares ISA. Savers aged 65 and over keep the full £20,000 cash limit. GOV.UK doesn\'t yet say exactly how the age test works, so check the latest guidance.',
  },
  {
    question: 'What other ISA changes happen in April 2027?',
    answer:
      'Alongside the £12,000 cash limit for under-65s, from 6 April 2027 interest paid on uninvested cash held inside a stocks and shares or Innovative Finance ISA will face a flat 22% charge, and there will be restrictions on transferring money from those ISAs into cash ISAs. The overall £20,000 allowance stays the same. This calculator assumes money in your stocks and shares ISA is invested, so keeping large amounts of cash in one would earn less than shown.',
  },
  {
    question: 'How does the cash limit affect me?',
    answer: `If you save more than £1,000 a month into a cash ISA, part of it would need to go elsewhere from April 2027. For example, someone paying £1,666 a month into cash would have about ${gbp(maxCash.movedPerYear)} a year moved into stocks and shares. The calculator does this for you when "Apply the £12,000 cash limit" is on, so you can see the effect on your total.`,
  },
  {
    question: 'How much will my ISA be worth if I max it out?',
    answer: `Paying £1,666 a month into a cash ISA at 4% for 10 years would build about ${gbp(maxCashNoCap.total)}. With the £12,000 cash limit and the excess going into stocks and shares at 5% growth (0.5% fees), it would be about ${gbp(maxCash.total)}. Investment returns aren't guaranteed and can be negative.`,
  },
  {
    question: 'How much tax does an ISA save?',
    answer:
      'Interest, dividends and gains inside an ISA are tax-free, and so are withdrawals. Outside an ISA, interest above your Personal Savings Allowance (£1,000 for basic-rate taxpayers, £500 for higher-rate, nothing for additional-rate) is taxed at your income tax rate. The calculator estimates the tax you\'d pay on your cash interest outside an ISA, assuming you have no other savings interest.',
  },
  {
    question: 'What growth rate should I use?',
    answer:
      'For a cash ISA, use your account\'s interest rate (AER). For a stocks and shares ISA, 5 to 7% a year is a common planning figure, but returns aren\'t guaranteed and can be negative. You can set fees in the Advanced tab.',
  },
  {
    question: 'Can I have more than one ISA?',
    answer:
      'Yes. Since April 2024 you can pay into more than one ISA of the same type in a tax year, as long as the total stays within £20,000.',
  },
]

export default function IsaCalculatorPage() {
  return (
    <SiteShell
      title="ISA Calculator"
      currentHref={PATH}
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'ISA Calculator'), buildFaqSchema(faqs)]}
    >
      <IsaCalculator defaults={ISA_DEFAULTS} faqs={faqs} startIso={new Date().toISOString()} />
    </SiteShell>
  )
}
