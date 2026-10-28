import { HOW_IT_WORKS, RELATED, RULES_CHECKED } from '@/lib/how-it-works'
import IsaCalculator from '@/components/IsaCalculator'
import SiteShell from '@/components/SiteShell'
import { gbp } from '@/lib/goals'
import { calculateIsa, ISA_DEFAULTS, type IsaInputs } from '@/lib/isa'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/isa-calculator'
const DESCRIPTION =
  'Free UK ISA calculator for 2026/27. Project cash and stocks and shares ISAs, see the tax an ISA saves as savings tax rises in April 2027, and what Budget 2026 means for the £20,000 cash ISA limit.'

export const metadata = pageMetadata({ path: PATH, title: 'ISA Calculator UK 2026/27: Cash and Stocks & Shares | bureau.money', description: DESCRIPTION })

// Worked examples use a fixed start date so the FAQ text matches the explanation
const EXAMPLE_START = new Date(2026, 9, 1)
const example = (x: Partial<IsaInputs>) => calculateIsa({ ...ISA_DEFAULTS, ...x }, EXAMPLE_START)
const maxCash = example({ cashBalance: 0, sharesBalance: 0, cashMonthly: 1666, sharesMonthly: 0, years: 10 })
const maxShares = example({ cashBalance: 0, sharesBalance: 0, cashMonthly: 0, sharesMonthly: 1666, years: 10 })

const faqs: FaqItem[] = [
  {
    question: 'How much can I put in an ISA in 2026/27?',
    answer:
      'Up to £20,000 between 6 April 2026 and 5 April 2027. You can put it all in one ISA or split it across cash, stocks and shares, Lifetime and Innovative Finance ISAs. Anything you don\'t use is lost at the end of the tax year.',
  },
  {
    question: 'Is the cash ISA limit still being cut to £12,000?',
    answer:
      'No. Budget 2025 planned to limit cash ISAs to £12,000 a year for under-65s from April 2027, but Budget 2026 (28 October 2026) reversed it. You can keep putting the full £20,000 into cash ISAs if you want to.',
  },
  {
    question: 'What about the 22% charge on cash in stocks and shares ISAs?',
    answer:
      'Budget 2025 also planned a 22% charge on interest from uninvested cash held in stocks and shares ISAs, and limits on moving money from stocks and shares ISAs into cash ISAs, both to stop people getting round the £12,000 limit. With that limit scrapped, Which? reports these are dropped too, but the Budget documents don\'t say so directly, so check GOV.UK for HMRC\'s confirmation.',
  },
  {
    question: 'How much tax does an ISA save?',
    answer:
      'Interest, dividends and gains inside an ISA are tax-free, and so are withdrawals. Outside an ISA, interest above your Personal Savings Allowance (£1,000 for basic-rate taxpayers, £500 for higher-rate, nothing for additional-rate) is taxed. From 6 April 2027 savings income is taxed at 24%, 44% or 49%, up from 20%, 40% and 45%, so a cash ISA saves more. For example, a higher-rate taxpayer earning £2,000 interest outside an ISA would pay £660 a year from April 2027. The calculator uses the right rate for each tax year.',
  },
  {
    question: 'How much will my ISA be worth if I max it out?',
    answer: `Paying £1,666 a month into a cash ISA at 4% for 10 years would build about ${gbp(maxCash.total)}. In a stocks and shares ISA at 5% growth (0.5% fees), it would be about ${gbp(maxShares.total)}. Investment returns aren't guaranteed and can be negative.`,
  },
  {
    question: 'What is changing for Lifetime ISAs?',
    answer:
      'From 29 October 2026 the withdrawal charge falls from 25% to 20% if you use a Lifetime ISA to buy a first home costing more than £450,000. From April 2029 a new First Time Buyer ISA replaces the Lifetime ISA for new savers: up to £4,000 a year with a 25% bonus (capped at £20,000), paid when you buy a first home up to £450,000, with no upper age limit. Existing Lifetime ISAs carry on under the current rules.',
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
      reviewed={RULES_CHECKED}
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'ISA Calculator'), buildFaqSchema(faqs)]}
    >
      <IsaCalculator defaults={ISA_DEFAULTS} faqs={faqs} startIso={new Date().toISOString()} howItWorks={HOW_IT_WORKS.isa} related={RELATED['/isa-calculator']} />
    </SiteShell>
  )
}
