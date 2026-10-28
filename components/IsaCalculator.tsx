'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Stat from './Stat'
import ToolScaffold from './ToolScaffold'
import type { RelatedLink } from './PageExtras'
import { useToolState } from './useToolState'
import { CurrencyInput, DurationInput, FieldLabel, InputTabs, PercentInput, SegmentedControl, Toggle } from './InputPanel'
import { calculateIsa, ISA_ALLOWANCE, isaCodec, type IsaInputs, type IsaYear, type TaxBand } from '@/lib/isa'
import type { FaqItem } from '@/lib/schemas'

const BarChart = dynamic(() => import('./MortgageChart'), { ssr: false })

const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog

const money = (n: number) => `${n < 0 ? '−' : ''}£${Math.abs(Math.round(n)).toLocaleString('en-GB')}`

const BAND_OPTIONS: { value: TaxBand; label: string }[] = [
  { value: 'basic', label: 'Basic rate' },
  { value: 'higher', label: 'Higher rate' },
  { value: 'additional', label: 'Additional' },
]

function exportToCsv(rows: IsaYear[]) {
  const lines = rows.map((r) => [r.year, r.cash, r.shares, r.total].join(','))
  const blob = new Blob([['Year,Cash ISA,Stocks and shares ISA,Total', ...lines].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bureau-isa.csv'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 100)
  ph()?.capture('csv_exported', { tool: 'isa' })
}

function YearTable({ rows }: { rows: IsaYear[] }) {
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
            {['Year', 'Cash ISA', 'Stocks & shares', 'Total'].map((h) => (
              <th key={h} className="text-left text-xs font-bold text-black px-3 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.year} className={i % 2 === 1 ? 'bg-black/[0.06]' : ''}>
              <td className="px-3 py-3 text-black">{r.year}</td>
              <td className="px-3 py-3 text-black">{r.cash.toLocaleString('en-GB')}</td>
              <td className="px-3 py-3 text-black">{r.shares.toLocaleString('en-GB')}</td>
              <td className="px-3 py-3 text-black">{r.total.toLocaleString('en-GB')}</td>
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

/**
 * Cash and stocks & shares ISAs projected separately, with the tax an ISA saves on cash interest.
 * `startIso` is the server's date, so the first render matches the HTML; the visitor's own date
 * takes over straight after loading.
 */
export default function IsaCalculator({ defaults, faqs, startIso, heading, howItWorks, related }: {
  defaults: IsaInputs
  faqs: FaqItem[]
  startIso: string
  /** Question pages: the question, shown as the page heading until the user changes a value */
  heading?: string
  howItWorks?: FaqItem[]
  related?: RelatedLink[]
}) {
  const { inputs, patch, hasInput, engage } = useToolState(defaults, isaCodec, 'isa')
  const [tab, setTab] = useState<'basic' | 'advanced'>('basic')
  const [start, setStart] = useState(() => new Date(startIso))
  useEffect(() => setStart(new Date()), [])

  const r = useMemo(() => calculateIsa(inputs, start), [inputs, start])
  const today = inputs.adjustForInflation ? " (today's money)" : ''
  const yearlyIn = (inputs.cashMonthly + inputs.sharesMonthly) * 12

  const fields = () => (
    <div className="space-y-5">
      <div className="-mt-1">
        <InputTabs
          options={[{ value: 'basic', label: 'Basic' }, { value: 'advanced', label: 'Advanced' }]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {tab === 'basic' ? (
        <>
          <div>
            <FieldLabel label="Cash ISA balance" />
            <CurrencyInput value={inputs.cashBalance} onChange={(v) => patch({ cashBalance: v })} symbol="£" step={1000} />
          </div>
          <div>
            <FieldLabel label="Stocks & shares ISA balance" />
            <CurrencyInput value={inputs.sharesBalance} onChange={(v) => patch({ sharesBalance: v })} symbol="£" step={1000} />
          </div>
          <div>
            <FieldLabel label="Pay into cash ISA each month" />
            <CurrencyInput value={inputs.cashMonthly} onChange={(v) => patch({ cashMonthly: v })} symbol="£" step={50} />
          </div>
          <div>
            <FieldLabel label="Pay into stocks & shares ISA each month" />
            <CurrencyInput value={inputs.sharesMonthly} onChange={(v) => patch({ sharesMonthly: v })} symbol="£" step={50} />
            <p className={`text-[11px] font-sans mt-1.5 ${yearlyIn > ISA_ALLOWANCE ? 'text-irn' : 'text-subdued'}`}>
              {money(yearlyIn)} a year of your {money(ISA_ALLOWANCE)} allowance
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel label="Cash ISA rate" />
              <PercentInput value={inputs.cashRate} onChange={(v) => patch({ cashRate: v })} />
            </div>
            <div>
              <FieldLabel label="Shares growth" />
              <PercentInput value={inputs.sharesGrowth} onChange={(v) => patch({ sharesGrowth: v })} />
            </div>
          </div>
          <div>
            <FieldLabel label="Time" />
            <DurationInput value={inputs.years} onChange={(v) => patch({ years: v })} unit="years" max={50} />
          </div>
        </>
      ) : (
        <>
          <div>
            <FieldLabel label="Income tax band" />
            <SegmentedControl options={BAND_OPTIONS} value={inputs.taxBand} onChange={(v) => patch({ taxBand: v })} />
            <p className="text-[11px] font-sans text-subdued mt-1.5">
              Used to estimate the tax an ISA saves on cash interest. Savings tax rises to 24%, 44% or 49% from April 2027
            </p>
          </div>
          <div>
            <FieldLabel label="Stocks & shares fees per year" />
            <PercentInput value={inputs.sharesFee} onChange={(v) => patch({ sharesFee: v })} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-black">Show in today&apos;s money</span>
              <Toggle checked={inputs.adjustForInflation} onChange={(v) => patch({ adjustForInflation: v })} />
            </div>
            {inputs.adjustForInflation && (
              <div className="mt-3">
                <FieldLabel label="Inflation rate" />
                <PercentInput value={inputs.inflationRate} onChange={(v) => patch({ inflationRate: v })} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )

  const summary = (
    <>
      In <strong>{inputs.years} years</strong> your ISAs could be worth <strong>{money(r.total)}</strong>
      {inputs.adjustForInflation ? " in today's money" : ''}
      {r.growth >= 0 ? (
        <>, with <strong>{money(r.growth)}</strong> of growth, all tax-free.</>
      ) : (
        <>, a real-terms loss of <strong>{money(-r.growth)}</strong> after inflation.</>
      )}
      {r.overAllowance > 0 && (
        <>
          {' '}You&apos;re planning to pay in <strong>{money(r.overAllowance)} a year</strong> more than the{' '}
          {money(ISA_ALLOWANCE)} allowance.
        </>
      )}
    </>
  )

  return (
    <ToolScaffold
      tool="isa"
      hasInput={hasInput}
      inputs={fields}
      mobileStats={
        <>
          <Stat label={`Total ISA value${today}`} value={money(r.total)} />
          <Stat label={r.growth >= 0 ? 'Tax-free growth' : 'Real-terms loss'} value={money(Math.abs(r.growth))} />
        </>
      }
      desktopStats={
        <>
          <Stat label={`Total ISA value${today}`} value={money(r.total)} />
          <Stat label={`Paid in${today}`} value={money(r.paidIn)} />
          <Stat label="Cash ISA" value={money(r.cash)} />
          <Stat label="Stocks & shares ISA" value={money(r.shares)} />
          <Stat label={r.growth >= 0 ? 'Tax-free growth' : 'Real-terms loss'} value={money(Math.abs(r.growth))} />
          <Stat label="Tax saved on cash (est.)" value={money(r.taxSavedOnCash)} />
        </>
      }
      summary={summary}
      chart={
        <BarChart
          rows={r.rows}
          series={[
            { key: 'cash', name: 'Cash ISA', fill: 'rgba(255, 94, 108, 0.3)' },
            { key: 'shares', name: 'Stocks & shares ISA', fill: '#FF5E6C' },
          ]}
        />
      }
      table={<YearTable rows={r.rows} />}
      faqs={faqs}
      onEngage={engage}
      heading={heading}
      howItWorks={howItWorks}
      related={related}
    />
  )
}
