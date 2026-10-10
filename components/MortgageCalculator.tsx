'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Card from './Card'
import CopyButton from './CopyButton'
import FAQ from './FAQ'
import { CurrencyInput, DurationInput, FieldLabel, PercentInput, SegmentedControl } from './InputPanel'
import {
  calculateMortgage,
  decodeMortgage,
  hasMortgageParams,
  mergeMortgageIntoSearch,
  MORTGAGE_DEFAULTS,
  type MortgageInputs,
  type MortgageType,
  type MortgageYear,
} from '@/lib/mortgage'
import type { FaqItem } from '@/lib/schemas'

const MortgageChart = dynamic(() => import('./MortgageChart'), { ssr: false })

const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog

const money = (n: number, dp = 0) =>
  `£${n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`

const duration = (months: number) => {
  const y = Math.floor(months / 12)
  const m = months % 12
  return m === 0 ? `${y} yrs` : `${y} yrs ${m} mo`
}

function exportToCsv(rows: MortgageYear[]) {
  const header = ['Year', 'Paid', 'Interest', 'Loan repaid', 'Balance']
  const lines = rows.map((r) => [r.year, r.paid, r.interest, r.principal, r.balance].join(','))
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bureau-mortgage.csv'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 100)
  ph()?.capture('csv_exported', { tool: 'mortgage' })
}

// ── Inputs ─────────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: MortgageType; label: string }[] = [
  { value: 'repayment', label: 'Repayment' },
  { value: 'interest-only', label: 'Interest only' },
]

function MortgageInputPanel({
  values,
  onChange,
  bare,
}: {
  values: MortgageInputs
  onChange: (patch: Partial<MortgageInputs>) => void
  bare?: boolean
}) {
  const depositPct = values.price > 0 ? (values.deposit / values.price) * 100 : 0
  return (
    <div className={bare ? '' : 'bg-elevated rounded-2xl shadow-card'}>
      {!bare && (
        <div className="px-5 pt-5">
          <h2 className="font-sans font-bold text-[20px] text-black">Input values</h2>
        </div>
      )}
      <div className={`${bare ? '' : 'px-5 pb-5 mt-5'} space-y-5`}>
        <div>
          <FieldLabel label="Property price" />
          <CurrencyInput value={values.price} onChange={(v) => onChange({ price: v })} symbol="£" step={5000} />
        </div>
        <div>
          <FieldLabel label="Deposit" />
          <CurrencyInput value={values.deposit} onChange={(v) => onChange({ deposit: v })} symbol="£" step={1000} />
          <p className="text-[11px] font-sans text-subdued mt-1.5">{depositPct.toFixed(0)}% of the property price</p>
        </div>
        <div>
          <FieldLabel label="Interest rate" />
          <PercentInput value={values.rate} onChange={(v) => onChange({ rate: v })} />
        </div>
        <div>
          <FieldLabel label="Mortgage term" />
          <DurationInput value={values.termYears} onChange={(v) => onChange({ termYears: Math.max(1, v) })} unit="years" />
        </div>
        <div>
          <FieldLabel label="Repayment type" />
          <SegmentedControl options={TYPE_OPTIONS} value={values.type} onChange={(v) => onChange({ type: v })} />
        </div>
        {values.type === 'repayment' && (
          <div>
            <FieldLabel label="Monthly overpayment (optional)" />
            <CurrencyInput value={values.overpayment} onChange={(v) => onChange({ overpayment: v })} symbol="£" step={50} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Results ────────────────────────────────────────────────────────────────────

function Stat({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-sm font-sans text-subdued mb-1">{label}</p>
      <div className="flex items-center justify-between gap-3">
        <span className="font-condensed text-[40px] text-black leading-none">{value}</span>
        <CopyButton value={value} />
      </div>
    </div>
  )
}

function YearTable({ rows }: { rows: MortgageYear[] }) {
  return (
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
            {['Year', 'Interest', 'Loan repaid', 'Balance'].map((h) => (
              <th key={h} className="text-left text-xs font-bold text-black px-3 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.year} className={i % 2 === 1 ? 'bg-black/[0.06]' : ''}>
              <td className="px-3 py-3 text-black">{row.year}</td>
              <td className="px-3 py-3 text-black">{row.interest.toLocaleString('en-GB')}</td>
              <td className="px-3 py-3 text-black">{row.principal.toLocaleString('en-GB')}</td>
              <td className="px-3 py-3 text-black">{row.balance.toLocaleString('en-GB')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => exportToCsv(rows)}
          className="text-[13px] font-sans font-bold text-white bg-black rounded-full px-4 py-1.5 hover:opacity-70 transition-opacity"
        >
          Export to CSV
        </button>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function MortgageCalculator({ faqs }: { faqs: FaqItem[] }) {
  // Defaults on first render (matches the server HTML); URL values applied after hydration
  const [inputs, setInputs] = useState<MortgageInputs>(MORTGAGE_DEFAULTS)
  const [urlLoaded, setUrlLoaded] = useState(false)
  const [hasInput, setHasInput] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [hasOpenedSheet, setHasOpenedSheet] = useState(false)
  const [tab, setTab] = useState<'graph' | 'table'>('graph')
  const hasEngaged = useRef(false)

  useEffect(() => {
    const search = window.location.search
    if (hasMortgageParams(search)) {
      setInputs(decodeMortgage(search, MORTGAGE_DEFAULTS))
      setHasInput(true)
    }
    setUrlLoaded(true)
  }, [])

  useEffect(() => {
    if (!urlLoaded) return
    const id = setTimeout(() => {
      const qs = mergeMortgageIntoSearch(window.location.search, inputs, MORTGAGE_DEFAULTS)
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    }, 300)
    return () => clearTimeout(id)
  }, [inputs, urlLoaded])

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

  const engage = () => {
    if (hasEngaged.current) return
    const posthog = ph()
    if (posthog) {
      hasEngaged.current = true
      posthog.capture('user_engaged', { tool: 'mortgage' })
    }
  }

  const patch = (updates: Partial<MortgageInputs>) => {
    setInputs((prev) => ({ ...prev, ...updates }))
    setHasInput(true)
    engage()
  }

  const result = useMemo(() => calculateMortgage(inputs), [inputs])
  const withoutOverpayment = useMemo(
    () => (inputs.overpayment > 0 ? calculateMortgage({ ...inputs, overpayment: 0 }) : result),
    [inputs, result],
  )
  const interestSaved = withoutOverpayment.totalInterest - result.totalInterest
  const interestOnly = inputs.type === 'interest-only'

  const summary = interestOnly ? (
    <>
      Borrowing <strong>{money(result.loan)}</strong> interest-only at <strong>{inputs.rate}%</strong>, you&apos;ll pay{' '}
      <strong>{money(result.monthlyPayment)}</strong> a month and still owe <strong>{money(result.loan)}</strong> after{' '}
      <strong>{inputs.termYears} years</strong>.
    </>
  ) : (
    <>
      Borrowing <strong>{money(result.loan)}</strong> over <strong>{inputs.termYears} years</strong> at{' '}
      <strong>{inputs.rate}%</strong>, you&apos;ll pay <strong>{money(result.monthlyPayment)}</strong> a month and{' '}
      <strong>{money(result.totalInterest)}</strong> in interest.
      {inputs.overpayment > 0 && interestSaved > 0 && (
        <>
          {' '}Overpaying <strong>{money(inputs.overpayment)}</strong> a month clears it in{' '}
          <strong>{duration(result.months).replace('yrs', 'years').replace('mo', 'months')}</strong> and saves{' '}
          <strong>{money(interestSaved)}</strong>.
        </>
      )}
    </>
  )

  const openSheet = () => {
    setSheetOpen(true)
    setHasOpenedSheet(true)
    ph()?.capture('input_sheet_opened', { tool: 'mortgage' })
    engage()
  }

  return (
    <>
      <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">

        {/* ── Left: Input panel (desktop) ── */}
        <div className="hidden lg:block lg:col-span-4">
          <MortgageInputPanel values={inputs} onChange={patch} />
        </div>

        {/* ── Right: Results, chart, table, FAQs ── */}
        <div className="space-y-3 lg:space-y-10 lg:col-span-8">

          <Card className="p-5">
            <h2 className="font-sans font-bold text-[20px] text-black mb-4">{hasInput ? 'Results' : 'Example'}</h2>

            {/* Mobile: two headline figures */}
            <div className="lg:hidden space-y-4 mb-4">
              <Stat label="Monthly payment" value={money(result.monthlyPayment, 2)} />
              <Stat label="Total interest" value={money(result.totalInterest)} />
            </div>

            {/* Desktop: full grid */}
            <div className="hidden lg:grid grid-cols-2 gap-x-8 gap-y-5 mb-5">
              <Stat label="Monthly payment" value={money(result.monthlyPayment, 2)} />
              <Stat label="Loan to value" value={`${result.ltv.toFixed(0)}%`} />
              <Stat label="Total interest" value={money(result.totalInterest)} />
              <Stat label="Loan amount" value={money(result.loan)} />
              <Stat label="Total repaid" value={money(result.totalRepaid)} />
              <Stat label={inputs.overpayment > 0 && !interestOnly ? 'Mortgage-free in' : 'Mortgage term'} value={duration(result.months)} />
            </div>

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
                  onClick={() => { setTab(t); ph()?.capture('analysis_tab_switched', { tab: t, tool: 'mortgage' }) }}
                  className={`relative flex-1 h-[38px] text-[13px] font-sans rounded-full outline-none ${
                    tab === t ? 'text-white' : 'text-black hover:bg-black/5'
                  }`}
                >
                  {tab === t && (
                    <motion.div
                      layoutId="mortgage-tab-pill"
                      className="absolute inset-0 bg-black rounded-full"
                      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    />
                  )}
                  <span className="relative z-10">{t === 'graph' ? 'Chart' : 'Table'}</span>
                </button>
              ))}
            </div>
            {tab === 'graph' ? <MortgageChart rows={result.rows} /> : <YearTable rows={result.rows} />}
          </Card>

          {/* Desktop: chart and table cards */}
          <Card className="hidden lg:block p-5">
            <h2 className="font-sans font-bold text-[20px] text-black mb-3">Chart</h2>
            <MortgageChart rows={result.rows} />
          </Card>
          <Card className="hidden lg:block p-5">
            <h2 className="font-sans font-bold text-[20px] text-black mb-3">Table</h2>
            <YearTable rows={result.rows} />
          </Card>

          <Card className="p-5">
            <h2 className="font-sans font-bold text-[20px] text-black mb-3">FAQs</h2>
            <FAQ faqs={faqs} />
          </Card>
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
              <div className="flex-1 overflow-y-auto px-4">
                <MortgageInputPanel values={inputs} onChange={patch} bare />
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
