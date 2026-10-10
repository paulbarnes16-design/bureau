import type { MetadataRoute } from 'next'

// Update a page's `updated` date only when its content actually changes, so Google keeps trusting it.
// /privacy is left out on purpose: it's marked noindex.
const PAGES: { path: string; updated: string; priority: number }[] = [
  { path: '', updated: '2026-10-10', priority: 1 },
  { path: '/us', updated: '2026-10-10', priority: 0.9 },
  { path: '/mortgage-calculator', updated: '2026-10-10', priority: 0.9 },
  { path: '/mortgage-overpayment-calculator', updated: '2026-10-10', priority: 0.8 },
  { path: '/loan-calculator', updated: '2026-10-10', priority: 0.9 },
  { path: '/pension-calculator', updated: '2026-10-10', priority: 0.9 },
  { path: '/isa-calculator', updated: '2026-10-10', priority: 0.8 },
  { path: '/how-much-will-10000-grow', updated: '2026-10-10', priority: 0.7 },
  { path: '/mortgage-calculator/250000-mortgage', updated: '2026-10-10', priority: 0.7 },
  { path: '/loan-calculator/15000-loan', updated: '2026-10-10', priority: 0.7 },
  { path: '/pension-calculator/200-a-month', updated: '2026-10-10', priority: 0.7 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((p) => ({
    url: `https://bureau.money${p.path}`,
    lastModified: p.updated,
    changeFrequency: 'monthly',
    priority: p.priority,
  }))
}
