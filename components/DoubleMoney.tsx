'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CurrencyInput, FieldLabel, PercentInput } from './InputPanel'
import ToolLayout from './ToolLayout'
import { gbp, ruleOf72, yearsToDouble } from '@/lib/goals'
import type { FaqItem } from '@/lib/schemas'

const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog

const DEFAULTS = { amount: 10000, rate: 7 }

const fmtYears = (y: number) => (isFinite(y) ? `${y.toFixed(1)} years` : 'never')

export default function DoubleMoney({ content, faqs }: { content: React.ReactNode; faqs: FaqItem[] }) {
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
  const estimate = ruleOf72(rate)

  const inputs = (
    <>
      <div>
        <FieldLabel label="Amount" />
        <CurrencyInput value={amount} onChange={(v) => patch({ amount: v })} symbol="£" step={1000} />
      </div>
      <div>
        <FieldLabel label="Annual interest rate" />
        <PercentInput value={rate} onChange={(v) => patch({ rate: v })} />
      </div>
    </>
  )

  const result = (
    <>
      <h2 className="font-sans font-bold text-[20px] text-black mb-4">{hasInput ? 'Results' : 'Example'}</h2>
      <p className="text-[13px] font-sans text-black mb-1">Your money doubles in</p>
      <p className="font-condensed text-[40px] text-black leading-none">{fmtYears(exact)}</p>
      <p className="font-sans text-[15px] text-black leading-relaxed mt-4">
        {isFinite(exact) ? (
          <>
            At <strong>{rate}%</strong> a year, <strong>{gbp(amount)}</strong> grows to <strong>{gbp(amount * 2)}</strong> in
            about <strong>{fmtYears(exact)}</strong>, with interest compounded yearly. The Rule of 72 estimates{' '}
            <strong>{fmtYears(estimate)}</strong>.
          </>
        ) : (
          <>With no interest, your money won&apos;t grow. Enter a rate above 0%.</>
        )}
      </p>
      {isFinite(exact) && (
        <Link
          href={`/?i=${amount}&r=${rate}&cf=y&dy=${Math.ceil(exact)}`}
          onClick={() => ph()?.capture('double_open_full_calculator')}
          className="block w-full text-center bg-black rounded-full py-3.5 mt-5 text-sm font-sans font-bold text-white hover:opacity-80 transition-opacity"
        >
          See it grow year by year
        </Link>
      )}
    </>
  )

  return <ToolLayout inputs={inputs} result={result} content={content} faqs={faqs} />
}
