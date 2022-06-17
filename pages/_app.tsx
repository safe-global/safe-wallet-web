import Sentry from '@/services/sentry' // needs to be imported first
import { type ReactElement } from 'react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { setBaseUrl } from '@gnosis.pm/safe-react-gateway-sdk'
import { SnackbarProvider } from 'notistack'
import theme from '@/styles/theme'

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
import { useInitWeb3 } from '@/services/wallets/useInitWeb3'
import { useInitSafeCoreSDK } from '@/services/safe-core/useInitSafeCoreSDK'
import useNotifier from '@/services/useNotifier'
import useTxNotifications from '@/services/useTxNotifications'
import useTxPendingStatuses, { useTxMonitor } from '@/services/useTxPendingStatuses'
import { useInitSession } from '@/services/useInitSession'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

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
        <CacheProvider value={emotionCache}>
          <ThemeProvider theme={theme}>
            <SnackbarProvider anchorOrigin={{ vertical: 'top', horizontal: 'right' }} maxSnack={5}>
              <CssBaseline />
              <InitApp />
              <PageLayout>
                <Component {...pageProps} />
              </PageLayout>
            </SnackbarProvider>
          </ThemeProvider>
        </CacheProvider>
      </Sentry.ErrorBoundary>
    </Provider>
  )
}

export default SafeWebCore
