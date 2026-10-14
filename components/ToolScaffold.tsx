'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from './Card'
import FAQ from './FAQ'
import { HowItWorks, RelatedQuestions, type RelatedLink } from './PageExtras'
import type { FaqItem } from '@/lib/schemas'

const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog

/**
 * Shared layout for the calculators: inputs on the left (a sheet on mobile),
 * results, chart, table and FAQs on the right. Matches the compound interest page.
 */
export default function ToolScaffold({
  tool,
  hasInput,
  inputs,
  mobileStats,
  desktopStats,
  summary,
  chart,
  table,
  faqs,
  onEngage,
  heading,
  howItWorks,
  related,
}: {
  tool: string
  hasInput: boolean
  /** Input fields; `bare` is true inside the mobile sheet */
  inputs: (bare: boolean) => React.ReactNode
  mobileStats: React.ReactNode
  desktopStats: React.ReactNode
  summary: React.ReactNode
  chart: React.ReactNode
  table: React.ReactNode
  faqs: FaqItem[]
  onEngage: () => void
  /** Question pages: the question, shown as the page heading until the user changes a value */
  heading?: string
  howItWorks?: FaqItem[]
  related?: RelatedLink[]
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [hasOpenedSheet, setHasOpenedSheet] = useState(false)
  const [tab, setTab] = useState<'graph' | 'table'>('graph')

  // Lock page scroll while the mobile input sheet is open
  useEffect(() => {
    if (!sheetOpen) return
    const scrollY = window.scrollY
    Object.assign(document.body.style, { position: 'fixed', top: `-${scrollY}px`, width: '100%', overflow: 'hidden' })
    document.documentElement.style.overflow = 'hidden'
    return () => {
      Object.assign(document.body.style, { position: '', top: '', width: '', overflow: '' })
      document.documentElement.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [sheetOpen])

  const openSheet = () => {
    setSheetOpen(true)
    setHasOpenedSheet(true)
    ph()?.capture('input_sheet_opened', { tool })
    onEngage()
  }

  return (
    <>
      <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">

        {/* ── Left: inputs (desktop) ── */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="bg-elevated rounded-2xl shadow-card p-5">
            <h2 className="font-sans font-bold text-[20px] text-black mb-5">Input values</h2>
            {inputs(false)}
          </div>
        </div>

        {/* ── Right: results, chart, table, FAQs ── */}
        <div className="space-y-3 lg:space-y-10 lg:col-span-8">

          <Card className="p-5">
            {heading ? (
              <h1 className="font-sans font-bold text-[20px] text-black mb-4">{hasInput ? 'Results' : heading}</h1>
            ) : (
              <h2 className="font-sans font-bold text-[20px] text-black mb-4">{hasInput ? 'Results' : 'Example'}</h2>
            )}
            <div className="lg:hidden space-y-4 mb-4">{mobileStats}</div>
            <div className="hidden lg:grid grid-cols-2 gap-x-8 gap-y-5 mb-5">{desktopStats}</div>
            <p className="text-[18px] font-sans text-black leading-relaxed mb-5 lg:mb-0">{summary}</p>
            <button
              onClick={openSheet}
              className="lg:hidden w-full bg-black rounded-full py-3.5 text-sm font-sans font-bold text-white"
            >
              {hasOpenedSheet ? 'Input values' : 'Get started'}
            </button>
          </Card>

          {/* Mobile: chart / table tabs */}
          <Card className="p-5 lg:hidden">
            <div className="flex rounded-full ring-1 ring-inset ring-black/[0.12] p-1 gap-1 mb-5">
              {(['graph', 'table'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); ph()?.capture('analysis_tab_switched', { tab: t, tool }) }}
                  className={`relative flex-1 h-[38px] text-[13px] font-sans rounded-full outline-none ${
                    tab === t ? 'text-white' : 'text-black hover:bg-black/5'
                  }`}
                >
                  {tab === t && (
                    <motion.div
                      layoutId={`${tool}-tab-pill`}
                      className="absolute inset-0 bg-black rounded-full"
                      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    />
                  )}
                  <span className="relative z-10">{t === 'graph' ? 'Chart' : 'Table'}</span>
                </button>
              ))}
            </div>
            {tab === 'graph' ? chart : table}
          </Card>

          {/* Desktop: chart and table cards */}
          <Card className="hidden lg:block p-5">
            <h2 className="font-sans font-bold text-[20px] text-black mb-3">Chart</h2>
            {chart}
          </Card>
          <Card className="hidden lg:block p-5">
            <h2 className="font-sans font-bold text-[20px] text-black mb-3">Table</h2>
            {table}
          </Card>

          <Card className="p-5">
            <h2 className="font-sans font-bold text-[20px] text-black mb-3">FAQs</h2>
            <FAQ faqs={faqs} />
            <RelatedQuestions links={related} />
          </Card>
          <HowItWorks items={howItWorks} />
        </div>
      </div>

      {/* Mobile: input sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed z-30 backdrop-blur-sm"
              style={{ top: '-100px', bottom: '-100px', left: '-100px', right: '-100px' }}
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="fixed inset-4 z-40 bg-elevated rounded-2xl shadow-card flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-4 flex-shrink-0">
                <h2 className="font-sans font-bold text-[20px] text-black">Input values</h2>
                <button onClick={() => setSheetOpen(false)} className="text-black" aria-label="Close">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M2 2l14 14M16 2L2 16" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4">{inputs(true)}</div>
              <div className="px-4 pt-4 pb-4">
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="w-full bg-black text-white font-sans font-bold text-[15px] py-4 rounded-full"
                >
                  Calculate
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
