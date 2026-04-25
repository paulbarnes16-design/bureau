'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init('phc_yH3VMPxxmynWHeF6fZwNmCZLo42cUGcJBBcWUqDV22xx', {
      api_host: 'https://us.i.posthog.com',
      persistence: 'memory',
      person_profiles: 'never',
      capture_pageview: true,
      capture_pageleave: true,
    })
  }, [])

  return <>{children}</>
}
