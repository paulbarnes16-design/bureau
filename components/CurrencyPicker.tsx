'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CURRENCIES, type Currency } from '@/lib/calculate'

interface Props {
  open: boolean
  selected: Currency
  onSelect: (c: Currency) => void
  onClose: () => void
}

export default function CurrencyPicker({ open, selected, onSelect, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-background overflow-y-auto"
        >
          <div className="max-w-md mx-auto px-5 pt-6 pb-8 min-h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button onClick={onClose} className="p-1 -ml-1 text-black" aria-label="Back">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <path d="M12 4l-6 6 6 6" />
                </svg>
              </button>
              <h2 className="font-sans font-bold text-[20px] text-black">Select currency</h2>
              <button onClick={onClose} className="p-1 -mr-1 text-black" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <path d="M2 2l14 14M16 2L2 16" />
                </svg>
              </button>
            </div>

            {/* Currency list */}
            <div className="flex-1 space-y-3">
              {CURRENCIES.map((c) => {
                const isSelected = c.code === selected.code
                return (
                  <button
                    key={c.code}
                    onClick={() => { onSelect(c); onClose() }}
                    className="w-full flex items-center gap-4"
                  >
                    {/* Symbol badge */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 font-sans font-black text-lg ${
                      isSelected ? 'bg-black text-white' : 'bg-white text-black shadow-sm'
                    }`}>
                      {c.symbol}
                    </div>
                    {/* Name */}
                    <span className="flex-1 text-left font-sans text-base text-black">{c.name}</span>
                    {/* Tick */}
                    {isSelected && (
                      <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="round">
                          <path d="M2 7l3.5 3.5L12 3" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Done button */}
            <div className="pt-8">
              <button
                onClick={onClose}
                className="w-full bg-black text-white font-sans font-bold text-base py-4 rounded-2xl"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
