export type MortgageType = 'repayment' | 'interest-only'

export interface MortgageInputs {
  price: number
  deposit: number
  rate: number
  termYears: number
  /** Extra months on top of the years (used for loans) */
  termMonths: number
  type: MortgageType
  /** Extra paid on top of the monthly payment (repayment mortgages only) */
  overpayment: number
  /** True when `rate` is an APR (an effective annual rate, as quoted on UK loans) rather than a nominal rate */
  apr?: boolean
}

export interface MortgageYear {
  year: number
  paid: number
  interest: number
  principal: number
  balance: number
  cumulativeInterest: number
  cumulativePrincipal: number
}

export interface MortgageResult {
  loan: number
  monthlyPayment: number
  totalInterest: number
  totalRepaid: number
  ltv: number
  /** Months until the loan is cleared (shorter than the term when overpaying; the full term for interest-only) */
  months: number
  rows: MortgageYear[]
}

export const MORTGAGE_DEFAULTS: MortgageInputs = {
  price: 300000,
  deposit: 60000,
  rate: 4.5,
  termYears: 25,
  termMonths: 0,
  type: 'repayment',
  overpayment: 0,
}

/** Monthly interest rate from a nominal annual rate, or from an APR (effective annual rate). */
export function monthlyRate(ratePct: number, apr = false): number {
  return apr ? Math.pow(1 + ratePct / 100, 1 / 12) - 1 : ratePct / 100 / 12
}

/** Standard monthly repayment for a loan at monthly interest rate `i`. */
export function monthlyRepayment(loan: number, i: number, months: number): number {
  if (months <= 0 || loan <= 0) return 0
  return i === 0 ? loan / months : (loan * i) / (1 - Math.pow(1 + i, -months))
}

export function calculateMortgage(inputs: MortgageInputs): MortgageResult {
  const { price, deposit, rate, termYears, type } = inputs
  const loan = Math.max(0, price - deposit)
  // Terms are capped at 50 years so a typed or linked value can't make the loop run forever
  const n = Math.min(600, Math.round(termYears * 12 + (inputs.termMonths ?? 0)))
  const i = monthlyRate(Math.min(100, Math.max(0, rate)), inputs.apr)
  const interestOnly = type === 'interest-only'
  const monthlyPayment = interestOnly ? loan * i : monthlyRepayment(loan, i, n)
  const overpayment = interestOnly ? 0 : inputs.overpayment

  let balance = loan
  let totalInterest = 0
  let totalPrincipal = 0
  let months = 0
  const rows: MortgageYear[] = [
    { year: 0, paid: 0, interest: 0, principal: 0, balance: loan, cumulativeInterest: 0, cumulativePrincipal: 0 },
  ]
  let year = { paid: 0, interest: 0, principal: 0 }

  for (let m = 1; m <= n && balance > 0.005; m++) {
    const interest = balance * i
    // Interest-only: only interest is paid; the full loan is still owed at the end
    let principal = interestOnly ? 0 : Math.min(balance, monthlyPayment - interest + overpayment)
    principal = Math.max(0, principal)
    balance -= principal
    totalInterest += interest
    totalPrincipal += principal
    year.paid += interest + principal
    year.interest += interest
    year.principal += principal
    months = m
    if (m % 12 === 0 || balance <= 0.005 || m === n) {
      rows.push({
        year: Math.ceil(m / 12),
        paid: Math.round(year.paid),
        interest: Math.round(year.interest),
        principal: Math.round(year.principal),
        balance: Math.round(Math.max(0, balance)),
        cumulativeInterest: Math.round(totalInterest),
        cumulativePrincipal: Math.round(totalPrincipal),
      })
      year = { paid: 0, interest: 0, principal: 0 }
    }
  }

  return {
    loan,
    monthlyPayment,
    totalInterest,
    // Interest-only still has to repay the loan at the end of the term
    totalRepaid: totalInterest + (interestOnly ? loan : totalPrincipal),
    ltv: price > 0 ? (loan / price) * 100 : 0,
    months,
    rows,
  }
}

// ── URL params ───────────────────────────────────────────────────────────────

const KEYS = { price: 'p', deposit: 'd', rate: 'r', termYears: 't', termMonths: 'tm', type: 'type', overpayment: 'op' } as const

export function hasMortgageParams(search: string): boolean {
  const p = new URLSearchParams(search)
  return Object.values(KEYS).some((k) => p.has(k))
}

export function decodeMortgage(search: string, base: MortgageInputs): MortgageInputs {
  const p = new URLSearchParams(search)
  const num = (k: string, fallback: number) => {
    const v = Number(p.get(k))
    return p.has(k) && !isNaN(v) && v >= 0 ? v : fallback
  }
  return {
    price: num(KEYS.price, base.price),
    deposit: num(KEYS.deposit, base.deposit),
    rate: num(KEYS.rate, base.rate),
    termYears: num(KEYS.termYears, base.termYears),
    termMonths: num(KEYS.termMonths, base.termMonths),
    type: p.get(KEYS.type) === 'io' ? 'interest-only' : p.get(KEYS.type) === 'rep' ? 'repayment' : base.type,
    overpayment: num(KEYS.overpayment, base.overpayment),
    apr: base.apr,
  }
}

/** Rewrites the mortgage keys in `search`, keeping other params (e.g. utm tags). */
export function mergeMortgageIntoSearch(search: string, inputs: MortgageInputs, base: MortgageInputs): string {
  const p = new URLSearchParams(search)
  Object.values(KEYS).forEach((k) => p.delete(k))
  if (inputs.price !== base.price) p.set(KEYS.price, String(inputs.price))
  if (inputs.deposit !== base.deposit) p.set(KEYS.deposit, String(inputs.deposit))
  if (inputs.rate !== base.rate) p.set(KEYS.rate, String(inputs.rate))
  if (inputs.termYears !== base.termYears) p.set(KEYS.termYears, String(inputs.termYears))
  if (inputs.termMonths !== base.termMonths) p.set(KEYS.termMonths, String(inputs.termMonths))
  if (inputs.type !== base.type) p.set(KEYS.type, inputs.type === 'interest-only' ? 'io' : 'rep')
  if (inputs.overpayment !== base.overpayment) p.set(KEYS.overpayment, String(inputs.overpayment))
  return p.toString()
}

export const mortgageCodec = { has: hasMortgageParams, decode: decodeMortgage, merge: mergeMortgageIntoSearch }
