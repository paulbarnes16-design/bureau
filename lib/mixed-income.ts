// UK rates for 2026/27 (England, Wales and Northern Ireland). Update each April.

export const PERSONAL_ALLOWANCE = 12570
/** Personal allowance is reduced by £1 for every £2 of adjusted net income above this */
export const TAPER_START = 100000
const BASIC_BAND = 37700
const ADDITIONAL_THRESHOLD = 125140
/** Total income at which higher-rate tax starts, with the full personal allowance */
export const HIGHER_RATE_START = PERSONAL_ALLOWANCE + BASIC_BAND
const INCOME_RATES = [0.2, 0.4, 0.45]
export const DIVIDEND_ALLOWANCE = 500
export const DIVIDEND_RATES = [0.1075, 0.3575, 0.3935]

/** Employee NI is worked out separately for each job, so the company salary has its own thresholds */
export const NI_PRIMARY_THRESHOLD = 12570
const NI_UPPER_LIMIT = 50270
const EMPLOYEE_NI = [0.08, 0.02]
/** No Employment Allowance for a company whose only employee is its director */
export const NI_SECONDARY_THRESHOLD = 5000
export const EMPLOYER_NI = 0.15

const CT_SMALL = 0.19
const CT_MAIN = 0.25
const CT_LOWER = 50000
const CT_UPPER = 250000

export const PENSION_ANNUAL_ALLOWANCE = 60000

/** How much to take out: everything, up to the higher-rate threshold, or up to £100,000 */
export type TakeMode = 'all' | 'basic' | 'taper'

export interface MixedInputs {
  /** Salary from your PAYE job */
  jobSalary: number
  /** Company profit for the year before paying yourself (after other costs) */
  profit: number
  /** Profits kept from earlier years, after corporation tax */
  retained: number
  /** Employer pension contribution paid by your company */
  pension: number
  take: TakeMode
}

export const MIXED_DEFAULTS: MixedInputs = {
  jobSalary: 40000,
  profit: 40000,
  retained: 0,
  pension: 0,
  take: 'all',
}

export interface Extraction {
  salary: number
  dividends: number
  pension: number
  corporationTax: number
  employerNI: number
  employeeNI: number
  /** Extra income tax because of the company salary (on top of your job's tax) */
  incomeTax: number
  dividendTax: number
  /** Salary and dividends after all personal tax and NI */
  keep: number
  leftInCompany: number
  /** Corporation tax, both kinds of NI, income tax and dividend tax */
  totalTax: number
}

export interface MixedResult {
  best: Extraction
  dividendsOnly: Extraction
  salaryOnly: Extraction
  /** Your job's salary after income tax and employee NI */
  jobNet: number
  /** Room under the chosen income limit after your job salary (Infinity when taking everything) */
  headroom: number
}

/** Corporation tax with marginal relief between £50,000 and £250,000. Assumes no associated companies. */
export function corporationTax(profit: number): number {
  if (profit <= 0) return 0
  if (profit <= CT_LOWER) return profit * CT_SMALL
  if (profit >= CT_UPPER) return profit * CT_MAIN
  return profit * CT_MAIN - (3 / 200) * (CT_UPPER - profit)
}

export function employerNI(salary: number): number {
  return Math.max(0, salary - NI_SECONDARY_THRESHOLD) * EMPLOYER_NI
}

export function employeeNI(salary: number): number {
  const main = Math.max(0, Math.min(salary, NI_UPPER_LIMIT) - NI_PRIMARY_THRESHOLD)
  const upper = Math.max(0, salary - NI_UPPER_LIMIT)
  return main * EMPLOYEE_NI[0] + upper * EMPLOYEE_NI[1]
}

export function personalAllowance(adjustedNetIncome: number): number {
  return Math.max(0, PERSONAL_ALLOWANCE - Math.max(0, adjustedNetIncome - TAPER_START) / 2)
}

/** Tax on `amount` of income taxed from `from` upwards through the bands, at the given rates. */
function bandTax(from: number, amount: number, rates: number[]): number {
  const edges = [0, BASIC_BAND, ADDITIONAL_THRESHOLD, Infinity]
  let tax = 0
  for (let b = 0; b < 3; b++) {
    const lo = Math.max(from, edges[b])
    const hi = Math.min(from + amount, edges[b + 1])
    if (hi > lo) tax += (hi - lo) * rates[b]
  }
  return tax
}

/**
 * Income tax on salary (non-savings income) and dividends. The personal allowance is used
 * against salary first; dividends sit on top, and the £500 dividend allowance still uses up band.
 */
export function incomeTax(salary: number, dividends: number) {
  const pa = personalAllowance(salary + dividends)
  const salaryTaxable = Math.max(0, salary - pa)
  const paLeft = Math.max(0, pa - salary)
  const divTaxable = Math.max(0, dividends - paLeft)
  const allowance = Math.min(DIVIDEND_ALLOWANCE, divTaxable)
  return {
    onSalary: bandTax(0, salaryTaxable, INCOME_RATES),
    onDividends: bandTax(salaryTaxable + allowance, divTaxable - allowance, DIVIDEND_RATES),
  }
}

const clamp = (v: number) => Math.max(0, v)

/** Biggest salary the company can pay out of `budget`, including employer NI. */
function maxSalary(budget: number): number {
  if (budget <= NI_SECONDARY_THRESHOLD) return budget
  return NI_SECONDARY_THRESHOLD + (budget - NI_SECONDARY_THRESHOLD) / (1 + EMPLOYER_NI)
}

/**
 * The whole picture for one company salary: corporation tax on what's left, dividends up to
 * the distributable profit and the income limit, then the extra personal tax on top of your job.
 */
function extract(inputs: MixedInputs, salary: number, headroom: number, dividendsAllowed = true): Extraction {
  const job = inputs.jobSalary
  const pension = Math.min(inputs.pension, clamp(inputs.profit))
  const erNI = employerNI(salary)
  const taxable = inputs.profit - pension - salary - erNI
  const ct = corporationTax(taxable)
  // Losses this year eat into profits kept from earlier years
  const distributable = clamp(inputs.retained + taxable - ct)
  const dividends = dividendsAllowed ? Math.min(distributable, clamp(headroom - salary)) : 0

  const before = incomeTax(job, 0).onSalary
  const after = incomeTax(job + salary, dividends)
  const extraIncomeTax = after.onSalary - before
  const eeNI = employeeNI(salary)
  const keep = salary + dividends - eeNI - extraIncomeTax - after.onDividends
  return {
    salary,
    dividends,
    pension,
    corporationTax: ct,
    employerNI: erNI,
    employeeNI: eeNI,
    incomeTax: extraIncomeTax,
    dividendTax: after.onDividends,
    keep,
    leftInCompany: distributable - dividends,
    totalTax: ct + erNI + eeNI + extraIncomeTax + after.onDividends,
  }
}

/**
 * Finds the company salary that leaves you best off. With an income limit, as much as fits under
 * it is taken out and the rest stays in the company; "best off" counts both what you keep and
 * what's left in the company, so it's the mix that pays the least tax.
 */
export function calculateMixed(inputs: MixedInputs): MixedResult {
  const limit = inputs.take === 'basic' ? HIGHER_RATE_START : inputs.take === 'taper' ? TAPER_START : Infinity
  const headroom = clamp(limit - inputs.jobSalary)
  const budget = clamp(inputs.profit - Math.min(inputs.pension, clamp(inputs.profit)))
  const sMax = Math.min(maxSalary(budget), headroom)

  // Every £10, plus the thresholds where the best answer usually sits
  const step = Math.max(10, Math.ceil(sMax / 5000 / 10) * 10)
  const thresholds = [NI_SECONDARY_THRESHOLD, NI_PRIMARY_THRESHOLD, PERSONAL_ALLOWANCE - inputs.jobSalary, HIGHER_RATE_START - inputs.jobSalary]
    .filter((t) => t > 0 && t <= sMax)
  const grid: number[] = []
  for (let s = 0; s < sMax; s += step) grid.push(s)

  const value = (e: Extraction) => e.keep + e.leftInCompany
  let best = extract(inputs, 0, headroom)
  for (const s of [...grid, Math.floor(sMax)]) {
    const e = extract(inputs, s, headroom)
    // Ties go to the lower salary
    if (value(e) > value(best) + 0.5) best = e
  }
  // A familiar threshold (e.g. £12,570) within £10 of the best reads better than an odd figure
  const near = thresholds.map((t) => extract(inputs, t, headroom)).filter((e) => value(e) >= value(best) - 10)
  if (near.length) best = near.reduce((a, b) => (value(b) > value(a) ? b : a))

  const jobTax = incomeTax(inputs.jobSalary, 0).onSalary
  return {
    best,
    dividendsOnly: extract(inputs, 0, headroom),
    salaryOnly: extract(inputs, sMax, headroom, false),
    jobNet: inputs.jobSalary - jobTax - employeeNI(inputs.jobSalary),
    headroom,
  }
}

// ── URL params ───────────────────────────────────────────────────────────────

const NUM: [keyof MixedInputs, string][] = [['jobSalary', 'job'], ['profit', 'p'], ['retained', 'ret'], ['pension', 'pen']]
const KEYS = NUM.map(([, k]) => k).concat('take')
const MODES: TakeMode[] = ['all', 'basic', 'taper']

export const mixedCodec = {
  has: (search: string) => {
    const p = new URLSearchParams(search)
    return KEYS.some((k) => p.has(k))
  },
  decode: (search: string, base: MixedInputs): MixedInputs => {
    const p = new URLSearchParams(search)
    const out = { ...base }
    for (const [f, k] of NUM) {
      const v = Number(p.get(k))
      if (p.has(k) && !isNaN(v) && v >= 0) (out[f] as number) = v
    }
    const take = p.get('take') as TakeMode
    if (MODES.includes(take)) out.take = take
    return out
  },
  merge: (search: string, inputs: MixedInputs, base: MixedInputs) => {
    const p = new URLSearchParams(search)
    KEYS.forEach((k) => p.delete(k))
    for (const [f, k] of NUM) if (inputs[f] !== base[f]) p.set(k, String(inputs[f]))
    if (inputs.take !== base.take) p.set('take', inputs.take)
    return p.toString()
  },
}
