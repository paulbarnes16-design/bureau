import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = 'bureau — Compound Interest Calculator'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const [mamoth, plexRegular, plexBold, icon] = await Promise.all([
    readFile(join(process.cwd(), 'fonts/Mamoth.otf')),
    readFile(join(process.cwd(), 'fonts/og/IBMPlexSans-Regular.woff')),
    readFile(join(process.cwd(), 'fonts/og/IBMPlexSans-Bold.woff')),
    readFile(join(process.cwd(), 'public/apple-touch-icon.png')),
  ])
  const iconSrc = `data:image/png;base64,${icon.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: '#EDEDED',
          color: '#000000',
          fontFamily: 'IBM Plex Sans',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} width={140} height={140} style={{ borderRadius: 32 }} alt="" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'Mamoth', fontSize: 150, lineHeight: 1 }}>bureau</div>
          <div style={{ fontSize: 52, fontWeight: 700, marginTop: 24 }}>Compound Interest Calculator</div>
          <div style={{ fontSize: 34, color: '#5E5E5E', marginTop: 12 }}>
            See exactly how your savings and investments grow over time.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Mamoth', data: mamoth, style: 'normal' },
        { name: 'IBM Plex Sans', data: plexRegular, weight: 400, style: 'normal' },
        { name: 'IBM Plex Sans', data: plexBold, weight: 700, style: 'normal' },
      ],
    },
  )
}
