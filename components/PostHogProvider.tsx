'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      persistence: 'memory',
      person_profiles: 'never',
      capture_pageview: true,
      capture_pageleave: true,
    })
  }, [])

  return <>{children}</>
}
