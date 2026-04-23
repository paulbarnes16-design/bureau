'use client'

import { useMemo } from 'react'
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Row { year: number; balance: number; deposits: number }

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

function niceTicks(min: number, max: number, count = 5): number[] {
  if (max <= min) return [min]
  const range = max - min
  const step = range / (count - 1)
  const mag = Math.pow(10, Math.floor(Math.log10(step)))
  let niceStep = Math.ceil(step / mag) * mag
  // Enforce minimum step so formatted labels (1 decimal place) never collide
  const minStep = max >= 1_000_000 ? 100_000 : max >= 1_000 ? 100 : 1
  niceStep = Math.max(niceStep, minStep)
  return Array.from({ length: count }, (_, i) => Math.round(min + i * niceStep)).filter(v => v <= max * 1.15)
}

export default function LineChart({ rows, initialValue }: { rows: Row[]; initialValue: number }) {
  const fmtYAxis = (v: number) => v < initialValue ? '' : fmtY(v)

  const ticks = useMemo(() => {
    const max = Math.max(...rows.map(r => Math.max(r.balance, r.deposits)))
    return niceTicks(initialValue, max)
  }, [rows, initialValue])

  return (
    <div className="w-full h-56 md:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={rows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#5E5E5E', fontFamily: 'var(--font-dm-sans)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtYAxis}
            tick={{ fontSize: 11, fill: '#5E5E5E', fontFamily: 'var(--font-dm-sans)' }}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={[initialValue, 'auto']}
            ticks={ticks}
            allowDataOverflow
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 12 }}
            content={({ payload }) => (
              <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: '#000', paddingLeft: 40 }}>
                {payload?.map((p) => (
                  <div key={p.value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                    {p.value}
                  </div>
                ))}
              </div>
            )}
          />
          <Line
            type="monotone"
            dataKey="balance"
            name="Compound interest"
            stroke="#FF5500"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#FF5500' }}
          />
          <Line
            type="monotone"
            dataKey="deposits"
            name="Deposits"
            stroke="#9EE7FF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#9EE7FF' }}
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  )
}
