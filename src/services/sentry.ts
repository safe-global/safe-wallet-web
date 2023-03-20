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
    // Remove sensitive URL query params
    const query = event.request?.query_string
    if (event.request && query) {
      const appUrl = typeof query !== 'string' && !Array.isArray(query) ? query.appUrl : ''
      if (appUrl) {
        event.request.query_string = { appUrl }
      } else {
        delete event.request.query_string
      }
    }
    return event
  },
})

export default Sentry
