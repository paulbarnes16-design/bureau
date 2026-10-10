'use client'

import { useEffect, useRef, useState } from 'react'

const ph = () => (window as { posthog?: { capture: (e: string, p?: object) => void } }).posthog

export interface UrlCodec<T> {
  has: (search: string) => boolean
  decode: (search: string, base: T) => T
  merge: (search: string, inputs: T, base: T) => string
}

/**
 * Calculator inputs synced with the URL. The first render uses the defaults so it
 * matches the server HTML; values from a shared link are applied after hydration.
 */
export function useToolState<T>(defaults: T, codec: UrlCodec<T>, tool: string) {
  const [inputs, setInputs] = useState<T>(defaults)
  const [urlLoaded, setUrlLoaded] = useState(false)
  const [hasInput, setHasInput] = useState(false)
  const hasEngaged = useRef(false)

  useEffect(() => {
    const search = window.location.search
    if (codec.has(search)) {
      setInputs(codec.decode(search, defaults))
      setHasInput(true)
    }
    setUrlLoaded(true)
    // Runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!urlLoaded) return
    const id = setTimeout(() => {
      const qs = codec.merge(window.location.search, inputs, defaults)
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    }, 300)
    return () => clearTimeout(id)
  }, [inputs, urlLoaded, codec, defaults])

  const engage = () => {
    if (hasEngaged.current) return
    const posthog = ph()
    if (posthog) {
      hasEngaged.current = true
      posthog.capture('user_engaged', { tool })
    }
  }

  const patch = (updates: Partial<T>) => {
    setInputs((prev) => ({ ...prev, ...updates }))
    setHasInput(true)
    engage()
  }

  return { inputs, patch, hasInput, engage }
}
