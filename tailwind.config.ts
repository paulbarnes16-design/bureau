import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Bureau design tokens — verbatim from Figma Foundations page
        background: '#EBE8E4',
        elevated:   '#F2F0EB',
        subdued:    '#5E5E5E',
        irn:        '#FF5E6C',
        'sky-blue': 'rgba(255, 94, 108, 0.3)',
      },
      boxShadow: {
        card: '-6px -5px 7.5px rgba(255,255,255,0.4), 6px 5px 14px rgba(0,0,0,0.12)',
      },
      fontFamily: {
        writer:    ['var(--font-writer)', 'serif'],
        condensed: ['var(--font-plex-mono)', 'ui-monospace', 'Menlo', 'monospace'],
        mono:      ['var(--font-plex-mono)', 'ui-monospace', 'Menlo', 'monospace'],
        sans:      ['var(--font-plex-mono)', 'ui-monospace', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
