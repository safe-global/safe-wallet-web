import { ReactElement } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import '../styles/globals.css'
import { store } from 'store'
import PageLayout from '@/components/common/PageLayout'
import { useInitChains } from '@/services/useChains'
import { useInitSafeInfo } from '@/services/useSafeInfo'
import { useInitBalances } from '@/services/useBalances'
import { useInitTxHistory } from '@/services/useTxHistory'
import { useInitTxQueue } from '@/services/useTxQueue'
import { useInitWeb3 } from '@/services/useWeb3'
import { useInitSafeSDK } from '@/services/useSafeSDK'
import { useInitWeb3ReadOnly } from '@/services/useWeb3ReadOnly'
import usePathRewrite from '@/services/usePathRewrite'

const InitApp = (): null => {
  usePathRewrite()
  useInitChains()
  useInitSafeInfo()
  useInitBalances()
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

      <PageLayout>
        <Component {...pageProps} />
      </PageLayout>
    </Provider>
  )
}

export default SafeWebCore
