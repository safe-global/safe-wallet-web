import Sentry from '@/services/sentry' // needs to be imported first
import { type ReactElement } from 'react'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import '../styles/globals.css'
import { store } from '@/store'
import PageLayout from '@/components/common/PageLayout'
import { useInitChains } from '@/services/useChains'
import { useInitSafeInfo } from '@/services/useSafeInfo'
import { useInitBalances } from '@/services/useBalances'
import { useInitCollectibles } from '@/services/useCollectibles'
import { useInitTxHistory } from '@/services/useTxHistory'
import { useInitTxQueue } from '@/services/useTxQueue'
import { useInitWeb3 } from '@/services/useWeb3'
import { useInitSafeSDK } from '@/services/useSafeSDK'
import { useInitWeb3ReadOnly } from '@/services/useWeb3ReadOnly'
import usePathRewrite from '@/services/usePathRewrite'
import { IS_PRODUCTION, STAGING_GATEWAY_URL } from '@/config/constants'
import { setBaseUrl } from '@gnosis.pm/safe-react-gateway-sdk'

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
  useInitWeb3ReadOnly()
  useInitSafeSDK()

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
