import { calculate, CURRENCIES, DEFAULT_INPUTS, type CalcInputs, type YearRow } from './calculate'

/** Lump Sum Allowance: the most tax-free cash you can take from pensions (from 6 April 2024). */
export const LUMP_SUM_ALLOWANCE = 268275

export interface PensionInputs {
  pot: number
  age: number
  retirementAge: number
  /** What you pay in each month, after any tax relief is added */
  personal: number
  employer: number
  /** Add basic-rate tax relief to personal contributions (relief at source: £80 becomes £100) */
  taxRelief: boolean
  growth: number
  fee: number
  adjustForInflation: boolean
  inflationRate: number
}

export const PENSION_DEFAULTS: PensionInputs = {
  pot: 25000,
  age: 35,
  retirementAge: 67,
  personal: 200,
  employer: 150,
  taxRelief: true,
  growth: 5,
  fee: 0.5,
  adjustForInflation: true,
  inflationRate: 2.5,
}

export interface PensionResult {
  years: number
  pot: number
  /** 25% of the pot, capped by the Lump Sum Allowance (in the same money as `pot`) */
  taxFreeLumpSum: number
  lumpSumCapped: boolean
  youPayIn: number
  employerPaysIn: number
  taxRelief: number
  /** Monthly income from taking 4% of the pot a year, before tax */
  monthlyIncomeAt4: number
  rows: YearRow[]
}

export function calculatePension(inputs: PensionInputs): PensionResult {
  const years = Math.max(0, inputs.retirementAge - inputs.age)
  const personalGross = inputs.taxRelief ? inputs.personal / 0.8 : inputs.personal
  const engine = (adjustForInflation: boolean): CalcInputs => ({
    ...DEFAULT_INPUTS,
    currency: CURRENCIES[0],
    initialInvestment: inputs.pot,
    interestRate: inputs.growth,
    compoundFreq: 'monthly',
    durationYears: years,
    durationMonths: 0,
    additionalPayments: personalGross + inputs.employer,
    additionalPaymentsFreq: 'monthly',
    managementFee: inputs.fee,
    adjustForInflation,
    inflationRate: inputs.inflationRate,
  })

  const shown = calculate(engine(inputs.adjustForInflation))
  const nominal = inputs.adjustForInflation ? calculate(engine(false)) : shown

  // The allowance is a fixed cash amount, so cap against the nominal pot, then convert
  const nominalLump = Math.min(nominal.futureValue * 0.25, LUMP_SUM_ALLOWANCE)
  const toShown = nominal.futureValue > 0 ? shown.futureValue / nominal.futureValue : 1

  const months = years * 12
  return {
    years,
    pot: shown.futureValue,
    taxFreeLumpSum: nominalLump * toShown,
    lumpSumCapped: nominal.futureValue * 0.25 > LUMP_SUM_ALLOWANCE,
    youPayIn: inputs.personal * months,
    employerPaysIn: inputs.employer * months,
    taxRelief: (personalGross - inputs.personal) * months,
    monthlyIncomeAt4: (shown.futureValue * 0.04) / 12,
    rows: shown.rows,
  }
}

// ── URL params ───────────────────────────────────────────────────────────────

const NUM_KEYS: [keyof PensionInputs, string][] = [
  ['pot', 'pot'], ['age', 'age'], ['retirementAge', 'ra'], ['personal', 'pc'], ['employer', 'ec'],
  ['growth', 'g'], ['fee', 'f'], ['inflationRate', 'ir'],
]
const BOOL_KEYS: [keyof PensionInputs, string][] = [['taxRelief', 'tr'], ['adjustForInflation', 'inf']]
const ALL_KEYS = [...NUM_KEYS, ...BOOL_KEYS].map(([, k]) => k)

export const pensionCodec = {
  has: (search: string) => {
    const p = new URLSearchParams(search)
    return ALL_KEYS.some((k) => p.has(k))
  },
  decode: (search: string, base: PensionInputs): PensionInputs => {
    const p = new URLSearchParams(search)
    const out = { ...base } as Record<keyof PensionInputs, number | boolean>
    for (const [field, k] of NUM_KEYS) {
      const v = Number(p.get(k))
      if (p.has(k) && !isNaN(v) && v >= 0) out[field] = v
    }
    for (const [field, k] of BOOL_KEYS) if (p.has(k)) out[field] = p.get(k) === '1'
    return out as unknown as PensionInputs
  },
  merge: (search: string, inputs: PensionInputs, base: PensionInputs) => {
    const p = new URLSearchParams(search)
    ALL_KEYS.forEach((k) => p.delete(k))
    for (const [field, k] of NUM_KEYS) if (inputs[field] !== base[field]) p.set(k, String(inputs[field]))
    for (const [field, k] of BOOL_KEYS) if (inputs[field] !== base[field]) p.set(k, inputs[field] ? '1' : '0')
    return p.toString()
  },
}
