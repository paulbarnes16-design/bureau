import { LUMP_SUM_ALLOWANCE } from './pension'

export interface DrawdownInputs {
  pot: number
  /** Take 25% tax-free cash up front (capped by the Lump Sum Allowance) before drawing an income */
  takeLumpSum: boolean
  startAge: number
  /** Income is sized to run the pot down to zero at this age */
  untilAge: number
  growth: number
  fee: number
  /** Income rises with inflation and figures are shown in today's money */
  adjustForInflation: boolean
  inflationRate: number
}

export interface DrawdownYear {
  age: number
  income: number
  growth: number
  pot: number
}

export interface DrawdownResult {
  lumpSum: number
  /** Pot left to draw an income from */
  drawdownPot: number
  /** Monthly income (in today's money if adjusting for inflation), before tax */
  monthlyIncome: number
  totalIncome: number
  /** 4% of the drawdown pot a year, as a monthly figure */
  monthlyAt4: number
  years: number
  rows: DrawdownYear[]
}

/** Monthly growth after fees, and monthly inflation, as rates. */
function monthlyRates(raw: DrawdownInputs) {
  const pct = (v: number) => Math.min(100, Math.max(0, v))
  const inputs = { ...raw, growth: pct(raw.growth), fee: pct(raw.fee), inflationRate: pct(raw.inflationRate) }
  const growth = (1 + inputs.growth / 100 / 12) * (1 - inputs.fee / 100 / 12) - 1
  const inflation = inputs.adjustForInflation ? Math.pow(1 + inputs.inflationRate / 100, 1 / 12) - 1 : 0
  return { growth, inflation }
}

export function calculateDrawdown(inputs: DrawdownInputs): DrawdownResult {
  const lumpSum = inputs.takeLumpSum ? Math.min(inputs.pot * 0.25, LUMP_SUM_ALLOWANCE) : 0
  const drawdownPot = inputs.pot - lumpSum
  // Capped so a typed or linked value can't make the loop run forever
  const years = Math.min(100, Math.max(0, inputs.untilAge - inputs.startAge))
  const n = years * 12
  const { growth, inflation } = monthlyRates(inputs)

  // Real (inflation-adjusted) monthly return; income is level in today's money.
  // Withdrawals are taken at the start of each month.
  const r = (1 + growth) / (1 + inflation) - 1
  const monthlyIncome =
    n === 0 ? 0 : r === 0 ? drawdownPot / n : (drawdownPot * r) / ((1 - Math.pow(1 + r, -n)) * (1 + r))

  // Simulate in today's money, so the table and chart match the headline figures
  let pot = drawdownPot
  const rows: DrawdownYear[] = [{ age: inputs.startAge, income: 0, growth: 0, pot: Math.round(pot) }]
  let yearIncome = 0
  let yearGrowth = 0
  for (let m = 1; m <= n; m++) {
    pot -= monthlyIncome
    const g = pot * r
    pot += g
    yearIncome += monthlyIncome
    yearGrowth += g
    if (m % 12 === 0) {
      rows.push({
        age: inputs.startAge + m / 12,
        income: Math.round(yearIncome),
        growth: Math.round(yearGrowth),
        pot: Math.max(0, Math.round(pot)),
      })
      yearIncome = 0
      yearGrowth = 0
    }
  }

  return {
    lumpSum,
    drawdownPot,
    monthlyIncome,
    totalIncome: monthlyIncome * n,
    monthlyAt4: (drawdownPot * 0.04) / 12,
    years,
    rows,
  }
}
