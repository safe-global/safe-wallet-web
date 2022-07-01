import Sentry from '@/services/sentry' // needs to be imported first
import { type ReactElement } from 'react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { setBaseUrl } from '@gnosis.pm/safe-react-gateway-sdk'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import theme from '@/styles/theme'
import '@/styles/globals.css'
import { IS_PRODUCTION, STAGING_GATEWAY_URL } from '@/config/constants'
import { store } from '@/store'
import PageLayout from '@/components/common/PageLayout'
import { useInitChains } from '@/hooks/useChains'
import { useInitSafeInfo } from '@/hooks/useSafeInfo'
import { useInitBalances } from '@/hooks/useBalances'
import { useInitCollectibles } from '@/hooks/useCollectibles'
import { useInitTxHistory } from '@/hooks/useTxHistory'
import { useInitTxQueue } from '@/hooks/useTxQueue'
import usePathRewrite from '@/hooks/usePathRewrite'
import { useInitOnboard } from '@/hooks/wallets/useOnboard'
import { useInitWeb3 } from '@/hooks/wallets/useInitWeb3'
import { useInitSafeCoreSDK } from '@/hooks/coreSDK/useInitSafeCoreSDK'
import useTxNotifications from '@/hooks/useTxNotifications'
import useTxPendingStatuses, { useTxMonitor } from '@/hooks/useTxPendingStatuses'
import { useInitSession } from '@/hooks/useInitSession'
import Notifications from '@/components/common/Notifications'
import CookieBanner from '@/components/common/CookieBanner'

const cssCache = createCache({
  key: 'css',
  prepend: true,
})

const InitApp = (): null => {
  if (!IS_PRODUCTION) {
    setBaseUrl(STAGING_GATEWAY_URL)
  }

  usePathRewrite()
  useInitChains()
  useInitSession()
  useInitSafeInfo()
  useInitBalances()
  useInitCollectibles()
  useInitTxHistory()
  useInitTxQueue()
  useInitOnboard()
  useInitWeb3()
  useInitSafeCoreSDK()
  useTxNotifications()
  useTxPendingStatuses()
  useTxMonitor()

  return null
}

const SafeWebCore = ({ Component, pageProps }: AppProps): ReactElement => {
  return (
    <Provider store={store}>
      <Head>
        <title>Safe 🌭</title>
        <meta name="description" content="Safe app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* @ts-ignore - Temporary Fix */}
      <Sentry.ErrorBoundary showDialog fallback={({ error }) => <div>{error.message}</div>}>
        <CacheProvider value={cssCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <InitApp />
            <PageLayout>
              <Component {...pageProps} />
            </PageLayout>

            <CookieBanner />

            <Notifications />
          </ThemeProvider>
        </CacheProvider>
      </Sentry.ErrorBoundary>
    </Provider>
  )
}

export default SafeWebCore
