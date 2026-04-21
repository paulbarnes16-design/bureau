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
        elevated:   '#FAFAFA',
        subdued:    '#5E5E5E',
        irn:        '#FF5500',
        'sky-blue': '#9EE7FF',
      },
      fontFamily: {
        display: ['var(--font-woodland)', 'Georgia', 'serif'],
        mono:    ['var(--font-jetbrains)', 'ui-monospace', 'Menlo', 'monospace'],
        sans:    ['var(--font-dm-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
