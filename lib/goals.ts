export const gbp = (n: number, dp = 0) =>
  `£${n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`
