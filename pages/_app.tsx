import Sentry from '@/services/sentry' // needs to be imported first
import { type ReactElement, ReactNode } from 'react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { setBaseUrl } from '@gnosis.pm/safe-react-gateway-sdk'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import '@/styles/globals.css'
import { IS_PRODUCTION, STAGING_GATEWAY_URL } from '@/config/constants'
import { store } from '@/store'
import PageLayout from '@/components/common/PageLayout'
import useLoadableStores from '@/hooks/useLoadableStores'
import usePathRewrite from '@/hooks/usePathRewrite'
import { useInitOnboard } from '@/hooks/wallets/useOnboard'
import { useInitWeb3 } from '@/hooks/wallets/useInitWeb3'
import { useInitSafeCoreSDK } from '@/hooks/coreSDK/useInitSafeCoreSDK'
import useTxNotifications from '@/hooks/useTxNotifications'
import useSafeNotifications from '@/hooks/useSafeNotifications'
import useTxPendingStatuses, { useTxMonitor } from '@/hooks/useTxPendingStatuses'
import { useInitSession } from '@/hooks/useInitSession'
import useStorageMigration from '@/services/ls-migration'
import Notifications from '@/components/common/Notifications'
import CookieBanner from '@/components/common/CookieBanner'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cgwDebugStorage } from '@/components/sidebar/DebugToggle'

const cssCache = createCache({
  key: 'css',
  prepend: true,
})

const InitApp = (): null => {
  if (!IS_PRODUCTION && !cgwDebugStorage.get()) {
    setBaseUrl(STAGING_GATEWAY_URL)
  }

  usePathRewrite()
  useStorageMigration()
  useInitSession()
  useLoadableStores()
  useInitOnboard()
  useInitWeb3()
  useInitSafeCoreSDK()
  useTxNotifications()
  useSafeNotifications()
  useTxPendingStatuses()
  useTxMonitor()

  return null
}

const AppProviders = ({ children }: { children: ReactNode[] }) => {
  const theme = useDarkMode()

  return (
    <Sentry.ErrorBoundary showDialog fallback={({ error }) => <div>{error.message}</div>}>
      <CacheProvider value={cssCache}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </CacheProvider>
    </Sentry.ErrorBoundary>
  )
}

const SafeWebCore = ({ Component, pageProps }: AppProps): ReactElement | null => {
  return (
    <Provider store={store}>
      <Head>
        <title key="default-title">Safe 🌭</title>
        <meta name="description" content="Safe app" />
        <meta name="viewport" content="width=device-width" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppProviders>
        <CssBaseline />

        <InitApp />

        <PageLayout>
          <Component {...pageProps} />
        </PageLayout>

        <CookieBanner />

        <Notifications />
      </AppProviders>
    </Provider>
  )
}

export default SafeWebCore
