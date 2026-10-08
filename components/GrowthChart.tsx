'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DataPoint {
  year: number
  balance: number
  contributions: number
  interest: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: number
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const contributions = payload.find((p) => p.name === 'Contributions')?.value ?? 0
  const interest = payload.find((p) => p.name === 'Growth')?.value ?? 0
  const total = contributions + interest

  return (
    <div
      style={{ background: '#F2F0EB', border: '1px solid rgba(0,0,0,0.1)' }}
      className="rounded-lg p-4 shadow-lg font-sans"
    >
      <p className="text-[10px] font-sans tracking-[0.1em] uppercase text-subdued mb-2">
        Year {label}
      </p>
      <p className="font-sans font-black text-xl text-black leading-none mb-3">
        £{total.toLocaleString('en-GB')}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-8 text-xs">
          <span className="flex items-center gap-1.5 font-sans text-subdued">
            <span className="inline-block w-2 h-2 rounded-full bg-sky-blue" />
            Contributions
          </span>
          <span className="font-sans font-bold text-black">
            £{contributions.toLocaleString('en-GB')}
          </span>
        </div>
        <div className="flex items-center justify-between gap-8 text-xs">
          <span className="flex items-center gap-1.5 font-sans text-subdued">
            <span className="inline-block w-2 h-2 rounded-full bg-irn" />
            Growth
          </span>
          <span className="font-sans font-bold text-irn">
            £{interest.toLocaleString('en-GB')}
          </span>
        </div>
      </div>
    </div>
  )
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}m`
  if (value >= 1_000) return `£${(value / 1_000).toFixed(0)}k`
  return `£${value}`
}

export default function GrowthChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="w-full h-72 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="gradContrib" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#FF5E6C" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FF5E6C" stopOpacity={0.15} />
            </linearGradient>
            <linearGradient id="gradGrowth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#FF5E6C" stopOpacity={0.95} />
              <stop offset="95%" stopColor="#FF5E6C" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis
            dataKey="year"
            tickFormatter={(v) => `Yr ${v}`}
            tick={{ fontSize: 10, fill: '#5E5E5E', fontFamily: 'var(--font-plex-mono)' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 10, fill: '#5E5E5E', fontFamily: 'var(--font-plex-mono)' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ fontFamily: 'var(--font-plex-mono)', fontSize: 11, color: '#5E5E5E' }}>
                {value}
              </span>
            )}
            wrapperStyle={{ paddingTop: '16px' }}
          />
          <Area
            type="monotone"
            dataKey="contributions"
            name="Contributions"
            stackId="1"
            stroke="rgba(255, 94, 108, 0.3)"
            fill="url(#gradContrib)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="interest"
            name="Growth"
            stackId="1"
            stroke="#FF5E6C"
            fill="url(#gradGrowth)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
