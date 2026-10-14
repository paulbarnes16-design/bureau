import Link from 'next/link'
import Card from './Card'
import FAQ from './FAQ'
import type { FaqItem } from '@/lib/schemas'

export interface RelatedLink {
  href: string
  title: string
}

/** Related question pages, shown as plain links under a calculator's FAQs. */
export function RelatedQuestions({ links }: { links?: RelatedLink[] }) {
  if (!links?.length) return null
  return (
    <div className="pt-4 mt-2 border-t border-black/[0.08]">
      <p className="text-sm font-sans text-subdued mb-2">More questions</p>
      <ul className="space-y-1.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="font-sans text-[15px] text-black underline hover:text-irn transition-colors">
              {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** How the calculator works: same collapsible style as the FAQs. */
export function HowItWorks({ items }: { items?: FaqItem[] }) {
  if (!items?.length) return null
  return (
    <Card className="p-5">
      <h2 className="font-sans font-bold text-[20px] text-black mb-3">How it works</h2>
      <FAQ faqs={items} />
    </Card>
  )
}
