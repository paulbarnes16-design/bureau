import Link from 'next/link'
import { TOOLS } from '@/lib/tools'

/**
 * Page frame shared by the calculator pages: header, page content,
 * "More calculators" links (UK pages) and the disclaimer footer.
 */
export default function SiteShell({
  title,
  intro,
  schemas = [],
  currentHref,
  showTools = true,
  children,
}: {
  title: string
  intro?: string
  schemas?: object[]
  currentHref?: string
  showTools?: boolean
  children: React.ReactNode
}) {
  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <div className="min-h-screen bg-background px-4 lg:px-10 pt-6 pb-12">
        <div className="space-y-6 lg:space-y-6">

          <div>
            <div className="flex items-center justify-between">
              <Link href="/" className="font-mamoth text-[24px] leading-none text-black">bureau</Link>
              <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-sans font-bold uppercase rounded-[2px] leading-none">
                Beta
              </span>
            </div>
            <h1 className="font-sans text-[15px] font-normal text-black">{title}</h1>
            {intro && <p className="font-sans text-[15px] text-subdued mt-1 max-w-2xl">{intro}</p>}
          </div>

          {children}

          <div className="pt-4 pb-2 lg:grid lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-start-5 lg:col-span-8 space-y-8">
              {showTools && (
                <nav aria-label="More calculators">
                  <h2 className="font-sans font-bold text-[15px] text-black mb-3">More calculators</h2>
                  <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-3">
                    {TOOLS.filter((t) => t.href !== currentHref).map((t) => (
                      <li key={t.href}>
                        <Link href={t.href} className="group block">
                          <span className="font-sans font-bold text-sm text-black group-hover:text-irn transition-colors">{t.title}</span>
                          <span className="block font-sans text-sm text-subdued">{t.blurb}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              <p className="text-sm font-sans text-black leading-relaxed">
                Bureau is for informational purposes only and is not financial advice. We may earn a commission from partner links.
                <br />
                <a href="/privacy" className="underline hover:text-black transition-colors">Privacy Policy</a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
