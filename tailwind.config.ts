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
        background: '#EDEDED',
        elevated:   '#F5F5F5',
        subdued:    '#5E5E5E',
        irn:        '#FF5E6C',
        'sky-blue': 'rgba(255, 94, 108, 0.3)',
      },
      boxShadow: {
        card: '0 0 0 1px rgba(0,0,0,0.1)', // 1px outside stroke, 10% black
      },
      fontFamily: {
        writer:    ['var(--font-writer)', 'serif'],
        mamoth:    ['var(--font-mamoth)', 'serif'],
        condensed: ['var(--font-plex-mono)', 'ui-monospace', 'Menlo', 'monospace'],
        mono:      ['var(--font-plex-mono)', 'ui-monospace', 'Menlo', 'monospace'],
        sans:      ['var(--font-plex-mono)', 'ui-monospace', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
