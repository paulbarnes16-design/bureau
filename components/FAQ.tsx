'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { faqs } from '@/lib/faq-data'

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div>
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 py-4 text-left group"
            aria-expanded={open === i}
          >
            <span className="font-sans text-[15px] text-black group-hover:text-irn transition-colors duration-120">
              {faq.question}
            </span>
            <motion.span
              animate={{ rotate: open === i ? 45 : 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="flex-shrink-0 text-black/40 group-hover:text-irn transition-colors duration-120"
              aria-hidden
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <line x1="7" y1="0" x2="7" y2="14" />
                <line x1="0" y1="7" x2="14" y2="7" />
              </svg>
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pb-5 pr-8 text-[15px] font-sans text-subdued leading-relaxed space-y-3">
                  {faq.answer.split('\n\n').map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
