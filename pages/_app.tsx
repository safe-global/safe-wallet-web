import Sentry from '@/services/sentry' // needs to be imported first
import '@/services/localStorage/migrateStorage' // needs to be imported second
import { type ReactElement } from 'react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { setBaseUrl } from '@gnosis.pm/safe-react-gateway-sdk'
import { SnackbarProvider } from 'notistack'
import { safeTheme } from '@gnosis.pm/safe-react-components'

import '@/styles/globals.css'
import { IS_PRODUCTION, STAGING_GATEWAY_URL } from '@/config/constants'
import { store } from '@/store'
import PageLayout from '@/components/common/PageLayout'
import createEmotionCache from '@/services/createEmotionCache'
import { useInitChains } from '@/services/useChains'
import { useInitSafeInfo } from '@/services/useSafeInfo'
import { useInitBalances } from '@/services/useBalances'
import { useInitCollectibles } from '@/services/useCollectibles'
import { useInitTxHistory } from '@/services/useTxHistory'
import { useInitTxQueue } from '@/services/useTxQueue'
import usePathRewrite from '@/services/usePathRewrite'
import { useInitOnboard } from '@/services/wallets/useOnboard'
import Web3Provider from '@/services/wallets/Web3Provider'
import { useInitSafeCoreSDK } from '@/services/safe-core/useInitSafeCoreSDK'
import useNotifier from '@/services/useNotifier'
import useTxNotifications from '@/services/useTxNotifications'
import useTxPendingStatuses, { useTxMonitor } from '@/services/useTxPendingStatuses'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

const InitApp = (): null => {
  if (!IS_PRODUCTION) {
    setBaseUrl(STAGING_GATEWAY_URL)
  }

  usePathRewrite()
  useInitChains()
  useInitSafeInfo()
  useInitBalances()
  useInitCollectibles()
  useInitTxHistory()
  useInitTxQueue()
  useInitOnboard()
  useInitSafeCoreSDK()
  useNotifier()
  useTxNotifications()
  useTxPendingStatuses()
  useTxMonitor()

  return null
}

const SafeWebCore = ({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}: AppProps & { emotionCache: EmotionCache }): ReactElement => {
  return (
    <Provider store={store}>
      <Head>
        <title>Safe 🌭</title>
        <meta name="description" content="Safe app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* @ts-ignore - Temporary Fix */}
      <Sentry.ErrorBoundary showDialog fallback={({ error }) => <div>{error.message}</div>}>
        <Web3Provider>
          <CacheProvider value={emotionCache}>
            <ThemeProvider theme={safeTheme}>
              <SnackbarProvider anchorOrigin={{ vertical: 'top', horizontal: 'right' }} maxSnack={5}>
                <CssBaseline />
                <InitApp />
                <PageLayout>
                  <Component {...pageProps} />
                </PageLayout>
              </SnackbarProvider>
            </ThemeProvider>
          </CacheProvider>
        </Web3Provider>
      </Sentry.ErrorBoundary>
    </Provider>
  )
}

export default SafeWebCore
