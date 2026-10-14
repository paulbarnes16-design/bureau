'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import dynamic from 'next/dynamic'
const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog
import { calculate, DEFAULT_INPUTS, type CalcInputs, type YearRow, FREQ_LABELS, FREQ_PER_YEAR } from '@/lib/calculate'
import { decodeInputs, hasCalcParams, mergeInputsIntoSearch } from '@/lib/url-params'
import InputPanel from './InputPanel'
import FAQ from './FAQ'
import { HowItWorks, RelatedQuestions, type RelatedLink } from './PageExtras'
import Card from './Card'
import CopyButton from './CopyButton'

const LineChart = dynamic(() => import('./LineChart'), { ssr: false })

// ── Animated number ───────────────────────────────────────────────────────────

function AnimatedValue({ value, symbol }: { value: number; symbol: string }) {
  const motionValue = useMotionValue(Number.isFinite(value) ? value : 0)
  const display = useTransform(motionValue, (v) => {
    const abs = Math.abs(v).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return v < 0 ? `-${symbol}${abs}` : `${symbol}${abs}`
  })

  useEffect(() => {
    if (!Number.isFinite(value)) return
    // If a previous value was invalid, jump straight to the new one rather than animating from NaN
    if (!Number.isFinite(motionValue.get())) {
      motionValue.set(value)
      return
    }
    const controls = animate(motionValue, value, { duration: 0.35, ease: 'easeOut' })
    return controls.stop
  }, [motionValue, value])

  if (!Number.isFinite(value)) return <span>—</span>
  return <motion.span>{display}</motion.span>
}

// ── CSV export ─────────────────────────────────────────────────────────────────

function exportToCsv(rows: YearRow[], inputs: CalcInputs) {
  const annualDep = inputs.additionalPayments * FREQ_PER_YEAR[inputs.additionalPaymentsFreq]

  const inputBlock = [
    `Initial Investment,${inputs.initialInvestment}`,
    `Annual Interest Rate (%),${inputs.interestRate}`,
    `Compound Frequency,${inputs.compoundFreq}`,
    `Duration (Years),${inputs.durationYears}`,
    `Additional Contributions (${inputs.additionalPaymentsFreq}),${inputs.additionalPayments}`,
    `Annual Deposits,${annualDep}`,
    `Annual Fee (%),${inputs.managementFee}`,
    ``,
  ]
  const dataStartRow = inputBlock.length + 2 // +1 for header row, +1 for 1-indexing

  const rate = `($B$2/100)`
  const fee  = `(1-$B$7/100)`
  const dep  = `$B$6`

  const csvRows: string[] = [
    ...inputBlock,
    `Year,Deposits,Interest Earned,Balance`,
    `${rows[0].year},${rows[0].deposits},0,=B1`,
    ...rows.slice(1).map((r, i) => {
      const prevBal = `D${dataStartRow + i}`
      return `${r.year},${dep},=${prevBal}*${rate}*${fee},=${prevBal}*(1+${rate})*${fee}+${dep}`
    }),
  ]

  const csv = csvRows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = 'compound-interest.csv'
    a.click()
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }
}

// ── Main Calculator ────────────────────────────────────────────────────────────

export default function Calculator({ defaultInputs, faqs, heading, howItWorks, related }: {
  defaultInputs?: Partial<CalcInputs>
  faqs: import('@/lib/schemas').FaqItem[]
  /** Question pages: the question, shown as the page heading until the user changes a value */
  heading?: string
  howItWorks?: import('@/lib/schemas').FaqItem[]
  related?: RelatedLink[]
}) {
  const [base] = useState<CalcInputs>(() => ({ ...DEFAULT_INPUTS, ...defaultInputs }))
  // Server and first client render both use the defaults; values from the URL are
  // applied after hydration so the HTML matches and React doesn't throw a mismatch.
  const [inputs, setInputs] = useState<CalcInputs>(base)
  const [urlLoaded, setUrlLoaded] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  // Defaults are shown as an "Example" until the user enters values (or arrives via a shared link)
  const [hasInput, setHasInput] = useState(false)
  const [hasOpenedSheet, setHasOpenedSheet] = useState(false)
  const [tab, setTab] = useState<'graph' | 'table'>('graph')
  const [resultPage, setResultPage] = useState(0)
  const [swipeDir, setSwipeDir] = useState(1)
  const [carouselHeight, setCarouselHeight] = useState<number | undefined>(undefined)
  const [tabSwipeDir, setTabSwipeDir] = useState(1)
  const page0Ref = useRef<HTMLDivElement | null>(null)
  const hasEngaged = useRef(false)

  const tabs = ['graph', 'table'] as const
  const switchTab = (t: 'graph' | 'table') => {
    setTabSwipeDir(tabs.indexOf(t) > tabs.indexOf(tab) ? 1 : -1)
    setTab(t)
    ph()?.capture('analysis_tab_switched', { tab: t })
  }

  useEffect(() => {
    const search = window.location.search
    if (hasCalcParams(search)) {
      setInputs((prev) => decodeInputs(search, prev))
      setHasInput(true)
    }
    setUrlLoaded(true)
  }, [])

  useEffect(() => {
    if (!urlLoaded) return
    const id = setTimeout(() => {
      const qs = mergeInputsIntoSearch(window.location.search, inputs, base)
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    }, 300)
    return () => clearTimeout(id)
  }, [inputs, base, urlLoaded])

  const patch = (updates: Partial<CalcInputs>) => {
    setInputs((prev) => ({ ...prev, ...updates }))
    setHasInput(true)
    if (!hasEngaged.current) {
      const posthog = ph()
      if (posthog) {
        hasEngaged.current = true
        posthog.capture('user_engaged', { tool: 'compound' })
      }
    }
  }

  const goToPage = (page: number) => {
    setSwipeDir(page > resultPage ? 1 : -1)
    setResultPage(page)
    ph()?.capture('result_page_viewed', { page })
  }

  const result = useMemo(() => calculate(inputs), [inputs])

  useEffect(() => {
    if (sheetOpen) {
      const scrollY = window.scrollY
      document.documentElement.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      const scrollY = parseInt(document.body.style.top || '0') * -1
      document.documentElement.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [sheetOpen])

  useEffect(() => {
    if (resultPage === 0 && page0Ref.current) {
      setCarouselHeight(page0Ref.current.scrollHeight)
    }
  }, [resultPage, inputs])

  const sym = inputs.currency.symbol

  const fmtResult = (n: number) => {
    const abs = Math.abs(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return n < 0 ? `-${sym}${abs}` : `${sym}${abs}`
  }

  const n = FREQ_PER_YEAR[inputs.compoundFreq]
  const nominalEAR = Math.pow(1 + inputs.interestRate / 100 / n, n) - 1
  const realEAR = inputs.adjustForInflation
    ? (1 + nominalEAR) / (1 + inputs.inflationRate / 100) - 1
    : nominalEAR
  const compoundedRate = realEAR * 100
  const allTimeReturn = result.totalDeposits > 0
    ? ((result.futureValue - result.totalDeposits) / result.totalDeposits) * 100
    : 0
  const timeToDouble = realEAR > 0
    ? Math.log(2) / Math.log(1 + realEAR)
    : Infinity

  const totalYears = inputs.durationYears + inputs.durationMonths / 12
  const totalDeposits = inputs.initialInvestment + inputs.additionalPayments *
    FREQ_PER_YEAR[inputs.additionalPaymentsFreq] * totalYears
  const summaryParts = [
    `Over `, `${inputs.durationYears} year${inputs.durationYears !== 1 ? 's' : ''}`, `, starting with `,
    `${sym}${Math.round(inputs.initialInvestment).toLocaleString('en-GB')}`,
    ` returning `, `${inputs.interestRate}%`,
    ` annually and ${FREQ_LABELS[inputs.additionalPaymentsFreq].toLowerCase()} contributions of `,
    `${sym}${inputs.additionalPayments.toLocaleString('en-GB')}`,
    ...(inputs.adjustForInflation ? [` and inflation at `, `${inputs.inflationRate}%`] : []),
    `.`,
  ]

  return (
    <>
      <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">

        {/* ── Left: Input panel (desktop) ── */}
        <div className="hidden lg:block lg:col-span-4">
          <InputPanel values={inputs} onChange={patch} />
        </div>

        {/* ── Right: Results + Analysis + FAQs ── */}
        <div className="space-y-3 lg:space-y-10 lg:col-span-8">

          {/* Results */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              {heading ? (
                <h1 className="font-sans font-bold text-[20px] text-black">{hasInput ? 'Results' : heading}</h1>
              ) : (
                <h2 className="font-sans font-bold text-[20px] text-black">{hasInput ? 'Results' : 'Example'}</h2>
              )}
              {inputs.adjustForInflation && (
                <span className="px-1.5 py-0.5 bg-black text-white text-[11px] font-sans font-bold rounded-[4px] leading-none">
                  Inflation adjusted
                </span>
              )}
            </div>

            {/* Mobile: swipeable result pages */}
            <div className="lg:hidden">
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.05}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -40 && resultPage < 2) goToPage(resultPage + 1)
                  if (info.offset.x > 40 && resultPage > 0) goToPage(resultPage - 1)
                }}
              >
                <div style={{ height: carouselHeight ?? 'auto', overflow: 'hidden' }}>
                <AnimatePresence mode="wait" custom={swipeDir} initial={false}>
                  {resultPage === 0 && (
                    <motion.div key="p0" ref={page0Ref}
                      custom={swipeDir}
                      variants={{ enter: (d) => ({ x: d * 30, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d) => ({ x: d * -30, opacity: 0 }) }}
                      initial="enter" animate="center" exit="exit"
                      transition={{ duration: 0.18 }}
                    >
                      <p className="text-sm font-sans text-subdued mb-1">{inputs.adjustForInflation ? 'Real future value' : 'Future value'}</p>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="font-condensed text-[40px] text-black leading-none"><AnimatedValue value={result.futureValue} symbol={sym} /></span>
                        <CopyButton value={fmtResult(result.futureValue)} />
                      </div>
                      <p className="text-sm font-sans text-subdued mb-1">{inputs.adjustForInflation ? 'Real interest earned' : 'Interest earned'}</p>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="font-condensed text-[40px] text-black leading-none"><AnimatedValue value={result.interestEarned} symbol={sym} /></span>
                        <CopyButton value={fmtResult(result.interestEarned)} />
                      </div>
                      <p className="text-[18px] font-sans text-black leading-relaxed">
                        {summaryParts.map((part, i) =>
                          i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                        )}
                      </p>
                    </motion.div>
                  )}
                  {resultPage === 1 && (
                    <motion.div key="p1"
                      custom={swipeDir}
                      variants={{ enter: (d) => ({ x: d * 30, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d) => ({ x: d * -30, opacity: 0 }) }}
                      initial="enter" animate="center" exit="exit"
                      transition={{ duration: 0.18 }}
                    >
                      <p className="text-sm font-sans text-subdued mb-1">{inputs.adjustForInflation ? 'Real all time rate of return' : 'All time rate of return'}</p>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="font-condensed text-[40px] text-black leading-none">{allTimeReturn.toFixed(2)}%</span>
                        <CopyButton value={`${allTimeReturn.toFixed(2)}%`} />
                      </div>
                      <p className="text-sm font-sans text-subdued mb-1">{inputs.adjustForInflation ? 'Real compounded rate of return' : 'Compounded rate of return'}</p>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="font-condensed text-[40px] text-black leading-none">{compoundedRate.toFixed(2)}%</span>
                        <CopyButton value={`${compoundedRate.toFixed(2)}%`} />
                      </div>
                      <p className="text-[18px] font-sans text-black leading-relaxed">
                        Over <strong>{inputs.durationYears} year{inputs.durationYears !== 1 ? 's' : ''}</strong> your total return was <strong>{allTimeReturn.toFixed(1)}%</strong>, compounding at <strong>{compoundedRate.toFixed(2)}%</strong> per year{inputs.adjustForInflation ? <>, after <strong>{inputs.inflationRate}%</strong> inflation</> : ''}.
                      </p>
                    </motion.div>
                  )}
                  {resultPage === 2 && (
                    <motion.div key="p2"
                      custom={swipeDir}
                      variants={{ enter: (d) => ({ x: d * 30, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d) => ({ x: d * -30, opacity: 0 }) }}
                      initial="enter" animate="center" exit="exit"
                      transition={{ duration: 0.18 }}
                    >
                      <p className="text-sm font-sans text-subdued mb-1">Time to double</p>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="font-condensed text-[40px] text-black leading-none">
                          {isFinite(timeToDouble) ? `${timeToDouble.toFixed(1)} yrs` : '—'}
                        </span>
                        {isFinite(timeToDouble) && <CopyButton value={`${timeToDouble.toFixed(1)} yrs`} />}
                      </div>
                      <p className="text-sm font-sans text-subdued mb-1">Total contributions</p>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="font-condensed text-[40px] text-black leading-none">
                          {sym}{Math.round(result.totalDeposits).toLocaleString('en-GB')}
                        </span>
                        <CopyButton value={`${sym}${Math.round(result.totalDeposits).toLocaleString('en-GB')}`} />
                      </div>
                      <p className="text-[18px] font-sans text-black leading-relaxed">
                        With a {inputs.adjustForInflation ? 'real' : ''} return of <strong>{compoundedRate.toFixed(2)}%</strong> your money doubles every <strong>{isFinite(timeToDouble) ? `${timeToDouble.toFixed(1)} years` : '—'}</strong>. You put in <strong>{sym}{Math.round(result.totalDeposits).toLocaleString('en-GB')}</strong> of your own money.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
              </motion.div>

              {/* Dots */}
              <div className="flex items-center justify-center gap-2 mt-5 mb-4">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    aria-label={`Show results page ${i + 1} of 3`}
                    aria-current={i === resultPage ? 'true' : undefined}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === resultPage ? 'bg-black' : 'bg-black/20'}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop: static layout */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-5">
                {/* Left column */}
                <div>
                  <p className="text-sm font-sans text-subdued mb-1">{inputs.adjustForInflation ? 'Real future value' : 'Future value'}</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-condensed text-[40px] text-black leading-none"><AnimatedValue value={result.futureValue} symbol={sym} /></span>
                    <CopyButton value={fmtResult(result.futureValue)} />
                  </div>
                </div>
                {/* Right column */}
                <div>
                  <p className="text-sm font-sans text-subdued mb-1">{inputs.adjustForInflation ? 'Real all time rate of return' : 'All time rate of return'}</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-condensed text-[40px] text-black leading-none">{allTimeReturn.toFixed(2)}%</span>
                    <CopyButton value={`${allTimeReturn.toFixed(2)}%`} />
                  </div>
                </div>
                {/* Left column */}
                <div>
                  <p className="text-sm font-sans text-subdued mb-1">{inputs.adjustForInflation ? 'Real interest earned' : 'Interest earned'}</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-condensed text-[40px] text-black leading-none"><AnimatedValue value={result.interestEarned} symbol={sym} /></span>
                    <CopyButton value={fmtResult(result.interestEarned)} />
                  </div>
                </div>
                {/* Right column */}
                <div>
                  <p className="text-sm font-sans text-subdued mb-1">{inputs.adjustForInflation ? 'Real compounded rate of return' : 'Compounded rate of return'}</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-condensed text-[40px] text-black leading-none">{compoundedRate.toFixed(2)}%</span>
                    <CopyButton value={`${compoundedRate.toFixed(2)}%`} />
                  </div>
                </div>
                {/* Left column */}
                <div>
                  <p className="text-sm font-sans text-subdued mb-1">Total contributions</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-condensed text-[40px] text-black leading-none">
                      {sym}{Math.round(result.totalDeposits).toLocaleString('en-GB')}
                    </span>
                    <CopyButton value={`${sym}${Math.round(result.totalDeposits).toLocaleString('en-GB')}`} />
                  </div>
                </div>
                {/* Right column */}
                <div>
                  <p className="text-sm font-sans text-subdued mb-1">Time to double</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-condensed text-[40px] text-black leading-none">
                      {isFinite(timeToDouble) ? `${timeToDouble.toFixed(1)} yrs` : '—'}
                    </span>
                    {isFinite(timeToDouble) && <CopyButton value={`${timeToDouble.toFixed(1)} yrs`} />}
                  </div>
                </div>
              </div>
              <p className="text-[18px] font-sans text-black leading-relaxed">
                {summaryParts.map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                )}
              </p>
            </div>

            {/* Input values (mobile only) */}
            <button
              onClick={() => {
        setSheetOpen(true)
        setHasOpenedSheet(true)
        ph()?.capture('input_sheet_opened', { tool: 'compound' })
        if (!hasEngaged.current) {
          const posthog = ph()
          if (posthog) {
            hasEngaged.current = true
            posthog.capture('user_engaged', { tool: 'compound' })
          }
        }
      }}
              className="lg:hidden w-full bg-black rounded-full py-3.5 text-sm font-sans font-bold text-white"
            >
              {hasOpenedSheet ? 'Input values' : 'Get started'}
            </button>
          </Card>

          {/* Analysis: Graph + Table — tabs on mobile, separate cards on desktop */}

          {/* Mobile: tabbed */}
          <Card className="p-5 lg:hidden">
            <div className="flex rounded-full ring-1 ring-inset ring-black/[0.12] p-1 gap-1 mb-5">
              {(['graph', 'table'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`relative flex-1 h-[38px] text-[13px] font-sans rounded-full capitalize outline-none ${
                    tab === t ? 'text-white' : 'text-black hover:bg-black/5'
                  }`}
                >
                  {tab === t && (
                    <motion.div
                      layoutId="tab-pill"
                      className="absolute inset-0 bg-black rounded-full"
                      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    />
                  )}
                  <span className="relative z-10 capitalize">{t === 'graph' ? 'Chart' : 'Table'}</span>
                </button>
              ))}
            </div>
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.05}
              onDragEnd={(_, info) => {
                if (info.offset.x < -40 && tab === 'graph') switchTab('table')
                if (info.offset.x > 40 && tab === 'table') switchTab('graph')
              }}
            >
              <AnimatePresence mode="wait" custom={tabSwipeDir}>
                {tab === 'graph' ? (
                  <motion.div key="graph"
                    custom={tabSwipeDir}
                    variants={{ enter: (d) => ({ x: d * 30, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d) => ({ x: d * -30, opacity: 0 }) }}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.18 }}
                  >
                    <LineChart rows={result.rows} initialValue={inputs.initialInvestment} inflation={inputs.adjustForInflation} />
                  </motion.div>
                ) : (
                  <motion.div key="table"
                    custom={tabSwipeDir}
                    variants={{ enter: (d) => ({ x: d * 30, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d) => ({ x: d * -30, opacity: 0 }) }}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.18 }}
                  >
                    <div className="overflow-x-auto -mx-1 outline-none">
                      <table className="w-full text-sm font-sans border-collapse table-fixed">
                        <colgroup>
                          <col className="w-14 lg:w-20" />
                          <col />
                          <col />
                          <col />
                        </colgroup>
                        <thead>
                          <tr className="bg-black/[0.06]">
                            {['Year', 'Deposits', inputs.adjustForInflation ? 'Real interest earned' : 'Interest earned', 'Balance'].map((h) => (
                              <th key={h} className="text-left text-xs font-bold text-black px-3 py-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((row, i) => (
                            <tr key={row.year} className={i % 2 === 1 ? 'bg-black/[0.06]' : ''}>
                              <td className="px-3 py-3 text-black">{row.year}</td>
                              <td className="px-3 py-3 text-black">{row.deposits.toLocaleString('en-GB')}</td>
                              <td className="px-3 py-3 text-black">{row.interestEarned.toLocaleString('en-GB')}</td>
                              <td className="px-3 py-3 text-black">{row.balance.toLocaleString('en-GB')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-3 pt-3 pb-1">
                        <button onClick={() => exportToCsv(result.rows, inputs)} className="text-[13px] font-sans font-bold text-white bg-black rounded-full px-4 py-1.5 hover:opacity-70 transition-opacity">Export to CSV</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Card>

          {/* Desktop: graph card */}
          <Card className="hidden lg:block p-5">
            <h2 className="font-sans font-bold text-[20px] text-black mb-3">Chart</h2>
            <LineChart rows={result.rows} initialValue={inputs.initialInvestment} inflation={inputs.adjustForInflation} />
          </Card>

          {/* Desktop: table card */}
          <Card className="hidden lg:block p-5">
            <h2 className="font-sans font-bold text-[20px] text-black mb-3">Table</h2>
            <div className="overflow-x-auto -mx-1 outline-none">
              <table className="w-full text-sm font-sans border-collapse table-fixed">
                <colgroup>
                  <col className="w-14 lg:w-20" />
                  <col />
                  <col />
                  <col />
                </colgroup>
                <thead>
                  <tr className="bg-black/[0.06]">
                    {['Year', 'Deposits', inputs.adjustForInflation ? 'Real interest earned' : 'Interest earned', 'Balance'].map((h) => (
                      <th key={h} className="text-left text-xs font-bold text-black px-3 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={row.year} className={i % 2 === 1 ? 'bg-black/[0.06]' : ''}>
                      <td className="px-3 py-3 text-black">{row.year}</td>
                      <td className="px-3 py-3 text-black">{row.deposits.toLocaleString('en-GB')}</td>
                      <td className="px-3 py-3 text-black">{row.interestEarned.toLocaleString('en-GB')}</td>
                      <td className="px-3 py-3 text-black">{row.balance.toLocaleString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 pt-3 pb-1">
                <button onClick={() => exportToCsv(result.rows, inputs)} className="text-[13px] font-sans font-bold text-white bg-black rounded-full px-4 py-1.5 hover:opacity-70 transition-opacity">Export to CSV</button>
              </div>
            </div>
          </Card>

          {/* FAQs */}
          <Card className="p-5">
            <h2 className="font-sans font-bold text-[20px] text-black mb-3">FAQs</h2>
            <FAQ faqs={faqs} />
            <RelatedQuestions links={related} />
          </Card>
          <HowItWorks items={howItWorks} />

        </div>
      </div>

      {/* Mobile: input lightbox */}
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
              <div className="flex-1 overflow-y-auto px-4 pb-0">
                <InputPanel
                  values={inputs}
                  onChange={patch}
                  onClose={() => setSheetOpen(false)}
                  showActions
                  bare
                />
              </div>
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
