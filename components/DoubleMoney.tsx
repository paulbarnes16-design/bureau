'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CurrencyInput, FieldLabel, PercentInput } from './InputPanel'
import Stat from './Stat'
import ToolLayout from './ToolLayout'
import { gbp, ruleOf72, yearsToDouble } from '@/lib/goals'
import type { FaqItem } from '@/lib/schemas'

const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog

const DEFAULTS = { amount: 10000, rate: 7 }

const yrs = (y: number) => (isFinite(y) ? `${y.toFixed(1)} yrs` : '—')

export default function DoubleMoney({ faqs }: { faqs: FaqItem[] }) {
  const [values, setValues] = useState(DEFAULTS)
  const [hasInput, setHasInput] = useState(false)
  const patch = (u: Partial<typeof DEFAULTS>) => {
    setValues((v) => ({ ...v, ...u }))
    if (!hasInput) {
      setHasInput(true)
      ph()?.capture('user_engaged', { tool: 'double_your_money' })
    }
  }

  const { amount, rate } = values
  const exact = yearsToDouble(rate)

  const inputs = (
    <>
      <div>
        <FieldLabel label="Amount" />
        <CurrencyInput value={amount} onChange={(v) => patch({ amount: v })} symbol="£" step={1000} />
      </div>
      <div>
        <FieldLabel label="Interest rate" />
        <PercentInput value={rate} onChange={(v) => patch({ rate: v })} />
      </div>
    </>
  )

  const result = (
    <>
      <h2 className="font-sans font-bold text-[20px] text-black mb-4">{hasInput ? 'Results' : 'Example'}</h2>
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 mb-5">
        <Stat label="Time to double" value={yrs(exact)} />
        <Stat label="Rule of 72 estimate" value={yrs(ruleOf72(rate))} />
        <Stat label="Starting amount" value={gbp(amount)} />
        <Stat label="Doubled amount" value={gbp(amount * 2)} />
      </div>
      <p className="text-[18px] font-sans text-black leading-relaxed mb-5">
        {isFinite(exact) ? (
          <>At <strong>{rate}%</strong> a year, <strong>{gbp(amount)}</strong> becomes <strong>{gbp(amount * 2)}</strong> in <strong>{exact.toFixed(1)} years</strong>.</>
        ) : (
          <>Enter an interest rate above 0%.</>
        )}
      </p>
      {isFinite(exact) && (
        <Link
          href={`/?i=${amount}&r=${rate}&cf=y&dy=${Math.ceil(exact)}`}
          onClick={() => ph()?.capture('double_open_full_calculator')}
          className="block w-full text-center bg-black rounded-full py-3.5 text-sm font-sans font-bold text-white"
        >
          See it year by year
        </Link>
      )}
    </>
  )

  return <ToolLayout inputs={inputs} result={result} faqs={faqs} />
}
