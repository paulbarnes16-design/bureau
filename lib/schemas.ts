export interface FaqItem {
  question: string
  answer: string
}

export function buildFaqSchema(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export function buildAppSchema(url: string, description: string, currency: string, name = 'Compound Interest Calculator') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url,
    description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: currency },
    publisher: { '@type': 'Organization', name: 'Bureau', url: 'https://bureau.money' },
  }
}

/** Tells Google the site's name ("bureau") and that "bureau.money" refers to it. */
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'bureau',
  alternateName: ['bureau.money', 'Bureau'],
  url: 'https://bureau.money/',
}

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'bureau',
  alternateName: 'bureau.money',
  url: 'https://bureau.money/',
  logo: 'https://bureau.money/apple-touch-icon.png',
}

/** Breadcrumb trail, e.g. Pension Calculator > Income from a £500,000 pension. */
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: item.url })),
  }
}
