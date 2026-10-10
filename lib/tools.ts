/** UK calculator pages: listed in the mobile menu and the footer of every UK page. */
export const TOOLS = [
  { href: '/', title: 'Compound interest calculator' },
  { href: '/mortgage-calculator', title: 'Mortgage calculator' },
  { href: '/isa-calculator', title: 'ISA calculator' },
  { href: '/how-much-will-10000-grow', title: 'How much will £10,000 grow?' },
] as const

/** Main calculators shown as tabs under the logo on desktop. */
export const MAIN_NAV = [
  { href: '/', title: 'Compound Interest Calculator' },
  { href: '/mortgage-calculator', title: 'Mortgage Calculator' },
] as const

export const SITE_URL = 'https://bureau.money'
