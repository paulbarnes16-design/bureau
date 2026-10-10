'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { MortgageYear } from '@/lib/mortgage'

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: number
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-black/10 rounded-xl p-3 shadow-md text-sm font-sans">
      <p className="font-bold text-black mb-1.5">Year {label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold text-black">
            {new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

function fmtY(v: number) {
  if (v >= 1_000_000) return `${+(v / 1_000_000).toFixed(1)}m`
  if (v >= 1_000) return `${+(v / 1_000).toFixed(1)}k`
  return String(v)
}

function niceTicks(max: number, count = 5): number[] {
  if (max <= 0) return [0]
  const step = max / (count - 1)
  const mag = Math.pow(10, Math.floor(Math.log10(step)))
  const niceStep = Math.max(Math.ceil(step / mag) * mag, 100)
  return Array.from({ length: count }, (_, i) => Math.round(i * niceStep))
}

/** Cumulative principal and interest paid by the end of each year. */
export default function MortgageChart({ rows }: { rows: MortgageYear[] }) {
  const { ticks, domainMax } = useMemo(() => {
    const max = Math.max(...rows.map((r) => r.cumulativeInterest + r.cumulativePrincipal))
    const ticks = niceTicks(max)
    return { ticks, domainMax: ticks[ticks.length - 1] ?? max }
  }, [rows])

  return (
    <div className="w-full h-56 md:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#5E5E5E', fontFamily: 'var(--font-pangram-sans)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtY}
            tick={{ fontSize: 11, fill: '#5E5E5E', fontFamily: 'var(--font-pangram-sans)' }}
            axisLine={false}
            tickLine={false}
            width={40}
            ticks={ticks}
            domain={[0, domainMax]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Legend
            wrapperStyle={{ paddingTop: 12 }}
            content={({ payload }) => (
              <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-pangram-sans)', fontSize: 12, color: '#000', paddingLeft: 40 }}>
                {payload?.map((p) => (
                  <div key={p.value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                    {p.value}
                  </div>
                ))}
              </div>
            )}
          />
          <Bar dataKey="cumulativePrincipal" name="Loan repaid" stackId="a" fill="rgba(255, 94, 108, 0.3)" />
          <Bar dataKey="cumulativeInterest" name="Interest paid" stackId="a" fill="#FF5E6C" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
