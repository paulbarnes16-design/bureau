'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import Stat from './Stat'
import ToolScaffold from './ToolScaffold'
import { useToolState } from './useToolState'
import { CurrencyInput, DurationInput, FieldLabel, PercentInput, SegmentedControl, Toggle } from './InputPanel'
import { calculatePension, pensionCodec, type PensionInputs, type PensionMode } from '@/lib/pension'
import { calculateDrawdown, type DrawdownYear } from '@/lib/drawdown'
import type { YearRow } from '@/lib/calculate'
import type { FaqItem } from '@/lib/schemas'

const LineChart = dynamic(() => import('./LineChart'), { ssr: false })
const BarChart = dynamic(() => import('./MortgageChart'), { ssr: false })

const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog

const money = (n: number) => `£${Math.round(n).toLocaleString('en-GB')}`

const MODE_OPTIONS: { value: PensionMode; label: string }[] = [
  { value: 'saving', label: 'Saving' },
  { value: 'income', label: 'Retirement income' },
]

function downloadCsv(header: string[], lines: (string | number)[][], name: string) {
  const blob = new Blob([[header.join(','), ...lines.map((l) => l.join(','))].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 100)
  ph()?.capture('csv_exported', { tool: 'pension' })
}

function AgeTable({ head, rows, onExport }: { head: string[]; rows: (string | number)[][]; onExport: () => void }) {
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
            {head.map((h) => (
              <th key={h} className="text-left text-xs font-bold text-black px-3 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-black/[0.06]' : ''}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-3 text-black">{typeof cell === 'number' ? cell.toLocaleString('en-GB') : cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={onExport}
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
  const income = inputs.mode === 'income'
  const saving = useMemo(() => calculatePension(inputs), [inputs])
  const drawdown = useMemo(
    () =>
      calculateDrawdown({
        pot: inputs.incomePot,
        takeLumpSum: inputs.takeLumpSum,
        startAge: inputs.retirementAge,
        untilAge: inputs.untilAge,
        growth: inputs.growth,
        fee: inputs.fee,
        adjustForInflation: inputs.adjustForInflation,
        inflationRate: inputs.inflationRate,
      }),
    [inputs],
  )
  const real = inputs.adjustForInflation
  const today = real ? " (today's money)" : ''
  const gross = inputs.taxRelief ? inputs.personal / 0.8 : inputs.personal

  const inflationField = (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-sans text-black">{income ? 'Income rises with inflation' : "Show in today's money"}</span>
        <Toggle checked={inputs.adjustForInflation} onChange={(v) => patch({ adjustForInflation: v })} />
      </div>
      {inputs.adjustForInflation && (
        <div className="mt-3">
          <FieldLabel label="Inflation rate" />
          <PercentInput value={inputs.inflationRate} onChange={(v) => patch({ inflationRate: v })} />
        </div>
      )}
    </div>
  )

  const fields = () => (
    <div className="space-y-5">
      <SegmentedControl
        options={MODE_OPTIONS}
        value={inputs.mode}
        onChange={(v) =>
          // Carry the projected pot over, so income mode shows what your savings would pay
          patch(v === 'income' && inputs.mode === 'saving' ? { mode: v, incomePot: Math.round(saving.pot) } : { mode: v })
        }
      />
      {income ? (
        <>
          <div>
            <FieldLabel label="Pension pot at retirement" />
            <CurrencyInput value={inputs.incomePot} onChange={(v) => patch({ incomePot: v })} symbol="£" step={10000} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-sans text-black">Take 25% tax-free first</span>
              <p className="text-[11px] font-sans text-subdued">
                {inputs.takeLumpSum ? `${money(drawdown.lumpSum)} as cash` : 'Draw income from the whole pot'}
              </p>
            </div>
            <Toggle checked={inputs.takeLumpSum} onChange={(v) => patch({ takeLumpSum: v })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel label="Income from age" />
              <DurationInput value={inputs.retirementAge} onChange={(v) => patch({ retirementAge: v })} unit="years" />
            </div>
            <div>
              <FieldLabel label="Make it last until" />
              <DurationInput value={inputs.untilAge} onChange={(v) => patch({ untilAge: v })} unit="years" />
            </div>
          </div>
          <div>
            <FieldLabel label="Investment growth per year" />
            <PercentInput value={inputs.growth} onChange={(v) => patch({ growth: v })} />
          </div>
          <div>
            <FieldLabel label="Annual fees" />
            <PercentInput value={inputs.fee} onChange={(v) => patch({ fee: v })} />
          </div>
          {inflationField}
        </>
      ) : (
        <>
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
          {inflationField}
        </>
      )}
    </div>
  )

  if (income) {
    const d = drawdown
    const incomeLabel = `Monthly income${today}`
    return (
      <ToolScaffold
        tool="pension"
        hasInput={hasInput}
        inputs={fields}
        mobileStats={
          <>
            <Stat label={incomeLabel} value={money(d.monthlyIncome)} />
            <Stat label="Yearly income" value={money(Math.round(d.monthlyIncome) * 12)} />
          </>
        }
        desktopStats={
          <>
            <Stat label={incomeLabel} value={money(d.monthlyIncome)} />
            <Stat label="Yearly income" value={money(Math.round(d.monthlyIncome) * 12)} />
            <Stat label="Tax-free cash" value={money(d.lumpSum)} />
            <Stat label="Income at 4% a year" value={`${money(d.monthlyAt4)}/mo`} />
            <Stat label="Income lasts" value={`${d.years} yrs`} />
            <Stat label="Pot used for income" value={money(d.drawdownPot)} />
          </>
        }
        summary={
          d.years === 0 ? (
            <>Set &ldquo;Make it last until&rdquo; to an age after you start taking income.</>
          ) : (
            <>
              {inputs.takeLumpSum ? (
                <>After taking <strong>{money(d.lumpSum)}</strong> tax-free, the remaining <strong>{money(d.drawdownPot)}</strong></>
              ) : (
                <>A <strong>{money(inputs.incomePot)}</strong> pot</>
              )}{' '}
              could pay about <strong>{money(d.monthlyIncome)}</strong> a month from <strong>{inputs.retirementAge}</strong> to{' '}
              <strong>{inputs.untilAge}</strong>
              {real ? ', rising with inflation' : ''}, before tax.
            </>
          )
        }
        chart={
          <BarChart
            rows={d.rows}
            xKey="age"
            tooltipPrefix="Age "
            series={[{ key: 'pot', name: real ? "Pot remaining (today's money)" : 'Pot remaining', fill: '#FF5E6C' }]}
          />
        }
        table={
          <AgeTable
            head={['Age', 'Income', 'Growth', 'Pot']}
            rows={d.rows.map((r: DrawdownYear) => [r.age, r.income, r.growth, r.pot])}
            onExport={() => downloadCsv(['Age', 'Income', 'Growth', 'Pot'], d.rows.map((r) => [r.age, r.income, r.growth, r.pot]), 'bureau-pension-income.csv')}
          />
        }
        faqs={faqs}
        onEngage={engage}
      />
    )
  }

  const r = saving
  const potLabel = `Pot at ${inputs.retirementAge}`
  const lumpLabel = r.lumpSumCapped ? 'Tax-free lump sum (capped)' : 'Tax-free lump sum'

  return (
    <ToolScaffold
      tool="pension"
      hasInput={hasInput}
      inputs={fields}
      mobileStats={
        <>
          <Stat label={`${potLabel}${today}`} value={money(r.pot)} />
          <Stat label={lumpLabel} value={money(r.taxFreeLumpSum)} />
        </>
      }
      desktopStats={
        <>
          <Stat label={`${potLabel}${today}`} value={money(r.pot)} />
          <Stat label={lumpLabel} value={money(r.taxFreeLumpSum)} />
          <Stat label="You pay in" value={money(r.youPayIn)} />
          <Stat label="Employer pays in" value={money(r.employerPaysIn)} />
          <Stat label="Tax relief added" value={money(r.taxRelief)} />
          <Stat label="Income at 4% a year" value={`${money(r.monthlyIncomeAt4)}/mo`} />
        </>
      }
      summary={
        r.years === 0 ? (
          <>You&apos;re at or past your retirement age. Your pot is <strong>{money(r.pot)}</strong>.</>
        ) : (
          <>
            By <strong>{inputs.retirementAge}</strong> your pension could be worth <strong>{money(r.pot)}</strong>
            {real ? " in today's money" : ''}. Taking 4% a year would give about <strong>{money(r.monthlyIncomeAt4)}</strong> a
            month before tax, on top of any State Pension.
          </>
        )
      }
      chart={
        <LineChart
          rows={r.rows}
          initialValue={inputs.pot}
          labels={{ deposits: 'Contributions', interest: real ? 'Real growth' : 'Investment growth' }}
        />
      }
      table={
        <AgeTable
          head={['Age', 'Contributions', 'Growth', 'Pot']}
          rows={r.rows.map((row: YearRow) => [inputs.age + row.year, row.deposits, row.interestEarned, row.balance])}
          onExport={() =>
            downloadCsv(['Age', 'Contributions', 'Growth', 'Pot'], r.rows.map((row) => [inputs.age + row.year, row.deposits, row.interestEarned, row.balance]), 'bureau-pension.csv')
          }
        />
      }
      faqs={faqs}
      onEngage={engage}
    />
  )
}
