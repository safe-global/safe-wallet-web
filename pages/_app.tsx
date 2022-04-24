import Sentry from '@/services/sentry' // needs to be imported first
import { type ReactElement } from 'react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'

import { setBaseUrl } from '@gnosis.pm/safe-react-gateway-sdk'
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
import { useInitOnboard } from '@/services/useOnboard'
import { useInitWeb3ReadOnly } from '@/services/useWeb3ReadOnly'
import { useInitCurriencies } from '@/services/useCurrencies'
import '@/styles/globals.css'

const InitApp = (): null => {
  if (!IS_PRODUCTION) {
    setBaseUrl(STAGING_GATEWAY_URL)
  }

  usePathRewrite()
  useInitChains()
  useInitCurriencies()
  useInitSafeInfo()
  useInitBalances()
  useInitCollectibles()
  useInitTxHistory()
  useInitTxQueue()
  useInitWeb3ReadOnly()
  useInitOnboard()

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

      <InitApp />

      {/* @ts-expect-error - Temporary Fix */}
      <Sentry.ErrorBoundary showDialog fallback={({ error }) => <div>{error.message}</div>}>
        <PageLayout>
          <Component {...pageProps} />
        </PageLayout>
      </Sentry.ErrorBoundary>
    </Provider>
  )
}

export default SafeWebCore
