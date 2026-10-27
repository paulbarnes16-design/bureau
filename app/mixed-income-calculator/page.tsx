import { HOW_IT_WORKS, RULES_CHECKED } from '@/lib/how-it-works'
import MixedIncomeCalculator from '@/components/MixedIncomeCalculator'
import SiteShell from '@/components/SiteShell'
import { gbp } from '@/lib/goals'
import { calculateMixed, MIXED_DEFAULTS as D } from '@/lib/mixed-income'
import { pageMetadata } from '@/lib/page-meta'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

const PATH = '/mixed-income-calculator'
const DESCRIPTION =
  'Free UK calculator for people with a PAYE job and their own limited company. Find the most tax-efficient salary and dividend mix for 2026/27 and see how much you keep.'

export const metadata = pageMetadata({
  path: PATH,
  title: 'Salary and Dividends Calculator for a PAYE Job and Limited Company 2026/27 | bureau.money',
  description: DESCRIPTION,
})

const base = calculateMixed(D)
const higher = calculateMixed({ ...D, jobSalary: 60000 })
const basicOnly = calculateMixed({ ...D, take: 'basic' })

const faqs: FaqItem[] = [
  {
    question: 'What salary should I pay myself from my company if I already have a job?',
    answer: `Often £5,000, the point where employer NI starts. Your job has already used your personal allowance, so company salary is taxed at 20% or more from the first pound, but it also saves corporation tax and avoids dividend tax. Up to £5,000 that usually beats a dividend; above it, 15% employer NI usually tips things back towards dividends for basic-rate taxpayers. For example, with a £40,000 job and £40,000 of company profit, a £5,000 salary plus dividends leaves you ${gbp(base.best.keep)}, against ${gbp(base.dividendsOnly.keep)} from dividends only.`,
  },
  {
    question: 'Is it different if my job makes me a higher-rate taxpayer?',
    answer: `The best salary can be higher, because higher-rate dividend tax (35.75%) makes dividends more expensive. With a £60,000 job and £40,000 of profit, the calculator's best salary is ${gbp(higher.best.salary)}, keeping ${gbp(higher.best.keep)} against ${gbp(higher.dividendsOnly.keep)} from dividends only. Above £12,570 your own NI (8%) starts on the company salary, so dividends win again from there.`,
  },
  {
    question: 'Should I take dividends or salary?',
    answer:
      'Salary is a cost to the company, so it saves corporation tax (19% to 25%), but it\'s taxed as income and above £5,000 the company pays 15% employer NI. Dividends are paid from profit after corporation tax and taxed at lower rates: 10.75% basic, 35.75% higher and 39.35% additional rate in 2026/27, after a £500 allowance. Taking everything as salary is almost always the most expensive option; the best mix is usually a small salary and the rest as dividends.',
  },
  {
    question: 'Does my company salary use a new personal allowance?',
    answer:
      'No. You have one personal allowance (£12,570) across all your income, and your PAYE job normally uses it. NI is different: it\'s worked out separately for each job, so your company salary has its own £12,570 threshold before you pay NI and its own £5,000 threshold before the company pays employer NI.',
  },
  {
    question: 'Can I claim the Employment Allowance?',
    answer:
      'Not if you are the only employee and also a director. The Employment Allowance (up to £10,500 of employer NI) isn\'t available to companies whose only employee is a director, so this calculator charges employer NI in full above £5,000.',
  },
  {
    question: 'How do I avoid paying higher-rate tax on dividends?',
    answer: `Keep your total income, including your job salary, under ${gbp(50270)}. Choose "Basic rate" under "How much to take out" and the calculator only takes out what fits, leaving the rest in the company. With a £40,000 job and £40,000 of profit, that means taking about ${gbp(basicOnly.best.salary + basicOnly.best.dividends)} and leaving ${gbp(basicOnly.best.leftInCompany)} in the company for a later year. Money left in the company is taxed as dividends when you take it out.`,
  },
  {
    question: 'What about the £100,000 personal allowance trap?',
    answer:
      'Your personal allowance falls by £1 for every £2 of income over £100,000 and is gone at £125,140, which works out as a 60% tax rate on that slice of salary. Choosing "Under £100k" keeps your total income below it. A company pension contribution is another way to take profit out without it counting as your income.',
  },
  {
    question: 'Should my company pay into my pension instead?',
    answer:
      'Employer pension contributions are a business cost, so they save corporation tax, and there\'s no income tax or NI on them. You can\'t touch the money until 55 (57 from April 2028), and contributions count towards the £60,000 annual allowance. Add one in the Advanced tab to see the effect.',
  },
  {
    question: 'Do I need to do a Self Assessment tax return?',
    answer:
      'Usually, yes. Directors are often asked to file one anyway, and you\'ll need to if you receive more than £10,000 in dividends. Tax on dividends and on the company salary not collected through PAYE is paid through Self Assessment, by 31 January after the end of the tax year.',
  },
]

export default function MixedIncomeCalculatorPage() {
  return (
    <SiteShell
      title="Mixed Income Calculator"
      currentHref={PATH}
      reviewed={RULES_CHECKED}
      schemas={[buildAppSchema(`${SITE_URL}${PATH}`, DESCRIPTION, 'GBP', 'Mixed Income Calculator'), buildFaqSchema(faqs)]}
    >
      <MixedIncomeCalculator defaults={D} faqs={faqs} howItWorks={HOW_IT_WORKS.mixed} />
    </SiteShell>
  )
}
