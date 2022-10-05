import Sentry from '@/services/sentry' // needs to be imported first
import type { ReactNode } from 'react'
import { type ReactElement } from 'react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { setBaseUrl as setGatewayBaseUrl } from '@gnosis.pm/safe-react-gateway-sdk'
import { CacheProvider, type EmotionCache } from '@emotion/react'
import '@/styles/globals.css'
import { IS_PRODUCTION, GATEWAY_URL_STAGING, GATEWAY_URL_PRODUCTION } from '@/config/constants'
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
import createEmotionCache from '@/utils/createEmotionCache'

const GATEWAY_URL = IS_PRODUCTION || cgwDebugStorage.get() ? GATEWAY_URL_PRODUCTION : GATEWAY_URL_STAGING

const InitApp = (): null => {
  setGatewayBaseUrl(GATEWAY_URL)
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

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

export const AppProviders = ({ children }: { children: ReactNode | ReactNode[] }) => {
  const theme = useLightDarkTheme()

  return (
    <ThemeProvider theme={theme}>
      <Sentry.ErrorBoundary showDialog fallback={ErrorBoundary}>
        {children}
      </Sentry.ErrorBoundary>
    </ThemeProvider>
  )
}

interface WebCoreAppProps extends AppProps {
  emotionCache?: EmotionCache
}

const WebCoreApp = ({ Component, pageProps, emotionCache = clientSideEmotionCache }: WebCoreAppProps): ReactElement => {
  return (
    <StoreHydrator>
      <Head>
        <title key="default-title">Safe</title>
        <meta
          name="description"
          content="Safe is the most trusted platform to manage digital assets on Ethereum (formerly known as the Gnosis Safe multisig)."
        />

        <link rel="dns-prefetch" href={GATEWAY_URL} />
        <link rel="preconnect" href={GATEWAY_URL} crossOrigin="" />

        <meta name="viewport" content="width=device-width" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta httpEquiv="Content-Security-Policy" content={ContentSecurityPolicy} />
        {IS_PRODUCTION && <meta httpEquiv="Strict-Transport-Security" content={StrictTransportSecurity} />}
        <link rel="shortcut icon" href="/favicons/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#000" />
      </Head>

      <CacheProvider value={emotionCache}>
        <AppProviders>
          <CssBaseline />

          <InitApp />

          <PageLayout>
            <Component {...pageProps} />
          </PageLayout>

          <CookieBanner />

          <Notifications />
        </AppProviders>
      </CacheProvider>
    </StoreHydrator>
  )
}

export default WebCoreApp
