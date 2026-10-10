'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import Stat from './Stat'
import ToolScaffold from './ToolScaffold'
import { useToolState } from './useToolState'
import { CurrencyInput, DurationInput, FieldLabel, PercentInput, Toggle } from './InputPanel'
import { calculatePension, pensionCodec, type PensionInputs } from '@/lib/pension'
import type { YearRow } from '@/lib/calculate'
import type { FaqItem } from '@/lib/schemas'

const LineChart = dynamic(() => import('./LineChart'), { ssr: false })

const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog

const money = (n: number) => `£${Math.round(n).toLocaleString('en-GB')}`

function exportToCsv(rows: YearRow[], age: number) {
  const header = ['Age', 'Contributions', 'Growth', 'Pot']
  const lines = rows.map((r) => [age + r.year, r.deposits, r.interestEarned, r.balance].join(','))
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bureau-pension.csv'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 100)
  ph()?.capture('csv_exported', { tool: 'pension' })
}

function AgeTable({ rows, age }: { rows: YearRow[]; age: number }) {
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
            {['Age', 'Contributions', 'Growth', 'Pot'].map((h) => (
              <th key={h} className="text-left text-xs font-bold text-black px-3 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.year} className={i % 2 === 1 ? 'bg-black/[0.06]' : ''}>
              <td className="px-3 py-3 text-black">{age + row.year}</td>
              <td className="px-3 py-3 text-black">{row.deposits.toLocaleString('en-GB')}</td>
              <td className="px-3 py-3 text-black">{row.interestEarned.toLocaleString('en-GB')}</td>
              <td className="px-3 py-3 text-black">{row.balance.toLocaleString('en-GB')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => exportToCsv(rows, age)}
          className="text-[13px] font-sans font-bold text-white bg-black rounded-full px-4 py-1.5 hover:opacity-70 transition-opacity"
        >
          Export to CSV
        </button>
      </div>
    </div>
  )
}

export default function PensionCalculator({ defaults, faqs }: { defaults: PensionInputs; faqs: FaqItem[] }) {
  const { inputs, patch, hasInput, engage } = useToolState(defaults, pensionCodec, 'pension')
  const result = useMemo(() => calculatePension(inputs), [inputs])
  const real = inputs.adjustForInflation
  const today = real ? " (today's money)" : ''
  const gross = inputs.taxRelief ? inputs.personal / 0.8 : inputs.personal

  const fields = () => (
    <div className="space-y-5">
      <div>
        <FieldLabel label="Current pension pot" />
        <CurrencyInput value={inputs.pot} onChange={(v) => patch({ pot: v })} symbol="£" step={1000} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel label="Your age" />
          <DurationInput value={inputs.age} onChange={(v) => patch({ age: v })} unit="years" />
        </div>
        <div>
          <FieldLabel label="Retirement age" />
          <DurationInput value={inputs.retirementAge} onChange={(v) => patch({ retirementAge: v })} unit="years" />
        </div>
      </div>
      <div>
        <FieldLabel label="You pay in each month" />
        <CurrencyInput value={inputs.personal} onChange={(v) => patch({ personal: v })} symbol="£" step={25} />
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-sm font-sans text-black">Add basic-rate tax relief</span>
            <p className="text-[11px] font-sans text-subdued">
              {inputs.taxRelief ? `£${inputs.personal.toLocaleString('en-GB')} becomes £${Math.round(gross).toLocaleString('en-GB')}` : 'Off'}
            </p>
          </div>
          <Toggle checked={inputs.taxRelief} onChange={(v) => patch({ taxRelief: v })} />
        </div>
      </div>
      <div>
        <FieldLabel label="Employer pays in each month" />
        <CurrencyInput value={inputs.employer} onChange={(v) => patch({ employer: v })} symbol="£" step={25} />
      </div>
      <div>
        <FieldLabel label="Investment growth per year" />
        <PercentInput value={inputs.growth} onChange={(v) => patch({ growth: v })} />
      </div>
      <div>
        <FieldLabel label="Annual fees" />
        <PercentInput value={inputs.fee} onChange={(v) => patch({ fee: v })} />
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
    </div>
  )

  const potLabel = `Pot at ${inputs.retirementAge}`
  const lumpLabel = result.lumpSumCapped ? 'Tax-free lump sum (capped)' : 'Tax-free lump sum'

  const mobileStats = (
    <>
      <Stat label={`${potLabel}${today}`} value={money(result.pot)} />
      <Stat label={lumpLabel} value={money(result.taxFreeLumpSum)} />
    </>
  )

  const desktopStats = (
    <>
      <Stat label={`${potLabel}${today}`} value={money(result.pot)} />
      <Stat label={lumpLabel} value={money(result.taxFreeLumpSum)} />
      <Stat label="You pay in" value={money(result.youPayIn)} />
      <Stat label="Employer pays in" value={money(result.employerPaysIn)} />
      <Stat label="Tax relief added" value={money(result.taxRelief)} />
      <Stat label="Income at 4% a year" value={`${money(result.monthlyIncomeAt4)}/mo`} />
    </>
  )

  const summary =
    result.years === 0 ? (
      <>You&apos;re at or past your retirement age. Your pot is <strong>{money(result.pot)}</strong>.</>
    ) : (
      <>
        By <strong>{inputs.retirementAge}</strong> your pension could be worth <strong>{money(result.pot)}</strong>
        {real ? " in today's money" : ''}. Taking 4% a year would give about <strong>{money(result.monthlyIncomeAt4)}</strong> a
        month before tax, on top of any State Pension.
      </>
    )

  return (
    <ToolScaffold
      tool="pension"
      hasInput={hasInput}
      inputs={fields}
      mobileStats={mobileStats}
      desktopStats={desktopStats}
      summary={summary}
      chart={
        <LineChart
          rows={result.rows}
          initialValue={inputs.pot}
          labels={{ deposits: 'Contributions', interest: real ? 'Real growth' : 'Investment growth' }}
        />
      }
      table={<AgeTable rows={result.rows} age={inputs.age} />}
      faqs={faqs}
      onEngage={engage}
    />
  )
}
