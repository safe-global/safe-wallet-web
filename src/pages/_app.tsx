import Sentry from '@/services/sentry' // needs to be imported first
import type { ReactNode } from 'react'
import { type ReactElement } from 'react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import CssBaseline from '@mui/material/CssBaseline'
import type { Theme } from '@mui/material/styles'
import { ThemeProvider } from '@mui/material/styles'
import { setBaseUrl as setGatewayBaseUrl } from '@safe-global/safe-gateway-typescript-sdk'
import { CacheProvider, type EmotionCache } from '@emotion/react'
import { SafeThemeProvider } from '@safe-global/safe-react-components'
import '@/styles/globals.css'
import { IS_PRODUCTION, GATEWAY_URL_STAGING, GATEWAY_URL_PRODUCTION } from '@/config/constants'
import { StoreHydrator } from '@/store'
import PageLayout from '@/components/common/PageLayout'
import useLoadableStores from '@/hooks/useLoadableStores'
import { useInitOnboard } from '@/hooks/wallets/useOnboard'
import { useInitWeb3 } from '@/hooks/wallets/useInitWeb3'
import { useInitSafeCoreSDK } from '@/hooks/coreSDK/useInitSafeCoreSDK'
import useTxNotifications from '@/hooks/useTxNotifications'
import useSafeNotifications from '@/hooks/useSafeNotifications'
import useTxPendingStatuses from '@/hooks/useTxPendingStatuses'
import { useInitSession } from '@/hooks/useInitSession'
import Notifications from '@/components/common/Notifications'
import CookieBanner from '@/components/common/CookieBanner'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cgwDebugStorage } from '@/components/sidebar/DebugToggle'
import { useTxTracking } from '@/hooks/useTxTracking'
import { useSafeMsgTracking } from '@/hooks/messages/useSafeMsgTracking'
import useGtm from '@/services/analytics/useGtm'
import useBeamer from '@/hooks/useBeamer'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import createEmotionCache from '@/utils/createEmotionCache'
import MetaTags from '@/components/common/MetaTags'
import useAdjustUrl from '@/hooks/useAdjustUrl'
import useSafeMessageNotifications from '@/hooks/messages/useSafeMessageNotifications'
import useSafeMessagePendingStatuses from '@/hooks/messages/useSafeMessagePendingStatuses'
import useChangedValue from '@/hooks/useChangedValue'

const GATEWAY_URL = IS_PRODUCTION || cgwDebugStorage.get() ? GATEWAY_URL_PRODUCTION : GATEWAY_URL_STAGING

const InitApp = (): null => {
  setGatewayBaseUrl(GATEWAY_URL)
  useAdjustUrl()
  useGtm()
  useInitSession()
  useLoadableStores()
  useInitOnboard()
  useInitWeb3()
  useInitSafeCoreSDK()
  useTxNotifications()
  useSafeMessageNotifications()
  useSafeNotifications()
  useTxPendingStatuses()
  useSafeMessagePendingStatuses()
  useTxTracking()
  useSafeMsgTracking()
  useBeamer()

  return null
}

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

export const AppProviders = ({ children }: { children: ReactNode | ReactNode[] }) => {
  const isDarkMode = useDarkMode()
  const themeMode = isDarkMode ? 'dark' : 'light'

  return (
    <SafeThemeProvider mode={themeMode}>
      {(safeTheme: Theme) => (
        <ThemeProvider theme={safeTheme}>
          <Sentry.ErrorBoundary showDialog fallback={ErrorBoundary}>
            {children}
          </Sentry.ErrorBoundary>
        </ThemeProvider>
      )}
    </SafeThemeProvider>
  )
}

interface WebCoreAppProps extends AppProps {
  emotionCache?: EmotionCache
}

const WebCoreApp = ({
  Component,
  pageProps,
  router,
  emotionCache = clientSideEmotionCache,
}: WebCoreAppProps): ReactElement => {
  const safeKey = useChangedValue(router.query.safe?.toString())

  return (
    <StoreHydrator>
      <Head>
        <title key="default-title">{'Safe{Wallet}'}</title>
        <MetaTags prefetchUrl={GATEWAY_URL} />
      </Head>

      <CacheProvider value={emotionCache}>
        <AppProviders>
          <CssBaseline />

          <InitApp />

          <PageLayout pathname={router.pathname}>
            <Component {...pageProps} key={safeKey} />
          </PageLayout>

          <CookieBanner />

          <Notifications />
        </AppProviders>
      </CacheProvider>
    </StoreHydrator>
  )
}

export default WebCoreApp
