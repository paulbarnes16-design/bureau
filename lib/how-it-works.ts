import type { RelatedLink } from '@/components/PageExtras'
import type { FaqItem } from './schemas'

/** When the UK rules quoted on the site were last checked. Update whenever they're re-checked. */
export const RULES_CHECKED = 'Rules and allowances checked against GOV.UK on 14 October 2026.'

/** "How it works" sections for each main calculator: method, assumptions and limits. */
export const HOW_IT_WORKS: Record<'compound' | 'mortgage' | 'loan' | 'pension' | 'isa' | 'mixed', FaqItem[]> = {
  compound: [
    {
      question: 'The calculation',
      answer:
        'Your balance grows by the interest rate divided by the number of compounding periods (12 for monthly), once each period. Regular contributions are added at the end of each period, or the start if you choose. Over time this follows the standard compound interest formula, A = P × (1 + r/n)^(n×t), plus the growth on each contribution from the day it is added.',
    },
    {
      question: 'Fees, tax and inflation',
      answer:
        'Annual fees are charged a little each period on the whole balance. Tax, if you set it, is taken once a year on interest above your tax-free amount. With "Adjust for inflation" on, results are shown in today\'s money: each year\'s balance is divided by the rise in prices since you started.',
    },
    {
      question: 'What it doesn\'t include',
      answer:
        'It assumes the same rate every year. Real savings rates change and investments go up and down, so treat results as an illustration rather than a forecast. It doesn\'t account for charges or bonuses specific to your account.',
    },
  ],
  mortgage: [
    {
      question: 'The calculation',
      answer:
        'For a repayment mortgage the monthly payment is M = L × r ÷ (1 − (1 + r)^−n), where L is the loan (price minus deposit), r is the yearly rate divided by 12 and n is the number of months. Each month, interest is charged on the balance still owed and the rest of the payment reduces the loan. For interest-only, the payment is just the interest and the loan is still owed at the end.',
    },
    {
      question: 'Overpayments',
      answer:
        'Any overpayment is taken off the balance each month on top of the normal payment. The payment stays the same, so the mortgage is cleared sooner and less interest is charged. "Interest saved" compares this with no overpayments.',
    },
    {
      question: 'What it doesn\'t include',
      answer:
        'It uses one rate for the whole term, whereas most UK mortgages start on a fixed or tracker deal and move to a different rate afterwards. It leaves out arrangement fees, stamp duty, legal costs, insurance and any early repayment charges.',
    },
  ],
  loan: [
    {
      question: 'The calculation',
      answer:
        'The monthly payment is M = L × r ÷ (1 − (1 + r)^−n), where L is the amount borrowed after any deposit and n is the number of months. UK lenders quote an APR, which is an annual rate including compounding, so r is the equivalent monthly rate: (1 + APR)^(1/12) − 1. Each payment covers that month\'s interest and repays part of the loan.',
    },
    {
      question: 'What it doesn\'t include',
      answer:
        'It works out personal loans and hire purchase, where the whole amount is repaid over the term. It doesn\'t model PCP balloon payments, payment holidays or early settlement. Your actual APR depends on your credit history.',
    },
  ],
  pension: [
    {
      question: 'Saving: the calculation',
      answer:
        'Your pot grows each month by the investment growth rate, less annual fees charged monthly. Each month your contribution and your employer\'s are added. With basic-rate tax relief on, your payment is topped up by 25% (relief at source: £80 becomes £100). The 25% tax-free lump sum is capped at the £268,275 Lump Sum Allowance.',
    },
    {
      question: 'Retirement income: the calculation',
      answer:
        'It finds the monthly income that would run your pot down to zero at the age you choose, taking income at the start of each month and growing the rest. With "Income rises with inflation" on, the income keeps its buying power each year and is shown in today\'s money. "Income at 4% a year" is a simple rule of thumb for comparison.',
    },
    {
      question: 'What it doesn\'t include',
      answer:
        'Figures are before income tax, and it doesn\'t include the State Pension, annuities or charges specific to your scheme. Investment growth isn\'t guaranteed. You can usually access a personal or workplace pension from 55, rising to 57 from 6 April 2028.',
    },
  ],
  isa: [
    {
      question: 'The calculation',
      answer:
        'Cash and stocks and shares ISAs are worked out separately, month by month. Cash grows at your rate (as an AER), and stocks and shares at your growth rate less fees. Payments are added at the end of each month. It starts from the current month and follows UK tax years, which run from 6 April to 5 April.',
    },
    {
      question: 'The £12,000 cash limit from April 2027',
      answer:
        'From 6 April 2027, under-65s can put at most £12,000 a year into cash ISAs; the overall allowance stays at £20,000. With "Apply the £12,000 cash limit" on, any cash saving above £12,000 in a tax year is moved into your stocks and shares ISA instead. It assumes you\'re one year older every 12 months, and stops applying the limit from age 65.',
    },
    {
      question: 'Tax saved',
      answer:
        'The tax saved is an estimate of the income tax you\'d pay on your cash ISA interest if it were in a normal savings account: interest above your Personal Savings Allowance (£1,000 basic rate, £500 higher rate, £0 additional rate), taxed at 20%, 40% or 45%. It assumes you have no other savings interest.',
    },
    {
      question: 'What it doesn\'t include',
      answer:
        'It doesn\'t model the 22% charge from April 2027 on interest from cash left uninvested inside a stocks and shares ISA, Lifetime ISA bonuses, or transfers between ISAs. Rates are assumed to stay the same each year.',
    },
  ],
  mixed: [
    {
      question: 'The calculation',
      answer:
        'For each possible company salary, it works out employer NI (15% above £5,000), corporation tax on the profit that\'s left (19% up to £50,000, 25% from £250,000, with marginal relief in between), and pays the rest out as dividends. It then works out the extra income tax, your NI and dividend tax on top of your PAYE job, and picks the salary that leaves the least tax overall. It checks every £10 of salary, and prefers a familiar threshold like £5,000 or £12,570 if it\'s within £10 of the best.',
    },
    {
      question: 'Your job and your company salary',
      answer:
        'Your PAYE job uses your personal allowance first, so your company salary is usually taxed from the first pound. NI is worked out separately for each job, so your company salary has its own £12,570 threshold for your NI and £5,000 for employer NI. Sole-director companies can\'t claim the Employment Allowance, so employer NI isn\'t reduced. Dividends sit on top of all your salary: the first £500 is tax-free, then 10.75%, 35.75% or 39.35% depending on your band.',
    },
    {
      question: 'Taking out less than everything',
      answer:
        'With "Basic rate" or "Under £100k", it takes out as much as fits under that income and leaves the rest in the company after corporation tax. The best mix is then the one that pays the least tax this year. Money left in the company will be taxed as dividends when you take it out later.',
    },
    {
      question: 'What it doesn\'t include',
      answer:
        'It uses 2026/27 rates for England, Wales and Northern Ireland, not Scottish income tax bands on salary. It assumes your company has no associated companies, that your job has no pension or salary sacrifice, and leaves out student loans, benefits in kind, the High Income Child Benefit Charge and other income such as savings interest or rent. Corporation tax is worked out on the year\'s profit as entered, so check your accounts and talk to an accountant before paying yourself.',
    },
  ],
}

/** Question pages linked from each main calculator's FAQ card. */
export const RELATED: Record<string, RelatedLink[]> = {
  '/': [{ href: '/how-much-will-10000-grow', title: 'How much will £10,000 grow?' }],
  '/mortgage-calculator': [
    { href: '/mortgage-calculator/250000-mortgage', title: 'What are the monthly repayments on a £250,000 mortgage?' },
    { href: '/mortgage-overpayment-calculator', title: 'How much could overpaying my mortgage save?' },
  ],
  '/loan-calculator': [{ href: '/loan-calculator/15000-loan', title: 'What are the monthly repayments on a £15,000 loan?' }],
  '/pension-calculator': [
    { href: '/pension-calculator/200-a-month', title: 'How much will I have if I pay £200 a month into a pension?' },
    { href: '/pension-calculator/500000-pot', title: 'How much income will a £500,000 pension pot give me?' },
  ],
  '/isa-calculator': [
    { href: '/isa-calculator/cash-isa-limit-2027', title: 'How does the £12,000 cash ISA limit affect me?' },
    { href: '/isa-calculator/max-isa-every-year', title: 'How much will I have if I max out my ISA every year?' },
    { href: '/isa-calculator/isa-millionaire', title: 'How long does it take to become an ISA millionaire?' },
    { href: '/isa-calculator/100-a-month', title: 'How much will £100 a month in a stocks and shares ISA grow?' },
    { href: '/isa-calculator/10000-cash-isa', title: 'How much interest will £10,000 earn in a cash ISA?' },
  ],
}
