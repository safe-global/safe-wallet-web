import Sentry from '@/services/sentry' // needs to be imported first
import { type ReactElement } from 'react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { setBaseUrl } from '@gnosis.pm/safe-react-gateway-sdk'
import theme from '@/styles/theme'
import dynamic from 'next/dynamic'

import '@/styles/globals.css'
import { IS_PRODUCTION, STAGING_GATEWAY_URL } from '@/config/constants'
import { store } from '@/store'
import PageLayout from '@/components/common/PageLayout'
import createEmotionCache from '@/services/createEmotionCache'
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
            <CssBaseline />
            <InitApp />
            <PageLayout>
              <Component {...pageProps} />
            </PageLayout>

            <Notifications />
          </ThemeProvider>
        </CacheProvider>
      </Sentry.ErrorBoundary>
    </Provider>
  )
}

//@ts-ignore
const withNoSSR = (Component: any) => dynamic(() => Promise.resolve(Component), { ssr: false })

export default withNoSSR(SafeWebCore)
