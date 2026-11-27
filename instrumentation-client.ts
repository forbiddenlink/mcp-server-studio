import * as Sentry from '@sentry/nextjs'
import posthog from 'posthog-js'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: false,
})

// The PostHog project is shared across apps, so every event carries app = 'mcp-server-studio'.
// Skipped entirely when the key is unset (local dev, previews without the variable).
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    loaded: (ph) => {
      ph.register({ app: 'mcp-server-studio' })
    },
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
