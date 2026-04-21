'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import InputPanel from '@/components/InputPanel'
import CurrencyPicker from '@/components/CurrencyPicker'
import FAQ from '@/components/FAQ'
import {
  DEFAULT_INPUTS, calculate,
  type CalcInputs, type Currency,
} from '@/lib/calculate'

const LineChart = dynamic(() => import('@/components/LineChart'), { ssr: false })

// ── Data ───────────────────────────────────────────────────────────────────────

const COLOURS = [
  { name: 'White',       hex: '#FFFFFF', token: '--c-white',      usage: 'Card inner surface'              },
  { name: 'Background',  hex: '#EDEDED', token: '--c-background',  usage: 'Page background'                 },
  { name: 'Elevated',    hex: '#FAFAFA', token: '--c-elevated',    usage: 'Card, popover, nav surface'      },
  { name: 'Subdued',     hex: '#5E5E5E', token: '--c-subdued',     usage: 'Secondary text, labels'          },
  { name: 'Black',       hex: '#000000', token: '--c-black',       usage: 'Primary text, active controls'   },
  { name: 'IRN',         hex: '#FF5500', token: '--c-irn',         usage: 'Compound interest series, accents'},
  { name: 'Sky blue',    hex: '#9EE7FF', token: '--c-sky-blue',    usage: 'Deposits series'                 },
  { name: 'Highlight',   hex: '#000000', token: '--c-highlight',   usage: 'Highlight / emphasis'            },
]

const TYPEFACES = [
  { name: 'Title',                family: 'Woodland → Fraunces', size: 24, weight: 'Heavy',   cls: 'font-display font-black text-2xl leading-none'     },
  { name: 'Subtitle',             family: 'Woodland → Fraunces', size: 20, weight: 'Bold',    cls: 'font-display font-bold text-xl leading-none'       },
  { name: 'Body Bold',            family: 'DM Sans',             size: 15, weight: 'Bold',    cls: 'font-sans font-bold text-[15px]'                   },
  { name: 'Body',                 family: 'DM Sans',             size: 15, weight: 'Regular', cls: 'font-sans text-[15px]'                             },
  { name: 'Body small bold',      family: 'DM Sans',             size: 13, weight: 'Bold',    cls: 'font-sans font-bold text-[13px]'                   },
  { name: 'Body Small',           family: 'DM Sans',             size: 13, weight: 'Regular', cls: 'font-sans text-[13px]'                             },
  { name: 'Marginal bold',        family: 'DM Sans',             size: 11, weight: 'Bold',    cls: 'font-sans font-bold text-[11px]'                   },
  { name: 'Marginal',             family: 'DM Sans',             size: 11, weight: 'Regular', cls: 'font-sans text-[11px]'                             },
  { name: 'Super-marginal bold',  family: 'DM Sans',             size: 9,  weight: 'Bold',    cls: 'font-sans font-bold text-[9px] uppercase tracking-wide' },
  { name: 'Super-marginal',       family: 'DM Sans',             size: 9,  weight: 'Regular', cls: 'font-sans text-[9px]'                              },
]

const NAV = [
  { id: 'overview',    label: 'Overview',    num: '00' },
  { id: 'colours',     label: 'Colours',     num: '01' },
  { id: 'typography',  label: 'Typography',  num: '02' },
  { id: 'inputs',      label: 'Inputs',      num: '03' },
  { id: 'controls',    label: 'Controls',    num: '04' },
  { id: 'buttons',     label: 'Buttons',     num: '05' },
  { id: 'results',     label: 'Results',     num: '06' },
  { id: 'chart',       label: 'Chart',       num: '07' },
  { id: 'table',       label: 'Table',       num: '08' },
  { id: 'faq',         label: 'FAQ',         num: '09' },
  { id: 'header',      label: 'Header',      num: '10' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function Section({
  id, num, title, desc, children,
}: {
  id: string; num: string; title: string; desc?: string; children: React.ReactNode
}) {
  return (
    <section id={id} className="py-14 border-b border-black/8">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-subdued mb-2">{num}</p>
        <h2 className="font-display font-black text-[42px] leading-none tracking-tight text-black mb-3">{title}</h2>
        {desc && <p className="font-mono text-sm text-subdued max-w-lg leading-relaxed">{desc}</p>}
      </div>
      {children}
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-subdued mb-2">{children}</p>
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <rect x="6" y="6" width="9" height="9" rx="1.5" />
      <path d="M4 12H3a1.5 1.5 0 01-1.5-1.5V3A1.5 1.5 0 013 1.5h7.5A1.5 1.5 0 0112 3v1" />
    </svg>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS)
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [toggleA, setToggleA] = useState(false)
  const [toggleB, setToggleB] = useState(true)
  const [seg3, setSeg3] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')
  const [seg2, setSeg2] = useState<'graph' | 'table'>('graph')

  const patch = (u: Partial<CalcInputs>) => setInputs((p) => ({ ...p, ...u }))
  const result = useMemo(() => calculate(inputs), [inputs])
  const sym = inputs.currency.symbol
  const fmt = (n: number) =>
    `${sym}${Math.abs(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="grid grid-cols-[220px_1fr] min-h-screen bg-elevated">

      {/* ── Sidebar ── */}
      <nav className="sticky top-0 h-screen overflow-y-auto bg-white border-r border-black/8 px-6 py-8 flex flex-col">
        <div>
          <p className="font-mono font-bold text-sm tracking-[0.17em] text-black">bureau</p>
          <p className="font-mono text-xs text-subdued mt-0.5 mb-8">design system · v1.0</p>
        </div>
        <ol className="space-y-0">
          {NAV.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="flex items-center gap-3 py-1.5 text-[13px] font-sans text-black/60 hover:text-irn transition-colors duration-100 group"
              >
                <span className="font-mono text-[10px] text-subdued w-5 flex-shrink-0 group-hover:text-irn transition-colors">{item.num}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
        <div className="mt-auto pt-8 border-t border-black/8">
          <p className="font-mono text-[10px] text-subdued leading-relaxed mb-3">
            8 colours · 10 type roles<br />3 type families
          </p>
          <Link href="/" className="font-mono text-[10px] text-subdued underline hover:text-black transition-colors">
            ← Back to app
          </Link>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="px-14 max-w-[860px]">

        {/* 00 Overview */}
        <Section id="overview" num="00 — Introduction" title="bureau">
          <p className="font-mono text-lg text-black/60 leading-relaxed max-w-xl">
            Tokens drawn directly from the Foundations page of the Figma source —<br />
            eight colours and ten type roles. Nothing else.
          </p>
          <p className="font-mono text-[12px] text-subdued mt-6">
            If a value isn&apos;t here, it doesn&apos;t exist in the system.
          </p>
        </Section>

        {/* 01 Colours */}
        <Section id="colours" num="01" title="Colour" desc="Eight tokens. Names verbatim from the Figma Foundations page.">
          <div className="grid grid-cols-4 gap-5 mb-10">
            {COLOURS.map((c) => (
              <div key={c.token} className="space-y-2">
                <div
                  className="aspect-square rounded-2xl border border-black/8"
                  style={{ background: c.hex }}
                />
                <p className="font-sans font-bold text-[13px] text-black">{c.name}</p>
                <p className="font-mono text-[11px] text-subdued">{c.hex}</p>
                <p className="font-sans text-[11px] text-subdued leading-snug">{c.usage}</p>
              </div>
            ))}
          </div>
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-black/10">
                <th className="text-left text-[10px] font-bold text-subdued uppercase tracking-wide pb-2 pr-8">Token</th>
                <th className="text-left text-[10px] font-bold text-subdued uppercase tracking-wide pb-2">Hex</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/6">
              {COLOURS.map((c) => (
                <tr key={c.token}>
                  <td className="py-2.5 font-mono text-[12px] text-black pr-8">{c.token}</td>
                  <td className="py-2.5 font-mono text-[12px] text-subdued">{c.hex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* 02 Typography */}
        <Section id="typography" num="02" title="Typography" desc="Ten roles. Fraunces substitutes PP Woodland. JetBrains Mono substitutes PP Fraktion Mono.">
          <div className="divide-y divide-black/8">
            {TYPEFACES.map((t) => (
              <div key={t.name} className="grid grid-cols-[180px_100px_1fr] gap-6 items-baseline py-4">
                <span className="font-mono text-[10px] text-subdued uppercase tracking-wide">{t.name}</span>
                <span className="font-mono text-[10px] text-subdued">{t.size}px · {t.weight}</span>
                <span className={`${t.cls} text-black`}>{t.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-elevated rounded-2xl p-5 space-y-1">
            <Label>Family reference</Label>
            <p className="font-mono text-[11px] text-black">PP Woodland → <span className="text-subdued">Fraunces (Google Fonts fallback)</span></p>
            <p className="font-mono text-[11px] text-black">PP Fraktion Mono → <span className="text-subdued">JetBrains Mono (Google Fonts fallback)</span></p>
            <p className="font-mono text-[11px] text-black">DM Sans → <span className="text-subdued">DM Sans (Google Fonts, free)</span></p>
          </div>
        </Section>

        {/* 03 Inputs */}
        <Section id="inputs" num="03" title="Inputs" desc="All input variants in context. The panel is fully interactive — changes update the Results and Chart sections below.">
          <div className="grid grid-cols-[1fr_1fr] gap-6 items-start">
            <div>
              <Label>InputPanel component</Label>
              <InputPanel values={inputs} onChange={patch} onCurrencyClick={() => setCurrencyOpen(true)} />
            </div>
            <div className="space-y-4 pt-6">
              <div>
                <Label>Currency input</Label>
                <div className="bg-white border border-black/10 rounded-xl px-4 py-3.5 text-base font-sans text-black">
                  {sym}{inputs.initialInvestment.toLocaleString('en-GB')}
                </div>
                <p className="font-mono text-[10px] text-subdued mt-1.5">White bg · 1px border black/10 · rounded-xl · px-4 py-3.5</p>
              </div>
              <div>
                <Label>Percent input</Label>
                <div className="bg-white border border-black/10 rounded-xl px-4 py-3.5 text-base font-sans text-black">
                  {inputs.interestRate}%
                </div>
              </div>
              <div>
                <Label>Duration inputs (2-col)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white border border-black/10 rounded-xl px-4 py-3.5 text-base font-sans text-black">
                    {inputs.durationYears} year{inputs.durationYears !== 1 ? 's' : ''}
                  </div>
                  <div className="bg-white border border-black/10 rounded-xl px-4 py-3.5 text-base font-sans text-black">
                    {inputs.durationMonths} month{inputs.durationMonths !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div>
                <Label>Info icon</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-sans text-black">Field label</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-black/30">
                    <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M7 6v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
                    <circle cx="7" cy="4" r="0.7" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 04 Controls */}
        <Section id="controls" num="04" title="Controls" desc="Segmented controls and toggles.">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Label>Segmented — 3 options</Label>
                <div className="flex rounded-xl bg-background p-1 gap-1">
                  {(['weekly', 'monthly', 'yearly'] as const).map((o) => (
                    <button key={o} onClick={() => setSeg3(o)}
                      className={`flex-1 py-2.5 text-sm font-sans font-medium rounded-lg transition-all capitalize ${
                        seg3 === o ? 'bg-black text-white' : 'text-black hover:bg-black/5'
                      }`}>
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="font-mono text-[10px] text-subdued mt-1.5">Active: bg-black text-white · Container: bg-background p-1 rounded-xl</p>
              </div>
              <div>
                <Label>Segmented — 2 options</Label>
                <div className="flex rounded-xl bg-background p-1 gap-1">
                  {(['graph', 'table'] as const).map((o) => (
                    <button key={o} onClick={() => setSeg2(o)}
                      className={`flex-1 py-2.5 text-sm font-sans font-medium rounded-lg transition-all capitalize ${
                        seg2 === o ? 'bg-black text-white' : 'text-black hover:bg-black/5'
                      }`}>
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <Label>Toggle — off</Label>
                <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3.5">
                  <div>
                    <p className="text-sm font-sans text-black">Adjust for inflation</p>
                    <p className="text-xs font-sans text-subdued mt-0.5">We default to 2.5%</p>
                  </div>
                  <button onClick={() => setToggleA(!toggleA)} role="switch" aria-checked={toggleA}
                    className={`relative inline-flex w-12 h-7 rounded-full transition-colors duration-200 ${toggleA ? 'bg-black' : 'bg-black/20'}`}>
                    <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${toggleA ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
              <div>
                <Label>Toggle — on</Label>
                <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3.5">
                  <div>
                    <p className="text-sm font-sans text-black">Adjust for inflation</p>
                    <p className="text-xs font-sans text-subdued mt-0.5">We default to 2.5%</p>
                  </div>
                  <button onClick={() => setToggleB(!toggleB)} role="switch" aria-checked={toggleB}
                    className={`relative inline-flex w-12 h-7 rounded-full transition-colors duration-200 ${toggleB ? 'bg-black' : 'bg-black/20'}`}>
                    <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${toggleB ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
              <div>
                <Label>Change currency row</Label>
                <button className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3.5 hover:bg-background transition-colors">
                  <span className="text-sm font-sans text-black">Change currency</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M6 3l5 5-5 5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* 05 Buttons */}
        <Section id="buttons" num="05" title="Buttons" desc="Primary (black full-width), secondary (grey), and inline icon buttons.">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Primary — Calculate</Label>
              <button className="w-full bg-black text-white font-sans font-bold text-base py-4 rounded-2xl hover:opacity-90 transition-opacity">Calculate</button>
            </div>
            <div className="space-y-2">
              <Label>Primary — Done</Label>
              <button className="w-full bg-black text-white font-sans font-bold text-base py-4 rounded-2xl hover:opacity-90 transition-opacity">Done</button>
            </div>
            <div className="space-y-2">
              <Label>Secondary — Edit Values</Label>
              <button className="w-full bg-background rounded-xl py-3.5 text-sm font-sans font-medium text-black hover:bg-black/10 transition-colors">Edit Values</button>
            </div>
            <div className="space-y-2">
              <Label>Copy button (IRN)</Label>
              <div className="flex items-center gap-3">
                <button className="text-irn hover:opacity-70 transition-opacity"><CopyIcon /></button>
                <span className="font-mono text-[10px] text-subdued">text-irn · hover: opacity 70</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Inflation adjusted badge</Label>
              <span className="inline-block px-2.5 py-1 bg-black text-white text-[11px] font-sans font-medium rounded-full">Inflation adjusted</span>
            </div>
            <div className="space-y-2">
              <Label>Nav link hover state</Label>
              <a href="#" className="font-sans text-sm text-irn underline">Section link</a>
            </div>
          </div>
        </Section>

        {/* 06 Results */}
        <Section id="results" num="06" title="Results" desc="Live results card — updates as you edit the inputs in section 03.">
          <div className="grid grid-cols-[1fr_300px] gap-6 items-start">
            <div className="bg-elevated rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-black text-2xl text-black">Results</h3>
                {inputs.adjustForInflation && (
                  <span className="px-2.5 py-1 bg-black text-white text-[11px] font-sans font-medium rounded-full leading-none">
                    Inflation adjusted
                  </span>
                )}
              </div>
              <p className="text-xs font-sans text-subdued mb-1">Future value</p>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="font-display font-black text-4xl text-black leading-none">{fmt(result.futureValue)}</span>
                <button className="text-irn hover:opacity-70 transition-opacity"><CopyIcon /></button>
              </div>
              <p className="text-xs font-sans text-subdued mb-1">Interest earned</p>
              <div className="flex items-center justify-between gap-3 mb-5">
                <span className="font-display font-black text-3xl text-black leading-none">{fmt(result.interestEarned)}</span>
                <button className="text-irn hover:opacity-70 transition-opacity"><CopyIcon /></button>
              </div>
              <p className="text-sm font-sans text-black leading-relaxed">
                Over <strong>{inputs.durationYears} year{inputs.durationYears !== 1 ? 's' : ''}</strong>,
                starting with <strong>{sym}{Math.round(result.totalDeposits).toLocaleString('en-GB')}</strong> returning{' '}
                <strong>{inputs.interestRate}%</strong> annually with {inputs.additionalPayments > 0 ? (
                  <><strong>{inputs.additionalPaymentsFreq}</strong> payments of <strong>{sym}{inputs.additionalPayments.toLocaleString('en-GB')}</strong>.</>
                ) : 'no additional payments.'}
              </p>
            </div>
            <div className="space-y-3 pt-1">
              <div>
                <Label>Future value number</Label>
                <p className="font-mono text-[10px] text-subdued leading-relaxed">font-display font-black text-4xl<br />text-black leading-none</p>
              </div>
              <div>
                <Label>Interest earned number</Label>
                <p className="font-mono text-[10px] text-subdued leading-relaxed">font-display font-black text-3xl<br />text-black leading-none</p>
              </div>
              <div>
                <Label>Section heading</Label>
                <p className="font-mono text-[10px] text-subdued">font-display font-black text-2xl</p>
              </div>
              <div>
                <Label>Sub-label</Label>
                <p className="font-mono text-[10px] text-subdued">text-xs font-sans text-subdued</p>
              </div>
            </div>
          </div>
        </Section>

        {/* 07 Chart */}
        <Section id="chart" num="07" title="Chart" desc="Two-series line chart. Orange = compound interest (total balance). Sky blue = deposits only (linear growth). Updates live with input changes.">
          <div className="bg-elevated rounded-2xl shadow-sm p-5">
            <div className="flex rounded-xl bg-background p-1 gap-1 mb-5 max-w-xs">
              {(['graph', 'table'] as const).map((o) => (
                <button key={o} onClick={() => setSeg2(o)}
                  className={`flex-1 py-2.5 text-sm font-sans font-medium rounded-lg transition-all capitalize ${
                    seg2 === o ? 'bg-black text-white' : 'text-black hover:bg-black/5'
                  }`}>
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </button>
              ))}
            </div>
            {seg2 === 'graph' ? (
              <LineChart rows={result.rows} initialValue={inputs.initialInvestment} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans border-collapse">
                  <thead>
                    <tr className="bg-background">
                      {['Year', 'Deposits', 'Interest earned', 'Balance'].map((h) => (
                        <th key={h} className="text-left text-xs font-bold text-black px-3 py-3 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, i) => (
                      <tr key={row.year} className={i % 2 === 0 ? 'bg-white' : 'bg-background/50'}>
                        <td className="px-3 py-3">{row.year}</td>
                        <td className="px-3 py-3">{row.deposits.toLocaleString('en-GB')}</td>
                        <td className="px-3 py-3">{row.interestEarned.toLocaleString('en-GB')}</td>
                        <td className="px-3 py-3">{row.balance.toLocaleString('en-GB')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <Label>Compound interest series</Label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-irn" />
                <span className="font-mono text-[10px] text-subdued">#FF5500 · strokeWidth 2</span>
              </div>
            </div>
            <div>
              <Label>Deposits series</Label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-sky-blue" />
                <span className="font-mono text-[10px] text-subdued">#9EE7FF · strokeWidth 2</span>
              </div>
            </div>
          </div>
        </Section>

        {/* 08 Table */}
        <Section id="table" num="08" title="Table" desc="Year-by-year breakdown. Even rows white, odd rows bg-background/50. See Chart section above for the interactive version.">
          <div className="bg-elevated rounded-2xl shadow-sm p-5 overflow-x-auto">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-background">
                  {['Year', 'Deposits', 'Interest earned', 'Balance'].map((h) => (
                    <th key={h} className="text-left text-xs font-bold text-black px-3 py-3 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.slice(0, 6).map((row, i) => (
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
          <div className="mt-4 space-y-1">
            <p className="font-mono text-[10px] text-subdued">Header: bg-background · text-xs font-bold text-black</p>
            <p className="font-mono text-[10px] text-subdued">Even rows: bg-white · Odd rows: bg-background/50</p>
            <p className="font-mono text-[10px] text-subdued">Cell: px-3 py-3 · text-sm font-sans text-black</p>
          </div>
        </Section>

        {/* 09 FAQ */}
        <Section id="faq" num="09" title="FAQ" desc="Accordion component. Questions from lib/faq-data.ts. + icon rotates 45° to × on open.">
          <div className="grid grid-cols-[1fr_260px] gap-6 items-start">
            <div className="bg-elevated rounded-2xl shadow-sm p-5">
              <h3 className="font-display font-black text-2xl text-black mb-3">FAQs</h3>
              <FAQ />
            </div>
            <div className="space-y-3 pt-1">
              <div>
                <Label>Question text</Label>
                <p className="font-mono text-[10px] text-subdued leading-relaxed">font-sans text-sm md:text-base<br />text-black · hover: text-irn</p>
              </div>
              <div>
                <Label>Answer text</Label>
                <p className="font-mono text-[10px] text-subdued leading-relaxed">font-sans text-sm text-subdued<br />leading-relaxed</p>
              </div>
              <div>
                <Label>Divider</Label>
                <p className="font-mono text-[10px] text-subdued">divide-y divide-black/8</p>
              </div>
              <div>
                <Label>Icon</Label>
                <p className="font-mono text-[10px] text-subdued">14×14 SVG · rotates 45° on open<br />Framer Motion animate rotate</p>
              </div>
            </div>
          </div>
        </Section>

        {/* 10 Header */}
        <Section id="header" num="10" title="Header" desc="The bureau wordmark card — sits at the top of every page.">
          <div className="grid grid-cols-2 gap-6 items-start">
            <div>
              <Label>Full-width variant</Label>
              <div className="bg-elevated rounded-2xl shadow-sm px-5 py-4">
                <p className="font-mono font-bold text-sm tracking-[0.17em] text-black">bureau</p>
                <p className="font-sans text-xs text-subdued mt-0.5">Compound Interest Calculator</p>
              </div>
            </div>
            <div>
              <Label>Compact variant</Label>
              <div className="bg-elevated rounded-2xl shadow-sm px-4 py-3 inline-block">
                <p className="font-mono font-bold text-sm tracking-[0.17em] text-black">bureau</p>
                <p className="font-sans text-xs text-subdued mt-0.5">Compound Interest Calculator</p>
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            <p className="font-mono text-[10px] text-subdued"><span className="text-black">bureau</span> — JetBrains Mono · font-bold · text-sm · tracking-[0.17em] · text-black</p>
            <p className="font-mono text-[10px] text-subdued"><span className="text-black">subtitle</span> — DM Sans · text-xs · text-subdued · mt-0.5</p>
            <p className="font-mono text-[10px] text-subdued"><span className="text-black">card</span> — bg-white · rounded-2xl · shadow-sm · px-5 py-4</p>
          </div>
        </Section>

        <footer className="py-12 font-mono text-[10px] text-subdued">
          bureau design system · built with Next.js + Tailwind CSS
        </footer>
      </main>

      <CurrencyPicker
        open={currencyOpen}
        selected={inputs.currency}
        onSelect={(c: Currency) => patch({ currency: c })}
        onClose={() => setCurrencyOpen(false)}
      />
    </div>
  )
}
