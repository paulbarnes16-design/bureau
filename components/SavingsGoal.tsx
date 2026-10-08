'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CurrencyInput, DurationInput, FieldLabel, PercentInput } from './InputPanel'
import Stat from './Stat'
import ToolLayout from './ToolLayout'
import { gbp, monthlyToReach } from '@/lib/goals'
import type { FaqItem } from '@/lib/schemas'

const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog

const DEFAULTS = { target: 50000, saved: 0, rate: 5, years: 10 }

export default function SavingsGoal({ faqs }: { faqs: FaqItem[] }) {
  const [values, setValues] = useState(DEFAULTS)
  const [hasInput, setHasInput] = useState(false)
  const patch = (u: Partial<typeof DEFAULTS>) => {
    setValues((v) => ({ ...v, ...u }))
    if (!hasInput) {
      setHasInput(true)
      ph()?.capture('user_engaged', { tool: 'savings_goal' })
    }
  }

  const { target, saved, rate, years } = values
  const monthly = monthlyToReach(target, saved, rate, years)
  const paidIn = saved + monthly * years * 12
  const interest = Math.max(0, target - paidIn)

  const inputs = (
    <>
      <div>
        <FieldLabel label="Savings target" />
        <CurrencyInput value={target} onChange={(v) => patch({ target: v })} symbol="£" step={1000} />
      </div>
      <div>
        <FieldLabel label="Already saved (optional)" />
        <CurrencyInput value={saved} onChange={(v) => patch({ saved: v })} symbol="£" />
      </div>
      <div>
        <FieldLabel label="Interest rate" />
        <PercentInput value={rate} onChange={(v) => patch({ rate: v })} />
      </div>
      <div>
        <FieldLabel label="Time to reach your goal" />
        <DurationInput value={years} onChange={(v) => patch({ years: Math.max(1, v) })} unit="years" />
      </div>
    </>
  )

  const result = (
    <>
      <h2 className="font-sans font-bold text-[20px] text-black mb-4">{hasInput ? 'Results' : 'Example'}</h2>
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 mb-5">
        <Stat label="Save each month" value={gbp(monthly, 2)} />
        <Stat label="Target" value={gbp(target)} />
        <Stat label="Total paid in" value={gbp(paidIn)} />
        <Stat label="Interest earned" value={gbp(interest)} />
      </div>
      <p className="text-[18px] font-sans text-black leading-relaxed mb-5">
        {monthly === 0 ? (
          <>What you&apos;ve already saved reaches <strong>{gbp(target)}</strong> on its own in <strong>{years} years</strong>.</>
        ) : (
          <>
            Save <strong>{gbp(monthly)}</strong> a month for <strong>{years} years</strong> at <strong>{rate}%</strong> to
            reach <strong>{gbp(target)}</strong>.
          </>
        )}
      </p>
      <Link
        href={`/?i=${saved}&r=${rate}&dy=${years}&ap=${Math.ceil(monthly)}`}
        onClick={() => ph()?.capture('goal_open_full_calculator')}
        className="block w-full text-center bg-black rounded-full py-3.5 text-sm font-sans font-bold text-white"
      >
        See it year by year
      </Link>
    </>
  )

  return <ToolLayout inputs={inputs} result={result} faqs={faqs} />
}
