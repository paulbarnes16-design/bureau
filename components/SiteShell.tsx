import Link from 'next/link'
import MobileMenu from './MobileMenu'
import { MAIN_NAV, navHrefFor, TOOLS } from '@/lib/tools'

/**
 * Page frame shared by the calculator pages: header, page content,
 * "More calculators" links (UK pages) and the disclaimer footer.
 */
export default function SiteShell({
  title,
  schemas = [],
  currentHref,
  showTools = true,
  answer,
  children,
}: {
  title: string
  schemas?: object[]
  currentHref?: string
  showTools?: boolean
  /** Question pages: an AnswerCard shown above the calculator; it holds the page heading */
  answer?: React.ReactNode
  children: React.ReactNode
}) {
  const navHref = navHrefFor(currentHref)
  const isMainPage = MAIN_NAV.some((t) => t.href === currentHref)
  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <div className="min-h-screen bg-background px-4 lg:px-10 pt-6 pb-12">
        <div className="space-y-6 lg:space-y-6">

          <header>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href="/" className="font-mamoth text-[24px] leading-none text-black">bureau</Link>
                <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-sans font-bold uppercase rounded-[2px] leading-none">
                  Beta
                </span>
              </div>
              {showTools && <MobileMenu currentHref={navHref} />}
            </div>
            {showTools && (
              <nav aria-label="Calculators" className="hidden lg:flex gap-10 mt-1">
                {MAIN_NAV.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    aria-current={t.href === navHref ? 'page' : undefined}
                    className={`font-sans text-[15px] transition-colors ${t.href === navHref ? 'text-black' : 'text-black/40 hover:text-black'}`}
                  >
                    {t.title}
                  </Link>
                ))}
              </nav>
            )}
            {/*
              Preset pages (e.g. ISA) look exactly like their parent calculator: the header shows the
              parent's name, and the page's own title is kept only as the heading search engines read.
            */}
            {showTools && !isMainPage ? (
              <>
                {!answer && <h1 className="sr-only">{title}</h1>}
                <p className="lg:hidden font-sans text-[15px] font-normal text-black" aria-hidden>
                  {MAIN_NAV.find((t) => t.href === navHref)?.title}
                </p>
              </>
            ) : (
              <h1 className={`font-sans text-[15px] font-normal text-black ${showTools ? 'lg:sr-only' : ''}`}>{title}</h1>
            )}
          </header>

          {answer}
          {children}

          <div className="pt-4 pb-2 lg:grid lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-start-5 lg:col-span-8 space-y-4">
              {showTools && (
                <nav aria-label="More calculators" className="text-sm font-sans text-black">
                  <ul className="flex flex-wrap gap-x-4 gap-y-1">
                    {TOOLS.filter((t) => t.href !== currentHref).map((t) => (
                      <li key={t.href}>
                        <Link href={t.href} className="underline hover:text-irn transition-colors">{t.title}</Link>
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
