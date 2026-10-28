import { NextResponse } from 'next/server'

const KEY = '4ef557cc5f4441358f35811b7624b76e'
const HOST = 'bureau.money'
const URLS = [
  'https://bureau.money',
  'https://bureau.money/isa-calculator',
  'https://bureau.money/isa-calculator/cash-isa-limit-2027',
  'https://bureau.money/isa-calculator/max-isa-every-year',
  'https://bureau.money/isa-calculator/isa-millionaire',
  'https://bureau.money/isa-calculator/10000-cash-isa',
  'https://bureau.money/mixed-income-calculator',
  'https://bureau.money/pension-calculator',
  'https://bureau.money/mortgage-calculator',
  'https://bureau.money/about',
]

export async function GET() {
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList: URLS,
      }),
    })

    return NextResponse.json({ status: res.status, ok: res.ok })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
