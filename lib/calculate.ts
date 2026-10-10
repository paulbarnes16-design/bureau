export type Freq = 'weekly' | 'monthly' | 'yearly'

export const FREQ_PER_YEAR: Record<Freq, number> = {
  weekly: 52,
  monthly: 12,
  yearly: 1,
}

export const FREQ_LABELS: Record<Freq, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

export const CURRENCIES = [
  { code: 'GBP', symbol: '£',   name: 'British Pound'    },
  { code: 'USD', symbol: '$',   name: 'US Dollar'         },
  { code: 'EUR', symbol: '€',   name: 'Euro'              },
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee'     },
  { code: 'BRL', symbol: 'R$',  name: 'Brazilian Real'   },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso'     },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen'     },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar'  },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar' },
]

export interface Currency {
  code: string
  symbol: string
  name: string
}

export interface CalcInputs {
  initialInvestment: number
  interestRate: number
  compoundFreq: Freq
  durationYears: number
  durationMonths: number
  additionalPayments: number
  additionalPaymentsFreq: Freq
  adjustForInflation: boolean
  inflationRate: number
  currency: Currency
  // Advanced
  managementFee: number
  depositGrowthRate: number
  depositsAtStart: boolean
  withdrawals: number
  withdrawalsFreq: Freq
  taxFreeAmount: number
  taxRate: number
}

export interface YearRow {
  year: number
  deposits: number
  cumulativeDeposits: number
  interestEarned: number
  balance: number
}

export interface CalcResult {
  futureValue: number
  interestEarned: number
  totalDeposits: number
  rows: YearRow[]
}

export const DEFAULT_INPUTS: CalcInputs = {
  initialInvestment: 1000,
  interestRate: 5,
  compoundFreq: 'monthly',
  durationYears: 5,
  durationMonths: 0,
  additionalPayments: 0,
  additionalPaymentsFreq: 'monthly',
  adjustForInflation: false,
  inflationRate: 2.5,
  currency: CURRENCIES[0],
  managementFee: 0,
  depositGrowthRate: 0,
  depositsAtStart: false,
  withdrawals: 0,
  withdrawalsFreq: 'monthly',
  taxFreeAmount: 0,
  taxRate: 0,
}

export function calculate(raw: CalcInputs): CalcResult {
  // Rates are capped at 0–100% so a typed or linked value can't overflow the maths
  const pct = (v: number) => Math.min(100, Math.max(0, v))
  const inputs: CalcInputs = {
    ...raw,
    interestRate: pct(raw.interestRate),
    inflationRate: pct(raw.inflationRate),
    managementFee: pct(raw.managementFee),
    depositGrowthRate: pct(raw.depositGrowthRate),
    taxRate: pct(raw.taxRate),
  }
  const {
    initialInvestment, interestRate, compoundFreq,
    durationYears, durationMonths,
    additionalPayments, additionalPaymentsFreq,
    adjustForInflation, inflationRate,
    managementFee, depositGrowthRate, depositsAtStart,
    withdrawals, withdrawalsFreq,
    taxFreeAmount, taxRate,
  } = inputs

  const n = FREQ_PER_YEAR[compoundFreq]
  const ppy = FREQ_PER_YEAR[additionalPaymentsFreq]
  const wpy = FREQ_PER_YEAR[withdrawalsFreq]
  const rPeriod = interestRate / 100 / n
  const feePeriod = managementFee / 100 / n
  // Capped so a typed or linked value can't make the loop run forever
  const totalYears = Math.min(100, durationYears + durationMonths / 12)
  const totalPeriods = Math.round(n * totalYears)
  const wdPerPeriod = withdrawals * wpy / n
  const growthRate = depositGrowthRate / 100

  function deflate(v: number, years: number): number {
    return adjustForInflation && years > 0 ? v / Math.pow(1 + inflationRate / 100, years) : v
  }

  let balance = initialInvestment
  let cumNetDeps = initialInvestment
  const rows: YearRow[] = []

  rows.push({
    year: 0,
    deposits: initialInvestment,
    cumulativeDeposits: initialInvestment,
    interestEarned: 0,
    balance: initialInvestment,
  })

  let prevRealBal = initialInvestment
  let prevNomBal = initialInvestment
  const maxYear = Math.ceil(totalYears)

  for (let y = 1; y <= maxYear; y++) {
    const startPeriod = Math.round(n * (y - 1)) + 1
    const endPeriod = Math.min(Math.round(n * y), totalPeriods)
    if (startPeriod > totalPeriods) break

    let yearDeps = 0
    let yearWds = 0

    for (let p = startPeriod; p <= endPeriod; p++) {
      const completedYears = Math.floor((p - 1) / n)
      // Count how many contribution payments fall due in this period.
      // floor(p * ppy / n) - floor((p-1) * ppy / n) gives 0, 1, or more payments per period,
      // correctly handling all frequency combinations (annual/monthly, weekly/monthly, etc.)
      const newPayments = Math.floor(p * ppy / n) - Math.floor((p - 1) * ppy / n)
      const dep = additionalPayments * newPayments * Math.pow(1 + growthRate, completedYears)

      if (depositsAtStart) balance += dep
      balance = balance * (1 + rPeriod) * (1 - feePeriod)
      if (!depositsAtStart) balance += dep
      const wd = Math.min(wdPerPeriod, balance)
      balance -= wd

      yearDeps += dep
      yearWds += wd
    }

    const netDepsThisYear = yearDeps - yearWds
    cumNetDeps += netDepsThisYear

    // Apply tax annually on nominal interest above tax-free allowance
    if (taxRate > 0) {
      const nomInterest = balance - prevNomBal - netDepsThisYear
      const taxable = Math.max(0, nomInterest - taxFreeAmount)
      balance = Math.max(0, balance - taxable * taxRate / 100)
    }
    prevNomBal = balance

    const realBal = deflate(balance, y)
    const interest = Math.round(realBal - prevRealBal - netDepsThisYear)

    rows.push({
      year: y,
      deposits: Math.round(netDepsThisYear),
      cumulativeDeposits: Math.round(cumNetDeps),
      interestEarned: interest,
      balance: Math.round(realBal),
    })

    prevRealBal = realBal
  }

  const finalRow = rows[rows.length - 1]
  const futureValue = finalRow.balance
  const totalDeposits = finalRow.cumulativeDeposits
  const interestEarned = futureValue - totalDeposits

  return { futureValue, interestEarned, totalDeposits, rows }
}
