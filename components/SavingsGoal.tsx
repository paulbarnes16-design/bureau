'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CurrencyInput, DurationInput, FieldLabel, PercentInput } from './InputPanel'
import ToolLayout from './ToolLayout'
import { gbp, monthlyToReach } from '@/lib/goals'
import type { FaqItem } from '@/lib/schemas'

const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog

const GOAL_DEFAULTS = { target: 50000, saved: 0, rate: 5, years: 10 }

const COMPARE_YEARS = [5, 10, 15, 20, 25]

function useSavingsGoal() {
  const [values, setValues] = useState(GOAL_DEFAULTS)
  const [hasInput, setHasInput] = useState(false)
  const patch = (u: Partial<typeof GOAL_DEFAULTS>) => {
    setValues((v) => ({ ...v, ...u }))
    if (!hasInput) {
      setHasInput(true)
      ph()?.capture('user_engaged', { tool: 'savings_goal' })
    }
  }
  return { values, patch, hasInput }
}

function GoalInputs({ values, patch }: ReturnType<typeof useSavingsGoal>) {
  return (
    <>
      <div>
        <FieldLabel label="Savings target" />
        <CurrencyInput value={values.target} onChange={(target) => patch({ target })} symbol="£" step={1000} />
      </div>
      <div>
        <FieldLabel label="Already saved (optional)" />
        <CurrencyInput value={values.saved} onChange={(saved) => patch({ saved })} symbol="£" />
      </div>
      <div>
        <FieldLabel label="Interest rate" />
        <PercentInput value={values.rate} onChange={(rate) => patch({ rate })} />
      </div>
      <div>
        <FieldLabel label="Time to reach your goal" />
        <DurationInput value={values.years} onChange={(years) => patch({ years: Math.max(1, years) })} unit="years" />
      </div>
    </>
  )
}

function GoalResult({ values, hasInput }: ReturnType<typeof useSavingsGoal>) {
  const { target, saved, rate, years } = values
  const monthly = monthlyToReach(target, saved, rate, years)
  const paidIn = saved + monthly * years * 12
  const interest = Math.max(0, target - paidIn)
  const fullCalcHref = `/?i=${saved}&r=${rate}&dy=${years}&ap=${Math.ceil(monthly)}`

  return (
    <>
      <h2 className="font-sans font-bold text-[20px] text-black mb-4">{hasInput ? 'Results' : 'Example'}</h2>
      <p className="text-[13px] font-sans text-black mb-1">You need to save</p>
      <p className="font-condensed text-[40px] text-black leading-none">
        {gbp(monthly)}<span className="font-sans font-normal text-[15px]"> a month</span>
      </p>
      <p className="font-sans text-[15px] text-black leading-relaxed mt-4">
        {monthly === 0 ? (
          <>What you&apos;ve already saved should reach <strong>{gbp(target)}</strong> on its own in {years} years at {rate}%.</>
        ) : (
          <>
            To reach <strong>{gbp(target)}</strong> in <strong>{years} years</strong> at <strong>{rate}%</strong>, you&apos;d
            pay in <strong>{gbp(paidIn)}</strong> in total and earn about <strong>{gbp(interest)}</strong> in interest.
          </>
        )}
      </p>

      <table className="w-full text-sm font-sans mt-5">
        <thead>
          <tr className="text-left">
            <th className="font-bold py-2 border-b border-black/10">Reach {gbp(target)} in</th>
            <th className="font-bold py-2 border-b border-black/10">Save each month</th>
          </tr>
        </thead>
        <tbody>
          {COMPARE_YEARS.map((y) => (
            <tr key={y} className={y === years ? 'font-bold' : ''}>
              <td className="py-2 border-b border-black/5">{y} years</td>
              <td className="py-2 border-b border-black/5 tabular-nums">{gbp(monthlyToReach(target, saved, rate, y))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link
        href={fullCalcHref}
        onClick={() => ph()?.capture('goal_open_full_calculator')}
        className="block w-full text-center bg-black rounded-full py-3.5 mt-5 text-sm font-sans font-bold text-white hover:opacity-80 transition-opacity"
      >
        See it grow year by year
      </Link>
    </>
  )
}

export default function SavingsGoal({ content, faqs }: { content: React.ReactNode; faqs: FaqItem[] }) {
  const goal = useSavingsGoal()
  return <ToolLayout inputs={<GoalInputs {...goal} />} result={<GoalResult {...goal} />} content={content} faqs={faqs} />
}
