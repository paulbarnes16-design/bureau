import { DEFAULT_INPUTS, CURRENCIES, type CalcInputs, type Freq } from './calculate'

const FREQ_ENC: Record<Freq, string> = { weekly: 'w', monthly: 'm', yearly: 'y' }
const FREQ_DEC: Record<string, Freq> = { w: 'weekly', m: 'monthly', y: 'yearly' }

export function encodeInputs(inputs: CalcInputs): string {
  const p = new URLSearchParams()
  const d = DEFAULT_INPUTS

  if (inputs.initialInvestment !== d.initialInvestment)   p.set('i',   String(inputs.initialInvestment))
  if (inputs.interestRate !== d.interestRate)             p.set('r',   String(inputs.interestRate))
  if (inputs.compoundFreq !== d.compoundFreq)             p.set('cf',  FREQ_ENC[inputs.compoundFreq])
  if (inputs.durationYears !== d.durationYears)           p.set('dy',  String(inputs.durationYears))
  if (inputs.durationMonths !== d.durationMonths)         p.set('dm',  String(inputs.durationMonths))
  if (inputs.additionalPayments !== d.additionalPayments) p.set('ap',  String(inputs.additionalPayments))
  if (inputs.additionalPaymentsFreq !== d.additionalPaymentsFreq) p.set('apf', FREQ_ENC[inputs.additionalPaymentsFreq])
  if (inputs.adjustForInflation !== d.adjustForInflation) p.set('inf', inputs.adjustForInflation ? '1' : '0')
  if (inputs.inflationRate !== d.inflationRate)           p.set('ir',  String(inputs.inflationRate))
  if (inputs.currency.code !== d.currency.code)           p.set('cur', inputs.currency.code)
  if (inputs.managementFee !== d.managementFee)           p.set('mf',  String(inputs.managementFee))
  if (inputs.depositGrowthRate !== d.depositGrowthRate)   p.set('dg',  String(inputs.depositGrowthRate))
  if (inputs.depositsAtStart !== d.depositsAtStart)       p.set('das', inputs.depositsAtStart ? '1' : '0')
  if (inputs.withdrawals !== d.withdrawals)               p.set('wd',  String(inputs.withdrawals))
  if (inputs.withdrawalsFreq !== d.withdrawalsFreq)       p.set('wf',  FREQ_ENC[inputs.withdrawalsFreq])
  if (inputs.taxFreeAmount !== d.taxFreeAmount)           p.set('tfa', String(inputs.taxFreeAmount))
  if (inputs.taxRate !== d.taxRate)                       p.set('tr',  String(inputs.taxRate))

  return p.toString()
}

export function decodeInputs(search: string, base: CalcInputs): CalcInputs {
  const p = new URLSearchParams(search)
  if (p.size === 0) return base
  const r = { ...base }

  const num = (key: string, fallback: number) => { const v = Number(p.get(key)); return isNaN(v) ? fallback : v }

  if (p.has('i'))   r.initialInvestment    = num('i', base.initialInvestment)
  if (p.has('r'))   r.interestRate         = num('r', base.interestRate)
  if (p.has('cf'))  r.compoundFreq         = FREQ_DEC[p.get('cf')!] ?? base.compoundFreq
  if (p.has('dy'))  r.durationYears        = num('dy', base.durationYears)
  if (p.has('dm'))  r.durationMonths       = num('dm', base.durationMonths)
  if (p.has('ap'))  r.additionalPayments   = num('ap', base.additionalPayments)
  if (p.has('apf')) r.additionalPaymentsFreq = FREQ_DEC[p.get('apf')!] ?? base.additionalPaymentsFreq
  if (p.has('inf')) r.adjustForInflation   = p.get('inf') === '1'
  if (p.has('ir'))  r.inflationRate        = num('ir', base.inflationRate)
  if (p.has('cur')) { const c = CURRENCIES.find(x => x.code === p.get('cur')); if (c) r.currency = c }
  if (p.has('mf'))  r.managementFee        = num('mf', base.managementFee)
  if (p.has('dg'))  r.depositGrowthRate    = num('dg', base.depositGrowthRate)
  if (p.has('das')) r.depositsAtStart      = p.get('das') === '1'
  if (p.has('wd'))  r.withdrawals          = num('wd', base.withdrawals)
  if (p.has('wf'))  r.withdrawalsFreq      = FREQ_DEC[p.get('wf')!] ?? base.withdrawalsFreq
  if (p.has('tfa')) r.taxFreeAmount        = num('tfa', base.taxFreeAmount)
  if (p.has('tr'))  r.taxRate              = num('tr', base.taxRate)

  return r
}
