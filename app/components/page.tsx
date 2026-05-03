'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import InputPanel from '@/components/InputPanel'
import FAQ from '@/components/FAQ'
import { DEFAULT_INPUTS, calculate, type CalcInputs } from '@/lib/calculate'

const LineChart = dynamic(() => import('@/components/LineChart'), { ssr: false })

// ── Data ───────────────────────────────────────────────────────────────────────

const COLOURS = [
  { name: 'Background',  hex: '#EDEDED', usage: 'Page background'                  },
  { name: 'Elevated',    hex: '#FAFAFA', usage: 'Card surface'                      },
  { name: 'White',       hex: '#FFFFFF', usage: 'Input fields, card inner ring'     },
  { name: 'Black',       hex: '#000000', usage: 'Primary text, active controls'     },
  { name: 'Subdued',     hex: '#5E5E5E', usage: 'Secondary text, labels'            },
  { name: 'IRN',         hex: '#FF5500', usage: 'Accent, compound interest series'  },
  { name: 'Sky Blue',    hex: '#9EE7FF', usage: 'Deposits series'                   },
]

const TYPEFACES = [
  { name: 'Wordmark',         size: 40, weight: 'Ultrabold Italic', cls: 'font-writer text-[40px] leading-none',  sample: 'bureau'      },
  { name: 'Title',            size: 20, weight: 'Bold',             cls: 'font-sans font-bold text-[20px] leading-none', sample: 'Results' },
  { name: 'Display',          size: 40, weight: 'Black',   cls: 'font-condensed text-[40px] leading-none',  sample: '£12,345.67'  },
  { name: 'Body bold',        size: 15, weight: 'Bold',    cls: 'font-sans font-bold text-[15px]',                sample: 'Calculate'   },
  { name: 'Body',             size: 15, weight: 'Regular', cls: 'font-sans text-[15px]',                          sample: 'Compound Interest Calculator' },
  { name: 'Body small bold',  size: 13, weight: 'Bold',    cls: 'font-sans font-bold text-sm',                    sample: 'Edit Values' },
  { name: 'Body small',       size: 13, weight: 'Regular', cls: 'font-sans text-sm',                              sample: 'Adjust for inflation' },
  { name: 'Marginal bold',    size: 11, weight: 'Bold',    cls: 'font-sans font-bold text-[11px]',                sample: 'Inflation adjusted' },
  { name: 'Marginal',         size: 11, weight: 'Regular', cls: 'font-sans text-[11px]',                          sample: 'Inflation adjusted' },
]

const NAV = [
  { id: 'colours',    label: 'Colours',    num: '01' },
  { id: 'typography', label: 'Typography', num: '02' },
  { id: 'cards',      label: 'Cards',      num: '03' },
  { id: 'inputs',     label: 'Inputs',     num: '04' },
  { id: 'controls',   label: 'Controls',   num: '05' },
  { id: 'buttons',    label: 'Buttons',    num: '06' },
  { id: 'results',    label: 'Results',    num: '07' },
  { id: 'chart',      label: 'Chart',      num: '08' },
  { id: 'table',      label: 'Table',      num: '09' },
  { id: 'faq',        label: 'FAQ',        num: '10' },
  { id: 'header',     label: 'Header',     num: '11' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function Section({ id, num, title, children }: { id: string; num: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-14 border-b border-black/8">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-subdued mb-2">{num}</p>
        <h2 className="font-sans font-black text-[42px] leading-none tracking-tight text-black">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-subdued mb-2">{children}</p>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-elevated rounded-2xl shadow-card ring-2 ring-inset ring-white ${className}`}>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-12 h-6 rounded-full flex-shrink-0 transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-irn' : 'bg-transparent ring-1 ring-inset ring-black'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-md transition-transform duration-200 ${
        checked ? 'bg-white translate-x-6' : 'bg-black translate-x-0'
      }`} />
    </button>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ComponentsPage() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS)
  const [toggleA, setToggleA] = useState(false)
  const [toggleB, setToggleB] = useState(true)
  const [seg, setSeg] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')

  const patch = (u: Partial<CalcInputs>) => setInputs((p) => ({ ...p, ...u }))
  const result = useMemo(() => calculate(inputs), [inputs])
  const sym = inputs.currency.symbol
  const fmt = (n: number) => {
    const abs = Math.abs(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return n < 0 ? `-${sym}${abs}` : `${sym}${abs}`
  }

  return (
    <div className="grid grid-cols-[220px_1fr] min-h-screen bg-background">

      {/* ── Sidebar ── */}
      <nav className="sticky top-0 h-screen overflow-y-auto bg-elevated border-r border-black/8 px-6 py-8 flex flex-col">
        <div>
          <p className="font-writer text-lg text-black">bureau</p>
          <p className="font-sans text-xs text-subdued mt-0.5 mb-8">component reference</p>
        </div>
        <ol className="space-y-0">
          {NAV.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="flex items-center gap-3 py-1.5 text-[13px] font-sans text-black/60 hover:text-irn transition-colors group"
              >
                <span className="font-mono text-[10px] text-subdued w-5 flex-shrink-0 group-hover:text-irn transition-colors">{item.num}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
        <div className="mt-auto pt-8 border-t border-black/8">
          <Link href="/" className="font-sans text-xs text-subdued underline hover:text-black transition-colors">
            ← Back to calculator
          </Link>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="px-14 max-w-[900px]">

        {/* 01 Colours */}
        <Section id="colours" num="01" title="Colour">
          <div className="grid grid-cols-7 gap-3">
            {COLOURS.map((c) => (
              <div key={c.hex} className="space-y-2">
                <div className="aspect-square rounded-xl border border-black/8" style={{ background: c.hex }} />
                <p className="font-sans font-bold text-[11px] text-black">{c.name}</p>
                <p className="font-mono text-[10px] text-subdued">{c.hex}</p>
                <p className="font-sans text-[10px] text-subdued leading-snug">{c.usage}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 02 Typography */}
        <Section id="typography" num="02" title="Typography">
          <div className="divide-y divide-black/8">
            {TYPEFACES.map((t) => (
              <div key={t.name} className="grid grid-cols-[160px_80px_1fr] gap-6 items-center py-4">
                <span className="font-mono text-[10px] text-subdued uppercase tracking-wide">{t.name}</span>
                <span className="font-mono text-[10px] text-subdued">{t.size}px · {t.weight}</span>
                <span className={`${t.cls} text-black`}>{t.sample}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 03 Cards */}
        <Section id="cards" num="03" title="Cards">
          <div className="space-y-4">
            <Label>Standard card</Label>
            <Card className="p-5">
              <p className="font-sans text-sm text-black">bg-elevated · rounded-2xl · shadow-card · ring-2 ring-inset ring-white</p>
            </Card>
            <Label>Shadow spec</Label>
            <p className="font-mono text-[10px] text-subdued leading-relaxed">
              -6px -5px 7.5px rgba(255,255,255,0.4) · 6px 5px 14px rgba(0,0,0,0.12)
            </p>
          </div>
        </Section>

        {/* 04 Inputs */}
        <Section id="inputs" num="04" title="Inputs">
          <div className="grid grid-cols-[1fr_1fr] gap-8 items-start">
            <div>
              <Label>InputPanel — live</Label>
              <InputPanel values={inputs} onChange={patch} />
            </div>
            <div className="space-y-4 pt-6">
              <div>
                <Label>Currency input</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-sans text-black pointer-events-none">{sym}</span>
                  <div className="w-full bg-white ring-1 ring-inset ring-black/[0.12] rounded-xl pl-7 pr-4 h-12 flex items-center text-base font-sans text-black">
                    {inputs.initialInvestment.toLocaleString('en-GB')}
                  </div>
                </div>
                <p className="font-mono text-[10px] text-subdued mt-1.5">prefix overlay · pl-7 pr-4 · symbol always visible</p>
              </div>
              <div>
                <Label>Percent input</Label>
                <div className="relative">
                  <div className="w-full bg-white ring-1 ring-inset ring-black/[0.12] rounded-xl pl-4 pr-8 h-12 flex items-center text-base font-sans text-black">
                    {inputs.interestRate}
                  </div>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-sans text-black pointer-events-none">%</span>
                </div>
                <p className="font-mono text-[10px] text-subdued mt-1.5">suffix overlay · pl-4 pr-8 · symbol always visible</p>
              </div>
              <div>
                <Label>Duration (2-col)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <div className="bg-white ring-1 ring-inset ring-black/[0.12] rounded-xl pl-4 pr-14 h-12 flex items-center text-base font-sans text-black">
                      {inputs.durationYears}
                    </div>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-sans text-black pointer-events-none">year{inputs.durationYears !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="relative">
                    <div className="bg-white ring-1 ring-inset ring-black/[0.12] rounded-xl pl-4 pr-14 h-12 flex items-center text-base font-sans text-black">
                      {inputs.durationMonths}
                    </div>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-sans text-black pointer-events-none">month{inputs.durationMonths !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 05 Controls */}
        <Section id="controls" num="05" title="Controls">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Label>Segmented control</Label>
                <div className="flex rounded-xl ring-1 ring-inset ring-black/[0.12] p-1 gap-1">
                  {(['weekly', 'monthly', 'yearly'] as const).map((o) => (
                    <button key={o} type="button" onClick={() => setSeg(o)}
                      className={`relative flex-1 h-[38px] text-[13px] font-sans rounded-lg outline-none ${
                        seg === o ? 'text-white' : 'text-black hover:bg-black/5'
                      }`}>
                      {seg === o && (
                        <motion.div layoutId="seg-pill" className="absolute inset-0 bg-black rounded-lg"
                          transition={{ type: 'spring', damping: 30, stiffness: 400 }} />
                      )}
                      <span className="relative z-10 capitalize">{o.charAt(0).toUpperCase() + o.slice(1)}</span>
                    </button>
                  ))}
                </div>
                <p className="font-mono text-[10px] text-subdued mt-1.5">ring-1 ring-inset ring-black/[0.12] · active pill: bg-black · spring animation</p>
              </div>
              <div>
                <Label>Currency expand (inline)</Label>
                <p className="font-sans text-xs text-subdued">Chevron rotates 90° · AnimatePresence height animation · stays open until chevron tapped</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <Label>Toggle — off</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-sans text-black">Adjust for inflation</span>
                  <Toggle checked={toggleA} onChange={setToggleA} />
                </div>
                <p className="font-mono text-[10px] text-subdued mt-1.5">w-12 h-6 · no fill · ring-1 ring-inset ring-black · black handle</p>
              </div>
              <div>
                <Label>Toggle — on</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-sans text-black">Adjust for inflation</span>
                  <Toggle checked={toggleB} onChange={setToggleB} />
                </div>
                <p className="font-mono text-[10px] text-subdued mt-1.5">bg-irn (#FF5500) · white handle · translate-x-6</p>
              </div>
            </div>
          </div>
        </Section>

        {/* 06 Buttons */}
        <Section id="buttons" num="06" title="Buttons">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Primary — Calculate</Label>
              <button className="w-full bg-black text-white font-sans font-bold text-base py-4 rounded-2xl">Calculate</button>
              <p className="font-mono text-[10px] text-subdued">bg-black · py-4 · rounded-2xl · font-bold</p>
            </div>
            <div className="space-y-2">
              <Label>Primary (mobile) — Edit Values</Label>
              <button className="w-full bg-black rounded-xl py-3.5 text-sm font-sans font-bold text-white">Edit Values</button>
              <p className="font-mono text-[10px] text-subdued">bg-black · py-3.5 · rounded-xl · font-bold · text-white</p>
            </div>
            <div className="space-y-2">
              <Label>Copy button</Label>
              <button className="text-irn hover:opacity-70 transition-opacity">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                  <rect x="6" y="6" width="9" height="9" rx="1.5" />
                  <path d="M4 12H3a1.5 1.5 0 01-1.5-1.5V3A1.5 1.5 0 013 1.5h7.5A1.5 1.5 0 0112 3v1" />
                </svg>
              </button>
              <p className="font-mono text-[10px] text-subdued">text-irn · hover:opacity-70</p>
            </div>
            <div className="space-y-2">
              <Label>Inflation adjusted tag</Label>
              <span className="inline-block px-1.5 py-0.5 bg-black text-white text-[11px] font-sans font-bold rounded-[4px] leading-none">Inflation adjusted</span>
              <p className="font-mono text-[10px] text-subdued">px-1.5 py-0.5 · rounded-[4px] · font-bold · text-[11px]</p>
            </div>
            <div className="space-y-2">
              <Label>Close (X) button</Label>
              <button className="text-black">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <path d="M2 2l14 14M16 2L2 16" />
                </svg>
              </button>
              <p className="font-mono text-[10px] text-subdued">text-black · 18×18 SVG</p>
            </div>
          </div>
        </Section>

        {/* 07 Results */}
        <Section id="results" num="07" title="Results">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sans font-bold text-[20px] text-black">Results</h2>
              {inputs.adjustForInflation && (
                <span className="px-1.5 py-0.5 bg-black text-white text-[11px] font-sans font-bold rounded-[4px] leading-none">
                  Inflation adjusted
                </span>
              )}
            </div>
            <p className="text-xs font-sans text-subdued mb-1">Future value</p>
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="font-condensed text-[40px] text-black leading-none">{fmt(result.futureValue)}</span>
            </div>
            <p className="text-xs font-sans text-subdued mb-1">Interest earned</p>
            <div className="flex items-center justify-between gap-3 mb-5">
              <span className="font-condensed text-[40px] text-black leading-none">{fmt(result.interestEarned)}</span>
            </div>
            <p className="text-sm font-sans text-black leading-relaxed">
              Over <strong>{inputs.durationYears} year{inputs.durationYears !== 1 ? 's' : ''}</strong>, starting with{' '}
              <strong>{sym}{Math.round(result.totalDeposits).toLocaleString('en-GB')}</strong> returning{' '}
              <strong>{inputs.interestRate}%</strong> annually and {inputs.additionalPaymentsFreq} payments of{' '}
              <strong>{sym}{inputs.additionalPayments.toLocaleString('en-GB')}</strong>.
            </p>
          </Card>
        </Section>

        {/* 08 Chart */}
        <Section id="chart" num="08" title="Chart">
          <Card className="p-5">
            <LineChart rows={result.rows} initialValue={inputs.initialInvestment} inflation={inputs.adjustForInflation} />
          </Card>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <Label>Compound interest series</Label>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-irn flex-shrink-0" />
                <span className="font-mono text-[10px] text-subdued">#FF5500 · strokeWidth 2</span>
              </div>
            </div>
            <div>
              <Label>Deposits series</Label>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-sky-blue flex-shrink-0" />
                <span className="font-mono text-[10px] text-subdued">#9EE7FF · strokeWidth 2</span>
              </div>
            </div>
          </div>
          <p className="font-mono text-[10px] text-subdued mt-3">Y-axis starts at initial investment · custom 10×10 square legend · domain function prevents rounding</p>
        </Section>

        {/* 09 Table */}
        <Section id="table" num="09" title="Table">
          <Card className="p-5">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm font-sans border-collapse">
                <thead>
                  <tr className="bg-background">
                    {['Year', 'Deposits', inputs.adjustForInflation ? 'Real interest earned' : 'Interest earned', 'Balance'].map((h) => (
                      <th key={h} className="text-left text-xs font-bold text-black px-3 py-3 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={row.year} className={i % 2 === 0 ? 'bg-white' : 'bg-background/50'}>
                      <td className="px-3 py-3 text-black">{row.year}</td>
                      <td className="px-3 py-3 text-black">{row.deposits.toLocaleString('en-GB')}</td>
                      <td className="px-3 py-3 text-black">{row.interestEarned.toLocaleString('en-GB')}</td>
                      <td className="px-3 py-3 text-black">{row.balance.toLocaleString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <p className="font-mono text-[10px] text-subdued mt-3">Even rows: bg-white · Odd rows: bg-background/50 · Header: bg-background rounded corners · Desktop: separate card from chart</p>
        </Section>

        {/* 10 FAQ */}
        <Section id="faq" num="10" title="FAQ">
          <Card className="p-5">
            <h2 className="font-sans font-bold text-[20px] text-black mb-3">FAQs</h2>
            <FAQ />
          </Card>
        </Section>

        {/* 11 Header */}
        <Section id="header" num="11" title="Header">
          <div>
            <span className="font-writer text-[32px] leading-none text-black">bureau</span>
            <p className="font-sans text-[15px] text-black mt-1">Compound Interest Calculator</p>
          </div>
          <p className="font-mono text-[10px] text-subdued mt-3">font-writer text-[40px] leading-none · no card · subtitle font-sans text-[15px] · mt-1</p>
        </Section>

        <footer className="py-12 font-mono text-[10px] text-subdued">
          bureau · component reference
        </footer>
      </main>
    </div>
  )
}
