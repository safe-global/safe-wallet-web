import Sentry from '@/services/sentry' // needs to be imported first
import type { ReactNode } from 'react'
import { useState } from 'react'
import { type ReactElement } from 'react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { setBaseUrl as setGatewayBaseUrl } from '@safe-global/safe-gateway-typescript-sdk'
import { CacheProvider, type EmotionCache } from '@emotion/react'
import '@/styles/globals.css'
import { GATEWAY_URL_PRODUCTION } from '@/config/constants'
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
import { useLightDarkTheme } from '@/hooks/useDarkMode'
// import { cgwDebugStorage } from '@/components/sidebar/DebugToggle'
import { useTxTracking } from '@/hooks/useTxTracking'
import useGtm from '@/services/analytics/useGtm'
import useBeamer from '@/hooks/useBeamer'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import createEmotionCache from '@/utils/createEmotionCache'
import MetaTags from '@/components/common/MetaTags'
import { QueryClient, QueryClientProvider, Hydrate } from '@tanstack/react-query'

// const GATEWAY_URL = IS_PRODUCTION || cgwDebugStorage.get() ? GATEWAY_URL_PRODUCTION : GATEWAY_URL_STAGING
const GATEWAY_URL = GATEWAY_URL_PRODUCTION

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

const WebCoreApp = ({
  Component,
  pageProps,
  router,
  emotionCache = clientSideEmotionCache,
}: WebCoreAppProps): ReactElement => {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <StoreHydrator>
      <Head>
        <title key="default-title">Safe</title>
        <MetaTags prefetchUrl={GATEWAY_URL} />
      </Head>

      <CacheProvider value={emotionCache}>
        <AppProviders>
          <CssBaseline />

          <InitApp />
          <QueryClientProvider client={queryClient}>
            <Hydrate state={pageProps.dehydratedState}>
              <PageLayout pathname={router.pathname}>
                <Component {...pageProps} />
              </PageLayout>
            </Hydrate>
          </QueryClientProvider>

          <Notifications />
        </AppProviders>
      </CacheProvider>
    </StoreHydrator>
  )
}

export default WebCoreApp
