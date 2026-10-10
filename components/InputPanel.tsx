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

export function FieldLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-[13px] font-sans text-black">{label}</span>
    </div>
  )
}

const inputCls = 'w-full bg-white ring-1 ring-inset ring-black/[0.12] rounded-xl h-12 text-base font-sans text-black outline-none focus:ring-black/[0.30] transition-colors'

export function CurrencyInput({
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

export function PercentInput({
  value,
  onChange,
  max = 100,
}: {
  value: number
  onChange: (v: number) => void
  /** Rates above this are capped, so the maths can't overflow */
  max?: number
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const handleArrow = (dir: 1 | -1) => {
    const next = Math.round(Math.min(max, Math.max(0, value + dir * 0.1)) * 10) / 10
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
          if (!isNaN(n) && n >= 0) onChange(Math.min(n, max))
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

export function DurationInput({
  value,
  onChange,
  unit,
  max = 100,
}: {
  value: number
  onChange: (v: number) => void
  unit: 'years' | 'months'
  /** Largest number of years accepted (months are always 0–11) */
  max?: number
}) {
  const limit = unit === 'months' ? 11 : max
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
          if (!isNaN(n) && n >= 0) onChange(Math.min(n, limit))
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault()
            const dir = e.key === 'ArrowUp' ? 1 : -1
            const next = Math.max(0, Math.min(value + dir, limit))
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

/** Pill-style segmented control used across the calculators. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  const id = useId()
  return (
    <div className="flex rounded-full ring-1 ring-inset ring-black/[0.12] p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`relative flex-1 h-[38px] text-[13px] font-sans rounded-full outline-none ${
            value === opt.value ? 'text-white' : 'text-black hover:bg-black/5'
          }`}
        >
          {value === opt.value && (
            <motion.div
              layoutId={`${id}-pill`}
              className="absolute inset-0 bg-black rounded-full"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            />
          )}
          <span className="relative z-10">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

function Segmented({ options, value, onChange }: { options: Freq[]; value: Freq; onChange: (v: Freq) => void }) {
  return <SegmentedControl options={options.map((o) => ({ value: o, label: FREQ_LABELS[o] }))} value={value} onChange={onChange} />
}

// ── Input tabs ─────────────────────────────────────────────────────────────────

/** Text tabs with a sliding underline, for switching between views of a calculator's inputs. */
export function InputTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  const index = Math.max(0, options.findIndex((o) => o.value === value))
  return (
    <div>
      <div className="flex" role="tablist">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={value === o.value}
            onClick={() => onChange(o.value)}
            className={`flex-1 pb-3 text-[13px] font-sans text-center outline-none transition-colors ${
              value === o.value ? 'text-black font-bold' : 'text-black/40'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="relative h-[2px] rounded-full bg-black/[0.08]">
        <motion.div
          className="absolute top-0 h-full rounded-full bg-irn"
          style={{ width: `${100 / options.length}%` }}
          animate={{ left: `${(index * 100) / options.length}%` }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        />
      </div>
    </div>
  )
}

// ── Toggle ─────────────────────────────────────────────────────────────────────

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
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
        className={`absolute top-1 left-1 w-4 h-4 rounded-full shadow-md transition-transform duration-200 ${
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
  const [inputTab, setInputTab] = useState<'basic' | 'advanced'>('basic')

  const handlePanEnd = (_: never, info: { offset: { x: number; y: number } }) => {
    if (Math.abs(info.offset.x) > Math.abs(info.offset.y) && Math.abs(info.offset.x) > 50) {
      if (info.offset.x < 0 && inputTab === 'basic') setInputTab('advanced')
      if (info.offset.x > 0 && inputTab === 'advanced') setInputTab('basic')
    }
  }

  return (
    <motion.div onPanEnd={handlePanEnd} className={bare ? '' : 'bg-elevated rounded-2xl shadow-card overflow-hidden'}>
      {/* Header — hidden in bare mode (sheet renders its own fixed header) */}
      {!bare && (
        <div className={`px-5 pt-5 ${showActions ? 'flex items-center justify-between' : ''}`}>
          <h2 className="font-sans font-bold text-[20px] text-black">Input values</h2>
          {showActions && onClose && (
            <button onClick={onClose} className="text-black/40 hover:text-black" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M2 2l14 14M16 2L2 16" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Basic / Advanced tabs */}
      <div className={`${bare ? 'mt-0' : 'px-5 mt-4'}`}>
          <InputTabs
            options={[{ value: 'basic', label: 'Basic' }, { value: 'advanced', label: 'Advanced' }]}
            value={inputTab}
            onChange={setInputTab}
          />
      </div>

      <div className={`${bare ? '' : 'px-5 pb-5'} space-y-5 mt-5`}>
        {inputTab === 'basic' ? (
          <>
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

            {/* Additional contributions */}
            <div>
              <FieldLabel label="Additional contributions (optional)" />
              <CurrencyInput
                value={values.additionalPayments}
                onChange={(v) => onChange({ additionalPayments: v })}
                symbol={values.currency.symbol}
              />
            </div>

            {/* Additional contributions frequency */}
            <div>
              <FieldLabel label="Additional contributions frequency" />
              <Segmented
                options={FREQ_OPTIONS}
                value={values.additionalPaymentsFreq}
                onChange={(v) => onChange({ additionalPaymentsFreq: v })}
              />
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
                              isSelected ? 'bg-black text-white shadow-card' : 'bg-elevated text-black shadow-card'
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
          </>
        ) : (
          <>
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

            {/* Tax-free interest amount */}
            <div>
              <FieldLabel label="Tax-free interest amount" />
              <CurrencyInput
                value={values.taxFreeAmount}
                onChange={(v) => onChange({ taxFreeAmount: v })}
                symbol={values.currency.symbol}
              />
            </div>

            {/* Tax rate on interest */}
            <div>
              <FieldLabel label="Tax rate on interest" />
              <PercentInput
                value={values.taxRate}
                onChange={(v) => onChange({ taxRate: v })}
              />
            </div>

            {/* Management fee */}
            <div>
              <FieldLabel label="Management fee %" />
              <PercentInput
                value={values.managementFee}
                onChange={(v) => onChange({ managementFee: v })}
              />
            </div>

            {/* Annual increase in contributions */}
            <div>
              <FieldLabel label="Annual increase in contributions %" />
              <PercentInput
                value={values.depositGrowthRate}
                onChange={(v) => onChange({ depositGrowthRate: v })}
              />
            </div>

            {/* Deposits at start of period */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-black">Deposits at start of period</span>
              <Toggle
                checked={values.depositsAtStart}
                onChange={(v) => onChange({ depositsAtStart: v })}
              />
            </div>

            {/* Withdrawals */}
            <div>
              <FieldLabel label="Withdrawals (optional)" />
              <CurrencyInput
                value={values.withdrawals}
                onChange={(v) => onChange({ withdrawals: v })}
                symbol={values.currency.symbol}
              />
            </div>
            <Segmented
              options={FREQ_OPTIONS}
              value={values.withdrawalsFreq}
              onChange={(v) => onChange({ withdrawalsFreq: v })}
            />

          </>
        )}

        <div className="h-16 lg:hidden" />
      </div>
    </motion.div>
  )
}
