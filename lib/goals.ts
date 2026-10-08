/**
 * Monthly saving needed to reach `target` in `years`, starting from `saved`,
 * with interest compounded monthly and deposits at the end of each month.
 */
export function monthlyToReach(target: number, saved: number, ratePct: number, years: number): number {
  const n = Math.round(years * 12)
  if (n <= 0) return Math.max(0, target - saved)
  const i = ratePct / 100 / 12
  const growth = Math.pow(1 + i, n)
  const shortfall = target - saved * growth
  if (shortfall <= 0) return 0
  return i === 0 ? shortfall / n : (shortfall * i) / (growth - 1)
}

/** Exact years for money to double at `ratePct`, compounded `perYear` times a year. */
export function yearsToDouble(ratePct: number, perYear = 1): number {
  if (ratePct <= 0) return Infinity
  return Math.log(2) / (perYear * Math.log(1 + ratePct / 100 / perYear))
}

/** Rule of 72 estimate of years to double. */
export function ruleOf72(ratePct: number): number {
  return ratePct > 0 ? 72 / ratePct : Infinity
}

export const gbp = (n: number, dp = 0) =>
  `£${n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`
