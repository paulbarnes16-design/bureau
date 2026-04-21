'use client'

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
    <div className="bg-white border border-black/10 rounded-xl p-3 shadow-md text-xs font-sans">
      <p className="font-bold text-black mb-1.5">Year {label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium text-black">
            {new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

function fmtY(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}m`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`
  return String(v)
}

export default function LineChart({ rows }: { rows: Row[] }) {

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
            tickFormatter={fmtY}
            tick={{ fontSize: 11, fill: '#5E5E5E', fontFamily: 'var(--font-dm-sans)' }}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={[(dataMin: number) => dataMin, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: '#5E5E5E' }}>
                {value}
              </span>
            )}
            wrapperStyle={{ paddingTop: 12 }}
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
