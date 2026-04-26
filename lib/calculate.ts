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
}

export function calculate(inputs: CalcInputs): CalcResult {
  const {
    initialInvestment, interestRate, compoundFreq,
    durationYears, durationMonths,
    additionalPayments, additionalPaymentsFreq,
    adjustForInflation, inflationRate,
  } = inputs

  const n = FREQ_PER_YEAR[compoundFreq]
  const ppy = FREQ_PER_YEAR[additionalPaymentsFreq]
  const r = interestRate / 100
  const rPeriod = n > 0 ? r / n : 0
  const totalYears = durationYears + durationMonths / 12
  const payPerPeriod = additionalPayments * ppy / n

  function nominalBalance(periods: number): number {
    if (periods === 0) return initialInvestment
    const cf = Math.pow(1 + rPeriod, periods)
    const annuity = rPeriod === 0
      ? payPerPeriod * periods
      : payPerPeriod * (cf - 1) / rPeriod
    return initialInvestment * cf + annuity
  }

  function realValue(nominal: number, years: number): number {
    if (!adjustForInflation || years === 0) return nominal
    return nominal / Math.pow(1 + inflationRate / 100, years)
  }

  const totalPeriods = Math.round(n * totalYears)
  const nomFV = nominalBalance(totalPeriods)
  const futureValue = realValue(nomFV, totalYears)
  const totalDeposits = initialInvestment + additionalPayments * ppy * totalYears
  const interestEarned = futureValue - totalDeposits

  const maxYears = Math.ceil(totalYears)
  const rows: YearRow[] = []
  let prevBal = 0
  let cumDeps = 0
  for (let y = 0; y <= maxYears; y++) {
    const nomBal = nominalBalance(Math.round(n * y))
    const bal = realValue(nomBal, y)
    const deps = y === 0 ? initialInvestment : additionalPayments * ppy
    cumDeps += deps
    const interest = Math.round(bal - prevBal - deps)
    rows.push({
      year: y,
      deposits: Math.round(deps),
      cumulativeDeposits: Math.round(cumDeps),
      interestEarned: interest,
      balance: Math.round(bal),
    })
    prevBal = bal
  }

  return { futureValue, interestEarned, totalDeposits, rows }
}
