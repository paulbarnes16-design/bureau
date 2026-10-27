'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Stat from './Stat'
import ToolScaffold from './ToolScaffold'
import type { RelatedLink } from './PageExtras'
import { useToolState } from './useToolState'
import { CurrencyInput, FieldLabel, InputTabs, SegmentedControl } from './InputPanel'
import {
  calculateMixed,
  HIGHER_RATE_START,
  mixedCodec,
  PENSION_ANNUAL_ALLOWANCE,
  TAPER_START,
  type Extraction,
  type MixedInputs,
  type TakeMode,
} from '@/lib/mixed-income'
import type { FaqItem } from '@/lib/schemas'

const BarChart = dynamic(() => import('./MortgageChart'), { ssr: false })

const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog

const money = (n: number) => `${n < 0 ? '−' : ''}£${Math.abs(Math.round(n)).toLocaleString('en-GB')}`

const TAKE_OPTIONS: { value: TakeMode; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'basic', label: 'Basic rate' },
  { value: 'taper', label: 'Under £100k' },
]

const TAKE_HINTS: Record<TakeMode, string> = {
  all: 'Take all of this year\'s profit out of the company',
  basic: `Keep your total income under ${money(HIGHER_RATE_START)}, so nothing is taxed at the higher rate`,
  taper: `Keep your total income under ${money(TAPER_START)}, so you keep your full personal allowance`,
}

const STRATEGIES = [
  { key: 'best', name: 'Best mix' },
  { key: 'dividendsOnly', name: 'Dividends only' },
  { key: 'salaryOnly', name: 'Salary only' },
] as const

const ROWS: { label: string; value: (e: Extraction) => number; bold?: boolean }[] = [
  { label: 'Salary', value: (e) => e.salary },
  { label: 'Dividends', value: (e) => e.dividends },
  { label: 'Corporation tax', value: (e) => e.corporationTax },
  { label: 'Employer NI', value: (e) => e.employerNI },
  { label: 'Your NI', value: (e) => e.employeeNI },
  { label: 'Income tax', value: (e) => e.incomeTax },
  { label: 'Dividend tax', value: (e) => e.dividendTax },
  { label: 'Total tax', value: (e) => e.totalTax, bold: true },
  { label: 'You keep', value: (e) => e.keep, bold: true },
  { label: 'Left in company', value: (e) => e.leftInCompany },
]

function exportToCsv(results: Record<(typeof STRATEGIES)[number]['key'], Extraction>, pension: number) {
  const rows = pension > 0 ? [...ROWS, { label: 'Into your pension', value: (e: Extraction) => e.pension }] : ROWS
  const lines = rows.map((row) => [row.label, ...STRATEGIES.map((s) => Math.round(row.value(results[s.key])))].join(','))
  const blob = new Blob([['', ...STRATEGIES.map((s) => s.name)].join(',') + '\n' + lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bureau-mixed-income.csv'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 100)
  ph()?.capture('csv_exported', { tool: 'mixed' })
}

function CompareTable({ results, pension }: { results: Record<(typeof STRATEGIES)[number]['key'], Extraction>; pension: number }) {
  const rows = pension > 0 ? [...ROWS, { label: 'Into your pension', value: (e: Extraction) => e.pension }] : ROWS
  return (
    <div className="overflow-x-auto -mx-1 outline-none">
      <table className="w-full text-sm font-sans border-collapse table-fixed">
        <colgroup>
          <col className="w-[34%]" />
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr className="bg-black/[0.06]">
            <th className="text-left text-xs font-bold text-black px-3 py-3"><span className="sr-only">Item</span></th>
            {STRATEGIES.map((s) => (
              <th key={s.key} className="text-left text-xs font-bold text-black px-3 py-3">{s.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} className={i % 2 === 1 ? 'bg-black/[0.06]' : ''}>
              <td className={`px-3 py-3 text-black ${row.bold ? 'font-bold' : ''}`}>{row.label}</td>
              {STRATEGIES.map((s) => (
                <td key={s.key} className={`px-3 py-3 text-black ${row.bold ? 'font-bold' : ''}`}>
                  {Math.round(row.value(results[s.key])).toLocaleString('en-GB')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => exportToCsv(results, pension)}
          className="text-[13px] font-sans font-bold text-white bg-black rounded-full px-4 py-1.5 hover:opacity-70 transition-opacity"
        >
          Export to CSV
        </button>
      </div>
    </div>
  )
}

/**
 * For someone with a PAYE job and their own limited company: the salary and dividend mix
 * that pays the least tax this year, compared with taking only dividends or only salary.
 */
export default function MixedIncomeCalculator({ defaults, faqs, heading, howItWorks, related }: {
  defaults: MixedInputs
  faqs: FaqItem[]
  heading?: string
  howItWorks?: FaqItem[]
  related?: RelatedLink[]
}) {
  const { inputs, patch, hasInput, engage } = useToolState(defaults, mixedCodec, 'mixed')
  const [tab, setTab] = useState<'basic' | 'advanced'>('basic')

  const r = useMemo(() => calculateMixed(inputs), [inputs])
  const { best } = r
  const takingNothing = best.salary + best.dividends === 0
  const capped = inputs.take !== 'all'

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
            <FieldLabel label="Salary from your PAYE job" />
            <CurrencyInput value={inputs.jobSalary} onChange={(v) => patch({ jobSalary: v })} symbol="£" step={1000} />
            <p className="text-[11px] font-sans text-subdued mt-1.5">Before tax, for the 2026/27 tax year</p>
          </div>
          <div>
            <FieldLabel label="Company profit before paying yourself" />
            <CurrencyInput value={inputs.profit} onChange={(v) => patch({ profit: v })} symbol="£" step={1000} />
            <p className="text-[11px] font-sans text-subdued mt-1.5">Income minus business costs, for this year</p>
          </div>
          <div>
            <FieldLabel label="How much to take out" />
            <SegmentedControl
              options={TAKE_OPTIONS}
              value={inputs.take}
              onChange={(v) => {
                patch({ take: v })
                ph()?.capture('take_mode_changed', { tool: 'mixed', take: v })
              }}
            />
            <p className="text-[11px] font-sans text-subdued mt-1.5">{TAKE_HINTS[inputs.take]}</p>
          </div>
        </>
      ) : (
        <>
          <div>
            <FieldLabel label="Company pension contribution" />
            <CurrencyInput value={inputs.pension} onChange={(v) => patch({ pension: v })} symbol="£" step={1000} />
            <p className={`text-[11px] font-sans mt-1.5 ${inputs.pension > PENSION_ANNUAL_ALLOWANCE ? 'text-irn' : 'text-subdued'}`}>
              {inputs.pension > PENSION_ANNUAL_ALLOWANCE
                ? `Over the ${money(PENSION_ANNUAL_ALLOWANCE)} annual allowance`
                : 'Paid by your company into your pension, free of tax and NI'}
            </p>
          </div>
          <div>
            <FieldLabel label="Profits kept from earlier years" />
            <CurrencyInput value={inputs.retained} onChange={(v) => patch({ retained: v })} symbol="£" step={1000} />
            <p className="text-[11px] font-sans text-subdued mt-1.5">After corporation tax. Can be paid out as dividends</p>
          </div>
        </>
      )}
    </div>
  )

  const summary = takingNothing && r.headroom > 0 ? (
    <>Your company has no profit to take out this year. Enter its profit before paying yourself to see the best mix.</>
  ) : takingNothing ? (
    <>
      Your job salary of <strong>{money(inputs.jobSalary)}</strong> already takes you over{' '}
      {money(inputs.take === 'basic' ? HIGHER_RATE_START : TAPER_START)}, so to stay under it you&apos;d take nothing out this year
      and leave <strong>{money(best.leftInCompany)}</strong> in the company after corporation tax.
    </>
  ) : (
    <>
      {best.salary > 0 ? (
        <>Pay yourself a salary of <strong>{money(best.salary)}</strong> and take <strong>{money(best.dividends)}</strong> in dividends.</>
      ) : (
        <>Take it all as dividends: <strong>{money(best.dividends)}</strong>.</>
      )}{' '}
      You&apos;d keep <strong>{money(best.keep)}</strong> after <strong>{money(best.totalTax)}</strong> of tax and NI
      {capped && best.leftInCompany > 0 ? <>, with <strong>{money(best.leftInCompany)}</strong> left in the company</> : null}.
      {r.betterOff >= 1 &&
        (capped ? (
          <>
            {' '}That leaves you <strong>{money(r.betterOff)}</strong> better off than dividends only, counting what&apos;s left in
            the company after {(r.laterDividendRate * 100).toFixed(2).replace(/0$/, '')}% dividend tax when you take it out later.
          </>
        ) : (
          <> That&apos;s <strong>{money(r.betterOff)}</strong> more than taking dividends only.</>
        ))}{' '}
      With your job, your take-home for the year is about <strong>{money(r.jobNet + best.keep)}</strong>.
    </>
  )

  const results = { best: r.best, dividendsOnly: r.dividendsOnly, salaryOnly: r.salaryOnly }
  const chartRows = STRATEGIES.map((s) => {
    const e = results[s.key]
    return {
      name: s.name,
      keep: Math.round(e.keep),
      pension: Math.round(e.pension),
      left: Math.round(e.leftInCompany),
      corporationTax: Math.round(e.corporationTax),
      ni: Math.round(e.employerNI + e.employeeNI),
      personalTax: Math.round(e.incomeTax + e.dividendTax),
    }
  })

  return (
    <ToolScaffold
      tool="mixed"
      hasInput={hasInput}
      inputs={fields}
      mobileStats={
        <>
          <Stat label="You keep" value={money(best.keep)} />
          <Stat label="Best salary from your company" value={money(best.salary)} />
        </>
      }
      desktopStats={
        <>
          <Stat label="You keep" value={money(best.keep)} />
          <Stat label="Total tax and NI" value={money(best.totalTax)} />
          <Stat label="Best salary from your company" value={money(best.salary)} />
          <Stat label="Dividends" value={money(best.dividends)} />
          {inputs.pension > 0 ? (
            <Stat label="Into your pension" value={money(best.pension)} />
          ) : (
            <Stat label="Better off vs dividends only" value={money(Math.max(0, r.betterOff))} />
          )}
          <Stat label="Left in company" value={money(best.leftInCompany)} />
        </>
      }
      summary={summary}
      chart={
        <BarChart
          rows={chartRows}
          xKey="name"
          tooltipPrefix=""
          series={[
            { key: 'keep', name: 'You keep', fill: '#FF5E6C' },
            ...(inputs.pension > 0 ? [{ key: 'pension', name: 'Pension', fill: 'rgba(255, 94, 108, 0.6)' }] : []),
            ...(capped ? [{ key: 'left', name: 'Left in company', fill: 'rgba(255, 94, 108, 0.3)' }] : []),
            { key: 'corporationTax', name: 'Corporation tax', fill: 'rgba(0, 0, 0, 0.7)' },
            { key: 'ni', name: 'NI', fill: 'rgba(0, 0, 0, 0.4)' },
            { key: 'personalTax', name: 'Income and dividend tax', fill: 'rgba(0, 0, 0, 0.18)' },
          ]}
        />
      }
      table={<CompareTable results={results} pension={inputs.pension} />}
      faqs={faqs}
      onEngage={engage}
      heading={heading}
      howItWorks={howItWorks}
      related={related}
    />
  )
}
