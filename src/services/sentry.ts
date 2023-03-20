import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { SENTRY_DSN } from '@/config/constants'
import packageJson from '../../package.json'

Sentry.init({
  dsn: SENTRY_DSN,
  release: `web-core@${packageJson.version}`,
  integrations: [new Integrations.BrowserTracing()],
  sampleRate: 0.1,
  // ignore MetaMask errors we don't control
  ignoreErrors: ['Internal JSON-RPC error', 'JsonRpcEngine', 'Non-Error promise rejection captured with keys: code'],

  beforeSend: (event) => {
    // Remove URL query params
    if (event.request?.query_string) {
      delete event.request?.query_string
    }
    return event
  },
})

export default Sentry
