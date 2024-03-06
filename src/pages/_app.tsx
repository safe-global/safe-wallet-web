import CookieBanner from '@/components/common/CookieBanner'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import MetaTags from '@/components/common/MetaTags'
import Notifications from '@/components/common/Notifications'
import PageLayout from '@/components/common/PageLayout'
import WalletProvider from '@/components/common/WalletProvider'
import ConnectKitProvider from '@/components/connectKitProvider'
import { useNotificationTracking } from '@/components/settings/PushNotifications/hooks/useNotificationTracking'
import { cgwDebugStorage } from '@/components/sidebar/DebugToggle'
import SafeThemeProvider from '@/components/theme/SafeThemeProvider'
import { TxModalProvider } from '@/components/tx-flow'
import { GATEWAY_URL_PRODUCTION, GATEWAY_URL_STAGING, IS_PRODUCTION } from '@/config/constants'
import CounterfactualHooks from '@/features/counterfactual/CounterfactualHooks'
import Recovery from '@/features/recovery/components/Recovery'
import useBeamer from '@/hooks/Beamer/useBeamer'
import { useInitSafeCoreSDK } from '@/hooks/coreSDK/useInitSafeCoreSDK'
import useSafeMessageNotifications from '@/hooks/messages/useSafeMessageNotifications'
import useSafeMessagePendingStatuses from '@/hooks/messages/useSafeMessagePendingStatuses'
import { useSafeMsgTracking } from '@/hooks/messages/useSafeMsgTracking'
import useAdjustUrl from '@/hooks/useAdjustUrl'
import useChangedValue from '@/hooks/useChangedValue'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useInitSession } from '@/hooks/useInitSession'
import useLoadableStores from '@/hooks/useLoadableStores'
import useSafeNotifications from '@/hooks/useSafeNotifications'
import useTxNotifications from '@/hooks/useTxNotifications'
import useTxPendingStatuses from '@/hooks/useTxPendingStatuses'
import { useTxTracking } from '@/hooks/useTxTracking'
import useRehydrateSocialWallet from '@/hooks/wallets/mpc/useRehydrateSocialWallet'
import { useInitWeb3 } from '@/hooks/wallets/useInitWeb3'
import { useInitOnboard } from '@/hooks/wallets/useOnboard'
import useGtm from '@/services/analytics/useGtm'
import PasswordRecoveryModal from '@/services/mpc/PasswordRecoveryModal'
import { SentryErrorBoundary } from '@/services/sentry' // needs to be imported first
import { makeStore, useHydrateStore } from '@/store'
import '@/styles/globals.css'
import createEmotionCache from '@/utils/createEmotionCache'
import { CacheProvider, type EmotionCache } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import type { Theme } from '@mui/material/styles'
import { ThemeProvider } from '@mui/material/styles'
import { setBaseUrl as setGatewayBaseUrl } from '@safe-global/safe-gateway-typescript-sdk'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import type { ReactNode } from 'react'
import { type ReactElement } from 'react'
import { Provider } from 'react-redux'

const GATEWAY_URL = IS_PRODUCTION || cgwDebugStorage.get() ? GATEWAY_URL_PRODUCTION : GATEWAY_URL_STAGING

const reduxStore = makeStore()

const InitApp = (): null => {
  setGatewayBaseUrl(GATEWAY_URL)
  useHydrateStore(reduxStore)
  useAdjustUrl()
  useGtm()
  useNotificationTracking()
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
  useRehydrateSocialWallet()

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
          <SentryErrorBoundary showDialog fallback={ErrorBoundary}>
            <WalletProvider>
              <TxModalProvider>{children}</TxModalProvider>
            </WalletProvider>
          </SentryErrorBoundary>
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
    <Provider store={reduxStore}>
      <Head>
        <title key="default-title">{'Safe{Wallet}'}</title>
        <MetaTags prefetchUrl={GATEWAY_URL} />
      </Head>
      <ConnectKitProvider>
        <CacheProvider value={emotionCache}>
          <AppProviders>
            <CssBaseline />

            <InitApp />

            <PageLayout pathname={router.pathname}>
              <Component {...pageProps} key={safeKey} />
            </PageLayout>

            <CookieBanner />

            <Notifications />

            <PasswordRecoveryModal />

            <Recovery />

            <CounterfactualHooks />
          </AppProviders>
        </CacheProvider>
      </ConnectKitProvider>
    </Provider>
  )
}

export default WebCoreApp
