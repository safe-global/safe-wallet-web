import Sentry from '@/services/sentry' // needs to be imported first
import { type ReactElement } from 'react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import { setBaseUrl } from '@gnosis.pm/safe-react-gateway-sdk'
import { SnackbarProvider } from 'notistack'

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
import useNotifier from '@/services/useNotifier'

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
  useNotifier()

  return null
}

const SafeWebCore = ({ Component, pageProps }: AppProps): ReactElement => {
  return (
    <Provider store={store}>
      <Head>
        <title>Safe 🌭</title>
        <meta name="description" content="Safe app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* @ts-expect-error - Temporary Fix */}
      <Sentry.ErrorBoundary showDialog fallback={({ error }) => <div>{error.message}</div>}>
        <SnackbarProvider anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <InitApp />
          <PageLayout>
            <Component {...pageProps} />
          </PageLayout>
        </SnackbarProvider>
      </Sentry.ErrorBoundary>
    </Provider>
  )
}

export default SafeWebCore
