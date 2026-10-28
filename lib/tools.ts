/** The calculators: tabs under the logo on desktop and the mobile menu. */
export const MAIN_NAV = [
  { href: '/', title: 'Compound Interest Calculator' },
  { href: '/mortgage-calculator', title: 'Mortgage Calculator' },
  { href: '/loan-calculator', title: 'Loan Calculator' },
  { href: '/pension-calculator', title: 'Pension Calculator' },
  { href: '/isa-calculator', title: 'ISA Calculator' },
  { href: '/mixed-income-calculator', title: 'Mixed Income Calculator' },
] as const

/**
 * Every UK page, linked from the footer. Pages with a `parent` are preset
 * versions of a main calculator, so the parent is highlighted in the nav.
 */
export const TOOLS: { href: string; title: string; parent?: string }[] = [
  { href: '/', title: 'Compound interest calculator' },
  { href: '/isa-calculator', title: 'ISA calculator' },
  { href: '/isa-calculator/cash-isa-limit-2027', title: 'Cash ISA limit 2027', parent: '/isa-calculator' },
  { href: '/isa-calculator/max-isa-every-year', title: 'Maxing out your ISA', parent: '/isa-calculator' },
  { href: '/isa-calculator/isa-millionaire', title: 'ISA millionaire', parent: '/isa-calculator' },
  { href: '/isa-calculator/100-a-month', title: '£100 a month in an ISA', parent: '/isa-calculator' },
  { href: '/isa-calculator/10000-cash-isa', title: '£10,000 in a cash ISA', parent: '/isa-calculator' },
  { href: '/how-much-will-10000-grow', title: 'How much will £10,000 grow?', parent: '/' },
  { href: '/mortgage-calculator', title: 'Mortgage calculator' },
  { href: '/mortgage-overpayment-calculator', title: 'Mortgage overpayment calculator', parent: '/mortgage-calculator' },
  { href: '/loan-calculator', title: 'Loan and car finance calculator' },
  { href: '/pension-calculator', title: 'Pension calculator' },
  { href: '/mixed-income-calculator', title: 'Salary and dividends calculator (PAYE job + limited company)' },
  { href: '/mortgage-calculator/250000-mortgage', title: '£250,000 mortgage repayments', parent: '/mortgage-calculator' },
  { href: '/loan-calculator/15000-loan', title: '£15,000 loan repayments', parent: '/loan-calculator' },
  { href: '/pension-calculator/200-a-month', title: '£200 a month into a pension', parent: '/pension-calculator' },
  { href: '/pension-calculator/500000-pot', title: 'Income from a £500,000 pension', parent: '/pension-calculator' },
]

/** The main calculator a page belongs to, for highlighting in the nav. */
export function navHrefFor(href?: string): string | undefined {
  const tool = TOOLS.find((t) => t.href === href)
  if (tool) return tool.parent ?? tool.href
  // Pages nested under a calculator's path belong to that calculator
  return MAIN_NAV.find((t) => t.href !== '/' && href?.startsWith(`${t.href}/`))?.href ?? href
}

export const SITE_URL = 'https://bureau.money'
