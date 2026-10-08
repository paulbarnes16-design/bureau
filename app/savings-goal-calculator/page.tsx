import Link from 'next/link'
import Prose from '@/components/Prose'
import SavingsGoal from '@/components/SavingsGoal'
import SiteShell from '@/components/SiteShell'
import { gbp, monthlyToReach } from '@/lib/goals'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/savings-goal-calculator'
const DESCRIPTION =
  'Free savings goal calculator. Find out how much you need to save each month to reach your target, including the interest your savings earn.'

export const metadata = pageMetadata({
  path: PATH,
  title: 'Savings Goal Calculator: How Much to Save a Month | bureau',
  description: DESCRIPTION,
})

const GOALS = [
  { goal: 'Emergency fund', target: 10000, years: 2, rate: 4 },
  { goal: 'House deposit', target: 30000, years: 5, rate: 4 },
  { goal: 'House deposit', target: 50000, years: 10, rate: 5 },
  { goal: 'Long-term savings', target: 100000, years: 20, rate: 6 },
]

const faqs: FaqItem[] = [
  {
    question: 'How much do I need to save each month to reach my goal?',
    answer: `It depends on your target, your timeframe and the interest rate. For example, to save £50,000 in 10 years at 5%, you'd need to put away about ${gbp(monthlyToReach(50000, 0, 5, 10))} a month. With no interest at all it would be ${gbp(50000 / 120)} a month. Enter your own figures above to see your number.`,
  },
  {
    question: 'How is the monthly amount calculated?',
    answer:
      'The calculator works out the regular payment that, with interest compounded monthly, grows to your target by the end of the timeframe. It uses the formula PMT = (FV − PV × (1 + r)^n) × r ÷ ((1 + r)^n − 1), where FV is your target, PV is what you\'ve already saved, r is the monthly interest rate and n is the number of months.',
  },
  {
    question: 'Does it account for what I have already saved?',
    answer:
      'Yes. Enter it in "Already saved" and the calculator assumes it stays invested and earns the same interest rate, which lowers the monthly amount you need. If your existing savings will reach the target on their own, it will tell you.',
  },
  {
    question: 'What interest rate should I use?',
    answer:
      'For money you\'ll need within about five years, use the rate on your savings account or cash ISA. For longer goals invested in a stocks and shares ISA or pension, many people plan with 5–7% a year. Returns on investments aren\'t guaranteed and can go down as well as up.',
  },
]

function Content() {
  return (
    <Prose>
      <h2>How much to save for common goals</h2>
      <table>
        <thead>
          <tr>
            <th>Goal</th>
            <th>Target</th>
            <th>Time</th>
            <th>Rate</th>
            <th>Per month</th>
          </tr>
        </thead>
        <tbody>
          {GOALS.map((g) => (
            <tr key={`${g.target}-${g.years}`}>
              <td>{g.goal}</td>
              <td>{gbp(g.target)}</td>
              <td>{g.years} years</td>
              <td>{g.rate}%</td>
              <td>{gbp(monthlyToReach(g.target, 0, g.rate, g.years))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Start earlier, save less</h3>
      <p>
        Time does a lot of the work. Saving for {gbp(100000)} at 6% takes about{' '}
        {gbp(monthlyToReach(100000, 0, 6, 10))} a month over 10 years, but only{' '}
        {gbp(monthlyToReach(100000, 0, 6, 20))} a month over 20 years, because your earlier payments have longer to earn
        interest.
      </p>

      <h3>Tips for reaching your goal</h3>
      <ul>
        <li>Set up a standing order for payday, so the money is saved before you can spend it.</li>
        <li>Use an ISA so the interest you earn isn&apos;t taxed.</li>
        <li>Review your target once a year, and raise your monthly amount when your income goes up.</li>
      </ul>
      <p>
        Saving into an ISA? The <Link href="/isa-calculator">ISA calculator</Link> shows how your allowance could grow.
      </p>
    </Prose>
  )
}

export default function SavingsGoalPage() {
  return (
    <SiteShell
      title="Savings Goal Calculator"
      intro="Find out how much you need to save each month to reach your target, including the interest your savings earn."
      currentHref={PATH}
      schemas={[
        buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'Savings Goal Calculator'),
        buildFaqSchema(faqs),
      ]}
    >
      <SavingsGoal content={<Content />} faqs={faqs} />
    </SiteShell>
  )
}
