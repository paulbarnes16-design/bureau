import SavingsGoal from '@/components/SavingsGoal'
import SiteShell from '@/components/SiteShell'
import { gbp, monthlyToReach } from '@/lib/goals'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/savings-goal-calculator'
const DESCRIPTION =
  'Free savings goal calculator. Find out how much you need to save each month to reach your target, including the interest you earn.'

export const metadata = pageMetadata({
  path: PATH,
  title: 'Savings Goal Calculator: How Much to Save a Month | bureau',
  description: DESCRIPTION,
})

const per = (target: number, rate: number, years: number) => gbp(monthlyToReach(target, 0, rate, years))

const faqs: FaqItem[] = [
  {
    question: 'How much do I need to save each month?',
    answer: `It depends on your target, timeframe and interest rate. To save £50,000 in 10 years at 5%, you'd need about ${per(50000, 5, 10)} a month. Over 20 years it drops to about ${per(50000, 5, 20)}.`,
  },
  {
    question: 'How much should I save for a house deposit?',
    answer: `To save £30,000 in 5 years at 4%, put away about ${per(30000, 4, 5)} a month. For £50,000 over the same time, it's about ${per(50000, 4, 5)}.`,
  },
  {
    question: 'Does it count what I\'ve already saved?',
    answer:
      'Yes. Add it under "Already saved". The calculator assumes it earns the same rate, which lowers your monthly amount.',
  },
  {
    question: 'How is the monthly amount worked out?',
    answer:
      'It finds the monthly payment that, with interest added each month, reaches your target on time: PMT = (FV − PV × (1 + r)^n) × r ÷ ((1 + r)^n − 1), where FV is your target, PV is what you\'ve saved, r is the monthly rate and n is the number of months.',
  },
  {
    question: 'What interest rate should I use?',
    answer:
      'For goals under about five years, use your savings account or cash ISA rate. For longer goals invested in a stocks and shares ISA, 5 to 7% a year is a common planning figure, though returns aren\'t guaranteed.',
  },
]

export default function SavingsGoalPage() {
  return (
    <SiteShell
      title="Savings Goal Calculator"
      currentHref={PATH}
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'Savings Goal Calculator'), buildFaqSchema(faqs)]}
    >
      <SavingsGoal faqs={faqs} />
    </SiteShell>
  )
}
