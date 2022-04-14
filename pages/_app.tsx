import { ReactElement } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import '../styles/globals.css'
import { store } from 'store'
import PageLayout from 'components/common/PageLayout'
import useChains from 'services/useChains'
import useSafeInfo from 'services/useSafeInfo'
import useBalances from 'services/useBalances'
import useTxHistory from 'services/useTxHistory'

const InitApp = (): null => {
  useChains()
  useSafeInfo()
  useBalances()
  useTxHistory()

  return null
}

const SafeWebCore = ({ Component, pageProps }: AppProps): ReactElement => {
  return (
    <Provider store={store}>
      <Head>
        <title>Safe</title>
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
