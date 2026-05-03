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

export function buildAppSchema(url: string, description: string, currency: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Compound Interest Calculator',
    url,
    description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: currency },
    publisher: { '@type': 'Organization', name: 'Bureau', url: 'https://bureau.money' },
  }
}
