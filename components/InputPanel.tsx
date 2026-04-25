'use client'

import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog
import { CURRENCIES, type CalcInputs, type Currency, type Freq, FREQ_LABELS } from '@/lib/calculate'

// ── Icons ─────────────────────────────────────────────────────────────────────

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-black/30 flex-shrink-0">
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 6v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
      <circle cx="7" cy="4" r="0.7" fill="currentColor" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M3 6l5 5 5-5" />
    </svg>
  )
}

// ── Primitives ─────────────────────────────────────────────────────────────────

function FieldLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-[13px] font-sans text-black">{label}</span>
    </div>
  )
}

const inputCls = 'w-full bg-white ring-1 ring-inset ring-black/[0.12] rounded-xl h-12 text-base font-sans text-black outline-none focus:ring-black/[0.30] transition-colors'

function CurrencyInput({
  value,
  onChange,
  symbol,
  step = 100,
}: {
  value: number
  onChange: (v: number) => void
  symbol: string
  step?: number
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const handleArrow = (dir: 1 | -1) => {
    const next = Math.max(0, value + dir * step)
    onChange(next)
    setDraft(String(next))
    setEditing(true)
  }

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-sans text-black pointer-events-none select-none leading-none">{symbol}</span>
      <input
        type="text"
        inputMode="numeric"
        value={editing ? draft : value.toLocaleString('en-GB')}
        className={`${inputCls} pl-7 pr-4`}
        onFocus={(e) => { setEditing(true); setDraft(String(value)); const t = e.currentTarget; setTimeout(() => t.select(), 0) }}
        onBlur={() => {
          setEditing(false)
          const n = Number(draft.replace(/,/g, ''))
          if (!isNaN(n) && n >= 0) onChange(n)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'ArrowUp') { e.preventDefault(); handleArrow(1) }
          if (e.key === 'ArrowDown') { e.preventDefault(); handleArrow(-1) }
        }}
        onChange={(e) => { const v = e.target.value.replace(/[^\d]/g, ''); setDraft(v) }}
      />
    </div>
  )
}

function PercentInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const handleArrow = (dir: 1 | -1) => {
    const next = Math.round(Math.max(0, value + dir * 0.1) * 10) / 10
    onChange(next)
    setDraft(String(next))
    setEditing(true)
  }

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        value={editing ? draft : String(value)}
        className={`${inputCls} pl-4 pr-8`}
        onFocus={(e) => { setEditing(true); setDraft(String(value)); const t = e.currentTarget; setTimeout(() => t.select(), 0) }}
        onBlur={() => {
          setEditing(false)
          const n = Number(draft)
          if (!isNaN(n) && n >= 0) onChange(n)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'ArrowUp') { e.preventDefault(); handleArrow(1) }
          if (e.key === 'ArrowDown') { e.preventDefault(); handleArrow(-1) }
        }}
        onChange={(e) => { const v = e.target.value.replace(/[^\d.]/g, ''); setDraft(v) }}
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-sans text-black pointer-events-none select-none">%</span>
    </div>
  )
}

function DurationInput({
  value,
  onChange,
  unit,
}: {
  value: number
  onChange: (v: number) => void
  unit: 'years' | 'months'
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const displayNum = editing ? (parseInt(draft, 10) || value) : value
  const suffix = unit === 'years'
    ? `year${displayNum !== 1 ? 's' : ''}`
    : `month${displayNum !== 1 ? 's' : ''}`

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={editing ? draft : String(value)}
        className={`${inputCls} pl-4 pr-14`}
        onFocus={(e) => { setEditing(true); setDraft(String(value)); const t = e.currentTarget; setTimeout(() => t.select(), 0) }}
        onBlur={() => {
          setEditing(false)
          const n = parseInt(draft, 10)
          if (!isNaN(n) && n >= 0) onChange(unit === 'months' ? Math.min(n, 11) : n)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault()
            const dir = e.key === 'ArrowUp' ? 1 : -1
            const next = Math.max(0, unit === 'months' ? Math.min(value + dir, 11) : value + dir)
            onChange(next)
            setDraft(String(next))
            setEditing(true)
          }
        }}
        onChange={(e) => { const v = e.target.value.replace(/[^\d]/g, ''); setDraft(v) }}
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-sans text-black pointer-events-none select-none">{suffix}</span>
    </div>
  )
}

// ── Segmented control ──────────────────────────────────────────────────────────

function Segmented({
  options,
  value,
  onChange,
}: {
  options: Freq[]
  value: Freq
  onChange: (v: Freq) => void
}) {
  const id = useId()
  return (
    <div className="flex rounded-full ring-1 ring-inset ring-black/[0.12] p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`relative flex-1 h-[38px] text-[13px] font-sans rounded-full outline-none ${
            value === opt ? 'text-white' : 'text-black hover:bg-black/5'
          }`}
        >
          {value === opt && (
            <motion.div
              layoutId={`${id}-pill`}
              className="absolute inset-0 bg-black rounded-full"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            />
          )}
          <span className="relative z-10">{FREQ_LABELS[opt]}</span>
        </button>
      ))}
    </div>
  )
}

// ── Toggle ─────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-12 h-6 rounded-full flex-shrink-0 transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-irn' : 'bg-transparent ring-1 ring-inset ring-black'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-md transition-transform duration-200 ${
          checked ? 'bg-white translate-x-6' : 'bg-black translate-x-0'
        }`}
      />
    </button>
  )
}

// ── InputPanel ────────────────────────────────────────────────────────────────

const FREQ_OPTIONS: Freq[] = ['weekly', 'monthly', 'yearly']

interface Props {
  values: CalcInputs
  onChange: (patch: Partial<CalcInputs>) => void
  onCurrencyClick?: () => void
  onClose?: () => void
  showActions?: boolean
  bare?: boolean
}

export default function InputPanel({ values, onChange, onClose, showActions, bare }: Props) {
  const [currencyOpen, setCurrencyOpen] = useState(false)
  return (
    <div className={bare ? '' : 'bg-elevated rounded-2xl shadow-card ring-2 ring-inset ring-white overflow-hidden'}>
      {/* Header — hidden in bare mode (sheet renders its own fixed header) */}
      {!bare && (
        <div className={`px-5 pt-5 ${showActions ? 'flex items-center justify-between' : ''}`}>
          <h2 className="font-sans font-bold text-[20px] text-black mb-5">Input values</h2>
          {showActions && onClose && (
            <button onClick={onClose} className="text-black/40 hover:text-black -mt-5" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M2 2l14 14M16 2L2 16" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className={`${bare ? '' : 'px-5 pb-5'} space-y-5`}>
        {/* Initial Investment */}
        <div>
          <FieldLabel label="Initial Investment" />
          <CurrencyInput
            value={values.initialInvestment}
            onChange={(v) => onChange({ initialInvestment: v })}
            symbol={values.currency.symbol}
            step={1000}
          />
        </div>

        {/* Interest rate */}
        <div>
          <FieldLabel label="Interest rate" />
          <PercentInput
            value={values.interestRate}
            onChange={(v) => onChange({ interestRate: v })}
          />
        </div>

        {/* Compound frequency */}
        <div>
          <FieldLabel label="Compound frequency" />
          <Segmented
            options={FREQ_OPTIONS}
            value={values.compoundFreq}
            onChange={(v) => onChange({ compoundFreq: v })}
          />
        </div>

        {/* Duration */}
        <div>
          <FieldLabel label="Compound duration" />
          <div className="grid grid-cols-2 gap-2">
            <DurationInput
              value={values.durationYears}
              onChange={(v) => onChange({ durationYears: v })}
              unit="years"
            />
            <DurationInput
              value={values.durationMonths}
              onChange={(v) => onChange({ durationMonths: v })}
              unit="months"
            />
          </div>
        </div>

        {/* Additional payments */}
        <div>
          <FieldLabel label="Additional contributions (optional)" />
          <CurrencyInput
            value={values.additionalPayments}
            onChange={(v) => onChange({ additionalPayments: v })}
            symbol={values.currency.symbol}
          />
        </div>

        {/* Additional payments frequency */}
        <Segmented
          options={FREQ_OPTIONS}
          value={values.additionalPaymentsFreq}
          onChange={(v) => onChange({ additionalPaymentsFreq: v })}
        />

        {/* Inflation toggle */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-sans text-black">Adjust for inflation</span>
            <Toggle
              checked={values.adjustForInflation}
              onChange={(v) => { onChange({ adjustForInflation: v }); ph()?.capture('inflation_toggled', { enabled: v }) }}
            />
          </div>
          <AnimatePresence initial={false}>
            {values.adjustForInflation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-3">
                  <FieldLabel label="Inflation rate" />
                  <PercentInput
                    value={values.inflationRate}
                    onChange={(v) => onChange({ inflationRate: v })}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Change currency */}
        <div>
          <button
            type="button"
            onClick={() => setCurrencyOpen((o) => !o)}
            className="w-full flex items-center justify-between py-1"
          >
            <span className="text-sm font-sans text-black">Change currency</span>
            <motion.span animate={{ rotate: currencyOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
              <ChevronDown />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {currencyOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden px-4 -mx-4 pb-4 -mb-4"
              >
                <div className="pt-3 space-y-1">
                  {(CURRENCIES as Currency[]).map((c) => {
                    const isSelected = c.code === values.currency.code
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => { onChange({ currency: c }); ph()?.capture('currency_changed', { currency: c.code }) }}
                        className="w-full flex items-center gap-3 py-1"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-sans font-black text-sm ${
                          isSelected ? 'bg-black text-white shadow-card' : 'bg-elevated text-black shadow-[inset_0_0_0_2px_white,-6px_-5px_7.5px_rgba(255,255,255,0.4),6px_5px_14px_rgba(0,0,0,0.12)]'
                        }`}>
                          {c.symbol}
                        </div>
                        <span className="flex-1 text-left font-sans text-sm text-black">{c.name}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-16 lg:hidden" />
      </div>
    </div>
  )
}
