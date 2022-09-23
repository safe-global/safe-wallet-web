import Sentry from '@/services/sentry' // needs to be imported first
import { type ReactElement, ReactNode } from 'react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { setBaseUrl } from '@gnosis.pm/safe-react-gateway-sdk'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import '@/styles/globals.css'
import { IS_PRODUCTION, GATEWAY_URL } from '@/config/constants'
import { StoreHydrator } from '@/store'
import PageLayout from '@/components/common/PageLayout'
import useLoadableStores from '@/hooks/useLoadableStores'
import usePathRewrite from '@/hooks/usePathRewrite'
import { useInitOnboard } from '@/hooks/wallets/useOnboard'
import { useInitWeb3 } from '@/hooks/wallets/useInitWeb3'
import { useInitSafeCoreSDK } from '@/hooks/coreSDK/useInitSafeCoreSDK'
import useTxNotifications from '@/hooks/useTxNotifications'
import useSafeNotifications from '@/hooks/useSafeNotifications'
import useTxPendingStatuses from '@/hooks/useTxPendingStatuses'
import { useInitSession } from '@/hooks/useInitSession'
import useStorageMigration from '@/services/ls-migration'
import Notifications from '@/components/common/Notifications'
import CookieBanner from '@/components/common/CookieBanner'
import { useLightDarkTheme } from '@/hooks/useDarkMode'
import { cgwDebugStorage } from '@/components/sidebar/DebugToggle'
import { useTxTracking } from '@/hooks/useTxTracking'
import useGtm from '@/services/analytics/useGtm'
import useBeamer from '@/hooks/useBeamer'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { ContentSecurityPolicy, StrictTransportSecurity } from '@/config/securityHeaders'

const cssCache = createCache({
  key: 'css',
  prepend: true,
})

const InitApp = (): null => {
  if (!IS_PRODUCTION && !cgwDebugStorage.get()) {
    setBaseUrl(GATEWAY_URL)
  }

  usePathRewrite()
  useStorageMigration()
  useGtm()
  useInitSession()
  useLoadableStores()
  useInitOnboard()
  useInitWeb3()
  useInitSafeCoreSDK()
  useTxNotifications()
  useSafeNotifications()
  useTxPendingStatuses()
  useTxTracking()
  useBeamer()

  return null
}

export const AppProviders = ({ children }: { children: ReactNode | ReactNode[] }) => {
  const theme = useLightDarkTheme()

  return (
    <CacheProvider value={cssCache}>
      <ThemeProvider theme={theme}>
        <Sentry.ErrorBoundary showDialog fallback={ErrorBoundary}>
          {children}
        </Sentry.ErrorBoundary>
      </ThemeProvider>
    </CacheProvider>
  )
}

const SafeWebCore = ({ Component, pageProps }: AppProps): ReactElement => {
  return (
    <StoreHydrator>
      <Head>
        <title key="default-title">Safe</title>
        <meta
          name="description"
          content="Safe is the most trusted platform to manage digital assets on Ethereum (formerly known as the Gnosis Safe multisig)."
        />

        <base href="/app" />

        <link rel="dns-prefetch" href={GATEWAY_URL} />
        <link rel="preconnect" href={GATEWAY_URL} crossOrigin="" />

        <meta name="viewport" content="width=device-width" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta httpEquiv="Content-Security-Policy" content={ContentSecurityPolicy} />
        {IS_PRODUCTION && <meta httpEquiv="Strict-Transport-Security" content={StrictTransportSecurity} />}
        <link rel="shortcut icon" href="/app/favicons/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/app/favicons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/app/favicons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/app/favicons/favicon-16x16.png" />
        <link rel="manifest" href="/app/favicons/site.webmanifest" />
        <link rel="mask-icon" href="/app/favicons/safari-pinned-tab.svg" color="#000" />
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
    </StoreHydrator>
  )
}

export default SafeWebCore
