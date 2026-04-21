'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { calculate, DEFAULT_INPUTS, CURRENCIES, type CalcInputs, type Currency, FREQ_LABELS } from '@/lib/calculate'
import InputPanel from './InputPanel'
import CurrencyPicker from './CurrencyPicker'
import FAQ from './FAQ'

const LineChart = dynamic(() => import('./LineChart'), { ssr: false })

// ── Copy button ────────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      className="text-irn hover:opacity-70 transition-opacity flex-shrink-0"
      aria-label="Copy value"
    >
      {copied ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round">
          <path d="M3 9l4 4 8-8" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
          <rect x="6" y="6" width="9" height="9" rx="1.5" />
          <path d="M4 12H3a1.5 1.5 0 01-1.5-1.5V3A1.5 1.5 0 013 1.5h7.5A1.5 1.5 0 0112 3v1" />
        </svg>
      )}
    </button>
  )
}

// ── Card wrapper ───────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-elevated rounded-2xl shadow-card ring-2 ring-inset ring-white ${className}`}>
      {children}
    </div>
  )
}

// ── Main Calculator ────────────────────────────────────────────────────────────

export default function Calculator() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [tab, setTab] = useState<'graph' | 'table'>('graph')

  const patch = (updates: Partial<CalcInputs>) => setInputs((prev) => ({ ...prev, ...updates }))

  const result = useMemo(() => calculate(inputs), [inputs])

  const sym = inputs.currency.symbol

  const fmtResult = (n: number) =>
    `${sym}${Math.abs(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // Summary sentence components
  const totalYears = inputs.durationYears + inputs.durationMonths / 12
  const totalDeposits = inputs.initialInvestment + inputs.additionalPayments *
    (inputs.additionalPaymentsFreq === 'weekly' ? 52 : inputs.additionalPaymentsFreq === 'monthly' ? 12 : 1) * totalYears
  const summaryParts = [
    `Over `, `${inputs.durationYears} year${inputs.durationYears !== 1 ? 's' : ''}`, `, starting with `,
    `${sym}${Math.round(totalDeposits).toLocaleString('en-GB')}`,
    ` returning `, `${inputs.interestRate}%`,
    ` annually and ${FREQ_LABELS[inputs.additionalPaymentsFreq].toLowerCase()} payments of `,
    `${sym}${inputs.additionalPayments.toLocaleString('en-GB')}`, `.`,
  ]

  return (
    <>
      <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">

        {/* ── Left: Input panel / Currency picker (desktop) ── */}
        <div className="hidden lg:block lg:col-span-4">
          <AnimatePresence mode="wait">
            {currencyOpen ? (
              <motion.div
                key="currency"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                className="bg-elevated rounded-2xl shadow-card ring-2 ring-inset ring-white p-5 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => setCurrencyOpen(false)} className="p-1 -ml-1 text-black" aria-label="Back">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                      <path d="M12 4l-6 6 6 6" />
                    </svg>
                  </button>
                  <h2 className="font-display font-black text-2xl text-black">Select currency</h2>
                </div>
                <div className="space-y-2">
                  {(CURRENCIES as Currency[]).map((c) => {
                    const isSelected = c.code === inputs.currency.code
                    return (
                      <button
                        key={c.code}
                        onClick={() => { patch({ currency: c }); setCurrencyOpen(false) }}
                        className="w-full flex items-center gap-3"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-black text-base ${
                          isSelected ? 'bg-black text-white' : 'bg-background text-black'
                        }`}>
                          {c.symbol}
                        </div>
                        <span className="flex-1 text-left font-sans text-sm text-black">{c.name}</span>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-md bg-black flex items-center justify-center flex-shrink-0">
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="round">
                              <path d="M2 7l3.5 3.5L12 3" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setCurrencyOpen(false)}
                  className="w-full bg-black text-white font-sans font-bold text-base py-4 rounded-2xl mt-2"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="inputs"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
              >
                <InputPanel
                  values={inputs}
                  onChange={patch}
                  onCurrencyClick={() => setCurrencyOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Results + Analysis + FAQs ── */}
        <div className="space-y-3 lg:space-y-10 lg:col-span-8">

          {/* Results */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-black text-2xl text-black">Results</h2>
              {inputs.adjustForInflation && (
                <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-sans font-bold uppercase tracking-wide rounded-[4px] leading-none">
                  Inflation adjusted
                </span>
              )}
            </div>

            {/* Future value */}
            <p className="text-xs font-sans text-subdued mb-1">Future value</p>
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="font-display font-black text-[40px] text-black leading-none">
                {fmtResult(result.futureValue)}
              </span>
              <CopyButton value={fmtResult(result.futureValue)} />
            </div>

            {/* Interest earned */}
            <p className="text-xs font-sans text-subdued mb-1">Interest earned</p>
            <div className="flex items-center justify-between gap-3 mb-5">
              <span className="font-display font-black text-[40px] text-black leading-none">
                {fmtResult(result.interestEarned)}
              </span>
              <CopyButton value={fmtResult(result.interestEarned)} />
            </div>

            {/* Summary */}
            <p className="text-sm font-sans text-black leading-relaxed">
              {summaryParts.map((part, i) =>
                i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
              )}
            </p>

            {/* Edit Values (mobile only) */}
            <button
              onClick={() => setSheetOpen(true)}
              className="lg:hidden mt-4 w-full bg-background rounded-xl py-3.5 text-sm font-sans font-medium text-black"
            >
              Edit Values
            </button>
          </Card>

          {/* Analysis: Graph + Table */}
          <Card className="p-5">
            {/* Tabs */}
            <div className="flex rounded-xl ring-1 ring-inset ring-black/[0.12] p-1 gap-1 mb-5">
              {(['graph', 'table'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative flex-1 h-[38px] text-sm font-sans font-medium rounded-lg capitalize outline-none ${
                    tab === t ? 'text-white' : 'text-black hover:bg-black/5'
                  }`}
                >
                  {tab === t && (
                    <motion.div
                      layoutId="tab-pill"
                      className="absolute inset-0 bg-black rounded-lg"
                      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    />
                  )}
                  <span className="relative z-10 capitalize">{t === 'graph' ? 'Graph' : 'Table'}</span>
                </button>
              ))}
            </div>

            {tab === 'graph' ? (
              <LineChart rows={result.rows} />
            ) : (
              <div className="overflow-x-auto -mx-1 outline-none">
                <table className="w-full text-sm font-sans border-collapse">
                  <thead>
                    <tr className="bg-background">
                      {['Year', 'Deposits', 'Interest earned', 'Balance'].map((h) => (
                        <th key={h} className="text-left text-xs font-bold text-black px-3 py-3 first:rounded-l-lg last:rounded-r-lg">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, i) => (
                      <tr key={row.year} className={i % 2 === 0 ? 'bg-white' : 'bg-background/50'}>
                        <td className="px-3 py-3 text-black">{row.year}</td>
                        <td className="px-3 py-3 text-black">{row.deposits.toLocaleString('en-GB')}</td>
                        <td className="px-3 py-3 text-black">{row.interestEarned.toLocaleString('en-GB')}</td>
                        <td className="px-3 py-3 text-black">{row.balance.toLocaleString('en-GB')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* FAQs */}
          <Card className="p-5">
            <h2 className="font-display font-black text-2xl text-black mb-3">FAQs</h2>
            <FAQ />
          </Card>

        </div>
      </div>

      {/* Mobile: input sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed inset-0 z-40 bg-background overflow-y-auto"
          >
            <div className="max-w-lg mx-auto px-4 py-6">
              <InputPanel
                values={inputs}
                onChange={patch}
                onCurrencyClick={() => { setSheetOpen(false); setCurrencyOpen(true) }}
                onClose={() => setSheetOpen(false)}
                showActions
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Currency picker — mobile only (desktop uses side panel) */}
      <div className="lg:hidden">
        <CurrencyPicker
          open={currencyOpen}
          selected={inputs.currency}
          onSelect={(c: Currency) => patch({ currency: c })}
          onClose={() => setCurrencyOpen(false)}
        />
      </div>
    </>
  )
}
