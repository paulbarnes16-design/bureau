/** The calculators: tabs under the logo on desktop and the mobile menu. */
export const MAIN_NAV = [
  { href: '/', title: 'Compound Interest Calculator' },
  { href: '/mortgage-calculator', title: 'Mortgage Calculator' },
  { href: '/loan-calculator', title: 'Loan Calculator' },
  { href: '/pension-calculator', title: 'Pension Calculator' },
] as const

/**
 * Every UK page, linked from the footer. Pages with a `parent` are preset
 * versions of a main calculator, so the parent is highlighted in the nav.
 */
export const TOOLS: { href: string; title: string; parent?: string }[] = [
  { href: '/', title: 'Compound interest calculator' },
  { href: '/isa-calculator', title: 'ISA calculator', parent: '/' },
  { href: '/how-much-will-10000-grow', title: 'How much will £10,000 grow?', parent: '/' },
  { href: '/mortgage-calculator', title: 'Mortgage calculator' },
  { href: '/mortgage-overpayment-calculator', title: 'Mortgage overpayment calculator', parent: '/mortgage-calculator' },
  { href: '/loan-calculator', title: 'Loan and car finance calculator' },
  { href: '/pension-calculator', title: 'Pension calculator' },
]

/** The main calculator a page belongs to, for highlighting in the nav. */
export function navHrefFor(href?: string): string | undefined {
  return TOOLS.find((t) => t.href === href)?.parent ?? href
}

export const SITE_URL = 'https://bureau.money'
