'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import Stat from './Stat'
import ToolScaffold from './ToolScaffold'
import { useToolState } from './useToolState'
import { CurrencyInput, DurationInput, FieldLabel, PercentInput, SegmentedControl } from './InputPanel'
import { calculateMortgage, mortgageCodec, type MortgageInputs, type MortgageType, type MortgageYear } from '@/lib/mortgage'
import type { FaqItem } from '@/lib/schemas'

const MortgageChart = dynamic(() => import('./MortgageChart'), { ssr: false })

const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog

const money = (n: number, dp = 0) =>
  `£${n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`

const shortDuration = (months: number) => {
  const y = Math.floor(months / 12)
  const m = months % 12
  if (y === 0) return `${m} mo`
  return m === 0 ? `${y} yrs` : `${y} yrs ${m} mo`
}

const longDuration = (months: number) => {
  const y = Math.floor(months / 12)
  const m = months % 12
  const ys = y === 1 ? '1 year' : `${y} years`
  const ms = m === 1 ? '1 month' : `${m} months`
  if (y === 0) return ms
  return m === 0 ? ys : `${ys} ${ms}`
}

function exportToCsv(rows: MortgageYear[], tool: string) {
  const header = ['Year', 'Paid', 'Interest', 'Loan repaid', 'Balance']
  const lines = rows.map((r) => [r.year, r.paid, r.interest, r.principal, r.balance].join(','))
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bureau-${tool}.csv`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 100)
  ph()?.capture('csv_exported', { tool })
}

const TYPE_OPTIONS: { value: MortgageType; label: string }[] = [
  { value: 'repayment', label: 'Repayment' },
  { value: 'interest-only', label: 'Interest only' },
]

function YearTable({ rows, tool }: { rows: MortgageYear[]; tool: string }) {
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
          onClick={() => exportToCsv(rows, tool)}
          className="text-[13px] font-sans font-bold text-white bg-black rounded-full px-4 py-1.5 hover:opacity-70 transition-opacity"
        >
          Export to CSV
        </button>
      </div>
    </div>
  )
}

/**
 * Repayment calculator for mortgages and for loans / car finance.
 * `variant` switches the wording and fields; the maths is shared.
 */
export default function MortgageCalculator({
  defaults,
  faqs,
  variant = 'mortgage',
}: {
  defaults: MortgageInputs
  faqs: FaqItem[]
  variant?: 'mortgage' | 'loan'
}) {
  const tool = variant
  const { inputs, patch, hasInput, engage } = useToolState(defaults, mortgageCodec, tool)
  const isLoan = variant === 'loan'

  const result = useMemo(() => calculateMortgage(inputs), [inputs])
  const withoutOverpayment = useMemo(
    () => (inputs.overpayment > 0 ? calculateMortgage({ ...inputs, overpayment: 0 }) : result),
    [inputs, result],
  )
  const interestSaved = withoutOverpayment.totalInterest - result.totalInterest
  const interestOnly = inputs.type === 'interest-only'
  const overpaying = !isLoan && !interestOnly && inputs.overpayment > 0 && interestSaved > 0
  const termMonths = Math.round(inputs.termYears * 12 + inputs.termMonths)
  const depositPct = inputs.price > 0 ? (inputs.deposit / inputs.price) * 100 : 0

  const fields = () => (
    <div className="space-y-5">
      <div>
        <FieldLabel label={isLoan ? 'Price or amount to borrow' : 'Property price'} />
        <CurrencyInput value={inputs.price} onChange={(v) => patch({ price: v })} symbol="£" step={isLoan ? 500 : 5000} />
      </div>
      <div>
        <FieldLabel label={isLoan ? 'Deposit or part-exchange (optional)' : 'Deposit'} />
        <CurrencyInput value={inputs.deposit} onChange={(v) => patch({ deposit: v })} symbol="£" step={isLoan ? 500 : 1000} />
        {!isLoan && <p className="text-[11px] font-sans text-subdued mt-1.5">{depositPct.toFixed(0)}% of the property price</p>}
      </div>
      <div>
        <FieldLabel label={isLoan ? 'Interest rate (APR)' : 'Interest rate'} />
        <PercentInput value={inputs.rate} onChange={(v) => patch({ rate: v })} />
      </div>
      <div>
        <FieldLabel label={isLoan ? 'Loan term' : 'Mortgage term'} />
        {isLoan ? (
          <div className="grid grid-cols-2 gap-2">
            <DurationInput value={inputs.termYears} onChange={(v) => patch({ termYears: v })} unit="years" max={50} />
            <DurationInput value={inputs.termMonths} onChange={(v) => patch({ termMonths: Math.min(11, v) })} unit="months" />
          </div>
        ) : (
          <DurationInput value={inputs.termYears} onChange={(v) => patch({ termYears: Math.max(1, v) })} unit="years" max={50} />
        )}
      </div>
      {!isLoan && (
        <>
          <div>
            <FieldLabel label="Repayment type" />
            <SegmentedControl options={TYPE_OPTIONS} value={inputs.type} onChange={(v) => patch({ type: v })} />
          </div>
          {!interestOnly && (
            <div>
              <FieldLabel label="Monthly overpayment (optional)" />
              <CurrencyInput value={inputs.overpayment} onChange={(v) => patch({ overpayment: v })} symbol="£" step={50} />
            </div>
          )}
        </>
      )}
    </div>
  )

  const monthly = <Stat label="Monthly payment" value={money(result.monthlyPayment, 2)} />
  const totalInterest = <Stat label="Total interest" value={money(result.totalInterest)} />

  const mobileStats = overpaying ? (
    <>
      <Stat label="Interest saved" value={money(interestSaved)} />
      <Stat label="Mortgage-free in" value={shortDuration(result.months)} />
    </>
  ) : (
    <>
      {monthly}
      {totalInterest}
    </>
  )

  const desktopStats = isLoan ? (
    <>
      {monthly}
      {totalInterest}
      <Stat label="Amount borrowed" value={money(result.loan)} />
      <Stat label="Total repaid" value={money(result.totalRepaid)} />
      <Stat label="Loan term" value={shortDuration(termMonths)} />
      <Stat label="Interest as % of loan" value={`${result.loan > 0 ? ((result.totalInterest / result.loan) * 100).toFixed(1) : '0.0'}%`} />
    </>
  ) : (
    <>
      {monthly}
      <Stat label="Loan to value" value={`${result.ltv.toFixed(0)}%`} />
      {totalInterest}
      <Stat label="Loan amount" value={money(result.loan)} />
      {overpaying ? <Stat label="Interest saved" value={money(interestSaved)} /> : <Stat label="Total repaid" value={money(result.totalRepaid)} />}
      <Stat label={overpaying ? 'Mortgage-free in' : 'Mortgage term'} value={shortDuration(result.months)} />
    </>
  )

  const summary = result.loan === 0 ? (
    <>{isLoan ? 'Your deposit covers the full amount, so there\'s nothing to borrow.' : 'Your deposit covers the full price, so there\'s nothing to borrow.'}</>
  ) : termMonths === 0 ? (
    <>Enter a {isLoan ? 'loan' : 'mortgage'} term to see your repayments.</>
  ) : isLoan ? (
    <>
      Borrowing <strong>{money(result.loan)}</strong> over <strong>{longDuration(termMonths)}</strong> at{' '}
      <strong>{inputs.rate}% APR</strong>, you&apos;ll pay <strong>{money(result.monthlyPayment)}</strong> a month and{' '}
      <strong>{money(result.totalInterest)}</strong> in interest.
    </>
  ) : interestOnly ? (
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
      {overpaying && (
        <>
          {' '}Overpaying <strong>{money(inputs.overpayment)}</strong> a month clears it in{' '}
          <strong>{longDuration(result.months)}</strong> and saves <strong>{money(interestSaved)}</strong>.
        </>
      )}
    </>
  )

  return (
    <ToolScaffold
      tool={tool}
      hasInput={hasInput}
      inputs={fields}
      mobileStats={mobileStats}
      desktopStats={desktopStats}
      summary={summary}
      chart={<MortgageChart rows={result.rows} />}
      table={<YearTable rows={result.rows} tool={tool} />}
      faqs={faqs}
      onEngage={engage}
    />
  )
}
