/** Overall ISA allowance per tax year. */
export const ISA_ALLOWANCE = 20000
/** Cash ISA limit for under-65s from 6 April 2027. */
export const CASH_ISA_LIMIT_2027 = 12000
/** First tax year the cash limit applies (6 April 2027). */
const CAP_START = { year: 2027, month: 3 } // April (0-based month)

export type TaxBand = 'basic' | 'higher' | 'additional'

/** Personal Savings Allowance: interest you can earn tax-free outside an ISA each year. */
export const SAVINGS_ALLOWANCE: Record<TaxBand, number> = { basic: 1000, higher: 500, additional: 0 }
export const TAX_RATE: Record<TaxBand, number> = { basic: 20, higher: 40, additional: 45 }

export interface IsaInputs {
  age: number
  cashBalance: number
  sharesBalance: number
  cashMonthly: number
  sharesMonthly: number
  /** Cash ISA rate, as an AER */
  cashRate: number
  /** Stocks and shares growth per year, before fees */
  sharesGrowth: number
  sharesFee: number
  years: number
  /** Move cash saving above the £12,000 limit into stocks and shares from April 2027 (under-65s) */
  applyCashLimit: boolean
  taxBand: TaxBand
  adjustForInflation: boolean
  inflationRate: number
}

export const ISA_DEFAULTS: IsaInputs = {
  age: 35,
  cashBalance: 10000,
  sharesBalance: 5000,
  cashMonthly: 1200,
  sharesMonthly: 300,
  cashRate: 4,
  sharesGrowth: 5,
  sharesFee: 0.5,
  years: 10,
  applyCashLimit: true,
  taxBand: 'basic',
  adjustForInflation: false,
  inflationRate: 2.5,
}

export interface IsaYear {
  year: number
  cash: number
  shares: number
  total: number
  paidIn: number
}

export interface IsaResult {
  cash: number
  shares: number
  total: number
  /** Total paid in (in today's money when adjusting for inflation) */
  paidIn: number
  /** Can be negative in today's money if inflation outpaces growth */
  growth: number
  /** Cash saving moved into stocks and shares because of the £12,000 limit, per full tax year */
  movedPerYear: number
  movedTotal: number
  /** Planned yearly subscriptions above the £20,000 allowance */
  overAllowance: number
  /** Estimated income tax on the cash interest if it were held outside an ISA */
  taxSavedOnCash: number
  rows: IsaYear[]
}

const pct = (v: number) => Math.min(100, Math.max(0, v))

/**
 * Month-by-month projection from the current month. Contributions are paid at the end of
 * each month; the cash limit is applied per tax year (6 April to 5 April) from April 2027.
 */
export function calculateIsa(inputs: IsaInputs, start = new Date()): IsaResult {
  const years = Math.min(50, Math.max(0, inputs.years))
  const n = Math.round(years * 12)
  const cashI = Math.pow(1 + pct(inputs.cashRate) / 100, 1 / 12) - 1
  // Monthly growth after the annual fee, charged monthly on the balance
  const sharesI = Math.pow(1 + pct(inputs.sharesGrowth) / 100, 1 / 12) * (1 - pct(inputs.sharesFee) / 100 / 12) - 1
  const inflation = inputs.adjustForInflation ? pct(inputs.inflationRate) / 100 : 0
  const real = (v: number, months: number) => v / Math.pow(1 + inflation, months / 12)

  let cash = inputs.cashBalance
  let shares = inputs.sharesBalance
  let paidIn = inputs.cashBalance + inputs.sharesBalance
  // Paid in, converted to today's money when month by month, so growth compares like with like
  let paidInReal = paidIn
  let cashThisTaxYear = 0
  let movedTotal = 0
  let interestByTaxYear = 0
  let taxSavedOnCash = 0
  const band = inputs.taxBand
  const rows: IsaYear[] = [{ year: 0, cash: Math.round(cash), shares: Math.round(shares), total: Math.round(cash + shares), paidIn: Math.round(paidIn) }]

  for (let m = 1; m <= n; m++) {
    const date = new Date(start.getFullYear(), start.getMonth() + m, 1)
    const isApril = date.getMonth() === 3
    if (isApril) {
      // New tax year: settle tax that would have been due on last year's cash interest outside an ISA
      taxSavedOnCash += (Math.max(0, interestByTaxYear - SAVINGS_ALLOWANCE[band]) * TAX_RATE[band]) / 100
      interestByTaxYear = 0
      cashThisTaxYear = 0
    }
    const age = inputs.age + Math.floor((m - 1) / 12)
    const capApplies =
      inputs.applyCashLimit &&
      age < 65 &&
      (date.getFullYear() > CAP_START.year || (date.getFullYear() === CAP_START.year && date.getMonth() >= CAP_START.month))

    const interest = cash * cashI
    cash += interest
    shares *= 1 + sharesI
    interestByTaxYear += interest

    let toCash = inputs.cashMonthly
    let toShares = inputs.sharesMonthly
    if (capApplies) {
      const room = Math.max(0, CASH_ISA_LIMIT_2027 - cashThisTaxYear)
      const moved = Math.max(0, toCash - room)
      toCash -= moved
      toShares += moved
      movedTotal += moved
    }
    cashThisTaxYear += toCash
    cash += toCash
    shares += toShares
    paidIn += inputs.cashMonthly + inputs.sharesMonthly
    paidInReal += real(inputs.cashMonthly + inputs.sharesMonthly, m)

    if (m % 12 === 0) {
      rows.push({
        year: m / 12,
        cash: Math.round(real(cash, m)),
        shares: Math.round(real(shares, m)),
        total: Math.round(real(cash + shares, m)),
        paidIn: Math.round(inflation ? paidInReal : paidIn),
      })
    }
  }
  taxSavedOnCash += (Math.max(0, interestByTaxYear - SAVINGS_ALLOWANCE[band]) * TAX_RATE[band]) / 100

  const total = real(cash + shares, n)
  const paidInShown = inflation ? paidInReal : paidIn
  const cashYearly = inputs.cashMonthly * 12
  // Only report a yearly figure if saving really was moved during the projection
  const cashLimitBinds = movedTotal > 0 && cashYearly > CASH_ISA_LIMIT_2027
  return {
    cash: real(cash, n),
    shares: real(shares, n),
    total,
    paidIn: paidInShown,
    growth: total - paidInShown,
    movedPerYear: cashLimitBinds ? cashYearly - CASH_ISA_LIMIT_2027 : 0,
    movedTotal,
    overAllowance: Math.max(0, (inputs.cashMonthly + inputs.sharesMonthly) * 12 - ISA_ALLOWANCE),
    taxSavedOnCash,
    rows,
  }
}

// ── URL params ───────────────────────────────────────────────────────────────

const NUM: [keyof IsaInputs, string][] = [
  ['age', 'age'], ['cashBalance', 'cb'], ['sharesBalance', 'sb'], ['cashMonthly', 'cm'], ['sharesMonthly', 'sm'],
  ['cashRate', 'cr'], ['sharesGrowth', 'sg'], ['sharesFee', 'sf'], ['years', 'y'], ['inflationRate', 'ir'],
]
const BOOL: [keyof IsaInputs, string][] = [['applyCashLimit', 'cap'], ['adjustForInflation', 'inf']]
const KEYS = [...NUM, ...BOOL].map(([, k]) => k).concat('band')

export const isaCodec = {
  has: (search: string) => {
    const p = new URLSearchParams(search)
    return KEYS.some((k) => p.has(k))
  },
  decode: (search: string, base: IsaInputs): IsaInputs => {
    const p = new URLSearchParams(search)
    const out = { ...base } as unknown as Record<string, number | boolean | string>
    for (const [f, k] of NUM) {
      const v = Number(p.get(k))
      if (p.has(k) && !isNaN(v) && v >= 0) out[f] = v
    }
    for (const [f, k] of BOOL) if (p.has(k)) out[f] = p.get(k) === '1'
    const band = p.get('band')
    if (band === 'basic' || band === 'higher' || band === 'additional') out.taxBand = band
    return out as unknown as IsaInputs
  },
  merge: (search: string, inputs: IsaInputs, base: IsaInputs) => {
    const p = new URLSearchParams(search)
    KEYS.forEach((k) => p.delete(k))
    for (const [f, k] of NUM) if (inputs[f] !== base[f]) p.set(k, String(inputs[f]))
    for (const [f, k] of BOOL) if (inputs[f] !== base[f]) p.set(k, inputs[f] ? '1' : '0')
    if (inputs.taxBand !== base.taxBand) p.set('band', inputs.taxBand)
    return p.toString()
  },
}
