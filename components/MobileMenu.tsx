'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MAIN_NAV } from '@/lib/tools'

const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog

/** Hamburger button and calculator menu, shown on mobile only. */
export default function MobileMenu({ currentHref }: { currentHref?: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => { setOpen(true); ph()?.capture('menu_opened') }}
        className="w-10 h-10 -mr-2 flex items-center justify-center text-black"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <path d="M1 1h20M1 8h20M1 15h20" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed z-30 backdrop-blur-sm"
              style={{ top: '-100px', bottom: '-100px', left: '-100px', right: '-100px' }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              aria-label="Menu"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="fixed top-4 inset-x-4 z-40 bg-elevated rounded-2xl shadow-card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-sans font-bold text-[20px] text-black">Calculators</h2>
                <button onClick={() => setOpen(false)} className="text-black" aria-label="Close menu">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M2 2l14 14M16 2L2 16" />
                  </svg>
                </button>
              </div>
              <ul>
                {MAIN_NAV.map((t) => (
                  <li key={t.href} className="border-b border-black/[0.08] last:border-0">
                    <Link
                      href={t.href}
                      onClick={() => setOpen(false)}
                      aria-current={t.href === currentHref ? 'page' : undefined}
                      className={`block py-3.5 font-sans text-[15px] ${t.href === currentHref ? 'font-bold text-black' : 'text-black'}`}
                    >
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
