import Sentry from '@/services/sentry' // needs to be imported first
import { type ReactElement } from 'react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { setBaseUrl } from '@gnosis.pm/safe-react-gateway-sdk'
import { safeTheme, useThemeMode } from '@gnosis.pm/safe-react-components'

import '@/styles/globals.css'
import { store } from '@/store'
import PageLayout from '@/components/common/PageLayout'
import { useInitChains } from '@/services/useChains'
import { useInitSafeInfo } from '@/services/useSafeInfo'
import { useInitBalances } from '@/services/useBalances'
import { useInitCollectibles } from '@/services/useCollectibles'
import { useInitTxHistory } from '@/services/useTxHistory'
import { useInitTxQueue } from '@/services/useTxQueue'
import usePathRewrite from '@/services/usePathRewrite'
import { IS_PRODUCTION, STAGING_GATEWAY_URL } from '@/config/constants'
import { useOnboard } from '@/services/wallets/useOnboard'
import { useInitWeb3 } from '@/services/wallets/useInitWeb3'
import { useInitSafeCoreSDK } from '@/services/wallets/useInitSafeCoreSDK'
import { useInitAddressBook } from '@/services/useAddressBook'
import createEmotionCache from '@/services/createEmotionCache'

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
  useInitWeb3()
  useOnboard()
  useInitSafeCoreSDK()
  useInitAddressBook()

  return null
}

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

const SafeWebCore = ({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}: AppProps & { emotionCache: EmotionCache }): ReactElement => {
  return (
    <CacheProvider value={emotionCache}>
      <Provider store={store}>
        <Head>
          <title>Safe 🌭</title>
          <meta name="description" content="Safe app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <ThemeProvider theme={safeTheme}>
          <CssBaseline />
          <InitApp />
          {/* @ts-expect-error - Temporary Fix */}
          <Sentry.ErrorBoundary showDialog fallback={({ error }) => <div>{error.message}</div>}>
            <PageLayout>
              <Component {...pageProps} />
            </PageLayout>
          </Sentry.ErrorBoundary>
        </ThemeProvider>
      </Provider>
    </CacheProvider>
  )
}

export default SafeWebCore
