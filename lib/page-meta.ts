import type { Metadata } from 'next'
import { SITE_URL } from './tools'

/** Metadata for a UK calculator page: title, description, canonical URL and social cards. */
export function pageMetadata({ path, title, description }: { path: string; title: string; description: string }): Metadata {
  const url = `${SITE_URL}${path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, type: 'website', locale: 'en_GB', url, siteName: 'Bureau' },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  }
}
