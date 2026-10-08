'use client'

import { useState } from 'react'

const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      ph()?.capture('value_copied', { value })
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      className="text-irn hover:opacity-70 transition-opacity flex-shrink-0"
      aria-label="Copy value"
    >
      {copied ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round">
          <path d="M3 9l4 4 8-8" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
          <rect x="6" y="6" width="9" height="9" rx="1.5" />
          <path d="M4 12H3a1.5 1.5 0 01-1.5-1.5V3A1.5 1.5 0 013 1.5h7.5A1.5 1.5 0 0112 3v1" />
        </svg>
      )}
    </button>
  )
}
